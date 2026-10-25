import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { roleHome } from '../utils/roles'

const inputClass =
  'w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

const roleOptions = [
  { id: 'farmer', title: 'Farmer', hint: 'List your harvest' },
  { id: 'buyer', title: 'Buyer', hint: 'Find produce to buy' }
]

const emptyForm = {
  full_name: '',
  phone: '',
  email: '',
  password: '',
  role: 'farmer',
  district: '',
  sector: ''
}

export default function Register() {
  const { register } = useAuthContext()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
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
      const user = await register(form)
      navigate(roleHome(user.role), { replace: true })
    } catch (err) {
      const data = err.response?.data
      setError(data?.error || 'Unable to create your account. Please try again.')
      setFieldErrors(data?.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:py-16">
      <section className="hidden rounded-card bg-gradient-to-br from-brand-700 via-brand-800 to-[#0b3d24] p-8 text-white lg:block">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">
          Umuhinzi Connect
        </p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight">
          Join the movement from farm to market.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-50/85">
          Create a farmer account to sell your harvest, or a buyer account to
          source fresh produce directly.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-brand-50/90">
          <li>Free to join</li>
          <li>Contact farmers directly</li>
          <li>Built for Rwanda&apos;s districts</li>
        </ul>
      </section>

      <section className="rounded-card border border-line bg-card p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-semibold text-ink">Create account</h1>
        <p className="mt-1 text-sm text-muted">
          A phone number is all you need to get started.
        </p>

        {error && (
          <div className="mt-4 rounded-card border border-danger-600/20 bg-red-50 px-3.5 py-2.5 text-sm text-danger-700">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label
              htmlFor="full_name"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              value={form.full_name}
              onChange={onChange}
              placeholder="e.g. Mukamana Alice"
              className={inputClass}
            />
            {fieldErrors.full_name && (
              <p className="mt-1 text-xs text-danger-600">
                {fieldErrors.full_name}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                <p className="mt-1 text-xs text-danger-600">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Email <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className={inputClass}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-danger-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>
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
              autoComplete="new-password"
              required
              minLength={6}
              value={form.password}
              onChange={onChange}
              placeholder="At least 6 characters"
              className={inputClass}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-danger-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">
              I am a
            </span>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((option) => {
                const active = form.role === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, role: option.id }))
                    }
                    className={`rounded-card border px-4 py-3 text-left transition ${
                      active
                        ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                        : 'border-line bg-white hover:border-brand-300'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-ink">
                      {option.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {option.hint}
                    </span>
                  </button>
                )
              })}
            </div>
            {fieldErrors.role && (
              <p className="mt-1 text-xs text-danger-600">{fieldErrors.role}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="district"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                District{' '}
                <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="district"
                name="district"
                type="text"
                value={form.district}
                onChange={onChange}
                placeholder="e.g. Kigali"
                className={inputClass}
              />
              {fieldErrors.district && (
                <p className="mt-1 text-xs text-danger-600">
                  {fieldErrors.district}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="sector"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Sector <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="sector"
                name="sector"
                type="text"
                value={form.sector}
                onChange={onChange}
                placeholder="e.g. Gasabo"
                className={inputClass}
              />
              {fieldErrors.sector && (
                <p className="mt-1 text-xs text-danger-600">
                  {fieldErrors.sector}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-card bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-700 hover:text-brand-800"
          >
            Sign in
          </Link>
        </p>
      </section>
    </div>
  )
}
