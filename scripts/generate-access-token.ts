import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { getRandomMessage, createAccessTokenWithSignature } from "../lib/utils"

// TODO: get new method, this is deprecated
export default async function generateMartketplaceAccessToken(hre: HardhatRuntimeEnvironment) {
  try {
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()

    const message = await getRandomMessage()
    if (message === false) {
      return false
    }

    const signature = await signer.signMessage(message)
    const token = await createAccessTokenWithSignature(address, message, signature)
    if (token === false) {
      return false
    }
    // console.log(token)
    return token
  } catch (error) {
    console.error(error)
  }
  return false
}
