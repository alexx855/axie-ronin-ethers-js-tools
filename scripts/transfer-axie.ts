
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { getAxieContract } from "../lib/contracts"

export default async function transferAxie(taskArgs: {
  address: string
  axie: string
}, hre: HardhatRuntimeEnvironment) {
  try {
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()
    const addressTo = taskArgs.address.replace('ronin:', '0x').toLowerCase()

    const axieId = parseInt(taskArgs.axie.replace(/\s/g, '').replace('#', ''), 10)
    if (isNaN(axieId) || axieId <= 0) {
      console.log('Invalid Axie ID provided')
      throw new Error('Invalid Axie ID provided')
    }

    console.log(`Transferring Axie #${axieId} from ${address} to ${addressTo}`)

    // get axie contract
    const axieContract = await getAxieContract(signer)

    // Transfer
    const tx = await axieContract.transferFrom(address, addressTo, axieId, { gasPrice: 20000000000 })

    // wait for tx to be mined and get receipt
    const receipt = await tx.wait()
    console.log('Receipt:', receipt.transactionHash)
    return receipt.transactionHash
  } catch (error) {
    console.error(error)
  }
  return false
}
