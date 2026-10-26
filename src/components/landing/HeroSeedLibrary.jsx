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
      <defs>
        {/* Soft botanical warm shading */}
        <radialGradient id="potatoGlow" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
        </radialGradient>
      </defs>

      {/* Main plant stem & lush foliage */}
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Main central stem */}
        <motion.path
          d="M80 115 C79 92 81 60 76 22"
          strokeWidth="1.8"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={transition}
        />

        {/* Top apical leaf cluster */}
        <motion.path
          d="M76 22 C72 11 77 3 80 2 C83 3 88 11 84 22 Z"
          strokeWidth="1.3"
          fill="currentColor"
          fillOpacity="0.08"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.05 }}
        />
        <motion.path
          d="M80 2 L79 22"
          strokeWidth="0.9"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.08 }}
        />

        {/* Leaf 1 - Top Left */}
        <motion.path
          d="M77 36 C64 30 52 32 42 38 C49 48 63 48 76 41 Z"
          strokeWidth="1.3"
          fill="currentColor"
          fillOpacity="0.09"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.1 }}
        />
        <motion.path
          d="M77 38 C62 38 52 38 42 38"
          strokeWidth="0.8"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.13 }}
        />

        {/* Leaf 2 - Top Right */}
        <motion.path
          d="M78 30 C90 24 104 26 114 34 C106 43 93 42 78 35 Z"
          strokeWidth="1.3"
          fill="currentColor"
          fillOpacity="0.09"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.14 }}
        />
        <motion.path
          d="M78 33 C92 32 103 33 114 34"
          strokeWidth="0.8"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.17 }}
        />

        {/* Leaf 3 - Mid Left with stemlet */}
        <motion.path
          d="M78 58 C62 50 48 56 36 65 C45 74 61 72 77 62 Z"
          strokeWidth="1.3"
          fill="currentColor"
          fillOpacity="0.09"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.2 }}
        />
        <motion.path
          d="M77 60 C58 61 46 63 36 65"
          strokeWidth="0.8"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.23 }}
        />

        {/* Leaf 4 - Mid Right */}
        <motion.path
          d="M79 50 C95 44 110 48 122 58 C112 68 96 66 79 55 Z"
          strokeWidth="1.3"
          fill="currentColor"
          fillOpacity="0.09"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.25 }}
        />
        <motion.path
          d="M79 52 C97 53 110 56 122 58"
          strokeWidth="0.8"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.28 }}
        />

        {/* Leaf 5 - Lower Left small */}
        <motion.path
          d="M78 78 C65 73 54 79 46 87 C54 94 67 91 79 83 Z"
          strokeWidth="1.2"
          fill="currentColor"
          fillOpacity="0.08"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.3 }}
        />

        {/* Leaf 6 - Lower Right */}
        <motion.path
          d="M80 72 C94 68 106 74 115 84 C105 92 92 88 80 77 Z"
          strokeWidth="1.2"
          fill="currentColor"
          fillOpacity="0.08"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.33 }}
        />

        {/* Delicate root / stolon tendrils anchoring to tubers */}
        <motion.path
          d="M79 108 C75 116 64 120 54 124"
          strokeWidth="1"
          strokeDasharray="2 2"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.38 }}
        />
        <motion.path
          d="M80 110 C86 118 96 118 104 122"
          strokeWidth="1"
          strokeDasharray="2 2"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.4 }}
        />
      </g>

      {/* Freshly harvested earth tubers / potatoes below with natural organic contours */}
      <motion.g
        initial={{ opacity: 0, scale: 0.92, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: delay + 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Main large potato (right) */}
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M96 112 C116 110 134 117 136 128 C138 139 122 148 102 147 C84 146 76 136 78 125 C80 115 88 113 96 112 Z"
            fill="url(#potatoGlow)"
            strokeWidth="1.5"
          />
          {/* Eyes / dimples of the potato */}
          <path d="M98 122 C101 121 104 122 104 122" strokeWidth="1" />
          <path d="M116 126 C119 125 122 127 122 127" strokeWidth="1" />
          <path d="M106 137 C109 136 112 138 112 138" strokeWidth="0.9" />
          <circle cx="89" cy="131" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="127" cy="133" r="0.8" fill="currentColor" stroke="none" />
        </g>

        {/* Medium potato (left) */}
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M48 116 C62 113 74 121 73 133 C72 143 58 149 44 147 C30 145 25 135 28 125 C31 116 38 117 48 116 Z"
            fill="url(#potatoGlow)"
            strokeWidth="1.4"
          />
          {/* Eyes */}
          <path d="M42 126 C45 125 48 126 48 126" strokeWidth="0.9" />
          <path d="M57 131 C59 130 62 132 62 132" strokeWidth="0.9" />
          <circle cx="36" cy="136" r="0.8" fill="currentColor" stroke="none" />
        </g>

        {/* Small baby potato (center-front) */}
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M68 135 C78 132 86 137 85 144 C84 149 75 151 67 150 C59 148 57 142 60 137 C62 134 65 135 68 135 Z"
            fill="url(#potatoGlow)"
            strokeWidth="1.2"
          />
          <path d="M72 142 C74 141 76 142 76 142" strokeWidth="0.8" />
        </g>
      </motion.g>
    </svg>
  )
}

