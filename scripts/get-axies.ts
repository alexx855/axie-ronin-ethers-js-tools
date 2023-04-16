
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import * as fs from 'fs/promises'
import { AvailableNetworks, CONTRACT_AXIE_ABI_JSON_PATH, CONTRACT_AXIE_ADDRESS, CONTRACT_MARKETPLACE_V2_ABI_JSON_PATH, CONTRACT_MARKETPLACE_V2_ADDRESS, CONTRACT_WETH_ADDRESS } from "../lib/constants"

export default async function getAxieIds(hre: HardhatRuntimeEnvironment) {
  try {
    if (hre.network.name != 'ronin' && hre.network.name != 'saigon') {
      throw new Error('Network not supported')
    }
    const network: AvailableNetworks = hre.network.name

    // get address
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()

    // get axie contract
    const axieABI = JSON.parse(await fs.readFile(CONTRACT_AXIE_ABI_JSON_PATH, 'utf8'))
    const axieContract = await new hre.ethers.Contract(CONTRACT_AXIE_ADDRESS[network], axieABI, signer)

    // get axies balance for the address
    const axiesBalance = await axieContract.balanceOf(address)

    // get axie ids
    let axieIds = []
    for (let i = 0; i < axiesBalance; i++) {
      const axieId = await axieContract.tokenOfOwnerByIndex(address, i)
      axieIds.push(axieId)
    }
    return axieIds

  } catch (error) {
    console.error(error)
  }
  return []
}
