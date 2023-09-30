
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { getAxieIdsFromAccount } from "../lib/axie"
import unlistAxie from "./unlist-axie"

export default async function unlistAllAxies(taskArgs: {}, hre: HardhatRuntimeEnvironment) {
  // get address
  const accounts = await hre.ethers.getSigners()
  const signer = accounts[0]
  const address = signer.address.toLowerCase()
  console.log(`Unlisting all axies of ${address.replace('0x', 'ronin:')}`)

  // get axie ids from the account
  const axieIds = await getAxieIdsFromAccount(address, hre.ethers.provider)
  for (let i = 0; i < axieIds.length; i++) {
    const axie = axieIds[i].toString()
    await unlistAxie({ axie }, hre)
  }
}
