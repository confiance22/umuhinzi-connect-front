const audiences = [
  'Smallholder farmers',
  'Farmer cooperatives',
  'Fresh produce buyers',
  'Restaurants & hotels',
  'Local markets',
  'Agri-traders',
  'Institutional kitchens'
]

export default function TrustBar() {
  return (
    <section className="relative overflow-hidden border-y border-black/5 bg-white/60 py-5 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto flex max-w-6xl items-center gap-8 px-4">
        <p className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted dark:text-gray-500 md:block">
          Built for the food chain
        </p>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-9 [animation-play-state:running] hover:[animation-play-state:paused]">
            {[...audiences, ...audiences].map((audience, index) => (
              <span
                key={`${audience}-${index}`}
                className="flex shrink-0 items-center gap-3 text-xs font-medium text-muted transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300"
              >
                <span className="size-1 rounded-full bg-brand-500/60" aria-hidden="true" />
                {audience}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
