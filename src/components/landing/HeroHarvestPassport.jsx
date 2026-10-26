import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { BRAND_NAME } from '../../constants/brand'

function PotatoPlant() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 150"
      className="mt-1 h-28 w-24 shrink-0 text-[#0f3d25] dark:text-[#d9f99d] sm:h-32 sm:w-28"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M91 18c-2 17-9 31-22 43-11 10-24 16-38 19" />
        <path d="M75 45c-9-14-9-28-2-40 9 10 13 24 9 39" />
        <path d="M81 40c11-11 23-15 37-12-6 13-18 21-34 22" />
        <path d="M65 63c-15-4-27-14-33-28 16 2 28 12 38 28" />
        <path d="M72 75c7-14 19-22 34-24-3 15-14 25-32 28" />
        <path d="M61 82c-14 1-26-5-35-17 14-4 27 1 39 13" />
        <path d="M53 93c-4 10-12 18-23 22-1-12 7-22 20-27" />
      </g>
      <g fill="currentColor" fillOpacity=".06" stroke="currentColor" strokeWidth=".9">
        <ellipse cx="101" cy="122" rx="17" ry="12" transform="rotate(-12 101 122)" />
        <ellipse cx="63" cy="130" rx="15" ry="11" transform="rotate(9 63 130)" />
        <ellipse cx="112" cy="143" rx="11" ry="8" transform="rotate(18 112 143)" />
      </g>
      <g fill="currentColor" fillOpacity=".28">
        <circle cx="96" cy="119" r=".8" />
        <circle cx="104" cy="124" r=".7" />
        <circle cx="59" cy="128" r=".7" />
        <circle cx="66" cy="133" r=".8" />
        <circle cx="109" cy="141" r=".6" />
      </g>
    </svg>
  )
}

