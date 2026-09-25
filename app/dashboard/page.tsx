import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase'
import ConnectButton from './ConnectButton'
import AlertBanner from './AlertBanner'
import PricingCards from './PricingCards'

export const dynamic = 'force-dynamic'

async function getDashboardData(profileId: string) {
  const db = createAdminClient()

  const [profileRes, subscribersRes, alertsRes] = await Promise.all([
    db.from('profiles').select('subscription_tier').eq('id', profileId).single(),
    db.from('subscribers').select('health_score, churn_risk, is_active, created_at').eq('profile_id', profileId),
    db.from('alerts').select('*').eq('profile_id', profileId).eq('is_read', false).order('created_at', { ascending: false }).limit(5),
  ])

  const subs = subscribersRes.data ?? []
  const active = subs.filter((s) => s.is_active)
  const avgHealth = active.length
    ? Math.round(active.reduce((sum, s) => sum + (s.health_score ?? 0), 0) / active.length)
    : 0
  const highRisk = active.filter((s) => s.churn_risk === 'high').length
  const newThisWeek = active.filter((s) => {
    const d = new Date(s.created_at)
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000
  }).length

  return {
    subscriptionTier: profileRes.data?.subscription_tier ?? 'free',
    totalSubscribers: active.length,
    avgHealth,
    highRisk,
    newThisWeek,
    alerts: alertsRes.data ?? [],
  }
}

async function getTopSubscribers(profileId: string) {
  const db = createAdminClient()
  const { data } = await db
    .from('subscribers')
    .select('x_username, x_display_name, health_score, churn_risk, followed_at')
    .eq('profile_id', profileId)
    .eq('is_active', true)
    .order('health_score', { ascending: false })
    .limit(10)
  return data ?? []
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string; upgraded?: string }
}) {
  const session = getSession()

  if (!session) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-5xl mb-2">📊</div>
          <h1 className="text-3xl font-bold text-white">XCreator CRM</h1>
          <p className="text-gray-400">
            Connect your X account to start tracking subscriber health, churn risk, and engagement.
          </p>
          {searchParams.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              Connection failed: {searchParams.error.replace(/_/g, ' ')}. Please try again.
            </div>
          )}
          <ConnectButton />
          <p className="text-xs text-gray-600">
            We only read your follower list. We never post on your behalf.
          </p>
        </div>
      </main>
    )
  }

  const [stats, topSubs] = await Promise.all([
    getDashboardData(session.userId),
    getTopSubscribers(session.userId),
  ])

  const riskColor = (risk: string) => {
    if (risk === 'high') return 'text-red-400 bg-red-500/10'
    if (risk === 'medium') return 'text-yellow-400 bg-yellow-500/10'
    return 'text-green-400 bg-green-500/10'
  }

  const healthColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">XCreator CRM</span>
          <span className="text-gray-500 text-sm">@{session.xUsername}</span>
        </div>
        <a href="/api/auth/logout" className="text-sm text-gray-400 hover:text-white transition-colors">
          Disconnect
        </a>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {searchParams.connected && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 text-sm">
            ✅ X account connected! Your subscribers are syncing — check back in a few minutes.
          </div>
        )}
        {searchParams.upgraded && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 text-sm">
            🎉 Plan upgraded successfully! Your new subscriber limit is now active.
          </div>
        )}

        {stats.alerts.map((alert) => (
          <AlertBanner key={alert.id} alert={alert} />
        ))}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Subscribers" value={stats.totalSubscribers.toLocaleString()} />
          <StatCard label="New This Week" value={`+${stats.newThisWeek}`} accent="text-green-400" />
          <StatCard label="Avg Health Score" value={`${stats.avgHealth}/100`} accent={healthColor(stats.avgHealth)} />
          <StatCard label="High Churn Risk" value={stats.highRisk.toString()} accent={stats.highRisk > 0 ? 'text-red-400' : 'text-green-400'} />
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-4">Top Subscribers by Health Score</h2>
          {topSubs.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-8 text-center text-gray-500">
              <p>No subscriber data yet.</p>
              <p className="text-sm mt-1">The daily sync runs automatically — or trigger it manually via the API.</p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-400">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Health Score</th>
                    <th className="px-4 py-3">Churn Risk</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Following Since</th>
                  </tr>
                </thead>
                <tbody>
                  {topSubs.map((sub, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">@{sub.x_username}</div>
                        {sub.x_display_name && <div className="text-gray-500 text-xs">{sub.x_display_name}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${healthColor(sub.health_score ?? 0)}`}>{sub.health_score ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskColor(sub.churn_risk ?? 'low')}`}>
                          {sub.churn_risk ?? 'low'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-400">
                        {sub.followed_at ? new Date(sub.followed_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <PricingCards currentTier={stats.subscriptionTier} />
      </div>
    </main>
  )
}

function StatCard({ label, value, accent = 'text-white' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}