function TomatoArt({ className = '', delay = 0.65 }) {
  const transition = { duration: 1.15, delay, ease: [0.22, 1, 0.36, 1] }

  return (
    <svg aria-hidden="true" viewBox="0 0 120 100" fill="none" className={className}>
      <defs>
        <radialGradient id="tomatoGlow" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
        </radialGradient>
      </defs>

      {/* Main vine / stem and leaves */}
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Graceful curving vine stem */}
        <motion.path
          d="M58 8 C57 26 55 46 51 68"
          strokeWidth="1.6"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={transition}
        />
        {/* Branch toward second tomato */}
        <motion.path
          d="M54 50 C62 52 70 56 78 62"
          strokeWidth="1.4"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.1 }}
        />

        {/* Top left serrated tomato leaf */}
        <motion.path
          d="M57 18 C44 14 32 20 23 31 C32 37 46 33 56 24 Z"
          strokeWidth="1.2"
          fill="currentColor"
          fillOpacity="0.08"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.12 }}
        />
        <motion.path
          d="M57 20 C42 21 32 25 23 31"
          strokeWidth="0.7"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.15 }}
        />

        {/* Top right leaf */}
        <motion.path
          d="M57 14 C68 9 81 12 91 21 C82 28 69 27 57 19 Z"
          strokeWidth="1.2"
          fill="currentColor"
          fillOpacity="0.08"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.14 }}
        />
        <motion.path
          d="M57 16 C71 16 81 18 91 21"
          strokeWidth="0.7"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.17 }}
        />

        {/* Mid leaf */}
        <motion.path
          d="M55 38 C40 36 30 44 24 53 C33 57 45 52 54 43 Z"
          strokeWidth="1.1"
          fill="currentColor"
          fillOpacity="0.07"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.2 }}
        />
      </g>

      {/* Main plump tomato (left) */}
      <motion.g
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, delay: delay + 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Tomato body - classic heirloom plump lobed silhouette */}
        <path
          d="M49 67 C42 66 33 71 31 80 C29 90 38 97 49 97 C60 97 68 90 67 80 C66 71 58 66 49 67 Z"
          fill="url(#tomatoGlow)"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Soft highlight crescent */}
        <path
          d="M36 78 C35 83 37 88 41 91"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
        {/* Tomato calyx / star sepals */}
        <path
          d="M49 67 L46 61 M49 67 L53 61 M49 67 L42 65 M49 67 L56 66 M49 67 L49 71"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Second smaller companion tomato (right) */}
      <motion.g
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, delay: delay + 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <path
          d="M80 63 C74 62 67 67 66 74 C65 82 72 88 80 88 C88 88 95 82 94 74 C93 67 87 62 80 63 Z"
          fill="url(#tomatoGlow)"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Soft highlight */}
        <path
          d="M71 72 C70 76 72 80 75 82"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
        {/* Calyx */}
        <path
          d="M80 63 L77 58 M80 63 L84 58 M80 63 L74 62 M80 63 L86 63 M80 63 L80 67"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  )
}

