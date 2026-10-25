import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import HarvestsPage from './pages/HarvestsPage'
import HowItWorksPage from './pages/HowItWorksPage'
import MarketPricesPage from './pages/MarketPricesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Messages from './pages/Messages'

const AUTH_ROUTES = ['/login', '/register', '/forgot-password']
const PUBLIC_ROUTES = ['/', '/harvests', '/how-it-works', '/market-prices']

export default function App() {
  const location = useLocation()
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname)
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname)
  const showAppChrome = !isAuthRoute && !isPublicRoute

  return (
    <div className={isAuthRoute ? '' : 'flex min-h-screen flex-col'}>
      {showAppChrome && <Navbar />}

      <main className={isAuthRoute ? '' : 'flex-1'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/harvests" element={<HarvestsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/market-prices" element={<MarketPricesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/messages" element={<Messages />} />
          </Route>

          <Route element={<ProtectedRoute requireRole="farmer" />}>
            <Route path="/farmer" element={<FarmerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute requireRole="buyer" />}>
            <Route path="/buyer" element={<BuyerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute requireRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showAppChrome && (
        <footer className="border-t border-line bg-white py-6 text-center text-xs text-muted">
          Umuhinzi Connect — linking farmers and buyers across Rwanda.
        </footer>
      )}
    </div>
  )
}
