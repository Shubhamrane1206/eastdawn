'use client'

import { useState, useTransition } from 'react'
import { awardBadgeToUser, createBadge, deleteBadge } from '@/app/admin-actions'
import { Trophy, Gift, Users, Plus, Trash2, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Role } from '@prisma/client'

type Badge = {
  id: string
  name: string
  description: string
  tier: string
  imageUrl?: string | null
  _count: { users: number }
}

type User = {
  id: string
  name: string | null
  email: string | null
  role: Role
  totalXp: number
  currentStreak: number
  createdAt: Date
  _count: { badges: number; courses: number }
}

const TIER_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  BRONZE: { color: '#CD7F32', bg: 'rgba(205,127,50,0.08)', border: 'rgba(205,127,50,0.25)' },
  SILVER: { color: '#C0C0C0', bg: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.25)' },
  GOLD: { color: '#FFD700', bg: 'rgba(255,215,0,0.08)', border: 'rgba(255,215,0,0.25)' },
  DIAMOND: { color: '#B9F2FF', bg: 'rgba(185,242,255,0.08)', border: 'rgba(185,242,255,0.25)' },
}

export default function BadgesClient({ badges: initialBadges, users }: { badges: Badge[]; users: User[] }) {
  const [badges, setBadges] = useState(initialBadges)
  const [awardModal, setAwardModal] = useState<Badge | null>(null)
  const [createModal, setCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Create form state
  const [createForm, setCreateForm] = useState({ name: '', description: '', tier: 'BRONZE', imageUrl: '' })

  const filteredUsers = users.filter(
    (u) =>
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  )

  const handleAward = () => {
    if (!awardModal || !selectedUser) return
    startTransition(async () => {
      await awardBadgeToUser(selectedUser, awardModal.id)
      setSuccessMsg('Badge awarded successfully!')
      setTimeout(() => {
        setAwardModal(null)
        setSelectedUser('')
        setUserSearch('')
        setSuccessMsg('')
      }, 1500)
    })
  }

  const handleCreate = () => {
    const fd = new FormData()
    fd.append('name', createForm.name)
    fd.append('description', createForm.description)
    fd.append('tier', createForm.tier)
    fd.append('imageUrl', createForm.imageUrl)
    startTransition(async () => {
      const result = await createBadge(fd)
      if (result?.error) {
        setErrorMsg(result.error)
      } else {
        setSuccessMsg('Badge created!')
        setCreateModal(false)
        setCreateForm({ name: '', description: '', tier: 'BRONZE', imageUrl: '' })
        setTimeout(() => setSuccessMsg(''), 2000)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteBadge(id)
      setBadges(prev => prev.filter(b => b.id !== id))
      setConfirmDelete(null)
    })
  }

  return (
    <>
      {/* Global Messages */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-sm shadow-lg">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Header with Create button */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-mono text-[var(--color-text-quaternary)]">{badges.length} badges in system</p>
        <button
          onClick={() => { setCreateModal(true); setErrorMsg('') }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[#03050a] font-mono font-bold text-xs uppercase rounded-lg hover:bg-[var(--color-success)] transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Badge
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {badges.map((badge) => {
          const style = TIER_STYLES[badge.tier] ?? TIER_STYLES.BRONZE
          return (
            <div
              key={badge.id}
              className="group relative p-5 rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg"
              style={{ borderColor: style.border, backgroundColor: style.bg }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${style.color}20`, border: `1px solid ${style.border}` }}
                >
                  <Trophy className="w-5 h-5" style={{ color: style.color }} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-text-quaternary)]">
                    <Users className="w-3 h-3" />
                    {badge._count.users}
                  </div>
                  {confirmDelete === badge.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(badge.id)} disabled={isPending} className="text-[9px] font-mono text-red-400 hover:underline uppercase">Confirm</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-[9px] font-mono text-[var(--color-text-quaternary)] hover:underline uppercase">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(badge.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-[var(--color-text-quaternary)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: style.color }}>
                {badge.tier}
              </p>
              <p className="font-mono text-sm text-white font-bold">{badge.name}</p>
              <p className="text-[11px] text-[var(--color-text-quaternary)] mt-1 leading-relaxed">
                {badge.description}
              </p>

              <button
                onClick={() => { setAwardModal(badge); setSelectedUser(''); setUserSearch('') }}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono uppercase border transition-all duration-200 hover:opacity-100 opacity-60 group-hover:opacity-100"
                style={{ borderColor: style.border, color: style.color }}
              >
                <Gift className="w-3 h-3" /> Award to Operator
              </button>
            </div>
          )
        })}
      </div>

      {/* Create Badge Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-[var(--color-primary)]" />
                <p className="font-display text-sm font-bold text-white uppercase">Create New Badge</p>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-[var(--color-text-quaternary)] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-1.5">Badge Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Recon Master"
                  className="w-full bg-[var(--color-surface-3)] border border-[var(--color-surface-3)] focus:border-[var(--color-primary)] rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-[var(--color-text-quaternary)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Award criteria..."
                  rows={2}
                  className="w-full bg-[var(--color-surface-3)] border border-[var(--color-surface-3)] focus:border-[var(--color-primary)] rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-[var(--color-text-quaternary)] focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-1.5">Tier</label>
                <select
                  value={createForm.tier}
                  onChange={e => setCreateForm(f => ({ ...f, tier: e.target.value }))}
                  className="w-full bg-[var(--color-surface-3)] border border-[var(--color-surface-3)] focus:border-[var(--color-primary)] rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:outline-none transition-colors"
                >
                  {['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-1.5">Image URL (Optional)</label>
                <input
                  type="text"
                  value={createForm.imageUrl}
                  onChange={e => setCreateForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-[var(--color-surface-3)] border border-[var(--color-surface-3)] focus:border-[var(--color-primary)] rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-[var(--color-text-quaternary)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={!createForm.name || !createForm.description || isPending}
                className="flex-1 py-2.5 bg-[var(--color-primary)] text-[#03050a] font-mono font-bold text-sm uppercase rounded-lg hover:bg-[var(--color-success)] transition-colors disabled:opacity-40"
              >
                {isPending ? 'Creating...' : 'Create Badge'}
              </button>
              <button
                onClick={() => setCreateModal(false)}
                className="flex-1 py-2.5 border border-[var(--color-surface-3)] text-[var(--color-text-secondary)] font-mono text-sm uppercase rounded-lg hover:border-[var(--color-text-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Award Modal */}
      {awardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-xs font-mono text-[var(--color-text-quaternary)] uppercase">Awarding</p>
                  <p className="font-display text-sm font-bold text-white uppercase">{awardModal.name}</p>
                </div>
              </div>
              <button onClick={() => setAwardModal(null)} className="text-[var(--color-text-quaternary)] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <p className="text-center font-mono text-[var(--color-success)] py-6">{successMsg}</p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-1.5">
                    Search Operator
                  </label>
                  <input
                    type="text"
                    placeholder="Name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-[var(--color-surface-3)] border border-[var(--color-surface-3)] focus:border-[var(--color-primary)] rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-[var(--color-text-quaternary)] focus:outline-none transition-colors"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 mb-5">
                  {filteredUsers.slice(0, 10).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border font-mono text-sm transition-all duration-150 ${
                        selectedUser === u.id
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-white'
                          : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40'
                      }`}
                    >
                      <p className="text-xs">{u.name ?? 'Unnamed'}</p>
                      <p className="text-[10px] text-[var(--color-text-quaternary)]">{u.email}</p>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-xs font-mono text-[var(--color-text-quaternary)] text-center py-4">
                      No operators found.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAward}
                    disabled={!selectedUser || isPending}
                    className="flex-1 py-2.5 bg-[var(--color-primary)] text-[#03050a] font-mono font-bold text-sm uppercase rounded-lg hover:bg-[var(--color-success)] transition-colors disabled:opacity-40"
                  >
                    {isPending ? 'Awarding...' : 'Award Badge'}
                  </button>
                  <button
                    onClick={() => setAwardModal(null)}
                    className="flex-1 py-2.5 border border-[var(--color-surface-3)] text-[var(--color-text-secondary)] font-mono text-sm uppercase rounded-lg hover:border-[var(--color-text-secondary)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
