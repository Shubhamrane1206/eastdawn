import { getAllUsers } from '@/app/admin-actions'
import UsersTable from './UsersTable'

export const metadata = {
  title: 'User Management | EASTDAWN Admin',
}

export default async function AdminUsersPage() {
  const users = await getAllUsers()
  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <p className="text-[10px] font-mono text-[var(--color-primary)] uppercase tracking-widest mb-1">
          / admin / users
        </p>
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">
          Operator Registry
        </h1>
        <p className="text-sm font-mono text-[var(--color-text-tertiary)] mt-1">
          {users.length} operators enrolled on the platform
        </p>
      </div>
      <UsersTable initialUsers={users} />
    </div>
  )
}
