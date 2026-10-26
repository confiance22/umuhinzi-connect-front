import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react'

const socialLinks = [
  { label: 'WhatsApp', href: 'https://wa.me/250784646650', icon: MessageCircle },
  { label: 'Facebook', href: '#', icon: Facebook },
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'LinkedIn', href: '#', icon: Linkedin }
]

export default function SocialLinks({ variant = 'light', className = '' }) {
  const tone =
    variant === 'dark'
      ? 'border-white/10 bg-white/[0.04] text-white/55 hover:border-[#d9f99d]/45 hover:bg-[#d9f99d]/10 hover:text-[#d9f99d]'
      : 'border-[#0f3d25]/10 bg-[#0f3d25]/[0.04] text-[#13251a]/55 hover:border-[#0f3d25]/30 hover:bg-[#0f3d25] hover:text-[#fbf7ec] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50 dark:hover:border-[#d9f99d]/40 dark:hover:bg-[#d9f99d] dark:hover:text-[#0f3d25]'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {socialLinks.map((social) => {
        const Icon = social.icon
        const external = social.href.startsWith('http')
        return (
          <a
            key={social.label}
            href={social.href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            aria-label={social.label}
            title={social.label}
            className={`inline-flex size-9 items-center justify-center rounded-full border transition-colors ${tone}`}
          >
            <Icon className="size-3.5" />
          </a>
        )
      })}
    </div>
  )
}
