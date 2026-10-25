export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="grid min-h-[50vh] place-items-center px-4">
      <div className="flex flex-col items-center gap-3">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  )
}
