'use client'

import { useState, useTransition } from 'react'
import { updateUserRole, updateUserXp, deleteUser } from '@/app/admin-actions'
import { Role } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'

export default function UserDetailClient({
  user,
}: {
  user: { id: string; role: Role; totalXp: number }
}) {
  const [role, setRole] = useState<Role>(user.role)
  const [xp, setXp] = useState(String(user.totalXp))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSave = () => {
    startTransition(async () => {
      await updateUserRole(user.id, role)
      await updateUserXp(user.id, parseInt(xp) || 0)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteUser(user.id)
      router.push('/admin/users')
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Edit Panel */}
      <div className="p-6 rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]">
        <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-5">
          Edit Operator
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-1.5">
              Role
            </label>
            <select
              id="detail-role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-[var(--color-surface-3)] border border-[var(--color-surface-3)] focus:border-[var(--color-primary)] rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:outline-none transition-colors"
            >
              <option value="LEARNER">LEARNER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-1.5">
              Total XP
            </label>
            <input
              id="detail-xp-input"
              type="number"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              className="w-full bg-[var(--color-surface-3)] border border-[var(--color-surface-3)] focus:border-[var(--color-primary)] rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:outline-none transition-colors"
            />
          </div>

          <button
            id="detail-save-btn"
            onClick={handleSave}
            disabled={isPending}
            className="w-full py-2.5 bg-[var(--color-primary)] text-[#03050a] font-mono font-bold text-sm uppercase rounded-lg hover:bg-[var(--color-success)] transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-display font-bold text-red-400 uppercase tracking-wider">
            Danger Zone
          </h2>
        </div>
        <p className="text-xs font-mono text-[var(--color-text-quaternary)] mb-4">
          Permanently delete this operator and all their data. This cannot be undone.
        </p>
        {confirmDelete ? (
          <div className="flex gap-3">
            <button
              id="confirm-delete-btn"
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 py-2 bg-red-500 text-white font-mono text-xs font-bold uppercase rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2 bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] font-mono text-xs uppercase rounded-lg border border-[var(--color-surface-3)] hover:border-[var(--color-text-secondary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            id="delete-user-btn"
            onClick={() => setConfirmDelete(true)}
            className="w-full py-2 border border-red-500/30 text-red-400 font-mono text-xs uppercase rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Delete Operator
          </button>
        )}
      </div>
    </div>
  )
}
