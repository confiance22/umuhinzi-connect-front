import { Check } from 'lucide-react'
import { PrimaryButton, GhostButton } from './Buttons'
import Title from './Title'
import { plansData } from '../../assets/landing/dummy-data'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Pricing() {
  const refs = useRef([])
  const navigate = useNavigate()

  return (
    <section id="pricing" className="border-t border-black/5 bg-white/60 py-20 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-4">
        <Title
          title="Pricing"
          heading="Simple, transparent pricing"
          description="Flexible agency packages designed to fit startups, growing teams and established brands."
        />

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plansData.map((plan, i) => (
            <motion.div
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              initial={{ y: 150, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 250, damping: 70, mass: 1, delay: 0.1 + i * 0.1 }}
              onAnimationComplete={() => {
                const card = refs.current[i]
                if (card) {
                  card.classList.add(
                    'transition',
                    'duration-500',
                    'hover:scale-[1.02]',
                    'hover:border-brand-500/40'
                  )
                }
              }}
              className={`relative rounded-2xl border p-6 backdrop-blur ${
                plan.popular
                  ? 'border-brand-500/50 bg-brand-50 shadow-[0_20px_50px_-30px_rgba(22,163,74,0.45)] dark:bg-brand-900/20 dark:shadow-none'
                  : 'border-black/5 bg-white shadow-[0_18px_45px_-32px_rgba(5,46,22,0.28)] dark:border-white/10 dark:bg-[#07160d] dark:shadow-none'
              }`}
            >
              {plan.popular && (
                <p className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  Most popular
                </p>
              )}

              <div className="mb-6">
                <p>{plan.name}</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-extrabold text-ink dark:text-white">{plan.price}</span>
                  <span className="text-sm text-muted dark:text-gray-400">/ {plan.credits}</span>
                </div>
                <p className="mt-2 text-sm text-muted dark:text-gray-300">{plan.desc}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted dark:text-gray-300">
                    <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    {feat}
                  </li>
                ))}
              </ul>

              <div>
                {plan.popular ? (
                  <PrimaryButton className="w-full" onClick={() => navigate('/register')}>
                    Get started
                  </PrimaryButton>
                ) : (
                  <GhostButton className="w-full justify-center" onClick={() => navigate('/register')}>
                    Get started
                  </GhostButton>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
