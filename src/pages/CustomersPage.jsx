/**
 * CustomersPage — the customer ledger: every stock-out is tagged to a
 * managed customer (or Walk-in), so disputes about "who took what" have a
 * paper trail. Lists customers with purchase stats, drills into a per-customer
 * ledger, and exports both the summary and the ledger (branded Excel/PDF/CSV).
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { customerApi } from '../api/customerApi'
import { useAuth } from '../hooks/useAuth'
import { useToastContext } from '../context/ToastContext'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate, formatDateTime } from '../utils/formatDate'
import { shopDisplayName } from '../utils/branding'
import { exportToCSV } from '../utils/exportToCSV'
import { exportReportPDF } from '../utils/exportToPDF'
import { exportToXLS } from '../utils/exportSpreadsheet'
import ExportMenu from '../components/common/ExportMenu'
import MetricCards from '../components/reports/MetricCards'
import { RowActionMenu, DockIcons } from '../components/admin/RowActions'
import { buildTotalsRow } from '../utils/reportTotals'

const SUMMARY_HEADERS = ['Customer', 'Phone', 'Shipments', 'Total Units', 'Cartons', 'Loose Pieces', 'Last Purchase']
const LEDGER_HEADERS = ['Date & Time', 'Product', 'Cartons', 'Loose Pieces', 'Units', 'Unit Value (RWF)', 'Est. Value (RWF)', 'Reason', 'Taken by']
const LEDGER_ALIGN = ['left', 'left', 'right', 'right', 'right', 'right', 'right', 'left', 'left']

const KPI_ICONS = {
  customers: 'M17 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  shipments: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12',
  units: 'M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  active: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
}

const Avatar = ({ name }) => (
  <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
    <span className="text-sm font-bold text-brand-700">{(name || '?').slice(0, 2).toUpperCase()}</span>
  </div>
)

export default function CustomersPage() {
  const { user } = useAuth()
  const { showToast } = useToastContext()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(null)
  const [ledger, setLedger] = useState([])
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', notes: '' })
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)

  const shopName = shopDisplayName(user)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setCustomers(await customerApi.list({ search: query.trim() || undefined }))
    } catch (err) {
      showToast(err.message || 'Could not load customers', 'error')
    } finally {
      setLoading(false)
    }
  }, [query, showToast])

  useEffect(() => {
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [load])

  const openLedger = useCallback(async (customer) => {
    setActive(customer)
    setLedgerLoading(true)
    setLedger([])
    try {
      const detail = await customerApi.get(customer.id)
      setLedger(detail.movements || [])
    } catch (err) {
      showToast(err.message || 'Could not load the ledger', 'error')
    } finally {
      setLedgerLoading(false)
    }
  }, [showToast])

  const filtered = useMemo(
    () => customers.filter((c) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (c.name || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q)
    }),
    [customers, query],
  )

  const totals = useMemo(() => filtered.reduce(
    (acc, c) => ({
      shipments: acc.shipments + (c.shipments || 0),
      units: acc.units + (c.totalUnits || 0),
      cartons: acc.cartons + (c.totalCartons || 0),
      pieces: acc.pieces + (c.totalPieces || 0),
    }),
    { shipments: 0, units: 0, cartons: 0, pieces: 0 },
  ), [filtered])

  const ledgerValue = useMemo(() => ledger.reduce((acc, m) => acc + (Number(m.qty) || 0) * (Number(m.unitValue) || 0), 0), [ledger])

  const activeCount = useMemo(() => customers.filter((c) => (c.shipments || 0) > 0).length, [customers])

  /* -- Exports ------------------------------------------------------ */
  const summarySpec = useCallback(() => ({
    reportTitle: 'Customer Ledger — Summary',
    subtitle: `${filtered.length} customer${filtered.length === 1 ? '' : 's'} taking stock from this shop${query.trim() ? ' (filtered)' : ''}.`,
    periodLabel: `As of ${formatDate(new Date())}`,
    generatedBy: user?.name || 'Shop Manager',
    shopName,
    headers: [...SUMMARY_HEADERS],
    rows: filtered.map((c) => [
      c.name,
      c.phone || '—',
      c.shipments || 0,
      c.totalUnits || 0,
      c.totalCartons || 0,
      c.totalPieces || 0,
      c.lastPurchaseAt ? formatDate(c.lastPurchaseAt) : '—',
    ]),
    alignments: ['left', 'left', 'right', 'right', 'right', 'right', 'left'],
    totalsRow: buildTotalsRow(SUMMARY_HEADERS, filtered.map((c) => [
      c.name, c.phone || '—', c.shipments || 0, c.totalUnits || 0, c.totalCartons || 0, c.totalPieces || 0, c.lastPurchaseAt ? formatDate(c.lastPurchaseAt) : '—',
    ])),
    filename: `StockRwa-Customers-${new Date().toISOString().slice(0, 10)}`,
  }), [filtered, query, shopName, user])

  const buildLedgerSpec = useCallback((customer, movements) => {
    const cust = customer || { name: 'Customer' }
    const rows = movements.map((m) => [
      formatDateTime(m.createdAt),
      m.productName,
      m.cartons || 0,
      m.pieces || 0,
      m.qty,
      Number(m.unitValue) || 0,
      (Number(m.qty) || 0) * (Number(m.unitValue) || 0),
      m.reason || '—',
      m.actor || '—',
    ])
    const safeName = cust.name.replace(/[^a-z0-9]+/gi, '-') || 'Customer'
    return {
      reportTitle: `Customer Ledger — ${cust.name}`,
      subtitle: `${movements.length} stock-out${movements.length === 1 ? '' : 's'} recorded to ${cust.name}${cust.phone ? ` · ${cust.phone}` : ''}. Ledger values are estimated from current prices.`,
      periodLabel: `As of ${formatDate(new Date())}`,
      generatedBy: user?.name || 'Shop Manager',
      shopName,
      headers: [...LEDGER_HEADERS],
      rows,
      alignments: [...LEDGER_ALIGN],
      totalsRow: buildTotalsRow(LEDGER_HEADERS, rows),
      filename: `StockRwa-Ledger-${safeName}-${new Date().toISOString().slice(0, 10)}`,
    }
  }, [shopName, user])

  const ledgerSpec = useCallback(
    () => buildLedgerSpec(active, ledger),
    [buildLedgerSpec, active, ledger],
  )

  const handleSummaryExcel = useCallback(async () => {
    try {
      await exportToXLS(summarySpec())
      showToast('Customer summary exported as Excel', 'success')
    } catch (err) {
      showToast(err?.message || 'Excel export failed', 'error')
    }
  }, [summarySpec, showToast])

  const handleSummaryPDF = useCallback(async () => {
    try {
      await exportReportPDF(summarySpec())
      showToast('Customer summary exported as PDF', 'success')
    } catch (err) {
      showToast(err?.message || 'PDF export failed', 'error')
    }
  }, [summarySpec, showToast])

  const handleSummaryCSV = () => {
    try {
      exportToCSV(SUMMARY_HEADERS, summarySpec().rows, `StockRwa-Customers-${new Date().toISOString().slice(0, 10)}`)
      showToast('Customer summary exported as CSV', 'success')
    } catch (err) {
      showToast(err?.message || 'CSV export failed', 'error')
    }
  }

  const handleLedgerExcel = useCallback(async () => {
    try {
      await exportToXLS(ledgerSpec())
      showToast('Ledger exported as Excel', 'success')
    } catch (err) {
      showToast(err?.message || 'Excel export failed', 'error')
    }
  }, [ledgerSpec, showToast])

  const handleLedgerPDF = useCallback(async () => {
    try {
      await exportReportPDF(ledgerSpec())
      showToast('Ledger exported as PDF', 'success')
    } catch (err) {
      showToast(err?.message || 'PDF export failed', 'error')
    }
  }, [ledgerSpec, showToast])

  const handleLedgerCSV = () => {
    try {
      exportToCSV(LEDGER_HEADERS, ledgerSpec().rows, `StockRwa-Ledger-${active ? active.name.replace(/[^a-z0-9]+/gi, '-') : 'Customer'}-${new Date().toISOString().slice(0, 10)}`)
      showToast('Ledger exported as CSV', 'success')
    } catch (err) {
      showToast(err?.message || 'CSV export failed', 'error')
    }
  }

  /* Per-customer PDF export (from the row action / ledger drawer) */
  const exportCustomerReport = useCallback(async (customer) => {
    try {
      const detail = await customerApi.get(customer.id)
      const movements = detail.movements || []
      await exportReportPDF(buildLedgerSpec(customer, movements))
      showToast(`"${customer.name}" report exported as PDF`, 'success')
    } catch (err) {
      showToast(err?.message || 'PDF export failed', 'error')
    }
  }, [buildLedgerSpec, showToast])

  /* -- Add / Edit / Delete ----------------------------------------- */
  const openAdd = () => {
    setForm({ name: '', phone: '', notes: '' })
    setModal('add')
  }

  const openEdit = (c) => {
    setForm({ name: c.name, phone: c.phone || '', notes: c.notes || '' })
    setModal('edit')
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { showToast('Customer name is required', 'error'); return }
    setSaving(true)
    try {
      if (modal === 'edit') {
        await customerApi.update(active.id, { name: form.name.trim(), phone: form.phone.trim() || null, notes: form.notes.trim() || null })
        showToast('Customer updated', 'success')
      } else {
        const created = await customerApi.create({ name: form.name.trim(), phone: form.phone.trim() || null, notes: form.notes.trim() || null })
        showToast(`"${created.name}" added`, 'success')
      }
      setModal(null)
      await load()
      if (active && modal === 'edit') openLedger({ ...active, name: form.name.trim(), phone: form.phone.trim() || null })
    } catch (err) {
      showToast(err.message || 'Could not save the customer', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setSaving(true)
    try {
      await customerApi.remove(deleting.id)
      showToast('Customer removed', 'success')
      setDeleting(null)
      await load()
    } catch (err) {
      showToast(err.message || 'Could not delete the customer', 'error')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setModal(null)
        setDeleting(null)
        setActive(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-full bg-page p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Customers &amp; Ledger</h1>
              <p className="text-sm text-muted mt-1">Every stock-out traced to its customer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportMenu onExcel={handleSummaryExcel} onPdf={handleSummaryPDF} onCsv={handleSummaryCSV} excelLabel="Export List" />
            <button onClick={openAdd}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 text-white text-sm font-medium px-5 py-2 transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Customer
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI row — same famous cards as the system reports: first black accent + green */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <MetricCards
          items={[
            { label: 'Customers', value: filtered.length, sub: 'matching current view', icon: KPI_ICONS.customers, accent: true },
            { label: 'Shipments', value: `${totals.shipments.toLocaleString()}`, sub: 'stock-outs recorded', icon: KPI_ICONS.shipments },
            { label: 'Units Taken', value: totals.units.toLocaleString(), sub: `${totals.cartons.toLocaleString()} cartons · ${totals.pieces.toLocaleString()} loose`, icon: KPI_ICONS.units },
            { label: 'Active', value: `${activeCount}`, sub: 'have taken stock', icon: KPI_ICONS.active },
          ]}
        />
      </motion.div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-full rounded-full border border-line bg-card pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-line bg-card shadow-soft overflow-hidden">
        {loading ? (
          <p className="text-center text-sm text-muted py-16">Loading customers…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-medium text-ink">No customers yet</p>
            <p className="text-xs text-muted mt-1">Add your first customer, or the next stock-out can be recorded to a Walk-in.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-line bg-page/60">
                  <th className="px-5 py-3.5 font-semibold">Actions</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Phone</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Shipments</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Units</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Cartons</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Loose</th>
                  <th className="px-5 py-3.5 font-semibold">Last Purchase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-page/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex justify-start">
                        <RowActionMenu
                          primary={{ label: 'View Ledger', icon: DockIcons.check, onClick: () => openLedger(c) }}
                          items={[
                            { label: 'Edit', icon: DockIcons.edit, onClick: () => openEdit(c) },
                            { label: 'Export Report (PDF)', icon: DockIcons.shield, iconTone: 'text-emerald-600', onClick: () => exportCustomerReport(c) },
                            'divider',
                            { label: 'Delete', icon: DockIcons.trash, danger: true, onClick: () => setDeleting(c) },
                          ]}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => openLedger(c)} className="flex items-center gap-3 text-left group">
                        <Avatar name={c.name} />
                        <div className="min-w-0">
                          <p className="font-medium text-ink group-hover:text-brand-700 transition-colors truncate">{c.name}</p>
                          <p className="text-xs text-muted truncate">Added {formatDate(c.createdAt)}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{c.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-ink">{c.shipments || 0}</td>
                    <td className="px-5 py-3.5 text-right text-ink">{c.totalUnits?.toLocaleString() || 0}</td>
                    <td className="px-5 py-3.5 text-right text-muted">{c.totalCartons || 0}</td>
                    <td className="px-5 py-3.5 text-right text-muted">{c.totalPieces || 0}</td>
                    <td className="px-5 py-3.5 text-muted">{c.lastPurchaseAt ? formatDate(c.lastPurchaseAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Ledger drawer */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" onClick={() => setActive(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-card shadow-2xl flex flex-col rounded-l-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={active.name} />
                <div>
                  <h2 className="text-lg font-bold text-ink">{active.name}</h2>
                  <p className="text-xs text-muted">{active.phone || 'No phone on file'} · customer since {formatDate(active.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ExportMenu onExcel={handleLedgerExcel} onPdf={handleLedgerPDF} onCsv={handleLedgerCSV} excelLabel="Export Ledger" />
                <button onClick={() => setActive(null)} className="p-2 rounded-lg text-gray-400 hover:text-ink hover:bg-page transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-line grid grid-cols-3 gap-4 shrink-0">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Shipments</p>
                <p className="text-lg font-bold text-ink">{active.shipments || 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Units Out</p>
                <p className="text-lg font-bold text-ink">{active.totalUnits?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Est. Value</p>
                <p className="text-lg font-bold text-ink">{formatCurrency(ledgerValue)}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {ledgerLoading ? (
                <p className="text-center text-sm text-muted py-16">Loading ledger…</p>
              ) : ledger.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm font-medium text-ink">No stock-outs yet</p>
                  <p className="text-xs text-muted mt-1">This customer has no movement history in the ledger.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card">
                      <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-line">
                        <th className="px-6 py-3 font-semibold">Date &amp; Time</th>
                        <th className="px-6 py-3 font-semibold">Product</th>
                        <th className="px-6 py-3 font-semibold text-right">Qty</th>
                        <th className="px-6 py-3 font-semibold text-right">Est. Value</th>
                        <th className="px-6 py-3 font-semibold">Reason</th>
                        <th className="px-6 py-3 font-semibold">By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {ledger.map((m) => (
                        <tr key={m.id} className="hover:bg-page/50 transition-colors">
                          <td className="px-6 py-3 text-muted whitespace-nowrap">{formatDateTime(m.createdAt)}</td>
                          <td className="px-6 py-3 font-medium text-ink">{m.productName}</td>
                          <td className="px-6 py-3 text-right whitespace-nowrap">
                            <span className="font-medium">{m.qty}</span>
                            <span className="text-xs text-muted ml-1">
                              {m.pieces > 0 && m.cartons > 0 ? `(${m.cartons}c + ${m.pieces}p)` : m.cartons > 0 ? `(${m.cartons} cartons)` : '(loose)'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right text-ink whitespace-nowrap">{formatCurrency((Number(m.qty) || 0) * (Number(m.unitValue) || 0))}</td>
                          <td className="px-6 py-3 text-muted capitalize">{m.reason || '—'}</td>
                          <td className="px-6 py-3 text-muted">{m.actor || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="border-t border-line px-6 py-3 text-xs text-muted shrink-0">
              Ledger values are estimated from current product prices, not recorded sale prices.
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-line flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">{modal === 'edit' ? 'Edit Customer' : 'Add Customer'}</h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-ink hover:bg-page transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={save} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Name <span className="text-red-500">*</span></label>
                  <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Kagame & Sons Traders"
                    className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 078 123 4567"
                    className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    placeholder="Anything useful — credit terms, usual orders…"
                    className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-colors resize-none" />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setModal(null)}
                    className="rounded-full border border-line bg-white text-ink text-sm font-medium px-4 py-2 hover:bg-page transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-700 text-white text-sm font-medium px-5 py-2 hover:bg-brand-800 transition-colors disabled:opacity-60">
                    {saving && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>}
                    {modal === 'edit' ? 'Save Changes' : 'Add Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setDeleting(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md rounded-2xl bg-card shadow-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Delete "{deleting.name}"?</h3>
                  <p className="text-sm text-muted mt-1">
                    Customers with transactions can't be deleted — they're in your reports.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-6">
                <button type="button" onClick={() => setDeleting(null)}
                  className="rounded-full border border-line bg-white text-ink text-sm font-medium px-4 py-2 hover:bg-page transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={confirmDelete} disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 text-white text-sm font-medium px-5 py-2 hover:bg-red-700 transition-colors disabled:opacity-60">
                  {saving && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>}
                  Delete Customer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}