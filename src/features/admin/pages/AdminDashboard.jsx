/**
 * AdminDashboard — Umuhinzi Connect platform overview for super admins.
 */
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../../api/adminApi'
import { useToastContext } from '../../../context/ToastContext'
import { ROUTE_PATHS } from '../../../constants/routePaths'

const EMPTY_STATS = {
  totalUsers: 0,
  totalFarmers: 0,
  totalBuyers: 0,
  totalSuperAdmins: 0,
  activeUsers: 0,
  lockedUsers: 0,
  totalRoles: 0,
  totalPermissions: 0,
}

const roleKeyOf = (user) => {
  if (user?.role) return user.role
  const first = Array.isArray(user?.roles) ? user.roles[0] : null
  return typeof first === 'string' ? first : first?.key || ''
}

const timeAgo = (isoDate) => {
  if (!isoDate) return ''
  const then = new Date(isoDate).getTime()
  if (Number.isNaN(then)) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs)
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState(EMPTY_STATS)
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToastContext()
  const toastRef = useRef(showToast)
  toastRef.current = showToast

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      const [usersRes, rolesRes, permsRes] = await Promise.allSettled([
        adminApi.getUsers(),
        adminApi.getRoles(),
        adminApi.getPermissions(),
      ])
      if (cancelled) return

      const users = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : []
      const roles = rolesRes.status === 'fulfilled' && Array.isArray(rolesRes.value) ? rolesRes.value : []
      const permissions = permsRes.status === 'fulfilled' && Array.isArray(permsRes.value) ? permsRes.value : []
      const countRole = (key) => users.filter((user) => roleKeyOf(user) === key).length

      setStats({
        totalUsers: users.length,
        totalFarmers: countRole('farmer'),
        totalBuyers: countRole('buyer'),
        totalSuperAdmins: countRole('super_admin'),
        activeUsers: users.filter((u) => u.enabled !== false && u.accountNonLocked !== false).length,
        lockedUsers: users.filter((u) => u.accountNonLocked === false).length,
        totalRoles: roles.length,
        totalPermissions: permissions.length,
      })

      const activity = [...users]
        .filter((u) => u.createdAt || u.created_at)
        .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
        .slice(0, 6)
        .map((u) => ({
          id: u.id,
          type: 'User',
          action: `New account created — ${u.name || u.phone || u.email}`,
          time: timeAgo(u.createdAt || u.created_at),
        }))
      setRecentActivity(activity)

      if (usersRes.status === 'rejected') {
        toastRef.current('Could not load dashboard metrics', 'error')
      }
      setIsLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const kpiCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      sub: `${stats.activeUsers} active · ${stats.lockedUsers} locked`,
      accent: true,
      icon: 'M17 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
    {
      label: 'Farmers',
      value: stats.totalFarmers,
      sub: 'Harvest sellers',
      icon: 'M12 22V8M5 12l7-7 7 7M5 22h14M8 22v-6h8v6',
    },
    {
      label: 'Buyers',
      value: stats.totalBuyers,
      sub: 'Marketplace buyers',
      icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
    },
    {
      label: 'Roles Configured',
      value: stats.totalRoles,
      sub: `${stats.totalPermissions} permissions`,
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
    },
  ]

  const quickLinks = [
    { label: 'Manage Users', desc: 'Review accounts and access status', to: ROUTE_PATHS.ADMIN_USERS, icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { label: 'Manage Roles', desc: 'Configure farmer and buyer access', to: ROUTE_PATHS.ADMIN_ROLES, icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { label: 'Permissions', desc: 'Review the platform permission catalog', to: ROUTE_PATHS.ADMIN_PERMISSIONS, icon: 'M15.5 7.5 21 2M18 5l-3 3M11 11a4 4 0 1 1-5.66 5.66A4 4 0 0 1 11 11z' },
    { label: 'My Account', desc: 'Update profile and password', to: ROUTE_PATHS.ADMIN_ACCOUNT, icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ]

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200/70 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-200/70 rounded-2xl" />
          <div className="h-80 bg-gray-200/70 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
            Platform Oversight
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-3">Platform Overview</h1>
          <p className="text-sm text-muted mt-1">Account health and access across Umuhinzi Connect.</p>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold bg-brand-600 text-white rounded-full px-4 py-2.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
          <span className="uppercase tracking-wide text-[11px]">System Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
              card.accent ? 'bg-ink border-ink' : 'bg-[#f6f1e6] border-line shadow-soft'
            }`}
          >
            <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.accent ? 'bg-brand-600 text-white' : 'bg-[#f6f1e6] text-ink'}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={card.icon} />
              </svg>
            </span>
            <p className={`text-3xl font-bold tracking-tight tabular-nums mt-4 ${card.accent ? 'text-white' : 'text-ink'}`}>{card.value}</p>
            <p className={`text-sm font-medium mt-0.5 ${card.accent ? 'text-white/80' : 'text-muted'}`}>{card.label}</p>
            <p className={`text-xs mt-2 ${card.accent ? 'text-white/50' : 'text-muted'}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#f6f1e6] border border-line rounded-2xl shadow-soft">
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <h3 className="text-sm font-semibold text-ink">Recent Accounts</h3>
            <Link to={ROUTE_PATHS.ADMIN_USERS} className="text-xs font-medium text-gray-400 hover:text-ink transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-line">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-14 text-center text-sm text-gray-400">No accounts recorded yet.</div>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#f6f1e6]/60 transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{act.action}</p>
                    <p className="text-xs text-gray-400">{act.time}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-[#f6f1e6] px-2 py-1 rounded-full shrink-0">{act.type}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-[#f6f1e6] border border-line rounded-2xl shadow-soft p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Quick Actions</h3>
            <div className="space-y-1.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-[#f6f1e6] transition-colors"
                >
                  <span className="w-10 h-10 rounded-xl bg-[#f6f1e6] group-hover:bg-brand-600 text-ink group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={link.icon} />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{link.label}</p>
                    <p className="text-xs text-gray-400 truncate">{link.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-ink ml-auto transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-brand-600 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Access control</p>
            <p className="text-xl font-bold text-white mt-2 leading-snug">
              {stats.totalPermissions} permissions across {stats.totalRoles} roles
            </p>
            <Link
              to={ROUTE_PATHS.ADMIN_ROLES}
              className="inline-flex items-center justify-center gap-2 mt-5 bg-ink text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-ink-soft transition-[transform,background-color,color,gap] duration-150 hover:gap-2.5 active:scale-[0.98]"
            >
              Review access
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
