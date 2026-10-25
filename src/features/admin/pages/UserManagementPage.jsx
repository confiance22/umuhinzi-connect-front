/**
 * UserManagementPage — Super Admin user management (Soma Connect design port).
 * Search / role / status filters, sortable DataTable, add/edit/delete/lock,
 * and enable/disable account actions.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Table } from '../../../components/common/Table'
import { RowActionMenu, DockIcons } from '../../../components/admin/RowActions'
import ConfirmDeleteModal from '../../../components/admin/ConfirmDeleteModal'
import AddUserModal from '../components/AddUserModal'
import { adminApi } from '../../../api/adminApi'
import { useAuth } from '../../../hooks/useAuth'
import { useToastContext } from '../../../context/ToastContext'

const AVATAR_STYLES = [
  'bg-brand-700/20 text-brand-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-ink/[0.06] text-ink/70',
  'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-teal-100 text-teal-700',
]
const initialsOf = (name) =>
  (name || '?')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
const avatarStyle = (seed) => {
  let h = 0
  const s = seed || '?'
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return AVATAR_STYLES[h % AVATAR_STYLES.length]
}

const STATUS_STYLES = {
  Active: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Inactive: { pill: 'bg-page text-muted', dot: 'bg-muted' },
  Locked: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
}
const StatusPill = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Inactive
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}

const resolveUserStatus = (user) => {
  if (user.accountNonLocked === false) return 'Locked'
  return user.enabled === false ? 'Inactive' : 'Active'
}

const TEMP_PASSWORD = 'TempPass@1'

const filterFieldClass =
  'h-11 w-full text-sm px-3.5 rounded-lg border border-line bg-white text-ink placeholder:text-muted/55 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all duration-200'

const RebootIcon = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 105.64-11.36L1 10" />
  </svg>
)

const SearchIcon = (
  <svg className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
  </svg>
)

export const UserManagementPage = () => {
  const { showToast } = useToastContext()
  const { user: currentUser } = useAuth()

  const isSelf = (u) => !!currentUser && (String(u.id) === String(currentUser.id) || (!!currentUser.username && u.username === currentUser.username))

  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newUserCreds, setNewUserCreds] = useState(null)

  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      showToast(err.message || 'Could not load users', 'error')
      setError(err.message || 'Could not load users')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const fetchRoles = useCallback(async () => {
    try {
      const data = await adminApi.getRoles()
      setRoles(Array.isArray(data) ? data : [])
    } catch {
      setRoles([])
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [fetchUsers, fetchRoles])

  const getUserRoleName = useCallback(
    (u) => {
      if (Array.isArray(u.roles) && u.roles.length > 0) return u.roles.map((r) => r?.name || r).join(', ')
      if (typeof u.roles === 'string' && u.roles) return u.roles
      if (u.role && typeof u.role === 'object') return u.role.name || 'None'
      if (u.roleId != null) {
        const m = roles.find((r) => String(r.id) === String(u.roleId))
        return m ? m.name : 'None'
      }
      if (u.role) {
        const m = roles.find((r) => r.key === u.role || r.name === u.role)
        return m ? m.name : u.role
      }
      return 'None'
    },
    [roles]
  )

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (q) {
        const hit =
          (u.name || '').toLowerCase().includes(q) ||
          (u.username || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q)
        if (!hit) return false
      }
      if (filterRole !== 'All' && getUserRoleName(u) !== filterRole) return false
      if (filterStatus !== 'All' && resolveUserStatus(u) !== filterStatus) return false
      return true
    })
  }, [users, search, filterRole, filterStatus, getUserRoleName])

  const resetFilters = () => {
    setSearch('')
    setFilterRole('All')
    setFilterStatus('All')
  }

  const handleSaveUser = async (userData) => {
    const roleIds = Array.isArray(userData.roleIds) ? userData.roleIds.filter(Boolean) : userData.roleId ? [userData.roleId] : []
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, {
          name: userData.name,
          username: userData.username,
          email: userData.email,
          enabled: userData.status !== 'Inactive',
          roleIds,
        })
        showToast('User updated', 'success')
      } else {
        await adminApi.createUser({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          password: TEMP_PASSWORD,
          roleIds,
        })
        setNewUserCreds({ name: userData.name, username: userData.username, email: userData.email, password: TEMP_PASSWORD })
      }
      await fetchUsers()
      setIsUserModalOpen(false)
      setEditingUser(null)
    } catch (err) {
      showToast(err.message || 'Could not save user', 'error')
    }
  }

  const copyCredential = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Copied to clipboard', 'success')
    } catch {
      showToast('Could not copy', 'error')
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      await adminApi.setUserStatus(user.id, user.enabled === false)
      await fetchUsers()
      showToast('User status updated', 'success')
    } catch (err) {
      showToast(err.message || 'Could not update status', 'error')
    }
  }

  const handleLock = async (user) => {
    try {
      await adminApi.lockUser(user.id)
      await fetchUsers()
      showToast('Account locked', 'success')
    } catch (err) {
      showToast(err.message || 'Could not lock account', 'error')
    }
  }

  const handleUnlock = async (user) => {
    try {
      await adminApi.unlockUser(user.id)
      await fetchUsers()
      showToast('Account unlocked', 'success')
    } catch (err) {
      showToast(err.message || 'Could not unlock account', 'error')
    }
  }

  const handleDelete = (user) => setDeleteTarget(user)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await adminApi.deleteUser(deleteTarget.id)
      await fetchUsers()
      showToast('User deleted', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err.message || 'Could not delete user', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortValue: (u) => u.name || u.username || '',
      render: (u) => {
        const label = u.name || u.username || '?'
        return (
          <div className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${avatarStyle(label)}`}>
              {initialsOf(label)}
            </span>
            <span className="text-sm font-medium text-ink whitespace-nowrap">{u.name || '—'}</span>
            {isSelf(u) && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[9px] font-bold uppercase tracking-wide shrink-0">You</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'username',
      header: 'Username',
      sortable: true,
      sortValue: (u) => u.username || '',
      render: (u) => <span className="text-sm text-muted">{u.username || '—'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      sortValue: (u) => u.email || '',
      render: (u) => <span className="text-sm text-muted">{u.email || '—'}</span>,
    },
    {
      key: 'roles',
      header: 'Roles',
      sortable: true,
      sortValue: getUserRoleName,
      render: (u) => {
        const list = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : null
        if (!list) return <span className="text-xs text-gray-300">—</span>
        return (
          <div className="flex flex-wrap gap-1.5">
            {list.map((r) => {
              const name = r?.name || String(r)
              return (
                <span
                  key={r?.id || name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-page text-ink border border-line"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-700 ring-1 ring-line shrink-0" />
                  {name}
                </span>
              )
            })}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: resolveUserStatus,
      render: (u) => <StatusPill status={resolveUserStatus(u)} />,
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sortable: true,
      sortValue: (u) => (u.createdAt ? new Date(u.createdAt).getTime() : 0),
      render: (u) => <span className="text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '132px',
      render: (u) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{ label: 'Edit', icon: DockIcons.edit, onClick: () => { setEditingUser(u); setIsUserModalOpen(true) } }}
            items={
              isSelf(u)
                ? []
                : [
                    u.accountNonLocked !== false
                      ? { label: 'Lock account', icon: DockIcons.lock, iconTone: 'text-amber-500', onClick: () => handleLock(u) }
                      : { label: 'Unlock account', icon: DockIcons.unlock, iconTone: 'text-amber-500', onClick: () => handleUnlock(u) },
                    u.enabled === false
                      ? { label: 'Enable user', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => handleToggleStatus(u) }
                      : { label: 'Disable user', icon: DockIcons.power, onClick: () => handleToggleStatus(u) },
                    'divider',
                    { label: 'Delete user', icon: DockIcons.trash, danger: true, onClick: () => handleDelete(u) },
                  ]
            }
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-brand-600">USER MANAGEMENT</span>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-1">User Management</h1>
          <p className="text-sm text-muted mt-1">Manage platform accounts and their assigned roles.</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null)
            setIsUserModalOpen(true)
          }}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 transition-[transform,background-color,color] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
        >
          New User
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-card shadow-soft px-4 py-3.5 flex flex-wrap items-end gap-x-3 gap-y-2.5">
        <div className="w-[260px] flex flex-col gap-1">
          <label className="text-sm font-medium text-ink">Search</label>
          <div className="relative">
            {SearchIcon}
            <input
              type="text"
              placeholder="Name, username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${filterFieldClass} pl-10`}
            />
          </div>
        </div>
        <div className="w-[140px] flex flex-col gap-1">
          <label className="text-sm font-medium text-ink">Role</label>
          <select className={`${filterFieldClass} cursor-pointer`} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="All">All</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="w-[140px] flex flex-col gap-1">
          <label className="text-sm font-medium text-ink">Status</label>
          <select className={`${filterFieldClass} cursor-pointer`} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Locked">Locked</option>
          </select>
        </div>
        <div className="flex-1" />
        <button
          onClick={resetFilters}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-white text-ink border border-line hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
        >
          {RebootIcon}
          Reset
        </button>
      </div>

      <Table
        columns={columns}
        rows={filteredUsers}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={1020}
        skeletonRows={10}
        pageSize={10}
        rowLabel="users"
        emptyTitle={users.length === 0 ? 'No users yet' : 'No matches'}
        emptyMessage={users.length === 0 ? 'Create your first user to get started.' : 'No users match the current filters.'}
      />

      {isUserModalOpen && (
        <AddUserModal
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false)
            setEditingUser(null)
          }}
          onSubmit={handleSaveUser}
          editingUser={editingUser}
          roles={roles}
        />
      )}

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete user"
        message="Are you sure you want to delete"
        itemName={deleteTarget?.name || deleteTarget?.username || ''}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {newUserCreds && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/40 backdrop-blur-sm p-4"
          onClick={() => setNewUserCreds(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-[#192540]/[0.08]">
              <div className="flex items-center gap-2 text-emerald-600 text-[10.5px] font-bold uppercase tracking-[0.18em]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                User created
              </div>
              <h2 className="text-[19px] font-medium tracking-tight mt-1.5 text-[#0A0A0A]">Share these credentials</h2>
              <p className="text-[12.5px] text-gray-500 mt-1">
                Give the login details below to <span className="font-semibold text-[#0A0A0A]">{newUserCreds.name}</span>. They must change the password after their first sign-in.
              </p>
            </div>

            <div className="p-6 space-y-3">
              {[
                { label: 'Email', value: newUserCreds.email },
                { label: 'Password', value: newUserCreds.password, mono: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 rounded-xl border border-[#192540]/[0.08] bg-[#192540]/[0.02] px-3.5 py-2.5">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold text-[#192540]/40 uppercase tracking-[0.14em]">{row.label}</div>
                    <div className={`text-[13px] font-medium text-[#0A0A0A] truncate ${row.mono ? 'font-mono' : ''}`}>{row.value}</div>
                  </div>
                  <button
                    onClick={() => copyCredential(row.value)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 bg-brand-700/[0.08] hover:bg-brand-700/15 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy
                  </button>
                </div>
              ))}

              <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200/70 px-3.5 py-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-[12px] text-amber-800 leading-relaxed">
                  This temporary password is not shown again. Pass it to the user now, before closing this window.
                </p>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setNewUserCreds(null)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-black transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagementPage
