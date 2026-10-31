import { useAuthContext } from '../context/AuthContext'
import { usePortalLightLock } from '../hooks/usePortalLightLock'

const stats = [
  { label: 'Open requests', value: '0' },
  { label: 'Harvests nearby', value: '0' },
  { label: 'Unread messages', value: '0' }
]

export default function BuyerDashboard() {
  usePortalLightLock()
  const { user } = useAuthContext()
  const firstName = user?.full_name?.split(' ')[0] || 'buyer'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#4d7c0f]">
        Buyer dashboard
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">
        Muraho, {firstName}.
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Post what you need, browse available harvests and contact farmers
        directly. Marketplace tools are coming next.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-card border border-line bg-[#efe7d6] p-5 shadow-soft"
          >
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-card border border-dashed border-[#d9f99d] bg-[#d9f99d]/15 p-6 text-sm text-[#0f3d25]">
        Your buyer requests and matched harvests will appear here.
      </div>
    </div>
  )
}
