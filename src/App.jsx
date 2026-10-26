import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ScrollToTopButton from './components/common/ScrollToTopButton'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import ManagerLayout from './components/manager/ManagerLayout'
import AdminDashboard from './features/admin/pages/AdminDashboard'
import UserManagementPage from './features/admin/pages/UserManagementPage'
import RolesPage from './features/admin/pages/RolesPage'
import PermissionsPage from './features/admin/pages/PermissionsPage'
import AdminAccountPage from './features/admin/pages/AdminAccountPage'
import ManagerDashboard from './features/manager/pages/ManagerDashboard'
import FarmerHarvestsPage from './features/manager/pages/FarmerHarvestsPage'
import HarvestFormPage from './features/manager/pages/HarvestFormPage'
import HarvestReportPage from './features/manager/pages/HarvestReportPage'
import NotificationsPage from './pages/NotificationsPage'
import AccountPage from './pages/AccountPage'
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

const PORTAL_ROUTES = [
  '/dashboard',
  '/products',
  '/stock',
  '/customers',
  '/qr',
  '/workers',
  '/reports',
  '/settings',
  '/account',
  '/notifications',
  '/chat'
]

export default function App() {
  const location = useLocation()
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname)
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname)
  const isAdminRoute =
    location.pathname === '/admin' || location.pathname.startsWith('/admin/')
  const isPortalRoute = PORTAL_ROUTES.some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  )
  const showAppChrome = !isAuthRoute && !isPublicRoute && !isAdminRoute && !isPortalRoute

  return (
    <div className={isAuthRoute ? 'min-h-screen bg-page dark:bg-[#07100a]' : 'flex min-h-screen flex-col bg-page dark:bg-[#07100a]'}>
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
            <Route element={<ManagerLayout />}>
              <Route path="/farmer" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ManagerDashboard />} />
              <Route path="/products" element={<FarmerHarvestsPage />} />
              <Route path="/products/add" element={<HarvestFormPage />} />
              <Route path="/products/:id/edit" element={<HarvestFormPage />} />
              <Route path="/reports" element={<HarvestReportPage />} />
              <Route path="/account" element={<AccountPage />} />

              <Route path="/stock" element={<Navigate to="/dashboard" replace />} />
              <Route path="/stock/*" element={<Navigate to="/dashboard" replace />} />
              <Route path="/customers" element={<Navigate to="/dashboard" replace />} />
              <Route path="/qr" element={<Navigate to="/dashboard" replace />} />
              <Route path="/qr/*" element={<Navigate to="/dashboard" replace />} />
              <Route path="/workers" element={<Navigate to="/dashboard" replace />} />
              <Route path="/chat" element={<Navigate to="/dashboard" replace />} />
              <Route path="/notifications" element={<Navigate to="/dashboard" replace />} />
              <Route path="/settings" element={<Navigate to="/account" replace />} />
              <Route path="/settings/*" element={<Navigate to="/account" replace />} />
              <Route path="/reports/*" element={<Navigate to="/reports" replace />} />
              <Route path="/products/:id" element={<Navigate to="/products" replace />} />
            </Route>
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

      <ScrollToTopButton />
    </div>
  )
}
