import Link from 'next/link'

const features = [
  {
    icon: '📊',
    title: 'Subscriber Health Scores',
    desc: "Every paid subscriber gets a daily 0–100 score based on the engagement signals X makes available — recency, activity, and tier. See who's about to cancel before they do.",
  },
  {
    icon: '🔴',
    title: 'Churn Risk Flags',
    desc: 'Subscribers who haven\'t engaged in 14, 30, or 60 days are automatically flagged Red / Amber / Green. No manual tracking needed.',
  },
  {
    icon: '💬',
    title: 'Automated Win-Back DMs',
    desc: 'When a subscriber crosses a churn threshold, a personalised DM goes out automatically. Set it once, recover revenue forever.',
  },
  {
    icon: '💰',
    title: 'Revenue Dashboard',
    desc: "MRR, churn rate, new vs lost subscribers this month, and LTV by cohort — all in one view X's native analytics don't give you.",
  },
  {
    icon: '📈',
    title: 'Content Attribution',
    desc: 'See which post types — exclusive threads, videos, polls — drive subscriber growth or trigger cancellations. Double down on what works.',
  },
  {
    icon: '🎯',
    title: 'Cohort Analysis',
    desc: "Which month's subscribers retain best? What's the average LTV by pricing tier? Know your best acquisition periods.",
  },
]

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try it with your first 100 subscribers.',
    featureList: ['Up to 100 subscribers', 'Basic health scores', 'Churn flags', '7-day data history'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For creators serious about subscriber retention.',
    featureList: ['Up to 1,000 subscribers', 'Full health scoring', 'Automated win-back DMs', 'Revenue dashboard', 'Content attribution', '90-day history'],
    cta: 'Start Pro trial',
    highlight: true,
  },
  {
    name: 'Scale',
    price: '$79',
    period: '/month',
    description: 'For high-volume creators and agencies.',
    featureList: ['Up to 5,000 subscribers', 'Everything in Pro', 'Cohort analytics', 'API access', 'Priority support', 'Unlimited history'],
    cta: 'Start Scale trial',
    highlight: false,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-500">✦</span>
          <span className="font-bold text-lg tracking-tight">XCreator CRM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link href="/dashboard" className="btn-primary text-sm px-4 py-2">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-sm text-brand-500 font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Built for X creators with paid subscribers
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
          Stop losing paid subscribers<br />
          <span className="text-brand-500">before you even notice.</span>
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          XCreator CRM tracks every paid subscriber on X, scores their engagement daily,
          flags churn risk automatically, and sends win-back DMs before they cancel.
          The CRM X never built.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="btn-primary text-base">
            Connect your X account →
          </Link>
          <Link href="#features" className="btn-secondary text-base">
            See how it works
          </Link>
        </div>
        <p className="mt-4 text-sm text-white/40">Free up to 100 subscribers · No credit card required</p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/10 bg-white/[0.02] py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '3x', label: 'more subscribers recovered when you act within 48 hrs' },
            { value: '< 2 min', label: 'to connect & see your data' },
            { value: '$0', label: 'to start' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-brand-500">{s.value}</div>
              <div className="text-sm text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Everything X won&apos;t tell you</h2>
        <p className="text-white/50 text-center mb-16 max-w-xl mx-auto">
          X&apos;s native analytics show you follower counts and impressions. XCreator CRM shows you who&apos;s about to cancel and what to do about it.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card hover:border-white/20 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-white/50 text-center mb-16">Starts free. Scales with your subscriber count.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl p-6 border ${
                t.highlight
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {t.highlight && (
                <div className="text-xs font-semibold text-brand-500 bg-brand-500/20 rounded-full px-3 py-1 inline-block mb-4">
                  Most popular
                </div>
              )}
              <div className="mb-4">
                <span className="text-3xl font-bold">{t.price}</span>
                <span className="text-white/50 text-sm">{t.period}</span>
              </div>
              <p className="text-white/60 text-sm mb-6">{t.description}</p>
              <ul className="space-y-2 mb-8">
                {t.featureList.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-brand-500 mt-0.5">✓</span>
                    <span className="text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className={`block text-center font-semibold py-3 rounded-xl transition-all ${
                  t.highlight
                    ? 'bg-brand-500 hover:bg-brand-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/30">
        <p className="mb-3">© 2026 XCreator CRM · Built for the creator economy</p>
        <div className="flex justify-center gap-6">
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
          <Link href="/refund" className="hover:text-white/60 transition-colors">Refund Policy</Link>
        </div>
      </footer>
    </main>
  )
}
