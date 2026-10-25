/**
 * RolesPage — Super Admin roles & access (Soma Connect design port).
 * Status + created-date filters, actions row (edit / permissions / status /
 * delete), permission-count pill opening the ManagePermissionsModal.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import AddRoleModal from '../components/AddRoleModal'
import ManagePermissionsModal from '../components/ManagePermissionsModal'
import ConfirmDeleteModal from '../../../components/admin/ConfirmDeleteModal'
import { RowActionMenu, DockIcons } from '../../../components/admin/RowActions'
import { adminApi } from '../../../api/adminApi'
import { useToastContext } from '../../../context/ToastContext'

const resolveRoleStatus = (role) => (role.active === false ? 'Inactive' : 'Active')

const fieldClass =
  'h-11 w-full text-sm px-3.5 rounded-lg border border-line bg-white text-ink focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-500/25 transition-all duration-200'

const CalendarIcon = (
  <svg className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const RebootIcon = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 105.64-11.36L1 10" />
  </svg>
)

const ShieldIcon = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v6M9 11h6" />
  </svg>
)

export const RolesPage = () => {
  const { showToast } = useToastContext()

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)

  const [filterRoleStatus, setFilterRoleStatus] = useState('All')
  const [filterRoleDateFrom, setFilterRoleDateFrom] = useState('')
  const [filterRoleDateTo, setFilterRoleDateTo] = useState('')
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)

  const [permModalRole, setPermModalRole] = useState(null)
  const [allPermissions, setAllPermissions] = useState([])
  const [selectedPermIds, setSelectedPermIds] = useState(new Set())
  const [permSaving, setPermSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      if (filterRoleStatus !== 'All' && resolveRoleStatus(r) !== filterRoleStatus) return false
      if (filterRoleDateFrom || filterRoleDateTo) {
        const created = r.createdAt ? String(r.createdAt).slice(0, 10) : ''
        if (!created) return false
        if (filterRoleDateFrom && created < filterRoleDateFrom) return false
        if (filterRoleDateTo && created > filterRoleDateTo) return false
      }
      return true
    })
  }, [roles, filterRoleStatus, filterRoleDateFrom, filterRoleDateTo])

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getRoles()
      setRoles(Array.isArray(data) ? data : [])
    } catch (err) {
      showToast(err.message || 'Could not load roles', 'error')
      setRoles([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleAddOrUpdateRole = async (roleData) => {
    try {
      if (editingRole) {
        await adminApi.updateRole(editingRole.id, { name: roleData.name, description: roleData.description })
        showToast('Role updated', 'success')
      } else {
        await adminApi.createRole({ name: roleData.name, description: roleData.description })
        showToast('Role created', 'success')
      }
      await fetchRoles()
      setIsRoleModalOpen(false)
      setEditingRole(null)
    } catch (err) {
      showToast(err.message || 'Could not save role', 'error')
    }
  }

  const handleToggleStatus = async (role) => {
    try {
      await adminApi.setRoleStatus(role.id, role.active === false)
      await fetchRoles()
      showToast('Role status updated', 'success')
    } catch (err) {
      showToast(err.message || 'Could not update role status', 'error')
    }
  }

  const executeDelete = async () => {
    if (!confirmDelete) return
    setIsDeleting(true)
    try {
      await adminApi.deleteRole(confirmDelete.id)
      await fetchRoles()
      showToast('Role deleted', 'success')
      setConfirmDelete(null)
    } catch (err) {
      showToast(err.message || 'Could not delete role', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const openPermModal = async (role) => {
    setPermModalRole(role)
    try {
      const perms = await adminApi.getPermissions()
      setAllPermissions(Array.isArray(perms) ? perms : [])
      setSelectedPermIds(new Set((role.permissions || []).map((p) => p.id)))
    } catch (err) {
      showToast(err.message || 'Could not load permissions', 'error')
      setPermModalRole(null)
    }
  }

  const togglePerm = (permId) =>
    setSelectedPermIds((prev) => {
      const next = new Set(prev)
      if (next.has(permId)) next.delete(permId)
      else next.add(permId)
      return next
    })

  const toggleCategory = (perms, selectAll) =>
    setSelectedPermIds((prev) => {
      const next = new Set(prev)
      perms.forEach((p) => (selectAll ? next.add(p.id) : next.delete(p.id)))
      return next
    })

  const savePermissions = async () => {
    if (!permModalRole) return
    setPermSaving(true)
    try {
      await adminApi.assignRolePermissions(permModalRole.id, Array.from(selectedPermIds))
      await fetchRoles()
      showToast('Permissions updated', 'success')
      setPermModalRole(null)
    } catch (err) {
      showToast(err.message || 'Could not update permissions', 'error')
    } finally {
      setPermSaving(false)
    }
  }

  const statusStyle = (status) =>
    status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-page text-muted border border-line'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-brand-600">ACCESS CONTROL</span>
          <h1 className="text-2xl font-bold text-ink tracking-tight sm:text-3xl mt-1">Roles &amp; Access</h1>
          <p className="text-sm text-muted mt-1">Define roles and the permissions that govern platform access.</p>
        </div>
        <button
          onClick={() => {
            setEditingRole(null)
            setIsRoleModalOpen(true)
          }}
          className="bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-brand-800 transition-[transform,background-color,color] duration-150 active:scale-[0.98] inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {ShieldIcon}
          New Role
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-card shadow-soft p-4 w-fit max-w-full">
        <div className="flex flex-wrap items-end gap-3.5">
          <div className="w-[160px] flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Status</label>
            <select className={`${fieldClass} cursor-pointer`} value={filterRoleStatus} onChange={(e) => setFilterRoleStatus(e.target.value)}>
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="w-[180px] flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">From</label>
            <div className="relative">
              {CalendarIcon}
              <input
                type="date"
                aria-label="Created from"
                className={`${fieldClass} pl-10`}
                value={filterRoleDateFrom}
                onChange={(e) => setFilterRoleDateFrom(e.target.value)}
              />
            </div>
          </div>
          <div className="w-[180px] flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">To</label>
            <div className="relative">
              {CalendarIcon}
              <input
                type="date"
                aria-label="Created to"
                className={`${fieldClass} pl-10`}
                value={filterRoleDateTo}
                onChange={(e) => setFilterRoleDateTo(e.target.value)}
              />
            </div>
          </div>

          <span className="hidden sm:block w-px h-10 bg-line mx-0.5" />

          <button
            onClick={fetchRoles}
            className="shrink-0 inline-flex items-center justify-center h-10 px-5 rounded-full bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setFilterRoleStatus('All')
              setFilterRoleDateFrom('')
              setFilterRoleDateTo('')
            }}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-white text-ink border border-line text-sm font-medium hover:bg-page transition-[transform,background-color,color] duration-150 active:scale-[0.98]"
          >
            {RebootIcon}
            Reset
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-line shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-page border-b border-line text-xs font-semibold text-muted uppercase tracking-wide">
                <th className="px-4 py-2.5 pl-6 text-left">Actions</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Permissions</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 pr-6">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm text-ink">
              {filteredRoles.map((role) => {
                const status = resolveRoleStatus(role)
                return (
                  <tr key={role.id || role.key} className="hover:bg-brand-700/[0.05] transition-colors">
                    <td className="px-4 py-2.5 pl-6">
                      <RowActionMenu
                        primary={{
                          label: 'Edit',
                          icon: DockIcons.edit,
                          onClick: () => {
                            setEditingRole(role)
                            setIsRoleModalOpen(true)
                          },
                        }}
                        items={[
                          { label: 'Permissions', icon: DockIcons.shield, iconTone: 'text-ink/60', onClick: () => openPermModal(role) },
                          role.active === false
                            ? { label: 'Activate role', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => handleToggleStatus(role) }
                            : { label: 'Deactivate role', icon: DockIcons.power, onClick: () => handleToggleStatus(role) },
                          'divider',
                          { label: 'Delete role', icon: DockIcons.trash, danger: true, onClick: () => setConfirmDelete(role) },
                        ]}
                      />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-ink">{role.name}</td>
                    <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{role.description || '—'}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => openPermModal(role)}
                        title="Manage permissions"
                        className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition-[transform,background-color] duration-150 active:scale-[0.98]"
                      >
                        {role.permissions?.length ?? 0}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyle(status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 pr-6 text-gray-400">{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-sm text-gray-400">Loading roles…</div>}
          {!loading && filteredRoles.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              {roles.length === 0 ? 'No roles yet. Create one to get started.' : 'No roles match the current filters.'}
            </div>
          )}
        </div>
      </div>

      {isRoleModalOpen && (
        <AddRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false)
            setEditingRole(null)
          }}
          onSubmit={handleAddOrUpdateRole}
          editingRole={editingRole}
        />
      )}

      {permModalRole && (
        <ManagePermissionsModal
          role={permModalRole}
          permissions={allPermissions}
          selectedIds={selectedPermIds}
          onToggle={togglePerm}
          onToggleCategory={toggleCategory}
          onSave={savePermissions}
          saving={permSaving}
          onClose={() => setPermModalRole(null)}
        />
      )}

      <ConfirmDeleteModal
        open={confirmDelete !== null}
        title="Delete role"
        message="Are you sure you want to delete the role"
        itemName={confirmDelete?.name}
        isLoading={isDeleting}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
      />
    </div>
  )
}

export default RolesPage
