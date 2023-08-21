
import listAxie from "./list-axie"
import getAxieIds from "./get-axie"
import { HardhatRuntimeEnvironment } from "hardhat/types"

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

  // get axie ids
  const axieIds = await getAxieIds(hre)

  // list all axies, one by one
  for (let i = 0; i < axieIds.length; i++) {
    const axieId = axieIds[i]

    // TODO: save in array, and list all at once Promise.all or multisig maybe to save gas
    await listAxie({ axie: axieId.toString(), ...taskArgs }, hre)
  }
}
