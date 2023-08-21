import type { HardhatRuntimeEnvironment } from "hardhat/types"

const AUTH_NONCE_URL = 'https://athena.skymavis.com/v2/public/auth/ronin/fetch-nonce'
const AUTH_LOGIN_URL = 'https://athena.skymavis.com/v2/public/auth/ronin/login'
const AUTH_TOKEN_REFRESH_URL = 'https://athena.skymavis.com/v2/public/auth/token/refresh'

interface IMarketplaceGetNonceResponse {
  nonce: string;
  issued_at: string;
  not_before: string;
  expiration_time: string;
}

interface IMarketplaceLoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  accessTokenExpiresIn: number,
  refreshToken: string;
  userID: string;
  enabled_mfa: boolean;
}

// Taken from https://github.com/SM-Trung-Le/temp-accessToken
export const getMarketplaceAccessTokenMessage = async (data: any, address: string) => {
  const domain = `axie-sniper.alexpedersen.dev`
  const uri = "https://axie-sniper.alexpedersen.dev"
  const statement = `I accept the Terms of Use (https://axie-sniper.alexpedersen.dev/terms-of-use) and the Privacy Policy (https://axie-sniper.alexpedersen.dev/privacy-policy)`
  const message = `${domain} wants you to sign in with your Ronin account:\n${address.replace('0x', 'ronin:').toLowerCase()}\n\n${statement}\n\nURI: ${uri}\nVersion: 1\nChain ID: 2020\nNonce: ${data.nonce}\nIssued At: ${data.issued_at}\nExpiration Time: ${data.expiration_time}\nNot Before: ${data.not_before}`

  /* 
      Example message: 
      app.axieinfinity.com wants you to sign in with your Ronin account: ronin:af9d50d8e6e19e3163583f293bb9b457cd28e8af I accept the Terms of Use (https://axieinfinity.com/terms-of-use) and the Privacy Policy (https://axieinfinity.com/privacy-policy) URI: https://app.axieinfinity.com Version: 1 Chain ID: 2020 Nonce: 13706446796901304963 Issued At: 2023-06-16T14:05:11Z Expiration Time: 2023-06-16T14:05:41Z Not Before: 2023-06-16T14:05:11Z
  */

  return message
}

export const exchangeToken = async (signature: string, message: string) => {
  const response = await fetch(AUTH_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ signature, message })
  })
  const data = await response.json() as IMarketplaceLoginResponse

  if (!data.accessToken) {
    throw new Error('No access token')
  }

  return data.accessToken
}

export const refreshToken = async (refreshToken: string) => { // Optional 
  const response = await fetch(AUTH_TOKEN_REFRESH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  })
  const data = await response.json()
  const newAccessToken = data.accessToken
  const newRefreshToken = data.refreshToken
  return { newAccessToken, newRefreshToken }
}

export default async function generateMartketplaceAccessToken(hre: HardhatRuntimeEnvironment) {
  try {
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]
    const address = signer.address.toLowerCase()

    // Get nonce
    const response = await fetch(`${AUTH_NONCE_URL}?address=${address}`)
    const data = await response.json() as IMarketplaceGetNonceResponse
    // Get message to sign
    const message = await getMarketplaceAccessTokenMessage(data, address)
    // Sign message
    const signature = await signer.signMessage(message)
    const token = await exchangeToken(signature, message)
    const refreshedToken = await refreshToken(token)
    console.log('refreshedToken', refreshedToken)
    return token
  } catch (error) {
    console.error(error)
  }
  return false
}
