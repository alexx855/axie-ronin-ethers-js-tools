
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { apiRequest } from "../lib/utils"
import { CONTRACT_MARKETPLACE_V2_ADDRESS, CONTRACT_WETH_ADDRESS, CONTRACT_AXIE_ADDRESS, AvailableNetworks, CONTRACT_AXIE_ABI_JSON_PATH, GRAPHQL_URL } from "../lib/constants"
import generateMartketplaceAccessToken from "./generate-access-token"
import * as fs from 'fs/promises'

export default async function listAxie(taskArgs: {
  axie: string
  basePrice: string
  endedPrice?: string
  duration?: string
  gasLimit?: number
}, hre: HardhatRuntimeEnvironment) {
  try {
    if (hre.network.name != 'ronin' && hre.network.name != 'saigon') {
      throw new Error('Network not supported')
    }

    const network: AvailableNetworks = hre.network.name

    if (!hre.ethers.utils.parseUnits(taskArgs.basePrice, 'ether')._isBigNumber) {
      console.log('Invalid basePrice provided')
      return false
    }

    const basePrice = hre.ethers.utils.parseUnits(taskArgs.basePrice, 'ether').toString()

    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()

    const axieId = parseInt(taskArgs.axie, 10)
    if (isNaN(axieId)) {
      console.log('Invalid Axie ID provided')
      return false
    }

    // check if axie contract is approved
    const axieABI = JSON.parse(await fs.readFile(CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
    const axieContract = await new hre.ethers.Contract(CONTRACT_AXIE_ADDRESS[network], axieABI, signer)
    const isApproved = await axieContract.isApprovedForAll(address, CONTRACT_MARKETPLACE_V2_ADDRESS[network])

    if (!isApproved) {
      console.log('Approving Axie Contract')
      const tx = await axieContract.setApprovalForAll(CONTRACT_MARKETPLACE_V2_ADDRESS[network], true)
      // wait for tx to be mined and get receipt
      const receipt = await tx.wait()
      console.log('Receipt:', receipt.transactionHash)
    }

    // get current block timestamp
    const currentBlock = await hre.ethers.provider.getBlock('latest')
    const startedAt = currentBlock.timestamp
    let endedAt = 0
    let duration = 86400 // 86400 seconds in a day, one day as default like the marketplace
    if (taskArgs.duration !== undefined) {
      duration = duration * parseInt(taskArgs.duration, 10)
      if (isNaN(duration)) {
        console.log('Invalid duration provided')
        return false
      }
      endedAt = startedAt + duration
    }

    let endedPrice

    if (taskArgs.endedPrice !== undefined) {
      if (!hre.ethers.utils.parseUnits(taskArgs.endedPrice, 'ether')._isBigNumber) {
        console.log('Invalid endedPrice provided')
        return false
      }
      endedPrice = hre.ethers.utils.parseUnits(taskArgs.endedPrice, 'ether').toString()
    } else {
      endedPrice = '0'
    }
    // ~ 6 months default and max listing duration
    const expiredAt = startedAt + 15634800

    const message = {
      types: {
        Asset: [
          {
            name: 'erc',
            type: 'uint8'
          },
          {
            name: 'addr',
            type: 'address'
          },
          {
            name: 'id',
            type: 'uint256'
          },
          {
            name: 'quantity',
            type: 'uint256'
          }
        ],
        Order: [
          {
            name: 'maker',
            type: 'address'
          },
          {
            name: 'kind',
            type: 'uint8'
          },
          {
            name: 'assets',
            type: 'Asset[]'
          },
          {
            name: 'expiredAt',
            type: 'uint256'
          },
          {
            name: 'paymentToken',
            type: 'address'
          },
          {
            name: 'startedAt',
            type: 'uint256'
          },
          {
            name: 'basePrice',
            type: 'uint256'
          },
          {
            name: 'endedAt',
            type: 'uint256'
          },
          {
            name: 'endedPrice',
            type: 'uint256'
          },
          {
            name: 'expectedState',
            type: 'uint256'
          },
          {
            name: 'nonce',
            type: 'uint256'
          },
          {
            name: 'marketFeePercentage',
            type: 'uint256'
          }
        ],
        EIP712Domain: [
          {
            name: 'name',
            type: 'string'
          },
          {
            name: 'version',
            type: 'string'
          },
          {
            name: 'chainId',
            type: 'uint256'
          },
          {
            name: 'verifyingContract',
            type: 'address'
          }
        ]
      },
      domain: {
        name: 'MarketGateway',
        version: '1',
        chainId: '2020',
        verifyingContract: CONTRACT_MARKETPLACE_V2_ADDRESS[network]
      },
      primaryType: 'Order',
      message: {
        maker: address,
        kind: '1',
        assets: [
          {
            erc: '1',
            addr: CONTRACT_AXIE_ADDRESS[network],
            id: axieId,
            quantity: '0'
          }
        ],
        expiredAt,
        paymentToken: CONTRACT_WETH_ADDRESS[network],
        startedAt,
        basePrice,
        endedAt,
        endedPrice,
        expectedState: '0',
        nonce: '0',
        marketFeePercentage: '425'
      }
    }
    // sign the trasaction, we need to call eth_signTypedData_v4 EPI721
    const signature = await hre.ethers.provider.send('eth_signTypedData_v4', [address, JSON.stringify(message)])

    const query = `
        mutation CreateOrder($order: InputOrder!, $signature: String!) {
          createOrder(order: $order, signature: $signature) {
            ...OrderInfo
            __typename
          }
        }
        fragment OrderInfo on Order {
          id
          maker
          kind
          assets {
            ...AssetInfo
            __typename
          }
          expiredAt
          paymentToken
          startedAt
          basePrice
          endedAt
          endedPrice
          expectedState
          nonce
          marketFeePercentage
          signature
          hash
          duration
          timeLeft
          currentPrice
          suggestedPrice
          currentPriceUsd
          __typename
        }
        fragment AssetInfo on Asset {
          erc
          address
          id
          quantity
          orderId
          __typename
        }
      `
    const variables = {
      order: {
        nonce: 0,
        assets: [
          {
            id: axieId.toString(),
            address: CONTRACT_AXIE_ADDRESS[network],
            erc: 'Erc721',
            quantity: '0'
          }
        ],
        basePrice,
        endedPrice,
        startedAt,
        endedAt,
        expiredAt
      },
      signature
    }

    const accessToken = await generateMartketplaceAccessToken(hre)
    const headers = {
      authorization: `Bearer ${accessToken}`
    }
    interface ICreateOrderResult {
      data?: {
        createOrder: {
          hash: string
        }
      }
      errors?: Array<{
        message: string
      }>
    }
    // send the create order mutation
    const result = await apiRequest<ICreateOrderResult>(GRAPHQL_URL, JSON.stringify({ query, variables }), headers)
    if (result === null) {
      console.log('Error creating order')
      return false
    }

    if (result.errors !== undefined) {
      console.log('Error creating order', result.errors)
      return false
    }

    // create the activity
    const activityQuery = `mutation AddActivity($action: Action!, $data: ActivityDataInput!) {
        createActivity(action: $action, data: $data) {
          result
          __typename
        }
      }`

    const activityVariables: Object = {
      action: 'ListAxie',
      data: {
        axieId: axieId.toString(),
        priceFrom: basePrice,
        priceTo: endedPrice,
        duration: duration.toString(),
        txHash: result.data?.createOrder.hash
      }
    }

    interface IActivityResult {
      data?: {
        createActivity: {
          result: boolean
        }
      }
      errors?: Array<{
        message: string
      }>
    }

    const activityResult = await apiRequest<IActivityResult>(GRAPHQL_URL, JSON.stringify({ query: activityQuery, variables: activityVariables }), headers)

    if (activityResult === null || activityResult.data === undefined) {
      console.log('Error creating activity')
      return false
    }

    if (activityResult.errors !== undefined) {
      console.log('Error creating activity', activityResult.errors)
      return false
    }

    console.log(`Axie ${axieId} listed for ${taskArgs.basePrice} ETH`)
    return activityResult.data.createActivity.result
  } catch (error: any) {
    console.error(error)
  }
  return false
}
