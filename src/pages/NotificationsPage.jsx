/**
 * NotificationsPage - Full-page notifications center with a multi-filter suite.
 * Features:
 *   - Search keyword filter (title & message)
 *   - Status filter tabs (All / Unread / Read)
 *   - Category / Type filter (Harvests, Orders, Farmers & Buyers, Accounts, System)
 *   - Date Range filter (All Time, Today, Past 7 Days, Past 30 Days)
 *   - Bulk actions: Mark all read, Clear all notifications
 *   - Per-notification quick actions: Toggle Read/Unread, Delete
 */
import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import { notificationApi } from '../api/notificationApi'
import { useAuth } from '../hooks/useAuth'
import { useToastContext } from '../context/ToastContext'
import { ROUTE_PATHS } from '../constants/routePaths'
import ConfirmDeleteModal from '../components/admin/ConfirmDeleteModal'

const TYPE_CONFIG = {
  all: { label: 'All Categories', color: 'bg-[#e8dfca] text-gray-700' },
  stock: {
    label: 'Harvests & Listings',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
  },
  shop: {
    label: 'Orders & Requests',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  team: {
    label: 'Farmers & Buyers',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      </svg>
    ),
  },
  user: {
    label: 'Accounts & Access',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 10h-6M19 7v6" />
      </svg>
    ),
  },
  info: {
    label: 'System Alerts',
    badge: 'bg-[#e8dfca] text-gray-700 border-gray-200',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
}

