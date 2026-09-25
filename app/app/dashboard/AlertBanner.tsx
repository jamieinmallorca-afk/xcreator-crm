'use client'

interface Alert {
  id: string
  alert_type: string
  message: string | null
}

export default function AlertBanner({ alert }: { alert: Alert }) {
  const icon = alert.alert_type === 'churn_risk' ? '⚠️' : alert.alert_type === 'unfollow' ? '👋' : '🎉'
  const borderColor =
    alert.alert_type === 'churn_risk' || alert.alert_type === 'unfollow'
      ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-300'
      : 'border-blue-500/30 bg-blue-500/5 text-blue-300'

  return (
    <div className={`border rounded-lg px-4 py-3 text-sm flex items-center gap-3 ${borderColor}`}>
      <span>{icon}</span>
      <span>{alert.message ?? alert.alert_type.replace(/_/g, ' ')}</span>
    </div>
  )
}
