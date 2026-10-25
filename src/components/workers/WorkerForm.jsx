/**
 * WorkerForm — create/edit worker (OWNER ONLY, gate at route + UI level).
 * Fields: name, role (worker/staff), phone, email, active status.
 * The worker's id becomes the actor recorded on stock movements.
 */
export default function WorkerForm({ initialValues = {}, onSubmit }) {
  // TODO(implementation): name, role select, phone, email, active toggle +
  // validators (isPhoneRw, isEmail) → submit → onSubmit(values)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(initialValues)
      }}
      className="grid max-w-xl gap-4"
    >
      <p className="text-sm text-muted">Worker form scaffold — name, role, phone, email, active.</p>
      <button
        type="submit"
        className="w-fit inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
      >
        Save worker
      </button>
    </form>
  )
}