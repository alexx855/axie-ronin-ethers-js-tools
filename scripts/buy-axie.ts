
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import buyMarketplaceOrder from "../lib/marketplace/buy-order"

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

export default async function buyAxie(taskArgs: {
  axie: string
}, hre: HardhatRuntimeEnvironment) {
  if (hre.network.name != 'ronin') {
    throw new Error('Network not supported')
  }

  try {
    const axieId = parseInt(taskArgs.axie, 10)
    if (isNaN(axieId)) {
      console.log('Invalid Axie ID provided')
      return false
    }

    // Get signer account
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]

    // wait for the transaction to be mined
    const receipt = await buyMarketplaceOrder(axieId, signer, process.env.MARKETPLACE_ACCESS_TOKEN!, process.env.SKIMAVIS_DAPP_KEY!)
    if (!receipt) {
      console.log('Error buying axie')
      return false
    }

    console.log('Receipt:', receipt.transactionHash)
    return receipt.transactionHash as string
  } catch (error) {
    console.error(error)
  }
  return false
}