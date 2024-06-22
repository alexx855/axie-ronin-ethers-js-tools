
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import createMarketplaceOrder from "../lib/marketplace/create-order"
import approveMarketplaceContract from "../lib/marketplace/approve"

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { ethers } from "ethers"
dotenv.config()

export default async function listAxie(taskArgs: {
  axie: string
  basePrice: string
  endedPrice?: string
  duration?: string
  gasLimit?: number
}, hre: HardhatRuntimeEnvironment) {
  try {

    if (
      !process.env.PRIVATE_KEY ||
      !process.env.MARKETPLACE_ACCESS_TOKEN ||
      !process.env.MARKETPLACE_REFRESH_TOKEN ||
      !process.env.SKIMAVIS_DAPP_KEY
    ) {
      throw new Error('Missing environment variables, please check your .env file')
    }

    if (hre.network.name != 'ronin') {
      throw new Error('Network not supported')
    }

    if (!hre.ethers.utils.parseUnits(taskArgs.basePrice, 'ether')._isBigNumber) {
      console.log('Invalid basePrice provided')
      return false
    }

    const basePrice = hre.ethers.utils.parseUnits(taskArgs.basePrice, 'ether').toString()

    const axieId = taskArgs.axie
    if (isNaN(parseInt(axieId, 10)) || axieId.length < 1) {
      console.log('Invalid Axie ID provided')
      return false
    }

    // Connection to the Ronin network using the RPC endpoint
    const connection = {
      url: 'https://api-gateway.skymavis.com/rpc',
      headers: {
        'x-api-key': process.env.SKIMAVIS_DAPP_KEY
      }
    }

    const provider = new ethers.providers.JsonRpcProvider(connection);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider) 

    // check if marketplace contract is approved for the axie contract
    const address = await wallet.getAddress()
    const isApproved = await approveMarketplaceContract(address, wallet)
    if (!isApproved) {
      console.log('Aborting, Axie Contract is not approved for the Marketplace')
      return false
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
    const orderData = {
      address,
      axieId,
      basePrice,
      endedPrice,
      startedAt,
      endedAt,
      expiredAt,
    }


    const result = await createMarketplaceOrder(orderData, process.env.MARKETPLACE_ACCESS_TOKEN!, wallet, process.env.SKIMAVIS_DAPP_KEY!)
    if (result === null || result.data?.createOrder.hash === undefined || result.errors !== undefined) {
      console.error('Error creating order', result)
      return false
    }

    console.log(`Axie ${axieId} listed for ${hre.ethers.utils.formatEther(basePrice)} WETH`)
    return true

    // // create activity on the marketplace (optional)
    // createActivity("ListAxie", {
    //   axieId: axieId,
    //   priceFrom: basePrice,
    //   priceTo: endedPrice,
    //   duration: duration.toString(),
    //   txHash: result.data?.createOrder.hash
    // }, accessToken)

  } catch (error) {
    console.error(error)
  }
  return false
}
