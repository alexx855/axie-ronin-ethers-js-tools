import { GRAPHQL_URL } from "./constants"

export async function apiRequest<T>(query: string, variables: { [key: string]: any }, headers?: { [key: string]: any }) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({ query, variables })
  })

  const res: T = await response.json()
  return res
}

export const getRandomMessage = async () => {
  const query = `mutation CreateRandomMessage {
    createRandomMessage
  }`
  interface IRandomMessage {
    data?: {
      createRandomMessage: string
    }
    errors?: {
      message: string
    }
  }
  const res = await apiRequest<IRandomMessage>(query, {})

  if (res === null || res.data === undefined) {
    return false
  }
  return res.data.createRandomMessage
}

export const createAccessTokenWithSignature = async (owner: string, message: string, signature: string) => {
  const query = `mutation CreateAccessTokenWithSignature($input: SignatureInput!) {
    createAccessTokenWithSignature(input: $input) {
      newAccount
      result
      accessToken
      __typename
    }
  }`
  interface ICreateAccessTokenResponse {
    data?: {
      createAccessTokenWithSignature: {
        accessToken: string
      }
    }
    errors?: {
      message: string
    }
  }

  const variables = { input: { mainnet: 'ronin', owner, message, signature } }
  const res = await apiRequest<ICreateAccessTokenResponse>(query, variables)

  if (res !== null) {
    if (res.data?.createAccessTokenWithSignature.accessToken !== undefined) {
      return res.data.createAccessTokenWithSignature.accessToken
    }

    if (res.errors !== undefined) {
      console.error(res.errors)
    }
  }

  console.log('Error creating access token')
  return false
}
