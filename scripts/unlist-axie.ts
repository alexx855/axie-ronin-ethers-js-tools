
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { apiRequest } from "../lib/utils"
import * as fs from 'fs/promises'
import { AvailableNetworks, CONTRACT_MARKETPLACE_V2_ABI_JSON_PATH, CONTRACT_MARKETPLACE_V2_ADDRESS, CONTRACT_WETH_ADDRESS, GRAPHQL_URL } from "../lib/constants"

export default async function unlistAxie(taskArgs: { axie: string }, hre: HardhatRuntimeEnvironment) {
  try {
    if (hre.network.name != 'ronin' && hre.network.name != 'saigon') {
      throw new Error('Network not supported')
    }
    const network: AvailableNetworks = hre.network.name

    const axieId = parseInt(taskArgs.axie, 10)
    if (isNaN(axieId)) {
      console.log('Invalid Axie ID provided')
      return false
    }

    // query the marketplace for the axie order
    const query = `
          query GetAxieDetail($axieId: ID!) {
            axie(axieId: $axieId) {
              id
              order {
                ... on Order {
                  id
                  maker
                  kind
                  assets {
                    ... on Asset {
                      erc
                      address
                      id
                      quantity
                      orderId
                    }
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
                }
              }
            }
          }
        `
    const variables = {
      axieId
    }

    interface IAxieOrderResult {
      data?: {
        axie: {
          id: string
          order: {
            id: string
            maker: string
            kind: number
            assets: Array<{
              erc: number
              address: string
              id: string
              quantity: string
              orderId: string
            }>
            expiredAt: string
            paymentToken: string
            startedAt: string
            basePrice: string
            endedAt: string
            endedPrice: string
            expectedState: number
            nonce: string
            marketFeePercentage: number
            signature: string
            hash: string
            duration: number
            timeLeft: number
            currentPrice: string
            suggestedPrice: string
            currentPriceUsd: string
          } | null
        }
        errors?: Array<{
          message: string
        }>
      }
    }

    const result = await apiRequest<IAxieOrderResult>(GRAPHQL_URL, JSON.stringify({ query, variables }))
    if (result === null || result.data === undefined || result.data.axie.order == null) {
      console.log(`Axie ${axieId} not listed`)
      return false
    }

    const order = result.data.axie.order
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]

    // get marketplace contract
    const marketAbi = JSON.parse(await fs.readFile(CONTRACT_MARKETPLACE_V2_ABI_JSON_PATH, 'utf8'))
    const marketplaceContract = await new hre.ethers.Contract(
      CONTRACT_MARKETPLACE_V2_ADDRESS[network],
      marketAbi,
      signer
    )

    // create the cancel order data
    const cancelOrderData = marketplaceContract.interface.encodeFunctionData('cancelOrder',
      [
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
    )

    let tx = await marketplaceContract.interactWith('ORDER_EXCHANGE', cancelOrderData)
    // wait for the transaction to be mined
    const receipt = await tx.wait()
    console.log(`Axie ${axieId} unlisted, tx: ${receipt.transactionHash}`)
    return receipt.transactionHash
  } catch (error) {
    console.error(error)
  }
  return false
}
