import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { apiRequest } from "../lib/utils";

const AUTH_NONCE_URL = 'https://athena.skymavis.com/v2/public/auth/ronin/fetch-nonce'
const AUTH_LOGIN_URL = 'https://athena.skymavis.com/v2/public/auth/ronin/login'
const AUTH_TOKEN_REFRESH_URL = 'https://athena.skymavis.com/v2/public/auth/token/refresh'

interface IAuthFetchNonceResponse {
  nonce: string;
  issued_at: string;
  not_before: string;
  expiration_time: string;
}

interface IAuthLoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  accessTokenExpiresIn: number,
  refreshToken: string;
  userID: string;
  enabled_mfa: boolean;
}

// Taken from https://github.com/SM-Trung-Le/temp-accessToken
export const getMarketplaceAccessTokenMessage = async (
  data: IAuthFetchNonceResponse,
  address: string,
  domain = `axie-sniper.alexpedersen.dev`,
  uri = "https://axie-sniper.alexpedersen.dev",
  statement = `I accept the Terms of Use (https://axie-sniper.alexpedersen.dev/terms-of-use) and the Privacy Policy (https://axie-sniper.alexpedersen.dev/privacy-policy)`,
) => {
  const message = `${domain} wants you to sign in with your Ronin account:\n${address.replace('0x', 'ronin:').toLowerCase()}\n\n${statement}\n\nURI: ${uri}\nVersion: 1\nChain ID: 2020\nNonce: ${data.nonce}\nIssued At: ${data.issued_at}\nExpiration Time: ${data.expiration_time}\nNot Before: ${data.not_before}`,
  /* 
      Example message: 
      app.axieinfinity.com wants you to sign in with your Ronin account: ronin:af9d50d8e6e19e3163583f293bb9b457cd28e8af I accept the Terms of Use (https://axieinfinity.com/terms-of-use) and the Privacy Policy (https://axieinfinity.com/privacy-policy) URI: https://app.axieinfinity.com Version: 1 Chain ID: 2020 Nonce: 13706446796901304963 Issued At: 2023-06-16T14:05:11Z Expiration Time: 2023-06-16T14:05:41Z Not Before: 2023-06-16T14:05:11Z
  */
  return message
}

export const exchangeToken = async (signature: string, message: string) => {
  const data = await apiRequest<IAuthLoginResponse>(AUTH_LOGIN_URL, JSON.stringify({ signature, message }))

  if (!data.accessToken) {
    throw new Error('No access token')
  }

  return data
}

export const refreshToken = async (refreshToken: string) => { // Optional 
  const data = await apiRequest<IAuthLoginResponse>(AUTH_TOKEN_REFRESH_URL, JSON.stringify({ refreshToken }))
  const newAccessToken = data.accessToken
  const newRefreshToken = data.refreshToken
  return { newAccessToken, newRefreshToken }
}

export default async function generateMartketplaceAccessToken(hre: HardhatRuntimeEnvironment) {
  try {
    // Get signer
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    // Get address
    const address = signer.address.toLowerCase()
    // Get nonce
    const data = await apiRequest<IAuthFetchNonceResponse>(`${AUTH_NONCE_URL}?address=${address}`, null, {}, "GET")
    // Generate message to sign
    const domain = `alexpedersen.dev`
    const uri = "https://alexpedersen.dev"
    const statement = `This is a demo of the Axie Infinity Marketplace Access Token Generator.`
    const message = await getMarketplaceAccessTokenMessage(data, address, domain, uri, statement)
    // Sign message
    const signature = await signer.signMessage(message)
    // Exchange signature for access token
    const { accessToken } = await exchangeToken(signature, message)
    return accessToken
  } catch (error) {
    console.error(error)
  }
  return false
}
