
import { HardhatRuntimeEnvironment } from "hardhat/types"
import getAxieIds from "./get-axies"
import unlistAxie from "./unlist-axie"

export default async function unlistAllAxies(taskArgs: {}, hre: HardhatRuntimeEnvironment) {
  // get address
  const accounts = await hre.ethers.getSigners()
  const signer = accounts[0]
  const address = signer.address.toLowerCase()
  console.log(`Unlisting all axies of ${address.replace('0x', 'ronin:')}`)

  // get axie ids
  const axieIds = await getAxieIds(hre)
  for (let i = 0; i < axieIds.length; i++) {
    const axieId = axieIds[i]

    await unlistAxie({ axie: axieId.toString() }, hre)
  }
}
