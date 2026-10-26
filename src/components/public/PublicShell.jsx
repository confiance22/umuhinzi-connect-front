import LandingNavbar from '../landing/Navbar'
import PublicFooter from './PublicFooter'

export default function PublicShell({ children }) {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#f6f1e6] text-[#13251a] transition-colors duration-300 dark:bg-[#07100a] dark:text-[#f3f0e6]">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-56 top-8 size-[42rem] rounded-full border border-[#0f3d25]/[0.07] dark:border-white/[0.05]" />
        <div className="absolute -left-44 top-[46rem] size-[30rem] rounded-full border border-[#0f3d25]/[0.05] dark:border-white/[0.04]" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-[#0f3d25]/[0.035] dark:bg-white/[0.025]" />
      </div>
      <LandingNavbar />
      <main className="relative z-10 px-4 pb-20 pt-28 sm:px-6 md:pt-32">{children}</main>
      <PublicFooter />
    </div>
  )
}
