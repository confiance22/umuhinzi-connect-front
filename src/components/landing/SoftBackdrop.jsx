export default function SoftBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute left-1/2 top-20 h-[460px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand-500/10 to-transparent blur-3xl dark:from-brand-600/30" />
      <div className="absolute bottom-10 right-12 h-[220px] w-[420px] rounded-full bg-gradient-to-bl from-brand-400/10 to-transparent blur-2xl dark:from-brand-500/20" />
    </div>
  )
}
