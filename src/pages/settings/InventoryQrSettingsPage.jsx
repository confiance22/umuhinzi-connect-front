/**
 * InventoryQrSettingsPage — Shop Manager: stock control policies + QR label
 * print defaults. Both are client-side behaviours persisted to localStorage
 * (stockrwa_preferences), so they survive reloads and are ready for the
 * scanner/print flows.
 */
import React, { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { useToastContext } from '../../context/ToastContext'

const SETTINGS_STORAGE_KEY = 'stockrwa_preferences'

const DEFAULT_INVENTORY = {
  defaultReorderThreshold: 20,
  enforceReasonOnStockOut: true,
  blockNegativeStock: true,
  dailyAuditReminder: true,
  notifyOnLowStock: true,
  autoApproveStockIn: false,
}

const DEFAULT_QR = {
  defaultSize: 'M',
  includePrice: true,
  includeSku: true,
  includeName: true,
  labelBorder: true,
  errorCorrection: 'H',
}

const Toggle = ({ on, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!on)}
    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${on ? 'bg-brand-700' : 'bg-gray-300'}`}
    aria-pressed={on}
  >
    <span
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
)

export const InventoryQrSettingsPage = () => {
  const { showToast } = useToastContext()
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY)
  const [qr, setQr] = useState(DEFAULT_QR)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    let local = {}
    try {
      local = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null') || {}
    } catch {
      local = {}
    }
    setInventory({ ...DEFAULT_INVENTORY, ...(local.inventory || {}) })
    setQr({ ...DEFAULT_QR, ...(local.qr || {}) })
  }, [])

  const changeInventory = (field, value) => {
    setInventory((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const changeQr = (field, value) => {
    setQr((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ inventory, qr }),
      )
      setHasChanges(false)
      showToast('Preferences saved', 'success')
    } catch {
      showToast('Could not save preferences', 'error')
    } finally {
      setSaving(false)
    }
  }

  const policyRow = (title, desc, checked, onChange) => (
    <div className="py-4 flex items-center justify-between">
      <div className="max-w-md">
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        <p className="text-[13px] text-muted mt-0.5 leading-snug">{desc}</p>
      </div>
      <Toggle on={checked} onChange={onChange} />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="inline-block text-xs font-medium uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
            Settings · Inventory & QR
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Inventory & QR Defaults</h1>
          <p className="text-sm text-muted mt-1">
            Stock rules and the default look of printed QR labels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full animate-pulse">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            )}
            Save preferences
          </button>
        </div>
      </div>

      {/* Inventory policies */}
      <div className="rounded-2xl border border-line bg-card shadow-soft p-6 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-ink">Stock Control & Audit Governance</h3>
          <p className="text-[13px] text-muted mt-0.5 leading-snug">
            Enforce operational business rules for worker stock transactions, auditing, and loss prevention.
          </p>
        </div>

        <div className="divide-y divide-line">
          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="max-w-md">
              <h4 className="text-sm font-semibold text-ink">Global Low-Stock Threshold</h4>
              <p className="text-[13px] text-muted mt-0.5 leading-snug">
                Default units baseline below which items flag as low stock across reports and dashboards.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="500"
                value={inventory.defaultReorderThreshold}
                onChange={(e) => changeInventory('defaultReorderThreshold', Number(e.target.value))}
                className="w-24 rounded-lg border border-line bg-white px-3 py-2 text-center text-sm font-semibold text-ink outline-none focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25"
              />
              <span className="text-xs text-gray-500">units</span>
            </div>
          </div>

          {policyRow(
            'Block Negative Stock Out',
            'Strictly disallow staff from recording stock-out when an item balance is zero.',
            inventory.blockNegativeStock,
            (v) => changeInventory('blockNegativeStock', v)
          )}
          {policyRow(
            'Mandatory Stock-Out Reasons',
            'Staff must declare a verified category (Sale, Damaged, Expired, Theft) before taking stock out.',
            inventory.enforceReasonOnStockOut,
            (v) => changeInventory('enforceReasonOnStockOut', v)
          )}
          {policyRow(
            'Automatic Low-Stock Notifications',
            'Receive high-priority manager alerts immediately when inventory levels fall below safety levels.',
            inventory.notifyOnLowStock,
            (v) => changeInventory('notifyOnLowStock', v)
          )}
          {policyRow(
            'Daily Closing Stock-Check Reminder',
            'Prompt shift workers to perform spot-counts on counter items before end of business.',
            inventory.dailyAuditReminder,
            (v) => changeInventory('dailyAuditReminder', v)
          )}
        </div>
      </div>

      {/* QR & print */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-line bg-card shadow-soft p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-ink">QR Code Label Formatting</h3>
            <p className="text-[13px] text-muted mt-0.5 leading-snug">
              Default label printing layout and content properties for shelf stickers and product packages.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Default Label Size</label>
              <div className="flex items-center gap-3">
                {[
                  { id: 'S', label: 'Small (96px)', desc: 'For small items: socks, accessories' },
                  { id: 'M', label: 'Medium (148px)', desc: 'Standard retail labels' },
                  { id: 'L', label: 'Large (200px)', desc: 'Shoe boxes, bags & bulky items' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => changeQr('defaultSize', s.id)}
                    className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                      qr.defaultSize === s.id
                        ? 'border-brand-700 bg-brand-700/5 ring-1 ring-brand-700'
                        : 'border-line hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className="block text-xs font-bold text-ink">{s.label}</span>
                    <span className="block text-xs text-muted mt-0.5">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-line pt-2">
              {[
                { key: 'includePrice', title: 'Show Unit Price on Label', desc: 'Prints formatted price (e.g. RWF 2,500) under the QR code.' },
                { key: 'includeSku', title: 'Show SKU Code', desc: 'Prints alphanumeric item identifier under code.' },
                { key: 'labelBorder', title: 'Dashed Border for Cutter', desc: 'Adds dashed cutting guide outline around printable labels.' },
              ].map((opt) => (
                <div key={opt.key} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-ink">{opt.title}</span>
                    <p className="text-[13px] text-muted leading-snug">{opt.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={qr[opt.key]}
                    onChange={(e) => changeQr(opt.key, e.target.checked)}
                    className="w-4 h-4 text-brand-700 rounded border-gray-300 focus:ring-brand-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card shadow-soft p-6 flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted mb-4">Live Label Print Preview</span>
          <div
            className={`bg-white p-4 text-center transition-all ${
              qr.labelBorder ? 'border border-dashed border-gray-300 rounded-xl' : ''
            }`}
            style={{ width: qr.defaultSize === 'S' ? 160 : qr.defaultSize === 'M' ? 200 : 230 }}
          >
            {qr.includeName && <p className="text-xs font-bold text-ink truncate mb-1">Men Leather Shoes</p>}
            {qr.includeSku && <p className="text-xs text-muted font-mono mb-2">SHOE-001</p>}
            <div className="flex justify-center my-2">
              <QRCodeCanvas
                value={JSON.stringify({ v: 1, type: 'product', id: '1', code: 'SHOE-001', name: 'Men Leather Shoes' })}
                size={qr.defaultSize === 'S' ? 88 : qr.defaultSize === 'M' ? 120 : 150}
                level="H"
                includeMargin
              />
            </div>
            {qr.includePrice && <p className="text-xs font-bold text-brand-700 mt-2">RWF 2,500</p>}
          </div>
          <p className="text-xs text-muted mt-4 max-w-xs">
            Labels work with StockRwa QR scanner protocols.
          </p>
        </div>
      </div>
    </div>
  )
}

export default InventoryQrSettingsPage