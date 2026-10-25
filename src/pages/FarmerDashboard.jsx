import { useAuthContext } from '../context/AuthContext'

const stats = [
  { label: 'Active harvests', value: '0' },
  { label: 'Buyer requests', value: '0' },
  { label: 'Unread messages', value: '0' }
]

export default function FarmerDashboard() {
  const { user } = useAuthContext()
  const firstName = user?.full_name?.split(' ')[0] || 'farmer'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
        Farmer dashboard
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">
        Muraho, {firstName}.
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        This is your home for publishing harvests and responding to buyer
        requests. Harvest management is coming next.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-card border border-line bg-card p-5 shadow-soft"
          >
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-card border border-dashed border-brand-200 bg-brand-50/60 p-6 text-sm text-brand-900">
        Your harvest listings and the create/edit form will appear here.
      </div>
    </div>
  )
}
