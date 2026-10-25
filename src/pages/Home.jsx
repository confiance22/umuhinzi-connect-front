import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { roleHome } from '../utils/roles'

const features = [
  {
    title: 'Sell at the right price',
    body: 'Farmers publish quantity, price and location so buyers can find them directly.'
  },
  {
    title: 'Buy with confidence',
    body: 'Browse harvest listings and contact the farmer in seconds — no middlemen required.'
  },
  {
    title: 'Less post-harvest waste',
    body: 'Stronger market linkages help produce move before it spoils.'
  }
]

export default function Home() {
  const { isAuthenticated, user } = useAuthContext()

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 via-brand-800 to-[#0b3d24] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-100">
            Rwanda&apos;s harvest marketplace
          </span>
          <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
            Fresh harvests, direct from Rwandan farmers.
          </h1>
          <p className="mt-4 max-w-xl text-base text-brand-50/90 sm:text-lg">
            Umuhinzi Connect links smallholder farmers with buyers, so good
            produce finds a market before it goes to waste.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <Link
                to={roleHome(user.role)}
                className="rounded-card bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-card bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
                >
                  Join Umuhinzi Connect
                </Link>
                <Link
                  to="/login"
                  className="rounded-card border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-card border border-line bg-card p-5 shadow-soft"
            >
              <h2 className="text-base font-semibold text-ink">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-card border border-dashed border-brand-200 bg-brand-50/60 p-6 text-sm text-brand-900">
          The public harvest grid and filters arrive next. In the meantime,
          create an account to explore the platform.
        </div>
      </section>
    </div>
  )
}
