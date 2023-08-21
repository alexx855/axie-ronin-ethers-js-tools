
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { CONTRACT_AXIE_ADDRESS, CONTRACT_AXIE_ABI_JSON_PATH, AvailableNetworks } from "../lib/constants"
import * as fs from 'fs/promises'

export default async function transferAxie(taskArgs: {
  address: string
  axie: string
}, hre: HardhatRuntimeEnvironment) {

  if (hre.network.name != 'ronin' && hre.network.name != 'saigon') {
    throw new Error('Network not supported')
  }
  const network: AvailableNetworks = hre.network.name

  try {
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.replace('ronin:', '0x').toLowerCase()
    const addressTo = taskArgs.address.replace('ronin:', '0x').toLowerCase()

    const axieId = parseInt(taskArgs.axie.replace(/\s/g, '').replace('#', ''), 10)
    if (isNaN(axieId) || axieId <= 0) {
      console.log('Invalid Axie ID provided')
      throw new Error('Invalid Axie ID provided')
    }

    console.log(`Transferring Axie #${axieId} from ${address} to ${addressTo}`)

    const axieABI = JSON.parse(await fs.readFile(CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
    const axieContract = await new hre.ethers.Contract(CONTRACT_AXIE_ADDRESS[network], axieABI, signer)

    // Check owner
    const owner = await axieContract.ownerOf(axieId)
    if (owner.toLowerCase() != address) {
      throw new Error(`You don't own this axie`)
    }

    // Transfer
    const tx = await axieContract.transferFrom(address, addressTo, axieId)

    // wait for tx to be mined and get receipt
    const receipt = await tx.wait()
    console.log('Receipt:', receipt.transactionHash)
    return receipt.transactionHash
  } catch (error) {
    console.error(error)
  }
  return false
}
