/**
 * DashboardLayout — authenticated app shell: Sidebar + Navbar + <Outlet />.
 * Every protected page renders inside this layout.
 */
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Toast from '../common/Toast'
import { useToastContext } from '../../context/ToastContext'

export default function DashboardLayout() {
  const { toasts, dismissToast } = useToastContext()
  return (
    <div className="flex h-screen bg-page">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}