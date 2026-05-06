import { getQuizAttempts, getQuizStats } from '@/app/admin-actions'
import { Target, TrendingUp, Globe } from 'lucide-react'

export const metadata = {
  title: 'Quiz Attempts | EASTDAWN Admin',
}

export default async function AdminQuizPage() {
  const [attempts, stats] = await Promise.all([getQuizAttempts(), getQuizStats()])

  const statCards = [
    { label: 'Total Attempts', value: stats.total, icon: Target, color: '#00C8FF' },
    { label: 'Average Score', value: `${stats.avgScore}%`, icon: TrendingUp, color: '#22C55E' },
    { label: 'Top Domain', value: stats.topDomain, icon: Globe, color: '#7850FF' },
  ]

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <p className="text-[10px] font-mono text-[var(--color-primary)] uppercase tracking-widest mb-1">
          / admin / quiz-attempts
        </p>
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">
          Quiz Intelligence
        </h1>
        <p className="text-sm font-mono text-[var(--color-text-tertiary)] mt-1">
          Platform-wide assessment tracking and performance analytics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="p-6 rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: `${card.color}1A`, border: `1px solid ${card.color}30` }}
            >
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <p className="text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-1">
              {card.label}
            </p>
            <p className="text-3xl font-display font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-surface-3)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-surface-3)]">
                {['Operator', 'Course', 'Module', 'Domain', 'Score', 'Date'].map((h) => (
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
              {attempts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 font-mono text-[var(--color-text-quaternary)]">
                    No quiz attempts recorded yet.
                  </td>
                </tr>
              )}
              {attempts.map((attempt, i) => (
                <tr
                  key={attempt.id}
                  className={`border-b border-[var(--color-surface-3)] last:border-none transition-colors hover:bg-[var(--color-surface-2)]/50 ${
                    i % 2 === 0 ? 'bg-[var(--color-surface-1)]' : 'bg-[var(--color-surface-1)]/50'
                  }`}
                >
                  <td className="px-5 py-4">
                    <p className="font-mono text-white text-sm">{attempt.user?.name ?? '—'}</p>
                    <p className="font-mono text-[10px] text-[var(--color-text-quaternary)]">{attempt.user?.email}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-[var(--color-text-secondary)] text-sm max-w-[150px] truncate">
                    {attempt.module?.course?.title ?? '—'}
                  </td>
                  <td className="px-5 py-4 font-mono text-[var(--color-text-secondary)] text-sm max-w-[150px] truncate">
                    {attempt.module?.title ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded text-[10px] font-mono uppercase bg-[#7850FF]/10 text-[#7850FF] border border-[#7850FF]/20">
                      {attempt.domain}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: attempt.score >= 80 ? '#22C55E' : attempt.score >= 50 ? '#FACC15' : '#EF4444' }}
                    >
                      {attempt.score}%
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[10px] text-[var(--color-text-quaternary)]">
                    {new Date(attempt.createdAt).toLocaleDateString()}
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
