
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { getAxieIdsFromAccount } from "../lib/axie"
import batchTransferAxies from "../lib/batch-transfer"

export default async function transferAllAxies(taskArgs: {
  address: string
  axies: string
}, hre: HardhatRuntimeEnvironment) {

  if (hre.network.name != 'ronin') {
    throw new Error('Network not supported')
  }

  try {
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()

    let axies: Array<string | number> = taskArgs.axies ? taskArgs.axies.split(',').map((axie: string) => {
      // remove whitespaces and # and convert to int
      return axie.replace(/\s/g, '').replace('#', '')
    }) : []

    // if no axies provided, get all axies from the account
    if (!axies || axies.length == 0) {
      // get all axies ids from the account
      const axieIds = await getAxieIdsFromAccount(address, hre.ethers.provider)
      axies = axieIds
    }

    // wait for tx to be mined and get receipt
    const receipt = await batchTransferAxies(signer, taskArgs.address.replace('ronin:', '0x').toLowerCase(), axies)

    console.log('Receipt:', receipt.transactionHash)
    return receipt.transactionHash
  } catch (error) {
    console.error(error)
  }
  return false
}
