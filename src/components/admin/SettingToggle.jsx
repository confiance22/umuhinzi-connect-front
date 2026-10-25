/**
 * SettingToggle — label/switch row used by the Super Admin settings pages.
 * 44×24 switch that turns green (#16A34A) when on with a smooth knob slide.
 */
export default function SettingToggle({
  title,
  description,
  on,
  disabled = false,
  busy = false,
  busyLabel = 'Saving…',
  onChange,
}) {
  return (
    <div className="flex items-start justify-between gap-6 px-6 py-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-[13px] text-muted mt-1 leading-snug max-w-2xl">{description}</p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        {busy && <span className="text-xs font-medium text-brand-700 animate-pulse">{busyLabel}</span>}
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={disabled || busy}
          onClick={() => onChange(!on)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline focus:outline-2 focus:outline-brand-500/40 disabled:opacity-50 disabled:pointer-events-none ${
            on ? 'bg-[#16A34A]' : 'bg-[#D1D5DB]'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              on ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  )
}