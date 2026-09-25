'use client'

import { useState } from 'react'
import { PLANS } from '@/lib/plans'

export default function PricingCards({ currentTier }: { currentTier: string }) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(plan: 'pro' | 'scale') {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleManageBilling() {
    setLoading('portal')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      alert('Something went wrong.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Plan</h2>
        {currentTier !== 'free' && (
          <button
            onClick={handleManageBilling}
            disabled={loading === 'portal'}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {loading === 'portal' ? 'Loading...' : 'Manage billing'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['free', 'pro', 'scale'] as const).map((key) => {
          const plan = PLANS[key]
          const isCurrent = currentTier === key
          const isUpgrade = key !== 'free' && currentTier !== key

          return (
            <div
              key={key}
              className={`rounded-xl p-5 border ${
                isCurrent
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-white">{plan.name}</span>
                {isCurrent && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-white mb-4">
                {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
              </div>
              <ul className="space-y-1.5 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-gray-400 flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              {isUpgrade && (
                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={!!loading}
                  className="w-full py-2 px-4 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {loading === key ? 'Loading...' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
