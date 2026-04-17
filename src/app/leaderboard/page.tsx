import { Shield, Trophy, Flame, Zap } from "lucide-react";
import Link from "next/link";
import { db } from '@/lib/db'

export default async function LeaderboardPage() {
  // Query top 50 users based on totalXp
  const topUsers = await db.user.findMany({
    orderBy: { totalXp: 'desc' },
    take: 50,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      totalStudyMinutes: true,
      totalXp: true,
      badges: {
        include: { badge: true }
      }
    }
  })

  return (
    <div className="flex flex-col min-h-screen px-4 py-24 sm:px-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-[var(--color-surface-3)] pb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,49,49,0.3)] flex items-center gap-4">
            <Trophy className="w-10 h-10 text-[var(--color-warning)]" />
            Global Leaderboard
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2 font-mono text-sm max-w-xl">
            Rankings are determined by total neural XP. Ascend the matrix through active training and module completion.
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-2)]/50 border-b border-[var(--color-surface-3)] text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase tracking-wider">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Operator</th>
                <th className="px-6 py-4 text-center">Neural Badges</th>
                <th className="px-6 py-4 text-right text-[var(--color-warning)]">XP</th>
                <th className="px-6 py-4 text-right">Training Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-surface-3)]/50">
              {topUsers.map((user, idx) => {
                const rank = idx + 1
                const isTop3 = rank <= 3
                return (
                  <tr key={user.id} className="group hover:bg-[var(--color-surface-2)] transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`font-display font-bold text-xl ${
                        rank === 1 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' :
                        rank === 2 ? 'text-gray-300' :
                        rank === 3 ? 'text-amber-600' : 'text-[var(--color-text-tertiary)]'
                      }`}>
                        #{rank}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border ${isTop3 ? 'border-[var(--color-warning)] shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'border-[var(--color-surface-3)]'}`}>
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <Shield className="w-5 h-5 text-[var(--color-text-secondary)]" />
                          )}
                        </div>
                        <div className="font-mono text-sm text-white uppercase tracking-wider group-hover:text-[var(--color-primary)] transition-colors">
                          {user.name || 'Anonymous Operator'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                       <div className="inline-flex gap-1">
                         {user.badges.slice(0, 3).map(b => (
                           <div key={b.badge.id} className="w-6 h-6 rounded bg-[var(--color-surface-3)] flex items-center justify-center" title={b.badge.name}>
                              <Zap className="w-3 h-3 text-[var(--color-primary)]" />
                           </div>
                         ))}
                         {user.badges.length > 3 && (
                           <div className="text-[10px] text-[var(--color-text-quaternary)] self-center ml-1">+{user.badges.length - 3}</div>
                         )}
                         {user.badges.length === 0 && (
                           <span className="text-[10px] text-[var(--color-text-quaternary)] font-mono">-</span>
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right font-mono text-sm text-[var(--color-warning)] font-bold">
                      {user.totalXp}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        <Flame className={`w-4 h-4 ${isTop3 ? 'text-[var(--color-warning)]' : 'text-[var(--color-primary)]'}`} />
                        <span className="font-display font-bold text-white">
                          {(user.totalStudyMinutes / 60).toFixed(1)} HR
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {topUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[var(--color-text-quaternary)] font-mono text-sm">
                    No operators registered on the network.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
