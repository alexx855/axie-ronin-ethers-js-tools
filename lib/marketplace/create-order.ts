import { ethers } from "ethers";
import { MARKETPLACE_GATEWAY_V2, AXIE_PROXY, WRAPPED_ETHER } from "@roninbuilders/contracts";
import { apiRequest } from "../utils"
import {
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

export default async function createMarketplaceOrder(
  orderData: ICreateOrderData,
  accessToken: string,
  signer: ethers.Wallet,
  skyMavisApiKey: string
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

  const types = {
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
    ]
  };

  const domain = {
    name: 'MarketGateway',
    version: '1',
    chainId: '2020',
    verifyingContract: MARKETPLACE_GATEWAY_V2.address
  };

  const order = {
    maker: address,
    kind: '1',
    assets: [
      {
        erc: '1',
        addr: AXIE_PROXY.address,
        id: axieId,
        quantity: '0' // ??? not sure why this is 0, maybbe its for items
      }
    ],
    expiredAt,
    paymentToken: WRAPPED_ETHER.address,
    startedAt,
    basePrice,
    endedAt,
    endedPrice,
    expectedState: '0',
    nonce: '0', // ?? use nonce from the wallet
    marketFeePercentage: '425'
  };

  const signature = await signer._signTypedData(domain, types, order);

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
          address: AXIE_PROXY.address,
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
    'authorization': `Bearer ${accessToken}`, // axie marketplace access token
    'x-api-key': skyMavisApiKey // skymavis app api key
  }

  const result = await apiRequest<ICreateOrderResult>(GRAPHQL_URL, JSON.stringify({ query, variables }), headers)
  return result
}