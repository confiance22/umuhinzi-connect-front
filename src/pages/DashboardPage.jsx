/**
 * DashboardPage — landing page after login.
 * KPI cards (total products, stock value, low stock count, recent activity),
 * a LowStockAlert list, recent StockHistoryTable and quick actions
 * (stock in/out, QR generate, start stock check).
 */
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {/* TODO: reportApi.getSummary() KPIs; LowStockAlert; recent movements; quick actions */}
    </div>
  )
}