'use client'

import { useState, useTransition } from 'react'
import { awardBadgeToUser } from '@/app/admin-actions'
import { Trophy, Gift, Users } from 'lucide-react'
import { Role } from '@prisma/client'

type Badge = {
  id: string
  name: string
  description: string
  tier: string
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

export default function BadgesClient({ badges, users }: { badges: Badge[]; users: User[] }) {
  const [awardModal, setAwardModal] = useState<Badge | null>(null)
  const [selectedUser, setSelectedUser] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [successMsg, setSuccessMsg] = useState('')

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
      setSuccessMsg(`Badge awarded successfully!`)
      setTimeout(() => {
        setAwardModal(null)
        setSelectedUser('')
        setUserSearch('')
        setSuccessMsg('')
      }, 1500)
    })
  }

  return (
    <>
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
                <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-text-quaternary)]">
                  <Users className="w-3 h-3" />
                  {badge._count.users}
                </div>
              </div>

              <p
                className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1"
                style={{ color: style.color }}
              >
                {badge.tier}
              </p>
              <p className="font-mono text-sm text-white font-bold">{badge.name}</p>
              <p className="text-[11px] text-[var(--color-text-quaternary)] mt-1 leading-relaxed">
                {badge.description}
              </p>

              <button
                id={`award-badge-${badge.id}`}
                onClick={() => { setAwardModal(badge); setSelectedUser(''); setUserSearch('') }}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono uppercase border transition-all duration-200 hover:opacity-100 opacity-60 group-hover:opacity-100"
                style={{ borderColor: style.border, color: style.color }}
              >
                <Gift className="w-3 h-3" />
                Award to Operator
              </button>
            </div>
          )
        })}
      </div>

      {/* Award Modal */}
      {awardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-xs font-mono text-[var(--color-text-quaternary)] uppercase">Awarding</p>
                <p className="font-display text-sm font-bold text-white uppercase">{awardModal.name}</p>
              </div>
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
                    id="badge-user-search"
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
                      id={`select-user-${u.id}`}
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
                    id="award-confirm-btn"
                    onClick={handleAward}
                    disabled={!selectedUser || isPending}
                    className="flex-1 py-2.5 bg-[var(--color-primary)] text-[#03050a] font-mono font-bold text-sm uppercase rounded-lg hover:bg-[var(--color-success)] transition-colors disabled:opacity-40"
                  >
                    {isPending ? 'Awarding...' : 'Award Badge'}
                  </button>
                  <button
                    id="award-cancel-btn"
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
