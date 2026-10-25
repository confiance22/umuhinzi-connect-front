/**
 * ForgotPasswordPage — full-screen split page (mirrors LoginPage/RegisterPage).
 * Left: dark brand panel with AuthDivider & glowing QR artwork.
 * Right: ForgotPasswordForm.
 */
import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'
import AuthThemeControls from '../components/auth/AuthThemeControls'
import BrandLockup from '../components/common/Brand'
import AuthDivider from '../components/common/AuthDivider'
import Toast from '../components/common/Toast'
import { useToastContext } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { ROUTE_PATHS } from '../constants/routePaths'

export default function ForgotPasswordPage() {
  const year = new Date().getFullYear()
  const { toasts, dismissToast } = useToastContext()
  const { isDark } = useTheme()
  const { t } = useLanguage()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white antialiased dark:bg-[#050505]">
      <AuthThemeControls />
      {/* Left brand panel */}
      <div className="auth-panel relative z-10 hidden flex-col justify-between overflow-hidden p-12 text-ink dark:text-white md:flex md:w-[52%] lg:p-20">
        <AuthDivider />

        <div className="relative z-10">
          <Link to={ROUTE_PATHS.HOME} className="inline-block" aria-label={t('auth.common.homeAria')}>
            <BrandLockup size={30} textClassName="text-[15px]" dark={!isDark} />
          </Link>
        </div>

        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 max-w-xl space-y-6"
        >
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${
            isDark
              ? 'border-brand-400/25 bg-brand-400/10 text-brand-300'
              : 'border-brand-600/20 bg-brand-600/10 text-brand-700'
          }`}>
            {t('auth.forgot.panelBadge')}
          </span>
          <h1 className="text-[45px] font-bold leading-tight tracking-tight text-ink dark:text-white xl:text-[54px]">
            {t('auth.forgot.panelTitle')}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-ink/65 dark:text-white/70">
            {t('auth.forgot.panelText')}
          </p>
        </motion.div>

        <div className="relative z-10">
          <p className="text-xs text-ink/35 dark:text-white/35">© {year} {t('auth.common.copyright')}</p>
        </div>
      </div>

      {/* Right form area */}
      <div className="auth-dark flex w-full flex-col justify-center overflow-y-auto bg-white p-8 dark:bg-[#050505] sm:p-16 md:w-[48%] lg:px-24">
        <div className="md:hidden mb-10">
          <Link to={ROUTE_PATHS.HOME} className="inline-block" aria-label={t('auth.common.homeAria')}>
            <BrandLockup size={30} textClassName="text-[15px]" dark={!isDark} />
          </Link>
        </div>

        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto"
        >
          <ForgotPasswordForm />
        </motion.div>
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}