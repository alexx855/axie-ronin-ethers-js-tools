import { ethers } from "ethers";
import { apiRequest } from "../utils"
import {
  CONTRACT_MARKETPLACE_V2_ADDRESS,
  CONTRACT_AXIE_ADDRESS,
  CONTRACT_WETH_ADDRESS,
  GRAPHQL_URL
} from "../constants"

export interface ICreateOrderData {
  address: string;
  axieId: string;
  basePrice: string;
  endedPrice: string;
  startedAt: number;
  endedAt: number;
  expiredAt: number
}

export interface ICreateOrderResult {
  data?: {
    createOrder: {
      hash: string
    }
  }
  errors?: Array<{
    message: string
  }>
}

// check and approve the axie contract to transfer axies from address to the marketplace contract
export default async function createMarketplaceOrder(
  orderData: ICreateOrderData,
  accessToken: string,
  provider: ethers.providers.JsonRpcProvider,
  skymavisApyKey: string
) {

  const {
    address,
    axieId,
    basePrice,
    endedPrice,
    startedAt,
    endedAt,
    expiredAt,
  } = orderData

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
      verifyingContract: CONTRACT_MARKETPLACE_V2_ADDRESS['ronin']
    },
    primaryType: 'Order',
    message: {
      maker: address,
      kind: '1',
      assets: [
        {
          erc: '1',
          addr: CONTRACT_AXIE_ADDRESS['ronin'],
          id: axieId,
          quantity: '0'
        }
      ],
      expiredAt,
      paymentToken: CONTRACT_WETH_ADDRESS['ronin'],
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
  const signature = await provider.send('eth_signTypedData_v4', [address, JSON.stringify(message)])

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
          id: axieId,
          address: CONTRACT_AXIE_ADDRESS['ronin'],
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



  const headers = {
    'authorization': `Bearer ${accessToken}`,
    'x-api-key': skymavisApyKey
  }

  const result = await apiRequest<ICreateOrderResult>(GRAPHQL_URL, JSON.stringify({ query, variables }), headers)
  return result
}