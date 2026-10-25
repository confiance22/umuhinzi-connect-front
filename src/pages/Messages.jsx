export default function Messages() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
        Messages
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Conversations</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Your farmer-to-buyer conversations will appear here. Messaging is coming
        next.
      </p>

      <div className="mt-6 rounded-card border border-dashed border-brand-200 bg-brand-50/60 p-6 text-sm text-brand-900">
        No conversations yet.
      </div>
    </div>
  )
}
