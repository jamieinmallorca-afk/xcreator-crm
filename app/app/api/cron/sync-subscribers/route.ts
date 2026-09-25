import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getFollowers, calculateHealthScore, refreshXToken } from '@/lib/x-api'

// Vercel cron hits this endpoint daily — protect it with a shared secret
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()

  // Fetch all profiles with valid tokens
  const { data: profiles, error } = await db
    .from('profiles')
    .select('id, x_user_id, x_access_token, x_refresh_token, x_token_expires_at, subscriber_limit')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results: { profileId: string; synced: number; errors: string[] }[] = []

  for (const profile of profiles ?? []) {
    const errors: string[] = []
    let accessToken = profile.x_access_token

    try {
      // Refresh token if expired (with 5 min buffer)
      if (
        profile.x_token_expires_at &&
        new Date(profile.x_token_expires_at).getTime() < Date.now() + 5 * 60 * 1000 &&
        profile.x_refresh_token
      ) {
        const refreshed = await refreshXToken(profile.x_refresh_token)
        accessToken = refreshed.access_token
        await db.from('profiles').update({
          x_access_token: refreshed.access_token,
          x_refresh_token: refreshed.refresh_token,
          x_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        }).eq('id', profile.id)
      }

      // Fetch followers from X API
      const followers = await getFollowers(
        profile.x_user_id,
        accessToken,
        profile.subscriber_limit
      )

      // Upsert each follower
      for (const follower of followers) {
        const healthScore = calculateHealthScore(new Date()) // week 1: simple score

        const { error: upsertError } = await db.from('subscribers').upsert(
          {
            profile_id: profile.id,
            x_user_id: follower.id,
            x_username: follower.username,
            x_display_name: follower.name,
            is_active: true,
            health_score: healthScore,
            churn_risk: healthScore > 70 ? 'low' : healthScore > 40 ? 'medium' : 'high',
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id,x_user_id', ignoreDuplicates: false }
        )

        if (upsertError) errors.push(upsertError.message)
      }

      // Mark unfollowers as inactive
      const followerIds = followers.map((f) => f.id)
      if (followerIds.length > 0) {
        await db
          .from('subscribers')
          .update({ is_active: false, unfollowed_at: new Date().toISOString() })
          .eq('profile_id', profile.id)
          .eq('is_active', true)
          .not('x_user_id', 'in', `(${followerIds.join(',')})`)
      }

      results.push({ profileId: profile.id, synced: followers.length, errors })
    } catch (err: any) {
      results.push({ profileId: profile.id, synced: 0, errors: [err.message] })
    }
  }

  return NextResponse.json({ ok: true, results })
}