export default function HeroHarvestPassport({ rows }) {
  const { t } = useLanguage()
  const primary = rows[0]
  const secondary = rows.slice(1)

  if (!primary) return null

  return (
    <div className="relative mx-auto w-full max-w-[460px] pb-10 lg:max-w-none">
      <svg
        aria-hidden="true"
        viewBox="0 0 540 650"
        className="pointer-events-none absolute -left-20 -top-12 h-[112%] w-[125%] text-[#0f3d25]/10 dark:text-white/10"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M-20 122c78-67 175-76 268-35 94 41 178 35 312-39" />
          <path d="M-30 160c82-70 184-78 280-34 96 44 185 36 325-42" />
          <path d="M-42 201c88-73 194-79 294-32 101 47 194 37 340-47" />
          <path d="M-54 246c94-76 204-80 309-30 105 51 204 38 356-52" />
          <path d="M-68 296c101-79 215-81 325-28 110 54 215 39 373-58" />
          <path d="M-82 350c108-82 227-82 342-25 115 57 226 40 392-64" />
        </g>
        <g fill="none" stroke="currentColor" strokeWidth=".8" strokeDasharray="3 8">
          <path d="M22 590c73-47 143-57 211-30 69 27 135 23 201-14" />
        </g>
      </svg>

      <div className="absolute -left-4 top-24 z-20 hidden -rotate-[5deg] border border-[#0f3d25] bg-[#d9f99d] px-3.5 py-2.5 text-[#0f3d25] shadow-[4px_4px_0_rgba(15,61,37,0.12)] dark:border-brand-300/50 dark:bg-[#13301f] dark:text-brand-200 dark:shadow-none sm:block">
        <span className="block text-[7px] font-bold uppercase tracking-[0.19em]">
          {t('landing.hero.directTrade')}
        </span>
        <span className="mt-1 block text-[8px] font-medium tracking-[0.08em] text-[#0f3d25]/60 dark:text-brand-200/55">
          {t('landing.hero.noMiddlemen')}
        </span>
      </div>

      <div className="relative ml-auto w-[94%]">
        <div
          aria-hidden="true"
          className="absolute -inset-x-3 bottom-[-0.9rem] top-4 rounded-[34px] border border-[#0f3d25]/15 bg-[#dfe8c4] dark:border-white/10 dark:bg-[#102017]"
        />

        <article className="relative overflow-hidden rounded-[30px] border border-[#0f3d25]/25 bg-[#fbf7ec] text-[#13251a] shadow-[18px_20px_0_rgba(15,61,37,0.08)] dark:border-white/15 dark:bg-[#0b1710] dark:text-[#f2eee3] dark:shadow-[18px_20px_0_rgba(0,0,0,0.24)]">
          <div className="grid grid-cols-[42px_1fr]">
            <aside className="flex flex-col items-center justify-between bg-[#0f3d25] py-4 text-[#f4efe2] dark:bg-[#d9f99d] dark:text-[#0f3d25]">
              <span className="[writing-mode:vertical-rl] rotate-180 text-[7px] font-semibold uppercase tracking-[0.28em]">
                {t('landing.hero.passportKicker')}
              </span>
              <span className="flex size-7 items-center justify-center rounded-full border border-[#f4efe2]/35 text-[7px] font-bold tracking-[0.08em] dark:border-[#0f3d25]/35">
                RW
              </span>
              <span className="[writing-mode:vertical-rl] rotate-180 text-[7px] font-semibold uppercase tracking-[0.22em] text-[#d9f99d]/65 dark:text-[#0f3d25]/55">
                No. 024
              </span>
            </aside>

            <div className="min-w-0">
              <header className="flex items-start justify-between gap-3 border-b border-[#0f3d25]/12 px-5 py-4 dark:border-white/10">
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-[0.26em] text-[#0f3d25]/45 dark:text-white/40">
                    {t('landing.hero.passportSeries')}
                  </p>
                  <h3 className="mt-1 font-serif text-[25px] leading-none tracking-[-0.03em]">
                    {t('landing.hero.passportKicker')}
                  </h3>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#0f3d25]/45 dark:text-white/40">
                    {t('landing.hero.season')}
                  </p>
                  <p className="mt-1 font-serif text-sm italic text-[#0f3d25]/75 dark:text-white/65">
                    No. 024
                  </p>
                </div>
              </header>

              <div className="px-5 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[7px] font-semibold uppercase tracking-[0.22em] text-[#0f3d25]/45 dark:text-white/40">
                      {t('landing.hero.passportLot')} / 01
                    </p>
                    <h4 className="mt-2 max-w-[220px] font-serif text-[36px] leading-[0.9] tracking-[-0.045em] sm:text-[40px]">
                      {primary.crop}
                    </h4>
                    <p className="mt-2.5 flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.17em] text-[#0f3d25]/55 dark:text-white/45">
                      <span className="size-1.5 rounded-full bg-[#0f3d25] dark:bg-[#d9f99d]" />
                      {primary.region} · Rwanda
                    </p>
                  </div>
                  <PotatoPlant />
                </div>

                <div className="mt-3 grid grid-cols-3 border-y border-[#0f3d25]/12 py-3 dark:border-white/10">
                  <div>
                    <p className="text-[7px] uppercase tracking-[0.16em] text-[#0f3d25]/40 dark:text-white/35">
                      {t('landing.hero.altitude')}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold tabular-nums">
                      {t('landing.hero.altitudeValue')}
                    </p>
                  </div>
                  <div className="border-x border-[#0f3d25]/10 px-3 dark:border-white/10">
                    <p className="text-[7px] uppercase tracking-[0.16em] text-[#0f3d25]/40 dark:text-white/35">
                      {t('landing.hero.harvested')}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold">{t('landing.hero.harvestedValue')}</p>
                  </div>
                  <div className="pl-3">
                    <p className="text-[7px] uppercase tracking-[0.16em] text-[#0f3d25]/40 dark:text-white/35">
                      {t('landing.hero.grade')}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold">
                      {t('landing.hero.gradeValue')} · {t('landing.hero.verified')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-[#0f3d25]/45 dark:text-white/40">
                      {t('landing.hero.farmGate')}
                    </p>
                    <p className="mt-1 flex items-baseline gap-1">
                      <span className="font-serif text-[34px] leading-none tracking-[-0.04em]">
                        {primary.price}
                      </span>
                      <span className="text-[10px] text-[#0f3d25]/45 dark:text-white/35">
                        {t('landing.hero.unit')}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`mb-1 rounded-full border px-2.5 py-1 text-[9px] font-semibold tabular-nums ${
                      primary.up
                        ? 'border-emerald-700/20 bg-emerald-700/[0.06] text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-300/[0.06] dark:text-emerald-300'
                        : 'border-rose-700/20 bg-rose-700/[0.06] text-rose-700 dark:border-rose-300/20 dark:bg-rose-300/[0.06] dark:text-rose-300'
                    }`}
                  >
                    {primary.change}
                  </span>
                </div>

                <p className="mt-2.5 max-w-[290px] text-[9px] leading-[1.7] text-[#0f3d25]/50 dark:text-white/40">
                  {t('landing.hero.passportNote')}
                </p>

                <div className="mt-4 border-t border-dashed border-[#0f3d25]/18 pt-3 dark:border-white/12">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/45 dark:text-white/40">
                      {t('landing.hero.otherLots')}
                    </p>
                    <Link
                      to="/market-prices"
                      className="text-[8px] font-semibold text-[#0f3d25]/65 underline decoration-[#0f3d25]/25 underline-offset-4 transition-colors hover:text-[#0f3d25] dark:text-white/50 dark:decoration-white/20 dark:hover:text-white"
                    >
                      {t('landing.hero.allPrices')}
                    </Link>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {secondary.map((row) => (
                      <div
                        key={row.crop}
                        className="rounded-xl border border-[#0f3d25]/10 bg-[#f2ecdc]/55 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.035]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[10px] font-semibold leading-tight">{row.crop}</p>
                          <span
                            className={`text-[8px] font-semibold tabular-nums ${
                              row.up ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {row.change}
                          </span>
                        </div>
                        <p className="mt-1 text-[8px] text-[#0f3d25]/45 dark:text-white/35">{row.region}</p>
                        <p className="mt-1.5 text-[11px] font-semibold tabular-nums">
                          {row.price}
                          <span className="ml-0.5 text-[8px] font-normal text-[#0f3d25]/40 dark:text-white/30">
                            {t('landing.hero.unit')}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <footer className="mt-4 flex items-center justify-between gap-3 border-t border-[#0f3d25]/12 bg-[#f0e9d8]/55 px-5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="truncate text-[7px] uppercase tracking-[0.15em] text-[#0f3d25]/40 dark:text-white/30">
                  {t('landing.hero.source')}
                </span>
                <span className="shrink-0 font-serif text-[9px] italic text-[#0f3d25]/60 dark:text-white/45">
                  {t('landing.hero.directTrade')} · {t('landing.hero.noMiddlemen')}
                </span>
              </footer>
            </div>
          </div>
        </article>

        <div className="absolute -bottom-5 -right-2 flex size-24 rotate-[-9deg] items-center justify-center rounded-full border border-[#0f3d25]/25 bg-[#fbf7ec] text-center shadow-[4px_5px_0_rgba(15,61,37,0.08)] dark:border-white/15 dark:bg-[#0b1710] dark:shadow-[4px_5px_0_rgba(0,0,0,0.25)]">
          <div className="absolute inset-[5px] rounded-full border border-dashed border-[#0f3d25]/30 dark:border-white/20" />
          <div className="relative">
            <span className="block text-[6px] font-semibold uppercase tracking-[0.2em] text-[#0f3d25]/45 dark:text-white/35">
              {BRAND_NAME}
            </span>
            <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#0f3d25] dark:text-[#d9f99d]">
              {t('landing.hero.verified')}
            </span>
            <span className="mt-0.5 block text-[6px] uppercase tracking-[0.16em] text-[#0f3d25]/40 dark:text-white/30">
              RW · 024
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
