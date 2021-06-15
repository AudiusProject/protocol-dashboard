const DEFAULT_TIMEOUT_MS = 7500
export const TIMED_OUT_ERROR = 'Request Timed Out'

export const fetchWithTimeout = async (
  url: string,
  timeout: number = DEFAULT_TIMEOUT_MS
) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${TIMED_OUT_ERROR}:${url}`)), timeout)
  })

  const res = (await Promise.race([fetch(url), timeoutPromise])) as Response
  if (!res.ok) {
    throw new Error(res.statusText)
  }
  return res.json()
}

export const withTimeout = async (
  asyncCall: () => Promise<any>,
  timeout: number = DEFAULT_TIMEOUT_MS
) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${TIMED_OUT_ERROR}`)), timeout)
  })

  const res = await Promise.race([asyncCall, timeoutPromise])
  return res
}

// TODO: put in env vars for staging
export const fetchUntilSuccess = async (endpoints: string[]): Promise<any> => {
  try {
    // Pick a random endpoint from the allowed endpoints
    const endpoint =
      endpoints[Math.floor(Math.random() * endpoints.length)]
    console.info('Attempting endpoint: ', endpoint)
    return await fetchWithTimeout(endpoint)
  } catch (e) {
    console.error(e)
    return await fetchUntilSuccess(endpoints)
  }
}
