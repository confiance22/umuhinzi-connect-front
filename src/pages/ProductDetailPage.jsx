/**
 * ProductDetailPage — single product view.
 * Product info, current stock level, full StockHistoryTable for that product
 * (with actor column — who moved/removed it), QR label preview + print,
 * edit/delete actions gated by usePermissions.
 */
export default function ProductDetailPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Product detail</h1>
      {/* TODO: useParams() → productApi.get(id) → info + QRPrintLabel + StockHistoryTable */}
    </div>
  )
}