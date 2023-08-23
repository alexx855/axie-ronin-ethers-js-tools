
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import cancelMarketplaceOrder from "../lib/marketplace/cancel-order"

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

export default async function unlistAxie(taskArgs: { axie: string }, hre: HardhatRuntimeEnvironment) {
  try {
    if (hre.network.name != 'ronin') {
      throw new Error('Network not supported')
    }

    const axieId = parseInt(taskArgs.axie, 10)
    if (isNaN(axieId)) {
      console.log('Invalid Axie ID provided')
      return false
    }

    // Get signer account
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]

    // wait for the transaction to be mined
    const skymavisApiKey = process.env.SKIMAVIS_DAPP_KEY!
    const receipt = await cancelMarketplaceOrder(taskArgs.axie, signer, skymavisApiKey)
    console.log(`Axie ${axieId} unlisted, tx: ${receipt.transactionHash}`)
    return receipt.transactionHash
  } catch (error) {
    console.error(error)
  }
  return false
}
