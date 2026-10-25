import { ChevronDown } from 'lucide-react'
import Title from './Title'
import { faqData } from '../../assets/landing/dummy-data'
import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function Faq() {
  const refs = useRef([])

  return (
    <section id="faq" className="py-20 2xl:py-32">
      <div className="max-w-3xl mx-auto px-4">
        <Title
          title="FAQ"
          heading="Frequently asked questions"
          description="Everything you need to know about working with our agency. If you have more questions, feel free to reach out."
        />

        <div className="space-y-3">
          {faqData.map((faq, i) => (
            <motion.details
              ref={(el) => {
                refs.current[i] = el
              }}
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 250, damping: 70, mass: 1, delay: 0.1 + i * 0.1 }}
              key={i}
              onAnimationComplete={() => {
                const card = refs.current[i]
                if (card) {
                  card.classList.add('transition', 'duration-300')
                }
              }}
              className="group select-none rounded-2xl border border-black/5 bg-white shadow-[0_16px_40px_-32px_rgba(5,46,22,0.25)] dark:border-white/10 dark:bg-white/5 dark:shadow-none"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer">
                <h4 className="font-medium text-ink dark:text-white">{faq.question}</h4>
                <ChevronDown className="h-5 w-5 text-brand-600 transition-transform group-open:rotate-180 dark:text-brand-300" />
              </summary>
              <p className="p-4 pt-0 text-sm leading-relaxed text-muted dark:text-gray-300">{faq.answer}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  )
}