function MaizeArt({ className = '', delay = 0.8 }) {
  const transition = { duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }

  return (
    <svg aria-hidden="true" viewBox="0 0 120 100" fill="none" className={className}>
      <defs>
        <linearGradient id="cornGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Main stalk line */}
      <motion.path
        d="M60 88 L60 98"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        variants={draw}
        initial="hidden"
        animate="visible"
        transition={transition}
      />

      {/* Ear of Corn cob base & kernel texture */}
      <motion.g
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, delay: delay + 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Cob body */}
        <path
          d="M53 36 C53 26 57 20 60 18 C63 20 67 26 67 36 L68 72 C68 80 64 84 60 84 C56 84 52 80 52 72 Z"
          fill="url(#cornGlow)"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Rows of corn kernels - clean neat botanical hatching */}
        <g stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.65">
          {/* Horizontal row segments */}
          <line x1="56" y1="28" x2="64" y2="28" />
          <line x1="55" y1="34" x2="65" y2="34" />
          <line x1="54" y1="40" x2="66" y2="40" />
          <line x1="54" y1="46" x2="66" y2="46" />
          <line x1="53" y1="52" x2="67" y2="52" />
          <line x1="53" y1="58" x2="67" y2="58" />
          <line x1="54" y1="64" x2="66" y2="64" />
          <line x1="55" y1="70" x2="65" y2="70" />
          <line x1="56" y1="76" x2="64" y2="76" />

          {/* Vertical kernel dividers */}
          <line x1="57" y1="28" x2="57" y2="76" strokeDasharray="2 3" />
          <line x1="60" y1="24" x2="60" y2="79" strokeDasharray="3 3" />
          <line x1="63" y1="28" x2="63" y2="76" strokeDasharray="2 3" />
        </g>

        {/* Corn silk at top */}
        <g stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.65">
          <path d="M60 18 C58 13 54 9 49 7" />
          <path d="M60 18 C60 12 62 8 63 4" />
          <path d="M60 18 C62 13 67 10 72 8" />
          <path d="M59 18 C57 14 56 10 57 6" />
        </g>
      </motion.g>

      {/* Corn husks (leaves peeling open gracefully) */}
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Left inner husk */}
        <motion.path
          d="M53 74 C47 64 45 48 41 38 C47 48 51 62 55 78"
          strokeWidth="1.3"
          fill="currentColor"
          fillOpacity="0.07"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.2 }}
        />
        {/* Left outer sweeping leaf */}
        <motion.path
          d="M54 82 C42 80 28 68 20 52 C32 58 44 68 53 79"
          strokeWidth="1.4"
          fill="currentColor"
          fillOpacity="0.08"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.25 }}
        />
        <motion.path
          d="M53 80 C36 72 26 62 20 52"
          strokeWidth="0.7"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.28 }}
        />

        {/* Right inner husk */}
        <motion.path
          d="M67 74 C73 64 75 48 79 38 C73 48 69 62 65 78"
          strokeWidth="1.3"
          fill="currentColor"
          fillOpacity="0.07"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.22 }}
        />
        {/* Right outer sweeping leaf */}
        <motion.path
          d="M66 82 C78 80 92 68 100 52 C88 58 76 68 67 79"
          strokeWidth="1.4"
          fill="currentColor"
          fillOpacity="0.08"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.3 }}
        />
        <motion.path
          d="M67 80 C84 72 94 62 100 52"
          strokeWidth="0.7"
          variants={draw}
          initial="hidden"
          animate="visible"
          transition={{ ...transition, delay: delay + 0.33 }}
        />
      </g>
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
