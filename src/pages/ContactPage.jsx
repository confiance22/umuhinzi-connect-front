import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send
} from 'lucide-react'
import PublicShell from '../components/public/PublicShell'
import { useLanguage } from '../context/LanguageContext'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  role: '',
  subject: '',
  message: ''
}

const ease = [0.16, 1, 0.3, 1]

export default function ContactPage() {
  const { t } = useLanguage()
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const timerRef = useRef(null)
  const roles = t('contact.roles') || []
  const helpPoints = t('contact.helpPoints') || []

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    timerRef.current = setTimeout(() => setStatus('sent'), 650)
  }

  const sendAnother = () => {
    setForm(initialForm)
    setStatus('idle')
  }

  const contactDetails = [
    {
      icon: Mail,
      label: t('contact.emailLabel'),
      value: t('contact.emailValue'),
      href: `mailto:${t('contact.emailValue')}`
    },
    {
      icon: Phone,
      label: t('contact.phoneLabel'),
      value: t('contact.phoneValue'),
      href: `tel:${t('contact.phoneValue').replace(/\s/g, '')}`
    },
    {
      icon: MapPin,
      label: t('contact.officeLabel'),
      value: t('contact.officeValue')
    },
    {
      icon: Clock3,
      label: t('contact.supportLabel'),
      value: t('contact.supportValue')
    }
  ]

  const fieldClass =
    'h-11 w-full rounded-xl border border-[#0f3d25]/[0.12] bg-[#f6f1e6]/65 px-3.5 text-[12px] text-[#13251a] outline-none transition-colors placeholder:text-[#13251a]/30 focus:border-[#0f3d25]/45 focus:bg-[#fbf7ec] dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/25 dark:focus:border-[#d9f99d]/40'
  const labelClass =
    'mb-1.5 block text-[7px] font-semibold uppercase tracking-[0.16em] text-[#13251a]/40 dark:text-white/30'

  return (
    <PublicShell>
      <section data-hero className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="flex flex-wrap items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.16em]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d9f99d] px-3 py-1.5 text-[#0f3d25] dark:bg-[#d9f99d]/15 dark:text-[#d9f99d]">
                <span className="size-1.5 rounded-full bg-[#0f3d25] dark:bg-[#d9f99d]" />
                {t('contact.badge')}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#13251a]/35 dark:text-white/30">
                <Clock3 className="size-3" />
                {t('contact.supportValue')}
              </span>
            </div>

            <h1 className="mt-6 max-w-[540px] font-serif text-[clamp(3.1rem,7vw,6.1rem)] leading-[0.88] tracking-[-0.06em]">
              {t('contact.title')}
            </h1>
            <p className="mt-6 max-w-[480px] text-sm leading-[1.8] text-[#13251a]/55 dark:text-white/45 sm:text-[15px]">
              {t('contact.subtitle')}
            </p>

            <div className="mt-9 grid gap-2.5 sm:grid-cols-2">
              {contactDetails.map((item) => {
                const Icon = item.icon
                const content = (
                  <>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0f3d25] text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]">
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[7px] font-semibold uppercase tracking-[0.15em] text-[#13251a]/35 dark:text-white/25">
                        {item.label}
                      </span>
                      <span className="mt-1 block truncate text-[11px] font-medium text-[#13251a]/75 dark:text-white/60">
                        {item.value}
                      </span>
                    </span>
                  </>
                )

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-[18px] border border-[#0f3d25]/10 bg-[#fbf7ec]/75 p-3.5 transition-colors hover:border-[#0f3d25]/25 hover:bg-[#fbf7ec] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-[18px] border border-[#0f3d25]/10 bg-[#fbf7ec]/75 p-3.5 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    {content}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 rounded-[22px] border border-[#0f3d25]/10 bg-[#e7efda]/60 p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#0f3d25]/55 dark:text-[#d9f99d]/60">
                {t('contact.helpTitle')}
              </p>
              <ul className="mt-3 space-y-2.5">
                {helpPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-[10px] leading-relaxed text-[#13251a]/55 dark:text-white/40"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#0f3d25] text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]">
                      <Check className="size-2.5" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease }}
            className="relative overflow-hidden rounded-[30px] border border-[#0f3d25]/15 bg-[#fbf7ec] p-6 text-[#13251a] shadow-[12px_14px_0_rgba(15,61,37,0.06)] dark:border-white/[0.12] dark:bg-[#0b1710] dark:text-[#f2eee3] dark:shadow-[12px_14px_0_rgba(0,0,0,0.2)] sm:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full border border-[#0f3d25]/10 dark:border-white/10"
            />
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease }}
                  className="relative flex min-h-[460px] flex-col items-center justify-center px-3 text-center"
                  role="status"
                >
                  <span className="flex size-16 items-center justify-center rounded-full bg-[#d9f99d] text-[#0f3d25] dark:bg-[#d9f99d]">
                    <Check className="size-7" />
                  </span>
                  <h2 className="mt-6 font-serif text-3xl tracking-[-0.04em]">
                    {t('contact.sentTitle')}
                  </h2>
                  <p className="mt-3 max-w-[320px] text-xs leading-relaxed text-[#13251a]/50 dark:text-white/40">
                    {t('contact.sentBody')}
                  </p>
                  <button
                    type="button"
                    onClick={sendAnother}
                    className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#0f3d25]/20 px-5 py-2.5 text-[10px] font-semibold transition-colors hover:border-[#0f3d25] hover:bg-[#0f3d25] hover:text-[#fbf7ec] dark:border-white/20 dark:hover:border-[#d9f99d] dark:hover:bg-[#d9f99d] dark:hover:text-[#0f3d25]"
                  >
                    {t('contact.another')}
                    <ArrowRight className="size-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease }}
                  onSubmit={handleSubmit}
                  className="relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-[30px] leading-none tracking-[-0.045em]">
                        {t('contact.formTitle')}
                      </h2>
                      <p className="mt-2 text-[10px] text-[#13251a]/45 dark:text-white/35">
                        {t('contact.formNote')}
                      </p>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0f3d25] text-[#d9f99d] dark:bg-[#d9f99d] dark:text-[#0f3d25]">
                      <Mail className="size-4" />
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className={labelClass}>
                        {t('contact.name')}
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={form.name}
                        onChange={updateField('name')}
                        placeholder={t('contact.namePlaceholder')}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className={labelClass}>
                        {t('contact.email')}
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={updateField('email')}
                        placeholder={t('contact.emailPlaceholder')}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className={labelClass}>
                        {t('contact.phone')}
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={updateField('phone')}
                        placeholder={t('contact.phonePlaceholder')}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-role" className={labelClass}>
                        {t('contact.role')}
                      </label>
                      <select
                        id="contact-role"
                        value={form.role}
                        onChange={updateField('role')}
                        className={fieldClass}
                      >
                        <option value="" disabled>
                          {t('contact.rolePlaceholder')}
                        </option>
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="contact-subject" className={labelClass}>
                        {t('contact.subject')}
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        value={form.subject}
                        onChange={updateField('subject')}
                        placeholder={t('contact.subjectPlaceholder')}
                        className={fieldClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="contact-message" className={labelClass}>
                        {t('contact.message')}
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={updateField('message')}
                        placeholder={t('contact.messagePlaceholder')}
                        className="w-full resize-none rounded-xl border border-[#0f3d25]/[0.12] bg-[#f6f1e6]/65 px-3.5 py-3 text-[12px] leading-relaxed text-[#13251a] outline-none transition-colors placeholder:text-[#13251a]/30 focus:border-[#0f3d25]/45 focus:bg-[#fbf7ec] dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/25 dark:focus:border-[#d9f99d]/40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f3d25] px-6 py-3.5 text-[11px] font-semibold text-[#f7f3e9] transition-colors hover:bg-[#14532d] disabled:cursor-wait disabled:opacity-60 dark:bg-[#d9f99d] dark:text-[#0f3d25] dark:hover:bg-white"
                  >
                    {status === 'sending' ? t('contact.sending') : t('contact.send')}
                    <Send className="size-3.5" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </PublicShell>
  )
}
