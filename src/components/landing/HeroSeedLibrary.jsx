import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { BRAND_NAME } from '../../constants/brand'

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 }
}

const floatSeeds = [
  { left: '5%', top: '19%', size: 4, duration: 7.5, delay: 0, drift: 13 },
  { left: '14%', top: '58%', size: 3, duration: 9, delay: 1.2, drift: 10 },
  { left: '29%', top: '9%', size: 2.5, duration: 8, delay: 2.4, drift: 16 },
  { left: '43%', top: '69%', size: 3.5, duration: 10, delay: 0.8, drift: 11 },
  { left: '57%', top: '14%', size: 2.5, duration: 8.5, delay: 3.1, drift: 14 },
  { left: '72%', top: '49%', size: 3, duration: 9.5, delay: 1.8, drift: 9 },
  { left: '86%', top: '24%', size: 4, duration: 11, delay: 2.8, drift: 15 },
  { left: '93%', top: '72%', size: 2.5, duration: 8, delay: 0.4, drift: 12 }
]

function PotatoArt({ className = '', delay = 0.55 }) {
  const transition = { duration: 1.25, delay, ease: [0.22, 1, 0.36, 1] }

  return (
    <svg aria-hidden="true" viewBox="0 0 160 150" fill="none" className={className}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M91 18c-2 17-9 31-22 43-11 10-24 16-38 19"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={transition}
        />
        <motion.path
          d="M75 45c-9-14-9-28-2-40 9 10 13 24 9 39"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.08 }}
        />
        <motion.path
          d="M81 40c11-11 23-15 37-12-6 13-18 21-34 22"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.14 }}
        />
        <motion.path
          d="M65 63c-15-4-27-14-33-28 16 2 28 12 38 28"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.2 }}
        />
        <motion.path
          d="M72 75c7-14 19-22 34-24-3 15-14 25-32 28"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.26 }}
        />
        <motion.path
          d="M61 82c-14 1-26-5-35-17 14-4 27 1 39 13"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.32 }}
        />
      </g>
      <motion.g
        fill="currentColor"
        fillOpacity=".07"
        stroke="currentColor"
        strokeWidth=".9"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: delay + 0.5, ease: 'easeOut' }}
      >
        <ellipse cx="101" cy="122" rx="17" ry="12" transform="rotate(-12 101 122)" />
        <ellipse cx="63" cy="130" rx="15" ry="11" transform="rotate(9 63 130)" />
        <ellipse cx="112" cy="143" rx="11" ry="8" transform="rotate(18 112 143)" />
      </motion.g>
    </svg>
  )
}

function TomatoArt({ className = '', delay = 0.65 }) {
  const transition = { duration: 1.15, delay, ease: [0.22, 1, 0.36, 1] }

  return (
    <svg aria-hidden="true" viewBox="0 0 120 100" fill="none" className={className}>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M58 23c-2 17-1 32 4 47"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={transition}
        />
        <motion.path
          d="M59 39c-13-7-22-18-25-33 14 5 23 15 29 30"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.08 }}
        />
        <motion.path
          d="M62 50c13-6 22-16 27-31-15 3-25 13-31 27"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.16 }}
        />
        <motion.circle
          cx="51"
          cy="75"
          r="13"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.28 }}
        />
        <motion.circle
          cx="79"
          cy="68"
          r="10"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.36 }}
        />
      </g>
      <motion.g
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, delay: delay + 0.38, ease: 'easeOut' }}
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      >
        <path d="M46 63l5-5 5 5 5-4 4 7-8 3-7-2-4-4Z" />
        <path d="M75 58l4-4 4 4 4-3 3 6-6 2-6-2-3-3Z" />
      </motion.g>
    </svg>
  )
}

