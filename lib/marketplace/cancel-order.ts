import { ethers } from "ethers";
import { apiRequest } from "../utils"
import {
  CONTRACT_WETH_ADDRESS,
  GRAPHQL_URL
} from "../constants"
import { getMarketplaceContract } from "../contracts";


export default async function cancelMarketplaceOrder(
  axieId: string,
  signer: ethers.Signer,
  skymavisApiKey: string,
) {

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


  interface IMarketplaceAxieOrderResult {
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

  const headers = {
    'x-api-key': skymavisApiKey
  }

  const variables = {
    axieId
  }

  const result = await apiRequest<IMarketplaceAxieOrderResult>(GRAPHQL_URL, JSON.stringify({ query, variables }), headers)
  if (result === null || result.data === undefined || result.data.axie.order == null) {
    console.log(`Axie ${axieId} is not for sale`)
    return false
  }

  const { order } = result.data.axie

  // create the cancel order data
  const cancelOrderData = [
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
      CONTRACT_WETH_ADDRESS['ronin'], // paymentToken
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
  const marketplaceContract = await getMarketplaceContract(signer)
  // create the cancel order data
  const encondedCancelOrderData = marketplaceContract.interface.encodeFunctionData('cancelOrder', cancelOrderData)
  // send the transaction
  const tx = await marketplaceContract.interactWith('ORDER_EXCHANGE', encondedCancelOrderData)
  const receipt = await tx.wait()
  return receipt
}