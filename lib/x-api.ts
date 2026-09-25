const X_API_BASE = 'https://api.twitter.com/2'

export interface XFollower {
  id: string
  name: string
  username: string
}

/**
 * Fetch all followers for a user (paginates automatically, max 1000 per page).
 * Uses OAuth 2.0 user access token.
 */
export async function getFollowers(
  userId: string,
  accessToken: string,
  maxResults = 1000
): Promise<XFollower[]> {
  const followers: XFollower[] = []
  let nextToken: string | undefined

  do {
    const params = new URLSearchParams({
      max_results: String(Math.min(maxResults, 1000)),
      'user.fields': 'name,username,created_at',
    })
    if (nextToken) params.set('pagination_token', nextToken)

    const res = await fetch(
      `${X_API_BASE}/users/${userId}/followers?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`X API error ${res.status}: ${err}`)
    }

    const json = await res.json()
    if (json.data) followers.push(...json.data)
    nextToken = json.meta?.next_token
  } while (nextToken && followers.length < maxResults)

  return followers
}

/**
 * Get basic user info for the authenticated user.
 */
export async function getXUser(accessToken: string) {
  const res = await fetch(
    `${X_API_BASE}/users/me?user.fields=name,username,profile_image_url,public_metrics`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error(`X API error ${res.status}`)
  const { data } = await res.json()
  return data
}

/**
 * Refresh an expired OAuth 2.0 access token.
 */
export async function refreshXToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const res = await fetch(`${X_API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`)
  return res.json()
}

/**
 * Simple health score: 100 for followers active in last 7 days,
 * degrades linearly to 20 at 90 days, stays at 20 beyond that.
 * (Week 1: score based on follow date as a proxy until engagement data flows in)
 */
export function calculateHealthScore(followedAt: Date | null): number {
  if (!followedAt) return 50
  const daysSince = (Date.now() - followedAt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSince < 7) return 95
  if (daysSince < 30) return 80
  if (daysSince < 60) return 60
  if (daysSince < 90) return 40
  return 20
}
