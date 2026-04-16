import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Trophy,
  BookOpen,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/badges', label: 'Badges', icon: Trophy },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await db.user.findUnique({
    where: { email: user.email! },
    select: { role: true, name: true, email: true },
  })

  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-base)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--color-surface-1)] border-r border-[var(--color-surface-3)] flex flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--color-surface-3)]">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-[var(--color-warning)]" />
            <span className="font-display text-xs font-bold text-[var(--color-warning)] uppercase tracking-widest">
              Admin
            </span>
          </div>
          <p className="font-display text-lg font-bold text-white uppercase tracking-tight leading-tight">
            EASTDAWN
          </p>
          <p className="text-[10px] font-mono text-[var(--color-text-quaternary)] mt-1 uppercase">
            Master Control Interface
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-white transition-all duration-200 font-mono text-sm relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-primary)] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />
              <item.icon className="w-4 h-4 flex-shrink-0 group-hover:text-[var(--color-primary)] transition-colors" />
              <span className="uppercase tracking-wider text-xs">{item.label}</span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* Operator Info */}
        <div className="p-4 border-t border-[var(--color-surface-3)]">
          <div className="px-4 py-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-warning)]/20">
            <p className="text-[10px] font-mono text-[var(--color-warning)] uppercase tracking-wider mb-1">
              Logged in as
            </p>
            <p className="text-sm font-mono text-white truncate">
              {dbUser.name ?? dbUser.email}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] animate-pulse" />
              <span className="text-[10px] font-mono text-[var(--color-warning)] uppercase">
                Master Admin
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 min-h-screen">{children}</main>
    </div>
  )
}
