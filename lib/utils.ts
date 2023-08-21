export async function apiRequest<T>(
  url: string,
  body: BodyInit | null = null,
  headers: Record<string, string> = {},
  method: 'GET' | 'POST' = 'POST',
) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...(method === 'GET' ? {} : { body })
  })

  const res: T = await response.json()
  return res
}
