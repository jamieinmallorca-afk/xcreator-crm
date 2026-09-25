/**
 * POST /api/cron/winback
 * Called by Vercel Cron daily. Sends win-back DMs to at-risk subscribers.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()

  // Fetch all active templates (no join — separate profile lookup below)
  const { data: templates, error: tErr } = await db
    .from('dm_templates')
    .select('id, profile_id, message, trigger_score')
    .eq('is_active', true)

  if (tErr) {
    console.error('[winback] templates fetch error', tErr)
    return NextResponse.json({ error: tErr.message }, { status: 500 })
  }

  // Group templates by profile_id to avoid re-fetching the same access token
  const byProfile = new Map<string, Array<{ id: string; message: string; trigger_score: number }>>()
  for (const t of templates ?? []) {
    if (!byProfile.has(t.profile_id)) byProfile.set(t.profile_id, [])
    byProfile.get(t.profile_id)!.push({ id: t.id, message: t.message, trigger_score: t.trigger_score })
  }

  const results: Array<{ profileId: string; sent: number; skipped: number; errors: number }> = []

  for (const [profileId, profileTemplates] of byProfile.entries()) {
    // Fetch access token for this profile separately — avoids join type issues
    const { data: profile } = await db
      .from('profiles')
      .select('x_access_token')
      .eq('id', profileId)
      .single()

    const accessToken: string | null = profile?.x_access_token ?? null

    if (!accessToken) {
      results.push({ profileId, sent: 0, skipped: 0, errors: 1 })
      continue
    }

    // Use the lowest trigger_score template active for this profile
    const template = profileTemplates.sort((a, b) => a.trigger_score - b.trigger_score)[0]

    // Find at-risk subscribers
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

    // Filter out those already DMed in last 30 days
    const { data: recentLogs } = await db
      .from('dm_log')
      .select('subscriber_x_user_id')
      .eq('profile_id', profileId)
      .eq('status', 'sent')
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const recentSet = new Set((recentLogs ?? []).map((l: { subscriber_x_user_id: string }) => l.subscriber_x_user_id))
    const eligible = atRisk.filter((s: { x_user_id: string }) => !recentSet.has(s.x_user_id))

    let sent = 0
    let skipped = atRisk.length - eligible.length
    let errors = 0

    for (const sub of eligible) {
      const subUsername: string = (sub as { x_username?: string }).x_username ?? 'there'
      const subUserId: string = (sub as { x_user_id: string }).x_user_id
      const renderedMessage = template.message.replace(/\{\{username\}\}/g, subUsername)

      const { data: logEntry } = await db
        .from('dm_log')
        .insert({
          profile_id: profileId,
          subscriber_x_user_id: subUserId,
          subscriber_username: subUsername,
          template_id: template.id,
          message: renderedMessage,
          status: 'pending',
        })
        .select('id')
        .single()

      const dmRes = await fetch(
        `https://api.twitter.com/2/dm_conversations/with/${subUserId}/messages`,
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
        if (logEntry) {
          await db.from('dm_log').update({
            status: 'sent',
            x_dm_event_id: dmData?.data?.dm_event_id ?? null,
            sent_at: new Date().toISOString(),
          }).eq('id', logEntry.id)
        }
        sent++
      } else {
        const dmErr = await dmRes.text()
        const isRateLimit = dmRes.status === 429
        if (logEntry) {
          await db.from('dm_log').update({
            status: isRateLimit ? 'rate_limited' : 'failed',
            error: dmErr,
          }).eq('id', logEntry.id)
        }
        errors++
        if (isRateLimit) break
      }

      await new Promise(r => setTimeout(r, 500))
    }

    results.push({ profileId, sent, skipped, errors })
  }

  const totalSent = results.reduce((a, r) => a + r.sent, 0)
  return NextResponse.json({ ok: true, results, totalSent })
}
