/**
 * NotFoundPage — 404 fallback for any unmatched route.
 */
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../constants/routePaths'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page">
      <h1 className="text-5xl font-bold tracking-tight text-ink">404</h1>
      <p className="text-sm text-muted">Page not found.</p>
      <Link
        to={ROUTE_PATHS.DASHBOARD}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98]"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
