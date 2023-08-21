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
