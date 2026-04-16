import { getUserById } from '@/app/admin-actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Zap, Flame, Trophy } from 'lucide-react'
import UserDetailClient from './UserDetailClient'

export const metadata = {
  title: 'User Detail | EASTDAWN Admin',
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUserById(id)
  if (!user) notFound()

  const TIER_COLORS: Record<string, string> = {
    BRONZE: '#CD7F32',
    SILVER: '#C0C0C0',
    GOLD: '#FFD700',
    DIAMOND: '#B9F2FF',
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-xs font-mono text-[var(--color-text-quaternary)] hover:text-[var(--color-primary)] transition-colors mb-8 uppercase"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Registry
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-8 border-b border-[var(--color-surface-3)]">
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono uppercase border mb-3"
            style={{
              color: user.role === 'ADMIN' ? 'var(--color-warning)' : 'var(--color-primary)',
              borderColor:
                user.role === 'ADMIN' ? 'rgba(255,160,64,0.3)' : 'rgba(0,200,255,0.3)',
              backgroundColor:
                user.role === 'ADMIN' ? 'rgba(255,160,64,0.1)' : 'rgba(0,200,255,0.1)',
            }}
          >
            <Shield className="w-3 h-3" />
            {user.role}
          </div>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">
            {user.name ?? 'Unknown Operator'}
          </h1>
          <p className="text-sm font-mono text-[var(--color-text-tertiary)] mt-1">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          {[
            { icon: Zap, val: user.totalXp.toLocaleString(), label: 'XP', color: 'var(--color-success)' },
            { icon: Flame, val: `${user.currentStreak}d`, label: 'Streak', color: 'var(--color-warning)' },
            { icon: Trophy, val: user.badges.length, label: 'Badges', color: '#FACC15' },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)] min-w-[80px]">
              <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
              <p className="font-display text-xl font-bold" style={{ color: s.color }}>
                {s.val}
              </p>
              <p className="text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Edit Panel */}
        <UserDetailClient user={{ id: user.id, role: user.role, totalXp: user.totalXp }} />

        {/* Badges */}
        <div className="p-6 rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]">
          <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-4">
            Badges Earned
          </h2>
          {user.badges.length === 0 ? (
            <p className="text-xs font-mono text-[var(--color-text-quaternary)]">No badges yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {user.badges.map(({ badge, awardedAt }) => (
                <div
                  key={badge.id}
                  className="p-3 rounded-lg border bg-[var(--color-surface-2)]"
                  style={{ borderColor: `${TIER_COLORS[badge.tier] ?? '#fff'}30` }}
                >
                  <p className="text-xs font-mono font-bold" style={{ color: TIER_COLORS[badge.tier] ?? '#fff' }}>
                    {badge.tier}
                  </p>
                  <p className="text-sm text-white font-mono mt-0.5">{badge.name}</p>
                  <p className="text-[10px] text-[var(--color-text-quaternary)] mt-1">
                    {new Date(awardedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Courses */}
        <div className="p-6 rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)] lg:col-span-2">
          <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-4">
            Generated Courses ({user.courses.length})
          </h2>
          {user.courses.length === 0 ? (
            <p className="text-xs font-mono text-[var(--color-text-quaternary)]">No courses yet.</p>
          ) : (
            <div className="space-y-3">
              {user.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-surface-3)] bg-[var(--color-surface-2)]"
                >
                  <div>
                    <p className="text-sm font-mono text-white">{course.title}</p>
                    <p className="text-[10px] font-mono text-[var(--color-text-quaternary)] mt-0.5">
                      {course.domain} · {course.level}
                    </p>
                  </div>
                  <p className="text-[10px] font-mono text-[var(--color-text-quaternary)]">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
