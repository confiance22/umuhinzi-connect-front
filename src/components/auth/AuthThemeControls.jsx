import LanguageToggle from '../public/LanguageToggle'
import ThemeToggle from '../public/ThemeToggle'

export default function AuthThemeControls() {
  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2 sm:right-6 sm:top-6">
      <LanguageToggle />
      <ThemeToggle />
    </div>
  )
}
