import LandingNavbar from '../landing/Navbar'
import SoftBackdrop from '../landing/SoftBackdrop'
import PublicFooter from './PublicFooter'

export default function PublicShell({ children }) {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#f7faf8] text-ink transition-colors duration-300 dark:bg-[#050505] dark:text-white">
      <SoftBackdrop />
      <LandingNavbar />
      <main className="relative z-10 px-4 pb-20 pt-32 sm:px-6">{children}</main>
      <PublicFooter />
    </div>
  )
}
