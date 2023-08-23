
import listAxie from "./list-axie"
import { getAxieIdsFromAccount } from "../lib/axie"
import { HardhatRuntimeEnvironment } from "hardhat/types"

// TODO: multisig to save gas
export default async function listAllAxies(taskArgs: {
  basePrice: string
  endedPrice?: string
  duration?: string
  gasLimit?: number
}, hre: HardhatRuntimeEnvironment) {
  // get address
  const accounts = await hre.ethers.getSigners()
  const signer = accounts[0]
  const address = signer.address.toLowerCase()
  console.log(`Listing all axies of ${address.replace('0x', 'ronin:')}`)

  // get all axies ids from the account
  const axieIds = await getAxieIdsFromAccount(address, signer)

  // list all axies, one by one
  for (let i = 0; i < axieIds.length; i++) {
    const axieId = axieIds[i]

    await listAxie({ axie: axieId.toString(), ...taskArgs }, hre)
  }
}
