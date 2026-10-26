import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { BRAND_NAME } from '../../constants/brand'

function AgasekeLid() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 240" className="size-full">
      <defs>
        <pattern
          id="agaseke-weave"
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="18" height="18" fill="#0f3d25" />
          <path d="M0 9h18M9 0v18" stroke="#d9f99d" strokeWidth="3.5" opacity=".62" />
          <path d="M0 0h18v18H0z" fill="none" stroke="#b45309" strokeWidth="1" opacity=".5" />
        </pattern>
      </defs>
      <circle cx="120" cy="120" r="120" fill="url(#agaseke-weave)" />
    </svg>
  )
}

export default function HeroAgasekeWeave({ rows }) {
  const { t } = useLanguage()

  return (
    <div className="relative mx-auto w-full max-w-[460px] pb-8 lg:max-w-none">
      <div
        aria-hidden="true"
        className="absolute -right-11 -top-12 size-[18rem] overflow-hidden rounded-full border-[13px] border-[#0f3d25] bg-[#0f3d25] shadow-[8px_10px_0_rgba(15,61,37,0.1)] dark:border-[#d9f99d] dark:bg-[#d9f99d] dark:shadow-[8px_10px_0_rgba(0,0,0,0.22)] sm:size-[21rem]"
      >
        <AgasekeLid />
        <div className="absolute inset-8 rounded-full border border-[#fbf7ec]/20" />
        <div className="absolute inset-16 rounded-full border border-[#fbf7ec]/15" />
      </div>

      <div className="absolute left-1 top-40 z-20 hidden -rotate-[5deg] border border-[#0f3d25] bg-[#d9f99d] px-3.5 py-2.5 text-[#0f3d25] shadow-[4px_4px_0_rgba(15,61,37,0.12)] dark:border-brand-300/50 dark:bg-[#13301f] dark:text-brand-200 dark:shadow-none sm:block">
        <span className="block text-[7px] font-bold uppercase tracking-[0.18em]">
          {t('landing.hero.wovenIn')}
        </span>
        <span className="mt-1 block text-[8px] font-medium tracking-[0.08em] text-[#0f3d25]/60 dark:text-brand-200/55">
          {t('landing.hero.directTrade')} · {t('landing.hero.noMiddlemen')}
        </span>
      </div>

      <div className="relative ml-auto w-[93%] pt-16">
        <div
          aria-hidden="true"
          className="absolute -inset-x-3 bottom-[-0.9rem] top-20 rounded-[32px] border border-[#0f3d25]/15 bg-[#e3d4bf] dark:border-white/10 dark:bg-[#1b1711]"
        />

        <article className="relative overflow-hidden rounded-[30px] border border-[#0f3d25]/25 bg-[#fbf7ec] text-[#13251a] shadow-[18px_20px_0_rgba(15,61,37,0.08)] dark:border-white/15 dark:bg-[#0b1710] dark:text-[#f2eee3] dark:shadow-[18px_20px_0_rgba(0,0,0,0.24)]">
          <header className="flex items-start justify-between gap-4 border-b border-dashed border-[#0f3d25]/16 px-5 py-4 dark:border-white/10">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[0.26em] text-[#0f3d25]/45 dark:text-white/40">
                {t('landing.hero.agasekeKicker')}
              </p>
              <h3 className="mt-1.5 font-serif text-[27px] leading-none tracking-[-0.03em]">
                {t('landing.hero.agasekeTitle')}
              </h3>
            </div>
            <div className="shrink-0 text-right">
              <span className="inline-flex items-center rounded-full border border-[#0f3d25]/20 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-[#0f3d25]/55 dark:border-white/15 dark:text-white/40">
                No. 02
              </span>
              <p className="mt-2 text-[7px] uppercase tracking-[0.15em] text-[#0f3d25]/40 dark:text-white/30">
                {t('landing.hero.market')} · {t('landing.hero.today')}
              </p>
            </div>
          </header>

          <div className="px-5 pt-4">
            <p className="max-w-[310px] text-[9px] leading-[1.75] text-[#0f3d25]/50 dark:text-white/40">
              {t('landing.hero.agasekeNote')}
            </p>

            <div className="mt-4 space-y-2.5">
              {rows.map((row, index) => (
                <div
                  key={row.crop}
                  className={`relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 ${
                    index === 0
                      ? 'border-[#0f3d25] bg-[#0f3d25] text-[#fbf7ec] dark:border-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]'
                      : 'border-[#0f3d25]/10 bg-[#f2ecdc]/60 text-[#13251a] dark:border-white/10 dark:bg-white/[0.035] dark:text-[#f2eee3]'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-[8px] font-bold tabular-nums ${
                        index === 0
                          ? 'border-[#fbf7ec]/30 text-[#d9f99d] dark:border-[#0f3d25]/30 dark:text-[#0f3d25]'
                          : 'border-[#0f3d25]/20 text-[#0f3d25]/60 dark:border-white/15 dark:text-white/45'
                      }`}
                    >
                      0{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold">{row.crop}</p>
                      <p
                        className={`mt-0.5 text-[7px] uppercase tracking-[0.16em] ${
                          index === 0
                            ? 'text-[#fbf7ec]/50 dark:text-[#0f3d25]/55'
                            : 'text-[#0f3d25]/40 dark:text-white/35'
                        }`}
                      >
                        {row.region}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[12px] font-semibold tabular-nums">
                      {row.price}
                      <span
                        className={`ml-0.5 text-[8px] font-normal ${
                          index === 0
                            ? 'text-[#fbf7ec]/45 dark:text-[#0f3d25]/50'
                            : 'text-[#0f3d25]/40 dark:text-white/30'
                        }`}
                      >
                        {t('landing.hero.unit')}
                      </span>
                    </p>
                    <p
                      className={`mt-0.5 text-[8px] font-semibold tabular-nums ${
                        row.up
                          ? index === 0
                            ? 'text-[#d9f99d] dark:text-emerald-800'
                            : 'text-emerald-700 dark:text-emerald-400'
                          : index === 0
                            ? 'text-[#f0b7a4] dark:text-rose-800'
                            : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {row.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-4 overflow-hidden rounded-2xl bg-[#d9f99d] px-4 py-3.5 text-[#0f3d25]">
              <svg
                aria-hidden="true"
                viewBox="0 0 320 80"
                className="pointer-events-none absolute inset-0 h-full w-full text-[#0f3d25]/10"
              >
                <g fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M-20 18c59-17 113-14 162 8 50 22 102 23 198-8" />
                  <path d="M-20 39c63-18 120-15 171 8 51 23 103 24 199-7" />
                  <path d="M-20 61c67-19 126-15 180 8 54 23 108 25 204-6" />
                </g>
              </svg>
              <div className="relative flex items-end justify-between gap-4">
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/55">
                    {t('landing.hero.basketAverage')}
                  </p>
                  <p className="mt-1 flex items-baseline gap-1">
                    <span className="font-serif text-[30px] leading-none tracking-[-0.03em]">RWF 460</span>
                    <span className="text-[9px] text-[#0f3d25]/50">{t('landing.hero.unit')}</span>
                  </p>
                </div>
                <p className="max-w-[104px] text-right text-[8px] font-medium leading-[1.55] text-[#0f3d25]/60">
                  {t('landing.hero.upFromLastSeason')}
                </p>
              </div>
            </div>
          </div>

          <footer className="mt-4 flex items-center justify-between gap-3 border-t border-[#0f3d25]/12 bg-[#f0e9d8]/55 px-5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="truncate text-[7px] uppercase tracking-[0.15em] text-[#0f3d25]/40 dark:text-white/30">
              {t('landing.hero.source')}
            </span>
            <Link
              to="/market-prices"
              className="shrink-0 text-[8px] font-semibold text-[#0f3d25]/65 underline decoration-[#0f3d25]/25 underline-offset-4 transition-colors hover:text-[#0f3d25] dark:text-white/50 dark:decoration-white/20 dark:hover:text-white"
            >
              {t('landing.hero.allPrices')}
            </Link>
          </footer>
        </article>

        <div className="absolute -bottom-6 -right-3 flex size-[88px] rotate-[5deg] flex-col items-center justify-center rounded-full border border-[#0f3d25]/25 bg-[#fbf7ec] text-center shadow-[4px_5px_0_rgba(15,61,37,0.08)] dark:border-white/15 dark:bg-[#0b1710] dark:shadow-[4px_5px_0_rgba(0,0,0,0.25)]">
          <div className="absolute inset-[5px] rounded-full border border-dashed border-[#0f3d25]/30 dark:border-white/20" />
          <span className="relative block text-[6px] font-semibold uppercase tracking-[0.2em] text-[#0f3d25]/45 dark:text-white/35">
            {BRAND_NAME}
          </span>
          <span className="relative mt-0.5 block text-[8px] font-bold uppercase leading-tight tracking-[0.1em] text-[#0f3d25] dark:text-[#d9f99d]">
            {t('landing.hero.wovenIn')}
          </span>
        </div>
      </div>
    </div>
  )
}
