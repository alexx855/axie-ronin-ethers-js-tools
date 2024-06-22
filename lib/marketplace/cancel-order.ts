import { ethers } from "ethers";
import { apiRequest } from "../utils"
import {
  GRAPHQL_URL
} from "../constants"
import { ORDER_EXCHANGE_LOGIC, APP_AXIE_ORDER_EXCHANGE, MARKETPLACE_GATEWAY_V2, MARKET_GATEWAY, WRAPPED_ETHER } from "@roninbuilders/contracts";


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

  // marketplace order exchange contract
  const marketAbi = new ethers.utils.Interface(MARKET_GATEWAY.abi);
  const contract = new ethers.Contract(
    MARKETPLACE_GATEWAY_V2.address,
    marketAbi,
    signer
  )

  // Assuming orderTypes and orderData are defined and orderData is an array
  const orderTypes = [
    '(address maker, uint8 kind, (uint8 erc,address addr,uint256 id,uint256 quantity)[] assets, uint256 expiredAt, address paymentToken, uint256 startedAt, uint256 basePrice, uint256 endedAt, uint256 endedPrice, uint256 expectedState, uint256 nonce, uint256 marketFeePercentage)',
  ];
  const orderData = [
    order.maker,
    1, // market order kind
    [[ // MarketAsset.Asset[]
      1, // MarketAsset.TokenStandard
      order.assets[0].address, // tokenAddress
      +order.assets[0].id, // axieId
      +order.assets[0].quantity // quantity
    ]],
    order.expiredAt,
    WRAPPED_ETHER.address, // paymentToken WETH
    order.startedAt,
    order.basePrice,
    order.endedAt,
    order.endedPrice,
    0, // expectedState
    order.nonce,
    425, // Market fee percentage, 4.25%
  ]

  // Encode the orderData values
  const encodedOrderData = await ethers.utils.defaultAbiCoder.encode(orderTypes, [orderData]);

  // Encode the values again for the cancelOrder function
  const axieOrderExchangeInterface = new ethers.utils.Interface(APP_AXIE_ORDER_EXCHANGE.abi);
  const orderExchangeData = axieOrderExchangeInterface.encodeFunctionData('cancelOrder', [
    encodedOrderData
  ])

  // Send the transaction
  const tx = await contract.interactWith('ORDER_EXCHANGE', orderExchangeData)
  const receipt = await tx.wait()
  return receipt
}