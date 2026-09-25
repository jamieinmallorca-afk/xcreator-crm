/**
 * POST /api/cron/winback
 *
 * Called by Vercel Cron (see vercel.json) once per day.
 * 1. Find all profiles with active DM templates
 * 2. For each profile, find subscribers whose health score < trigger_score
 *    and who haven't received a win-back DM in the last 30 days
 * 3. Send a DM via X API v2, log the result
 *
 * Requires the stored x_access_token to have dm.write scope.
 * Users grant this during the OAuth flow (dm.write must be in X_OAUTH_SCOPES).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  // Verify this is called by Vercel Cron (or our own internal calls)
  const auth = request.headers.get('authorization')
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()

  // Fetch all active templates grouped by profile
  const { data: templates, error: tErr } = await db
    .from('dm_templates')
    .select(`
      id, profile_id, name, message, trigger_score,
      profiles!inner (
        x_access_token, x_username
      )
    `)
    .eq('is_active', true)

  if (tErr) {
    console.error('[winback] templates fetch error', tErr)
    return NextResponse.json({ error: tErr.message }, { status: 500 })
  }

  const results: Array<{ profileId: string; sent: number; skipped: number; errors: number }> = []

  for (const template of (templates ?? [])) {
    const profileId = template.profile_id
    const profileData = (template.profiles as unknown as { x_access_token: string })
    const accessToken = profileData.x_access_token

    if (!accessToken) {
      results.push({ profileId, sent: 0, skipped: 0, errors: 1 })
      continue
    }

    // Find at-risk subscribers for this profile not DMed in 30 days
    const { data: atRisk, error: subErr } = await db
      .from('subscribers')
      .select('x_user_id, x_username, health_score')
      .eq('profile_id', profileId)
      .lt('health_score', template.trigger_score)
      .not('x_user_id', 'is', null)

    if (subErr || !atRisk?.length) {
      results.push({ profileId, sent: 0, skipped: atRisk?.length ?? 0, errors: subErr ? 1 : 0 })
      continue
    }

    // Filter out those already DMed in the last 30 days
    const { data: recentLogs } = await db
      .from('dm_log')
      .select('subscriber_x_user_id')
      .eq('profile_id', profileId)
      .eq('status', 'sent')
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const recentSet = new Set((recentLogs ?? []).map(l => l.subscriber_x_user_id))
    const eligible = atRisk.filter(s => !recentSet.has(s.x_user_id))

    let sent = 0, skipped = atRisk.length - eligible.length, errors = 0

    for (const sub of eligible) {
      const renderedMessage = template.message.replace(/\{\{username\}\}/g, sub.x_username ?? 'there')

      // Insert log entry as pending first
      const { data: logEntry } = await db
        .from('dm_log')
        .insert({
          profile_id: profileId,
          subscriber_x_user_id: sub.x_user_id,
          subscriber_username: sub.x_username,
          template_id: template.id,
          message: renderedMessage,
          status: 'pending',
        })
        .select('id')
        .single()

      // Send via X API v2
      const dmRes = await fetch(
        `https://api.twitter.com/2/dm_conversations/with/${sub.x_user_id}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: renderedMessage }),
        }
      )

      if (dmRes.ok) {
        const dmData = await dmRes.json() as { data?: { dm_event_id?: string } }
        await db.from('dm_log').update({
          status: 'sent',
          x_dm_event_id: dmData?.data?.dm_event_id,
          sent_at: new Date().toISOString(),
        }).eq('id', logEntry!.id)
        sent++
      } else {
        const dmErr = await dmRes.text()
        const isRateLimit = dmRes.status === 429

        await db.from('dm_log').update({
          status: isRateLimit ? 'rate_limited' : 'failed',
          error: dmErr,
        }).eq('id', logEntry!.id)

        errors++

        // Back off on rate limit — stop sending for this profile
        if (isRateLimit) {
          console.warn(`[winback] Rate limited for profile ${profileId}`)
          break
        }
      }

      // Polite delay between DMs (0.5s) to avoid bursting
      await new Promise(r => setTimeout(r, 500))
    }

    results.push({ profileId, sent, skipped, errors })
  }

  const totalSent = results.reduce((a, r) => a + r.sent, 0)
  console.log(`[winback] Done. Total sent: ${totalSent}`)
  return NextResponse.json({ ok: true, results, totalSent })
}
