import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { exchangeToken, generateAccessTokenMessage, refreshToken } from "../lib/marketplace/access-token";

export async function refreshAccessToken(refresh_token: { token: string }, hre: HardhatRuntimeEnvironment) {
  try {
    const { newAccessToken } = await refreshToken(refresh_token.token)
    return newAccessToken
  } catch (error) {
    console.error(error)
  }
}

export async function generateMartketplaceAccessToken({ }, hre: HardhatRuntimeEnvironment) {
  try {
    // Get signer
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    // Get address
    const address = signer.address.toLowerCase()
    // Generate message to sign
    const domain = `alexpedersen.dev`
    const uri = "https://alexpedersen.dev"
    const statement = `This is a demo of the Axie Infinity Marketplace Access Token Generator.`
    const message = await generateAccessTokenMessage(address, domain, uri, statement)
    // Sign message
    const signature = await signer.signMessage(message)
    // Exchange signature for access token
    const { accessToken } = await exchangeToken(signature, message)
    console.log('Access Token:', accessToken)
  } catch (error) {
    console.error(error)
  }
}
