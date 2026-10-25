import { motion } from 'framer-motion'

export default function Title({ title, heading, description }) {
  return (
    <div className="text-center mb-16">
      {title && (
        <motion.p
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 250, damping: 70, mass: 1 }}
          className="text-sm font-semibold text-brand-600 uppercase tracking-[0.18em] mb-3 dark:text-brand-400"
        >
          {title}
        </motion.p>
      )}
      {heading && (
        <motion.h2
          className="text-2xl md:text-4xl font-semibold text-ink dark:text-white"
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 250, damping: 70, mass: 1, delay: 0.1 }}
        >
          {heading}
        </motion.h2>
      )}
      {description && (
        <motion.p
          className="mx-auto my-3 max-w-md text-sm text-muted dark:text-gray-400"
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 250, damping: 70, mass: 1, delay: 0.2 }}
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}
