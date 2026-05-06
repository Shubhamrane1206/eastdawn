import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { Shield, Settings, LogOut, Award, Terminal, ShieldAlert } from 'lucide-react'
import { signOut } from '@/app/auth-actions'

export async function GlobalNav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dbUser = null
  if (user) {
    dbUser = await db.user.findUnique({
      where: { email: user.email! },
      select: { name: true, avatarUrl: true, totalXp: true, role: true }
    })
  }

  const isAdmin = dbUser?.role === 'ADMIN'

  return (
    <nav className="fixed top-0 inset-x-0 h-14 bg-[var(--color-surface-1)]/80 backdrop-blur-md border-b border-[var(--color-surface-3)] z-50 flex items-center px-6 justify-between transform transition-all">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 text-white font-display font-bold uppercase tracking-wider text-sm hover:text-[var(--color-primary)] transition-colors">
          <Shield className="w-4 h-4 text-[var(--color-primary)]" />
          Eastdawn
        </Link>
        
        {user ? (
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-[var(--color-text-secondary)] uppercase">
            <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <Link href="/leaderboard" className="hover:text-white transition-colors flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Leaderboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Master Control
              </Link>
            )}
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest">
            <span>// Neural Interface Offline</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-right hidden md:block">
              <p className="text-xs font-display font-bold text-white uppercase">{dbUser?.name || 'Operator'}</p>
              <p className="text-[10px] font-mono text-[var(--color-text-quaternary)]">{dbUser?.totalXp || 0} XP</p>
            </div>
            
            <Link href="/settings" className="w-8 h-8 rounded-full bg-[var(--color-surface-3)] border border-[var(--color-primary)]/40 flex items-center justify-center overflow-hidden hover:border-[var(--color-primary)] transition-colors">
              {dbUser?.avatarUrl ? (
                <img src={dbUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Settings className="w-4 h-4 text-[var(--color-text-secondary)]" />
              )}
            </Link>

            <form action={signOut}>
              <button type="submit" className="p-2 text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors rounded-lg hover:bg-[var(--color-surface-3)]" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              href="/admin" 
              className="p-2 text-[var(--color-text-quaternary)] hover:text-amber-400 transition-colors" 
              title="Admin Entry"
            >
              <ShieldAlert className="w-4 h-4" />
            </Link>
            <Link href="/login" className="text-[10px] font-mono text-[var(--color-text-secondary)] hover:text-white uppercase px-3 py-1.5 border border-[var(--color-surface-3)] rounded hover:border-[var(--color-primary)]/50 transition-all">
              Acknowledge
            </Link>
            <Link href="/register" className="text-[10px] font-mono bg-[var(--color-primary)] text-[#03050a] px-3 py-1.5 rounded font-bold hover:bg-[var(--color-success)] transition-all uppercase">
              Establish Link
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
