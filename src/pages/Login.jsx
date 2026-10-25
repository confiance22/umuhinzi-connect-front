import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { roleHome } from '../utils/roles'

const inputClass =
  'w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export default function Login() {
  const { login } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ phone: '', password: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    setSubmitting(true)

    try {
      const user = await login(form.phone, form.password)
      const from = location.state?.from?.pathname
      navigate(from || roleHome(user.role), { replace: true })
    } catch (err) {
      const data = err.response?.data
      setError(data?.error || 'Unable to sign in. Please try again.')
      setFieldErrors(data?.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
      <section className="hidden rounded-card bg-gradient-to-br from-brand-700 via-brand-800 to-[#0b3d24] p-8 text-white lg:block">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">
          Umuhinzi Connect
        </p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight">
          Welcome back to the harvest market.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-50/85">
          Sign in to manage your listings, buyer requests and conversations.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-brand-50/90">
          <li>Direct farmer-to-buyer links</li>
          <li>Simple harvest listings</li>
          <li>Built for Rwanda&apos;s districts</li>
        </ul>
      </section>

      <section className="rounded-card border border-line bg-card p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your phone number and password.
        </p>

        {error && (
          <div className="mt-4 rounded-card border border-danger-600/20 bg-red-50 px-3.5 py-2.5 text-sm text-danger-700">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={form.phone}
              onChange={onChange}
              placeholder="07XX XXX XXX"
              className={inputClass}
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-xs text-danger-600">{fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={onChange}
              placeholder="Your password"
              className={inputClass}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-danger-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-card bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted">
          New here?{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-700 hover:text-brand-800"
          >
            Create an account
          </Link>
        </p>
      </section>
    </div>
  )
}
