
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { getAxieIdsFromAccount } from "../lib/axie"

export default async function getAxieIds(hre: HardhatRuntimeEnvironment) {
  try {
    // get address
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()

    const axieIds = getAxieIdsFromAccount(address, hre.ethers.provider)
    return axieIds
  } catch (error) {
    console.error(error)
  }
  return []
}
