/**
 * AppRoutes — the app's route table.
 *
 * Layouts / guards:
 *   Public pages (Login/Register)   → each renders its own full-screen layout
 *   <ProtectedRoute /> + <DashboardLayout/> → authenticated app shell
 *   <ProtectedRoute requireRole=shop_manager /> → manager-only pages (Dashboard,
 *     Stock in/out/check, QR generate, product manage, Workers, Reports, Settings)
 *   <AdminRoute /> + <AdminLayout/> → Super Admin portal (/admin/*)
 *
 * Workers land on /qr/scan; hitting any manager page redirects them to their
 * own home instead of rendering manager content.
 *
 * Page components live in src/pages; paths in src/constants/routePaths.js.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../constants/routePaths'
import { ROLES } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'
import { dashboardPathForRoles } from '../utils/dashboardPath'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'

import RoleLayout from '../components/layout/RoleLayout'
import AdminLayout from '../components/admin/AdminLayout'

import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ManagerDashboard from '../features/manager/pages/ManagerDashboard'
import ProductsPage from '../pages/ProductsPage'
import ProductAddPage from '../pages/ProductAddPage'
import ProductEditPage from '../pages/ProductEditPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import StockInPage from '../pages/StockInPage'
import StockOutPage from '../pages/StockOutPage'
import StockCheckPage from '../pages/StockCheckPage'
import CustomersPage from '../pages/CustomersPage'
import QRGeneratePage from '../pages/QRGeneratePage'
import QRScanPage from '../features/worker/pages/WorkerScanPage'
import WorkersPage from '../features/manager/pages/WorkersPage'
import OverallReportPage from '../pages/reports/OverviewReportPage'
import StockInReportPage from '../pages/reports/StockInReportPage'
import StockOutReportPage from '../pages/reports/StockOutReportPage'
import ProductsReportPage from '../pages/reports/ProductsReportPage'
import ShopAccountSettingsPage from '../pages/settings/ShopAccountSettingsPage'
import InventoryQrSettingsPage from '../pages/settings/InventoryQrSettingsPage'
import SecuritySettingsPage from '../pages/settings/SecuritySettingsPage'
import NotFoundPage from '../pages/NotFoundPage'
import AdminDashboard from '../features/admin/pages/AdminDashboard'
import UserManagementPage from '../features/admin/pages/UserManagementPage'
import RolesPage from '../features/admin/pages/RolesPage'
import PermissionsPage from '../features/admin/pages/PermissionsPage'
import AdminAccountPage from '../features/admin/pages/AdminAccountPage'
import AccountPage from '../pages/AccountPage'
import ShopsPage from '../features/admin/pages/ShopsPage'
import NotificationsPage from '../pages/NotificationsPage'
import ChatPage from '../pages/ChatPage'
import AdminReportsPage from '../features/admin/pages/AdminReportsPage'
import AdminSettingsPage from '../features/admin/pages/AdminSettingsPage'
import AdminSecuritySettingsPage from '../features/admin/pages/AdminSecuritySettingsPage'
import AdminShopSettingsPage from '../features/admin/pages/AdminShopSettingsPage'
import AdminProductSettingsPage from '../features/admin/pages/AdminProductSettingsPage'

const HomeRedirect = () => {
  const { user } = useAuth()
  return <Navigate to={dashboardPathForRoles(user)} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public auth screens — each renders its own full-screen layout */}
      <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
      <Route path={ROUTE_PATHS.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTE_PATHS.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

      {/* Authenticated app shell (role-aware: managers get the portal shell) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleLayout />}>
          {/* Everyone lands on their own role's home */}
          <Route index element={<HomeRedirect />} />

          {/* Open to every authenticated role */}
          <Route path={ROUTE_PATHS.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTE_PATHS.PRODUCT_DETAIL()} element={<ProductDetailPage />} />
          <Route path={ROUTE_PATHS.QR_SCAN} element={<QRScanPage />} />
          <Route path={ROUTE_PATHS.ACCOUNT} element={<AccountPage />} />
          <Route path={ROUTE_PATHS.NOTIFICATIONS} element={<NotificationsPage scope="shop" />} />
          <Route path={ROUTE_PATHS.CHAT} element={<ChatPage />} />

          {/* Manager-only (role-guarded) */}
          <Route element={<ProtectedRoute requireRole={ROLES.SHOP_MANAGER} />}>
            <Route path={ROUTE_PATHS.DASHBOARD} element={<ManagerDashboard />} />
            <Route path={ROUTE_PATHS.PRODUCT_ADD} element={<ProductAddPage />} />
            <Route path={ROUTE_PATHS.PRODUCT_EDIT()} element={<ProductEditPage />} />
            <Route path={ROUTE_PATHS.STOCK_IN} element={<StockInPage />} />
            <Route path={ROUTE_PATHS.STOCK_OUT} element={<StockOutPage />} />
            <Route path={ROUTE_PATHS.STOCK_CHECK} element={<StockCheckPage />} />
            <Route path={ROUTE_PATHS.CUSTOMERS} element={<CustomersPage />} />
            <Route path={ROUTE_PATHS.QR_GENERATE} element={<QRGeneratePage />} />
            <Route path={ROUTE_PATHS.WORKERS} element={<WorkersPage />} />
            <Route path={ROUTE_PATHS.REPORTS} element={<OverallReportPage />} />
            <Route path={ROUTE_PATHS.REPORTS_STOCK_IN} element={<StockInReportPage />} />
            <Route path={ROUTE_PATHS.REPORTS_STOCK_OUT} element={<StockOutReportPage />} />
            <Route path={ROUTE_PATHS.REPORTS_PRODUCTS} element={<ProductsReportPage />} />
            <Route path={ROUTE_PATHS.SETTINGS} element={<Navigate to={ROUTE_PATHS.SETTINGS_SHOP} replace />} />
            <Route path={ROUTE_PATHS.SETTINGS_SHOP} element={<ShopAccountSettingsPage />} />
            <Route path={ROUTE_PATHS.SETTINGS_INVENTORY} element={<InventoryQrSettingsPage />} />
            <Route path={ROUTE_PATHS.SETTINGS_SECURITY} element={<SecuritySettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Super Admin portal */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTE_PATHS.ADMIN_DASHBOARD} element={<AdminDashboard />} />
            <Route path={ROUTE_PATHS.ADMIN_USERS} element={<UserManagementPage />} />
            <Route path={ROUTE_PATHS.ADMIN_ROLES} element={<RolesPage />} />
            <Route path={ROUTE_PATHS.ADMIN_PERMISSIONS} element={<PermissionsPage />} />
            <Route path={ROUTE_PATHS.ADMIN_ACCOUNT} element={<AdminAccountPage />} />
            <Route path={ROUTE_PATHS.ADMIN_SHOPS} element={<ShopsPage />} />
            <Route path={ROUTE_PATHS.ADMIN_REPORTS} element={<AdminReportsPage />} />
            <Route path={ROUTE_PATHS.ADMIN_SETTINGS} element={<AdminSettingsPage />} />
            <Route path={ROUTE_PATHS.ADMIN_SETTINGS_SECURITY} element={<AdminSecuritySettingsPage />} />
            <Route path={ROUTE_PATHS.ADMIN_SETTINGS_SHOPS} element={<AdminShopSettingsPage />} />
            <Route path={ROUTE_PATHS.ADMIN_SETTINGS_PRODUCTS} element={<AdminProductSettingsPage />} />
            {/* Super Admin Full Notifications Page */}
            <Route path={ROUTE_PATHS.ADMIN_NOTIFICATIONS} element={<NotificationsPage scope="system" />} />
            <Route path={ROUTE_PATHS.ADMIN_CHAT} element={<ChatPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}