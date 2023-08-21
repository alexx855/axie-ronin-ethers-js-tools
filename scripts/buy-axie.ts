
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { apiRequest } from "../lib/utils"
import { CONTRACT_MARKETPLACE_V2_ADDRESS, CONTRACT_WETH_ADDRESS, CONTRACT_AXIE_ADDRESS, CONTRACT_AXIE_ABI_JSON_PATH, CONTRACT_MARKETPLACE_V2_ABI_JSON_PATH, CONTRACT_WETH_ABI_JSON_PATH, GRAPHQL_URL, DEFAULT_GAS_LIMIT, AvailableNetworks } from "../lib/constants"
import * as fs from 'fs/promises'


export default async function buyAxie(taskArgs: {
  axie: string
}, hre: HardhatRuntimeEnvironment) {
  if (hre.network.name != 'ronin' && hre.network.name != 'saigon') {
    throw new Error('Network not supported')
  }

  const network: AvailableNetworks = hre.network.name
  try {
    const axieId = parseInt(taskArgs.axie, 10)
    if (isNaN(axieId)) {
      console.log('Invalid Axie ID provided')
      return false
    }

    console.log(`Getting order details for axie ${axieId}`)

    interface Axie {
      id: string
      order: Order
      __typename: string
    }

    interface Order {
      id: number
      maker: string
      kind: string
      assets: Asset[]
      expiredAt: number
      paymentToken: string
      startedAt: number
      basePrice: string
      endedAt: number
      endedPrice: string
      expectedState: string
      nonce: number
      marketFeePercentage: number
      signature: string
      hash: string
      duration: number
      timeLeft: number
      currentPrice: string
      suggestedPrice: string
      currentPriceUsd: string
      __typename: string
    }

    interface Asset {
      erc: string
      address: string
      id: string
      quantity: string
      orderId: number
      __typename: string
    }

    interface IGetAxieDetail {
      data?: {
        axie: Axie
      }
      errors?: {
        message: string
      }
    }

    const query = `query GetAxieDetail($axieId: ID!) {
      axie(axieId: $axieId) {
        ...AxieDetail
        __typename
      }
    }
    fragment AxieDetail on Axie {
      id
      order {
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
    }`
    const variables = {
      axieId
    }

    const results = await apiRequest<IGetAxieDetail>(GRAPHQL_URL, JSON.stringify({ query, variables }))
    const order = results.data?.axie.order
    if (!order) {
      console.log('No order found')
      return false
    }

    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()

    // get axie contract
    const axieABI = JSON.parse(await fs.readFile(CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
    const axieContract = await new hre.ethers.Contract(
      CONTRACT_AXIE_ADDRESS[network],
      axieABI,
      signer
    )

    // check if have enough balance
    const balance = await hre.ethers.provider.getBalance(address)
    const currentPrice = hre.ethers.BigNumber.from(order.currentPrice)
    if (currentPrice.gte(balance)) {
      console.log('Not enough balance')
      return false
    }

    // approve WETH Contract to transfer WETH from the account
    const wethABI = JSON.parse(await fs.readFile(CONTRACT_WETH_ABI_JSON_PATH, 'utf8'))
    const wethContract = await new hre.ethers.Contract(
      CONTRACT_WETH_ADDRESS[network],
      wethABI,
      signer
    )

    const allowance = await wethContract.allowance(address, CONTRACT_MARKETPLACE_V2_ADDRESS[network])
    if (hre.ethers.BigNumber.isBigNumber(allowance) && allowance.eq(0)) {
      console.log('Need approve the marketplace contract to transfer WETH, no allowance')
      // same amount as the ronin wallet approval, got it from there
      const amountToapproved = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      const txApproveWETH = await wethContract.approve(CONTRACT_MARKETPLACE_V2_ADDRESS[network], amountToapproved, { gasLimit: DEFAULT_GAS_LIMIT })
      console.log('txApproveWETH', txApproveWETH.hash)
      const receipt = await txApproveWETH.wait()
      console.log('Receipt:', receipt.transactionHash)
    }

    const settleOrderInput =
      [
        0, // expectedState
        order.currentPrice, // settlePrice
        '0xa7d8ca624656922c633732fa2f327f504678d132', // referralAddr
        order.signature, // signature
        [
          order.maker,
          1, // market order kind
          [[ // MarketAsset.Asset[]
            1, // MarketAsset.TokenStandard
            order.assets[0].address,
            order.assets[0].id,
            order.assets[0].quantity
          ]],
          order.expiredAt,
          CONTRACT_WETH_ADDRESS[network], // paymentToken
          order.startedAt,
          order.basePrice,
          order.endedAt,
          order.endedPrice,
          0, // expectedState
          order.nonce,
          425 // Market fee percentage, 4.25%
        ]
      ]

    // get marketplace contract
    const marketABI = JSON.parse(await fs.readFile(CONTRACT_MARKETPLACE_V2_ABI_JSON_PATH, 'utf8'))
    const marketplaceContract = await new hre.ethers.Contract(
      CONTRACT_MARKETPLACE_V2_ADDRESS[network],
      marketABI,
      signer
    )

    // settle order
    const settleOrderData = marketplaceContract.interface.encodeFunctionData('settleOrder', settleOrderInput)
    const txBuyAxie = await marketplaceContract.interactWith('ORDER_EXCHANGE', settleOrderData)
    // const txBuyAxie = await marketplaceContract.interactWith('ORDER_EXCHANGE', settleOrderData, { gasLimit: DEFAULT_GAS_LIMIT })
    const receipt = await txBuyAxie.wait()
    console.log('Receipt:', receipt.transactionHash)
    return receipt.transactionHash as string
  } catch (error) {
    console.error(error)
  }
  return false
}