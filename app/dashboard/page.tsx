export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="text-4xl mb-6">✦</div>
        <h1 className="text-2xl font-bold mb-3">XCreator CRM Dashboard</h1>
        <p className="text-white/50 mb-8">
          Connect your X account to see your subscriber health scores,
          churn risk flags, and revenue analytics.
        </p>
        <button className="btn-primary w-full">
          Connect with X →
        </button>
        <p className="text-xs text-white/30 mt-4">
          We request read-only access to your subscriber list and DM permissions for win-back flows.
        </p>
      </div>
    </main>
  )
}
