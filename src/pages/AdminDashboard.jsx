import { useAuthContext } from '../context/AuthContext'

const stats = [
  { label: 'Users', value: '0' },
  { label: 'Harvests', value: '0' },
  { label: 'Messages', value: '0' }
]

export default function AdminDashboard() {
  const { user } = useAuthContext()
  const firstName = user?.full_name?.split(' ')[0] || 'admin'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
        Admin dashboard
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">
        Welcome, {firstName}.
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Platform statistics and listing moderation will appear here.
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
        User management and harvest moderation are coming next.
      </div>
    </div>
  )
}
