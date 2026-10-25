/**
 * StockMovementForm — shared form for stock-in and stock-out.
 * type: 'in' | 'out'. For 'out', a REASON is required (sale / damaged / expired /
 * missing / theft) because unexplained removals are the loss this app prevents.
 * Always attaches the logged-in actor id to the payload for the audit trail.
 */
export default function StockMovementForm({ type = 'in', onSubmit }) {
  // TODO(implementation): product picker (search + select), quantity,
  // required reason + note when type==='out', actorId from useAuth().
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.({ type, actorId: null /* TODO: useAuth().user.id */ })
      }}
      className="grid max-w-xl gap-4"
    >
      <p className="text-sm text-gray-500">
        Stock {type} form scaffold — product, quantity, reason (out only), note, actor.
      </p>
      <button type="submit" className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 active:scale-[0.98] hover:bg-brand-800 disabled:opacity-60 disabled:pointer-events-none">
        Record {type}
      </button>
    </form>
  )
}