export default function NotificationsPage({ scope: propScope }) {
  const { user } = useAuth()
  const { showToast } = useToastContext()

  // Determine scope: 'system' for Super Admin, 'shop' for Manager
  const activeScope =
    propScope || (user?.role === 'super_admin' ? 'system' : `shop:${user?.shopId || 1}`)

  const { items, unread, markRead, markUnread, deleteItem, clearAll, markAllRead } =
    useNotifications(activeScope)

  // ── Filter states ──
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'unread' | 'read'
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'stock' | 'shop' | 'team' | 'user' | 'info'
  const [dateFilter, setDateFilter] = useState('all') // 'all' | 'today' | 'week' | 'month'
  const [clearOpen, setClearOpen] = useState(false)

  // ── Filtering Logic ──
  const filteredItems = useMemo(() => {
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const sevenDays = 7 * oneDay
    const thirtyDays = 30 * oneDay

    return items.filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.title?.toLowerCase().includes(q)
        const matchMsg = item.message?.toLowerCase().includes(q)
        if (!matchTitle && !matchMsg) return false
      }

      // Status filter
      if (statusFilter === 'unread' && item.read) return false
      if (statusFilter === 'read' && !item.read) return false

      // Category / Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false

      // Date range filter
      if (dateFilter !== 'all') {
        const itemTime = new Date(item.time).getTime()
        const diff = now - itemTime
        if (dateFilter === 'today' && diff > oneDay) return false
        if (dateFilter === 'week' && diff > sevenDays) return false
        if (dateFilter === 'month' && diff > thirtyDays) return false
      }

      return true
    })
  }, [items, searchQuery, statusFilter, typeFilter, dateFilter])

  const handleMarkAllRead = () => {
    markAllRead()
    showToast('All notifications marked as read', 'success')
  }

  const handleClearAll = () => {
    setClearOpen(true)
  }

  const confirmClearAll = () => {
    clearAll()
    setClearOpen(false)
    showToast('Notifications cleared', 'info')
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
    setDateFilter('all')
  }

  const isFiltered =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    dateFilter !== 'all'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 antialiased font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Notifications
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d9f99d] text-[#0f3d25]">
              {unread} unread
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {activeScope === 'system'
              ? 'Platform activity, account changes, and marketplace alerts.'
              : 'Harvest updates, buyer requests, and account activity.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d9f99d]/20 px-3.5 py-2 text-sm font-medium text-[#3f6212] transition-[transform,background-color,color] duration-150 hover:bg-[#d9f99d]/40 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              Mark all as read
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-[#fbf7ec] px-3.5 py-2 text-sm font-medium text-ink transition-[transform,background-color,color] duration-150 hover:bg-page hover:text-red-600 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Multi-Filter Bar ── */}
      <div className="rounded-2xl border border-line bg-[#efe7d6] shadow-soft p-4 space-y-4">
        {/* Search Bar & Status Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications by keyword..."
              className="h-11 w-full rounded-lg border border-line bg-[#fbf7ec] pl-9 pr-9 text-sm text-ink placeholder:text-muted/55 focus:border-[#84cc16] focus:outline focus:outline-2 focus:outline-[#84cc16]/25"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#e8dfca] p-1 rounded-full shrink-0 self-start md:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#d9f99d] text-[#0f3d25] shadow-soft'
                  : 'text-gray-500 hover:text-ink'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === 'unread'
                  ? 'bg-[#d9f99d] text-[#0f3d25] shadow-soft'
                  : 'text-gray-500 hover:text-ink'
              }`}
            >
              Unread ({unread})
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === 'read'
                  ? 'bg-[#d9f99d] text-[#0f3d25] shadow-soft'
                  : 'text-gray-500 hover:text-ink'
              }`}
            >
              Read ({items.length - unread})
            </button>
          </div>
        </div>

        {/* Dropdown Filters (Category & Date Range) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-500">Category:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-semibold bg-[#fbf7ec] border border-line rounded-lg px-2.5 py-1.5 text-ink outline-none focus:border-[#84cc16] focus:outline focus:outline-2 focus:outline-[#84cc16]/25"
              >
                <option value="all">All Categories</option>
                <option value="stock">Harvests & Listings</option>
                <option value="shop">Orders & Requests</option>
                <option value="team">Farmers & Buyers</option>
                <option value="user">Accounts & Access</option>
                <option value="info">System Alerts</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-500">Time:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-xs font-semibold bg-[#fbf7ec] border border-line rounded-lg px-2.5 py-1.5 text-ink outline-none focus:border-[#84cc16] focus:outline focus:outline-2 focus:outline-[#84cc16]/25"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#0f3d25] hover:text-[#3f6212] underline underline-offset-2"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* ── Notifications List ── */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-line bg-[#efe7d6] shadow-soft p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#e8dfca] flex items-center justify-center mx-auto text-gray-400 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-ink">No notifications found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
              {isFiltered
                ? 'No notifications match your active filter criteria. Try resetting the filters.'
                : "You're all caught up! Harvest updates, order activity, and account alerts will appear here."}
            </p>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#d9f99d] px-4 py-2 text-sm font-medium text-[#0f3d25] transition-[transform,background-color,color] duration-150 hover:bg-[#c3f27f] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Notification Cards */
          filteredItems.map((n) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
            return (
              <div
                key={n.id}
                className={`group rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex items-start gap-4 shadow-soft hover:shadow-md ${
                  n.read ? 'border-line bg-[#efe7d6]' : 'border-[#d9f99d] bg-[#d9f99d]/20'
                }`}
              >
                {/* Category Icon Badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    config.badge || 'bg-[#e8dfca] text-gray-600 border-line'
                  }`}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                        config.badge || 'bg-[#e8dfca] text-gray-700 border-gray-200'
                      }`}
                    >
                      {config.label}
                    </span>

                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#4d7c0f] inline-block" title="Unread" />
                    )}

                    <span className="text-xs text-gray-400 ml-auto">
                      {notificationApi.timeAgo(n.time)}
                    </span>
                  </div>

                  <h3 className={`text-sm font-semibold ${!n.read ? 'text-ink' : 'text-ink/70'}`}>
                    {n.title}
                  </h3>

                  <p className="text-xs text-muted leading-relaxed">{n.message}</p>
                </div>

                {/* Row Quick Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => (n.read ? markUnread(n.id) : markRead(n.id))}
                    title={n.read ? 'Mark as unread' : 'Mark as read'}
                    className="rounded-full p-1.5 text-gray-400 transition-[transform,background-color,color] duration-150 hover:bg-page hover:text-[#3f6212] active:scale-[0.98]"
                  >
                    {n.read ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="6" strokeWidth="2" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => deleteItem(n.id)}
                    title="Delete notification"
                    className="rounded-full p-1.5 text-gray-400 transition-[transform,background-color,color] duration-150 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <ConfirmDeleteModal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={confirmClearAll}
        title="Clear all notifications?"
        message={`This will permanently delete all ${items.length} notification${items.length === 1 ? '' : 's'}, including read and unread. This can't be undone.`}
        confirmLabel="Clear all"
      />
    </div>
  )
}