function MaizeArt({ className = '', delay = 0.8 }) {
  const transition = { duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }

  return (
    <svg aria-hidden="true" viewBox="0 0 120 100" fill="none" className={className}>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M60 12c2 26 1 49-4 74"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={transition}
        />
        <motion.path
          d="M58 35c-15 1-26 10-33 25 16 1 28-7 36-22"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.08 }}
        />
        <motion.path
          d="M61 49c15-2 25-12 30-28-16 1-27 10-33 25"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.16 }}
        />
        <motion.path
          d="M57 63c-14 1-24 10-30 24 15 1 26-7 33-21"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.24 }}
        />
        <motion.ellipse
          cx="62"
          cy="53"
          rx="10"
          ry="24"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.3 }}
        />
      </g>
      <motion.g
        stroke="currentColor"
        strokeWidth=".8"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.6, delay: delay + 0.55 }}
      >
        <path d="M55 40h14M54 46h16M54 52h16M55 58h14M56 64h12" />
        <path d="M58 34l8 38M62 32l4 40" />
      </motion.g>
    </svg>
  )
}

function CropArt({ index, className }) {
  if (index === 0) return <TomatoArt className={className} />
  return <MaizeArt className={className} />
}

export default function HeroSeedLibrary({ rows }) {
  const { t } = useLanguage()
  const primary = rows[0]
  const secondary = rows.slice(1)

  if (!primary) return null

  return (
    <div className="relative mx-auto w-full max-w-[460px] pb-8 lg:max-w-none">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-6 size-64 rounded-full border border-dashed border-[#0f3d25]/20 dark:border-[#d9f99d]/15 sm:size-80"
        animate={{ rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-2 top-1/2 size-24 rounded-full border border-[#0f3d25]/10 dark:border-white/10"
      />

      {floatSeeds.map((seed, index) => (
        <motion.span
          key={index}
          aria-hidden="true"
          className="pointer-events-none absolute z-0 bg-[#0f3d25]/30 dark:bg-[#d9f99d]/30"
          style={{
            left: seed.left,
            top: seed.top,
            width: seed.size,
            height: seed.size * 1.7,
            borderRadius: '60%'
          }}
          animate={{ y: [0, -seed.drift, 0], rotate: [0, 140, 0], opacity: [0, 0.7, 0] }}
          transition={{
            duration: seed.duration,
            delay: seed.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}

      <div className="relative ml-auto w-[96%]">
        <div className="grid grid-cols-[1.58fr_0.88fr] items-start gap-2.5 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 42, rotate: -7, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5, scale: 1 }}
            transition={{ type: 'spring', stiffness: 95, damping: 17, delay: 0.18 }}
            whileHover={{ y: -8, rotate: 0, scale: 1.015 }}
            className="relative z-20"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            >
              <article className="relative overflow-hidden rounded-[26px] border border-[#0f3d25]/25 bg-[#fbf7ec] text-[#13251a] shadow-[14px_18px_0_rgba(15,61,37,0.08)] dark:border-white/15 dark:bg-[#0b1710] dark:text-[#f2eee3] dark:shadow-[14px_18px_0_rgba(0,0,0,0.25)]">
                <header className="relative overflow-hidden border-b border-dashed border-[#fbf7ec]/20 bg-[#0f3d25] px-4 py-3 text-[#fbf7ec] dark:border-[#0f3d25]/25 dark:bg-[#d9f99d] dark:text-[#0f3d25]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[8px] font-semibold uppercase tracking-[0.25em]">{BRAND_NAME}</span>
                    <span className="text-[7px] font-medium uppercase tracking-[0.16em] text-[#d9f99d]/75 dark:text-[#0f3d25]/55">
                      {t('landing.hero.seedKicker')}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[6px] uppercase tracking-[0.18em] text-[#fbf7ec]/40 dark:text-[#0f3d25]/45">
                    <span>{t('landing.hero.seedSeason')}</span>
                    <span>No. 01 / RW</span>
                  </div>
                  <span className="absolute -bottom-1.5 -left-1.5 size-3 rounded-full bg-[#f6f1e6] dark:bg-[#07100a]" />
                  <span className="absolute -bottom-1.5 -right-1.5 size-3 rounded-full bg-[#f6f1e6] dark:bg-[#07100a]" />
                </header>

                <div className="px-4 pb-4 pt-3.5">
                  <div className="flex items-center justify-between gap-2 text-[7px] font-semibold uppercase tracking-[0.15em] text-[#0f3d25]/45 dark:text-white/40">
                    <span>{t('landing.hero.seedLabel')} / 01</span>
                    <span>{t('landing.hero.passportLot')}</span>
                  </div>

                  <div className="relative mt-2 flex h-40 items-center justify-center">
                    <motion.div
                      aria-hidden="true"
                      className="absolute size-[8.5rem] rounded-full bg-[#e7eed2] dark:bg-white/[0.045]"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.div
                      aria-hidden="true"
                      className="absolute size-[9.5rem] rounded-full border border-dashed border-[#0f3d25]/15 dark:border-white/10"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                    />
                    <PotatoArt className="relative h-36 w-36 text-[#0f3d25] dark:text-[#d9f99d]" />
                  </div>

                  <h4 className="mt-1 max-w-[240px] font-serif text-[33px] leading-[0.9] tracking-[-0.045em]">
                    {primary.crop}
                  </h4>
                  <p className="mt-2 flex items-center gap-1.5 text-[7px] font-semibold uppercase tracking-[0.16em] text-[#0f3d25]/50 dark:text-white/40">
                    <span className="size-1.5 rounded-full bg-[#0f3d25] dark:bg-[#d9f99d]" />
                    {primary.region} · Rwanda
                  </p>

                  <div className="mt-3 grid grid-cols-2 border-y border-[#0f3d25]/[0.12] py-2.5 dark:border-white/10">
                    <div>
                      <p className="text-[6px] uppercase tracking-[0.14em] text-[#0f3d25]/40 dark:text-white/35">
                        {t('landing.hero.seedLot')}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold">01 · {primary.region}</p>
                    </div>
                    <div className="border-l border-[#0f3d25]/10 pl-3 dark:border-white/10">
                      <p className="text-[6px] uppercase tracking-[0.14em] text-[#0f3d25]/40 dark:text-white/35">
                        {t('landing.hero.seedWeight')}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold">{t('landing.hero.seedWeightValue')}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[6px] font-semibold uppercase tracking-[0.18em] text-[#0f3d25]/40 dark:text-white/35">
                        {t('landing.hero.farmGate')}
                      </p>
                      <p className="mt-1 flex items-baseline gap-1">
                        <span className="font-serif text-[29px] leading-none tracking-[-0.04em]">
                          {primary.price}
                        </span>
                        <span className="text-[9px] text-[#0f3d25]/40 dark:text-white/30">
                          {t('landing.hero.unit')}
                        </span>
                      </p>
                    </div>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.9 }}
                      className={`mb-1 rounded-full border px-2 py-1 text-[8px] font-semibold tabular-nums ${
                        primary.up
                          ? 'border-emerald-700/20 bg-emerald-700/[0.06] text-emerald-800 dark:border-emerald-300/20 dark:text-emerald-300'
                          : 'border-rose-700/20 bg-rose-700/[0.06] text-rose-700 dark:border-rose-300/20 dark:text-rose-300'
                      }`}
                    >
                      {primary.change}
                    </motion.span>
                  </div>

                  <p className="mt-2 text-[8px] leading-[1.65] text-[#0f3d25]/45 dark:text-white/35">
                    {t('landing.hero.seedNote')}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#0f3d25]/[0.12] pt-3 dark:border-white/10">
                    <span className="rounded-full border border-[#0f3d25]/20 px-2.5 py-1 text-[6px] font-semibold uppercase tracking-[0.14em] text-[#0f3d25]/55 dark:border-white/15 dark:text-white/40">
                      {t('landing.hero.seedOpen')}
                    </span>
                    <span className="font-serif text-[10px] italic text-[#0f3d25]/50 dark:text-white/35">
                      No. 01
                    </span>
                  </div>
                </div>
              </article>
            </motion.div>
          </motion.div>

          <div className="flex flex-col gap-3 self-stretch pt-12">
            {secondary.map((row, index) => (
              <motion.div
                key={row.crop}
                initial={{ opacity: 0, x: 34, rotate: index === 0 ? 8 : -7 }}
                animate={{ opacity: 1, x: 0, rotate: index === 0 ? 5 : -5 }}
                transition={{
                  type: 'spring',
                  stiffness: 105,
                  damping: 17,
                  delay: 0.42 + index * 0.12
                }}
                whileHover={{ x: -8, rotate: index === 0 ? 2 : -1, scale: 1.02 }}
                className="relative z-30"
              >
                <motion.div
                  animate={{ y: [0, index === 0 ? -7 : -5, 0] }}
                  transition={{
                    duration: index === 0 ? 5.2 : 6.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1.7 + index * 0.4
                  }}
                >
                  <article className="relative overflow-hidden rounded-[20px] border border-[#0f3d25]/20 bg-[#fbf7ec] text-[#13251a] shadow-[8px_10px_0_rgba(15,61,37,0.07)] dark:border-white/15 dark:bg-[#0b1710] dark:text-[#f2eee3] dark:shadow-[8px_10px_0_rgba(0,0,0,0.22)]">
                    <div className="flex items-center justify-between gap-2 border-b border-[#0f3d25]/10 bg-[#efe7d6] px-3 py-1.5 text-[6px] font-semibold uppercase tracking-[0.12em] text-[#0f3d25]/55 dark:border-white/10 dark:bg-white/[0.045] dark:text-white/40">
                      <span>{t('landing.hero.seedLabel')}</span>
                      <span className="tabular-nums">0{index + 2}</span>
                    </div>
                    <div className="px-3 pb-3 pt-2">
                      <div className="flex h-14 items-center justify-center">
                        <CropArt
                          index={index}
                          className="h-14 w-20 text-[#0f3d25] dark:text-[#d9f99d]"
                        />
                      </div>
                      <p className="mt-1 font-serif text-[16px] leading-none tracking-[-0.03em]">
                        {row.crop}
                      </p>
                      <p className="mt-1 text-[6px] uppercase tracking-[0.14em] text-[#0f3d25]/45 dark:text-white/35">
                        {row.region}
                      </p>
                      <div className="mt-2 flex items-end justify-between gap-2">
                        <p className="text-[10px] font-semibold tabular-nums">
                          {row.price}
                          <span className="ml-0.5 text-[7px] font-normal text-[#0f3d25]/40 dark:text-white/30">
                            {t('landing.hero.unit')}
                          </span>
                        </p>
                        <p
                          className={`text-[7px] font-semibold tabular-nums ${
                            row.up ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {row.change}
                        </p>
                      </div>
                    </div>
                  </article>
                </motion.div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 145, damping: 16, delay: 0.82 }}
              whileHover={{ y: -4, rotate: -1 }}
              className="mt-auto rounded-[24px] border border-[#0f3d25]/20 bg-[#d9f99d] p-3 text-[#0f3d25] shadow-[6px_7px_0_rgba(15,61,37,0.08)] dark:border-brand-300/20 dark:bg-[#112a1b] dark:text-brand-200 dark:shadow-none"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#0f3d25]/25 bg-[#fbf7ec]/35 dark:border-brand-200/20 dark:bg-white/5">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5"
                  >
                    <path d="M19 5C11 5 5 9 5 17c8 0 14-5 14-12Z" />
                    <path d="M5 19c3-6 8-9 12-11" />
                  </svg>
                </span>
                <span className="text-[7px] font-bold uppercase leading-[1.3] tracking-[0.1em]">
                  {t('landing.hero.seedOpen')}
                </span>
              </div>
              <p className="mt-2 border-t border-[#0f3d25]/15 pt-2 text-[7px] font-medium leading-[1.55] text-[#0f3d25]/60 dark:border-brand-200/15 dark:text-brand-200/55">
                {t('landing.hero.directTrade')} · {t('landing.hero.noMiddlemen')}
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 flex items-center justify-between gap-4 border-t border-[#0f3d25]/[0.12] px-1 pt-3 text-[7px] uppercase tracking-[0.14em] text-[#0f3d25]/40 dark:border-white/10 dark:text-white/30"
        >
          <span className="truncate">{t('landing.hero.source')}</span>
          <Link
            to="/market-prices"
            className="shrink-0 text-[#0f3d25]/65 underline decoration-[#0f3d25]/25 underline-offset-4 transition-colors hover:text-[#0f3d25] dark:text-white/50 dark:decoration-white/20 dark:hover:text-white"
          >
            {t('landing.hero.allPrices')}
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
