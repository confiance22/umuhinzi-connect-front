/**
 * WorkersPage — staff/worker management (OWNER ONLY, guarded by ProtectedRoute).
 * WorkerTable with role badges, create/edit via WorkerForm, activate/deactivate.
 * Worker identity backs the stock audit trail.
 */
export default function WorkersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Workers</h1>
      {/* TODO: worker list + roles + create/edit/activate forms, gated to owner role */}
    </div>
  )
}