import { getPlatformStats } from '@/app/admin-actions'
import { Users, BookOpen, Trophy, Zap, Flame } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Admin Overview | EASTDAWN',
}

export default async function AdminOverviewPage() {
  const stats = await getPlatformStats()

  const cards = [
    {
      label: 'Total Operators',
      value: stats.totalUsers,
      icon: Users,
      color: 'var(--color-primary)',
      href: '/admin/users',
    },
    {
      label: 'Courses Generated',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'var(--color-secondary)',
      href: '/admin/courses',
    },
    {
      label: 'Badges Awarded',
      value: stats.totalBadgesAwarded,
      icon: Trophy,
      color: '#FACC15',
      href: '/admin/badges',
    },
    {
      label: 'Total XP Earned',
      value: stats.totalXp.toLocaleString(),
      icon: Zap,
      color: 'var(--color-success)',
      href: '/admin/users',
    },
    {
      label: 'Active Streaks',
      value: stats.usersOnStreak,
      icon: Flame,
      color: 'var(--color-warning)',
      href: '/admin/users',
    },
  ]

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] animate-pulse" />
          <span className="text-[10px] font-mono text-[var(--color-warning)] uppercase tracking-widest">
            Classified Access
          </span>
        </div>
        <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight drop-shadow-[0_0_20px_rgba(0,200,255,0.3)]">
          Master Control
        </h1>
        <p className="text-[var(--color-text-secondary)] font-mono text-sm mt-2">
          Platform-wide analytics and operator management interface.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="group relative p-6 rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)] hover:border-[var(--color-surface-3)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,255,0.08)] cursor-pointer">
              {/* Glow sweep on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top left, ${card.color}12 0%, transparent 60%)`,
                }}
              />
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${card.color}1A`, border: `1px solid ${card.color}30` }}
                >
                  <card.icon
                    className="w-5 h-5"
                    style={{ color: card.color }}
                  />
                </div>
                <p className="text-xs font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-2">
                  {card.label}
                </p>
                <p
                  className="text-4xl font-display font-bold"
                  style={{ color: card.color }}
                >
                  {card.value}
                </p>
              </div>
              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: card.color }}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Nav */}
      <div>
        <h2 className="text-xs font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/admin/users', label: 'Manage Operators', desc: 'Edit roles, XP and user data' },
            { href: '/admin/badges', label: 'Badge Control', desc: 'Award or revoke achievements' },
            { href: '/admin/courses', label: 'Course Index', desc: 'View and delete all courses' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="group p-5 rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-2)] hover:border-[var(--color-primary)]/40 transition-all duration-200">
                <p className="font-display text-sm font-bold text-white uppercase group-hover:text-[var(--color-primary)] transition-colors">
                  {item.label}
                </p>
                <p className="text-xs font-mono text-[var(--color-text-quaternary)] mt-1">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
