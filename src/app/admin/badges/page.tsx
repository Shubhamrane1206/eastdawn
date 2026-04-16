import { getAllBadges, getAllUsers } from '@/app/admin-actions'
import BadgesClient from './BadgesClient'

export const metadata = {
  title: 'Badge Control | EASTDAWN Admin',
}

export default async function AdminBadgesPage() {
  const [badges, users] = await Promise.all([getAllBadges(), getAllUsers()])

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <p className="text-[10px] font-mono text-[var(--color-primary)] uppercase tracking-widest mb-1">
          / admin / badges
        </p>
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">
          Badge Control
        </h1>
        <p className="text-sm font-mono text-[var(--color-text-tertiary)] mt-1">
          {badges.length} badges in the system
        </p>
      </div>
      <BadgesClient badges={badges} users={users} />
    </div>
  )
}
