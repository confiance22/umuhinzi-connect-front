import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './features/admin/pages/AdminDashboard'
import UserManagementPage from './features/admin/pages/UserManagementPage'
import RolesPage from './features/admin/pages/RolesPage'
import PermissionsPage from './features/admin/pages/PermissionsPage'
import AdminAccountPage from './features/admin/pages/AdminAccountPage'
import NotificationsPage from './pages/NotificationsPage'
import LandingPage from './pages/LandingPage'
import HarvestsPage from './pages/HarvestsPage'
import HowItWorksPage from './pages/HowItWorksPage'
import MarketPricesPage from './pages/MarketPricesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import { ForBuyersPage, ForFarmersPage } from './pages/PlatformAudiencePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import Messages from './pages/Messages'

const AUTH_ROUTES = ['/login', '/register', '/forgot-password']
const PUBLIC_ROUTES = [
  '/',
  '/harvests',
  '/how-it-works',
  '/market-prices',
  '/about',
  '/contact',
  '/platform/how-it-works',
  '/platform/farmers',
  '/platform/buyers'
]

export default function App() {
  const location = useLocation()
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname)
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname)
  const isAdminRoute =
    location.pathname === '/admin' || location.pathname.startsWith('/admin/')
  const showAppChrome = !isAuthRoute && !isPublicRoute && !isAdminRoute

  return (
    <div className={isAuthRoute ? '' : 'flex min-h-screen flex-col'}>
      {showAppChrome && <Navbar />}

      <main className={isAuthRoute ? '' : 'flex-1'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/harvests" element={<HarvestsPage />} />
          <Route path="/how-it-works" element={<Navigate to="/platform/how-it-works" replace />} />
          <Route path="/platform/how-it-works" element={<HowItWorksPage />} />
          <Route path="/platform/farmers" element={<ForFarmersPage />} />
          <Route path="/platform/buyers" element={<ForBuyersPage />} />
          <Route path="/market-prices" element={<MarketPricesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
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

          <Route element={<ProtectedRoute requireRole="super_admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="permissions" element={<PermissionsPage />} />
              <Route path="account" element={<AdminAccountPage />} />
              <Route path="notifications" element={<NotificationsPage scope="system" />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
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
