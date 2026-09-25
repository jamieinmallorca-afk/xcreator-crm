import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase'
import ConnectButton from './ConnectButton'
import PricingCards from './PricingCards'
import WinbackSection from './WinbackSection'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string }
}) {
  const session = getSession()
  if (!session) redirect('/')

  const db = createAdminClient()

  const { data: profile } = await db
    .from('profiles')
    .select('x_username, stripe_subscription_id, onboarding_completed')
    .eq('id', session.userId)
    .single()

  // Redirect first-time users to onboarding
  if (!profile?.onboarding_completed) redirect('/onboarding')

  const { data: subscribers } = await db
    .from('subscribers')
    .select('health_score, x_username')
    .eq('profile_id', session.userId)
    .order('health_score', { ascending: true })

  const totalSubscribers = subscribers?.length ?? 0
  const atRiskCount = subscribers?.filter(s => s.health_score < 30).length ?? 0
  const avgHealthScore =
    totalSubscribers > 0
      ? Math.round(
          subscribers!.reduce((acc, s) => acc + (s.health_score ?? 100), 0) / totalSubscribers
        )
      : 100

  const isPro = !!profile?.stripe_subscription_id

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-400">XCreator</span>
          <span className="text-slate-600">CRM</span>
        </div>
        <div className="flex items-center gap-4">
          {profile?.x_username && (
            <span className="text-sm text-slate-400">@{profile.x_username}</span>
          )}
          <a
            href="/api/auth/logout"
            className="text-sm text-slate-500 hover:text-white transition-colors"
          >
            Sign out
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Upgrade success banner */}
        {searchParams.upgraded && (
          <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl px-5 py-3 text-emerald-300 text-sm">
            🎉 You're now on the Pro plan! All features unlocked.
          </div>
        )}

        {/* Alerts */}
        {atRiskCount > 0 && (
          <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl px-5 py-3 text-amber-300 text-sm">
            ⚠️ {atRiskCount} subscriber{atRiskCount === 1 ? '' : 's'} at risk of churning. Consider sending a win-back DM.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Subscribers', value: totalSubscribers.toLocaleString(), color: 'text-white' },
            { label: 'At Risk',           value: atRiskCount.toLocaleString(),      color: 'text-amber-400' },
            { label: 'Avg Health',        value: `${avgHealthScore}%`,              color: avgHealthScore >= 70 ? 'text-emerald-400' : avgHealthScore >= 40 ? 'text-amber-400' : 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Subscriber table */}
        {totalSubscribers > 0 && (
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-base font-semibold">At-risk subscribers</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-slate-800">
                  <th className="text-left px-6 py-3">Username</th>
                  <th className="text-right px-6 py-3">Health score</th>
                </tr>
              </thead>
              <tbody>
                {(subscribers ?? [])
                  .filter(s => s.health_score < 50)
                  .slice(0, 20)
                  .map(s => (
                    <tr key={s.x_username} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3 text-slate-300">@{s.x_username}</td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className={`font-mono text-xs px-2 py-1 rounded-full ${
                            s.health_score < 30
                              ? 'bg-red-900/40 text-red-400'
                              : 'bg-amber-900/40 text-amber-400'
                          }`}
                        >
                          {s.health_score}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Win-back DM section */}
        {isPro ? (
          <WinbackSection />
        ) : (
          <div className="bg-slate-900/40 border border-dashed border-slate-700/50 rounded-2xl p-6 text-center">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm font-medium text-white mb-1">Win-back DMs</p>
            <p className="text-sm text-slate-500">Upgrade to Pro to auto-send DMs when subscribers go cold.</p>
          </div>
        )}

        {/* Pricing cards (for free users) */}
        {!isPro && <PricingCards currentTier="free" />}

        {/* Connect button */}
        <div className="flex justify-center">
          <ConnectButton username={profile?.x_username ?? ''} />
        </div>
      </div>
    </div>
  )
}
