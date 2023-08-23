import { Signer, ethers } from "ethers"
import { DEFAULT_GAS_LIMIT, CONTRACT_WETH_ADDRESS, GRAPHQL_URL } from "../constants"
import { getMarketplaceContract, getWETHContract } from "../contracts"
import { apiRequest } from "../utils"


// check and approve the axie contract to transfer axies from address to the marketplace contract
export default async function buyMarketplaceOrder(
  axieId: number,
  signer: Signer,
  provider: ethers.providers.JsonRpcProvider,
  skymavisApiKey: string
) {


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

  const headers = {
    'x-api-key': skymavisApiKey
  }

  const results = await apiRequest<IGetAxieDetail>(GRAPHQL_URL, JSON.stringify({ query, variables }), headers)
  const order = results.data?.axie.order

  if (!order) {
    console.log('No order found')
    return false
  }

  console.log(`Buying axie ${axieId} for ${ethers.utils.formatEther(order.currentPrice)} WETH`)

  // get marketplace contract
  const marketplaceContract = await getMarketplaceContract(signer)

  const address = await signer.getAddress()

  // check if the marketplace contract has enough WETH allowance
  const wethContract = await getWETHContract(signer)
  const allowance = await wethContract.allowance(address, marketplaceContract.address)
  if (ethers.BigNumber.isBigNumber(allowance) && allowance.eq(0)) {
    console.log('Need approve the marketplace contract to transfer WETH, no allowance')
    // same amount as the ronin wallet uses, i got it from there
    const amountToapproved = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
    const txApproveWETH = await wethContract.approve(marketplaceContract.address, amountToapproved, { gasLimit: DEFAULT_GAS_LIMIT })
    console.log('txApproveWETH', txApproveWETH.hash)
    const receipt = await txApproveWETH.wait()
    console.log('Receipt:', receipt.transactionHash)
  }

  // check if have enough WETH balance
  const currentPrice = ethers.BigNumber.from(order.currentPrice)
  const balanceWETH = await wethContract.balanceOf(address)
  if (ethers.BigNumber.isBigNumber(balanceWETH) && balanceWETH.lt(currentPrice)) {
    const amountToTransfer = currentPrice.sub(balanceWETH)
    console.log(`Not enough WETH balance to buy axie, you have ${ethers.utils.formatEther(balanceWETH)} WETH, need ${ethers.utils.formatEther(amountToTransfer)} WETH more`)
    return false
  }

  // settle marketplace order data
  const orderData = [
    [
      order.maker,
      1, // market order kind
      [[ // MarketAsset.Asset[]
        1, // MarketAsset.TokenStandard
        order.assets[0].address, // tokenAddress
        order.assets[0].id, // axieId
        +order.assets[0].quantity // quantity
      ]],
      order.expiredAt,
      CONTRACT_WETH_ADDRESS['ronin'], // paymentToken WETH
      order.startedAt,
      order.basePrice,
      order.endedAt,
      order.endedPrice,
      0, // expectedState
      order.nonce,
      425 // Market fee percentage, 4.25%
    ],
    order.signature, // signature
    order.currentPrice, // settlePrice
    '0xa7d8ca624656922c633732fa2f327f504678d132', // referralAddr
    0, // expectedState
  ]
  const encodedOrderData = await marketplaceContract.interface.encodeFunctionData('settleOrder', orderData)

  // estimate gas price
  const gasPrice = await provider.getGasPrice()
  const estimateGas = await marketplaceContract.estimateGas.interactWith('ORDER_EXCHANGE', encodedOrderData)
  console.log(`Estimated ron gas limit: ${estimateGas.toString()}`)

  // check if have enough ron balance
  const gasCost = gasPrice.mul(estimateGas)
  const balanceRON = await provider.getBalance(address)
  if (balanceRON.lt(gasCost)) {
    console.log(`Not enough RON balance to buy axie, you have ${ethers.utils.formatEther(balanceRON)} RON, need ${ethers.utils.formatEther(gasCost)} RON more`)
    return false
  }

  const txBuyAxie = await marketplaceContract.interactWith('ORDER_EXCHANGE', encodedOrderData)
  const receipt = await txBuyAxie.wait()
  return receipt
}