'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, Trash2, ShieldCheck, Zap } from 'lucide-react'
import { deleteUser, updateUserRole, updateUserXp } from '@/app/admin-actions'
import { Role } from '@prisma/client'

type UserWithCounts = {
  id: string
  name: string | null
  email: string | null
  role: Role
  totalXp: number
  currentStreak: number
  createdAt: Date
  _count: { badges: number; courses: number }
}

const ROLE_COLORS: Record<Role, string> = {
  LEARNER: 'var(--color-primary)',
  ADMIN: 'var(--color-warning)',
  ENTERPRISE: 'var(--color-secondary)',
}

export default function UsersTable({ initialUsers }: { initialUsers: UserWithCounts[] }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL')
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [editingXp, setEditingXp] = useState<{ id: string; val: string } | null>(null)

  const filtered = initialUsers.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const handleRoleChange = (id: string, role: Role) => {
    startTransition(() => updateUserRole(id, role))
  }

  const handleDeleteConfirm = (id: string) => {
    startTransition(async () => {
      await deleteUser(id)
      setConfirmDelete(null)
    })
  }

  const handleXpSave = (id: string) => {
    if (!editingXp || editingXp.id !== id) return
    const val = parseInt(editingXp.val)
    if (isNaN(val)) return
    startTransition(async () => {
      await updateUserXp(id, val)
      setEditingXp(null)
    })
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-quaternary)]" />
          <input
            id="user-search"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] focus:border-[var(--color-primary)] rounded-lg text-sm font-mono text-white placeholder-[var(--color-text-quaternary)] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'LEARNER', 'ADMIN', 'ENTERPRISE'] as const).map((r) => (
            <button
              key={r}
              id={`filter-${r}`}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition-colors border ${
                roleFilter === r
                  ? 'bg-[var(--color-primary)] text-[#03050a] border-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-surface-3)] hover:border-[var(--color-primary)]/40'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-surface-3)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-surface-3)]">
                {['Operator', 'Role', 'XP', 'Streak', 'Badges', 'Courses', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 font-mono text-[var(--color-text-quaternary)]">
                    No operators found.
                  </td>
                </tr>
              )}
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-[var(--color-surface-3)] last:border-none transition-colors hover:bg-[var(--color-surface-2)]/50 ${
                    i % 2 === 0 ? 'bg-[var(--color-surface-1)]' : 'bg-[var(--color-surface-1)]/50'
                  }`}
                >
                  {/* Operator */}
                  <td className="px-5 py-4">
                    <p className="font-mono text-white text-sm">{user.name ?? '—'}</p>
                    <p className="font-mono text-[10px] text-[var(--color-text-quaternary)] mt-0.5">{user.email}</p>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4">
                    <select
                      id={`role-${user.id}`}
                      value={user.role}
                      disabled={isPending}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      className="bg-[var(--color-surface-3)] border border-[var(--color-surface-3)] rounded px-2 py-1 text-xs font-mono cursor-pointer focus:outline-none"
                      style={{ color: ROLE_COLORS[user.role] }}
                    >
                      <option value="LEARNER">LEARNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </td>

                  {/* XP */}
                  <td className="px-5 py-4">
                    {editingXp?.id === user.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          id={`xp-input-${user.id}`}
                          type="number"
                          value={editingXp.val}
                          onChange={(e) => setEditingXp({ id: user.id, val: e.target.value })}
                          className="w-20 bg-[var(--color-surface-3)] border border-[var(--color-primary)] rounded px-2 py-1 text-xs font-mono text-white focus:outline-none"
                        />
                        <button
                          id={`xp-save-${user.id}`}
                          onClick={() => handleXpSave(user.id)}
                          disabled={isPending}
                          className="text-[8px] font-mono text-[var(--color-success)] hover:underline uppercase"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingXp(null)}
                          className="text-[8px] font-mono text-[var(--color-text-quaternary)] hover:underline uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`xp-edit-${user.id}`}
                        onClick={() => setEditingXp({ id: user.id, val: String(user.totalXp) })}
                        className="flex items-center gap-1.5 text-sm font-mono text-[var(--color-success)] hover:underline"
                      >
                        <Zap className="w-3 h-3" />
                        {user.totalXp.toLocaleString()}
                      </button>
                    )}
                  </td>

                  {/* Streak */}
                  <td className="px-5 py-4 font-mono text-[var(--color-warning)] text-sm">
                    🔥 {user.currentStreak}d
                  </td>

                  {/* Badges */}
                  <td className="px-5 py-4 font-mono text-yellow-400 text-sm">
                    {user._count.badges}
                  </td>

                  {/* Courses */}
                  <td className="px-5 py-4 font-mono text-[var(--color-secondary)] text-sm">
                    {user._count.courses}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        id={`view-user-${user.id}`}
                        className="p-1.5 rounded hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                        title="View Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      {confirmDelete === user.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            id={`delete-confirm-${user.id}`}
                            onClick={() => handleDeleteConfirm(user.id)}
                            disabled={isPending}
                            className="text-[10px] font-mono text-red-400 hover:underline uppercase"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-[10px] font-mono text-[var(--color-text-quaternary)] hover:underline uppercase"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`delete-user-${user.id}`}
                          onClick={() => setConfirmDelete(user.id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-[var(--color-text-quaternary)] hover:text-red-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
