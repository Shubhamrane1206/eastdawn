import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { SpotlightCard } from '@/components/SpotlightCard'
import { BookOpen, Shield, Zap, Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Knowledge Library | EASTDAWN',
  description: 'Your personal archive of AI-generated cybersecurity courses.',
}

const LEVEL_COLOR: Record<string, string> = {
  Beginner: 'var(--color-success)',
  Intermediate: 'var(--color-warning)',
  Advanced: 'var(--color-secondary)',
  Expert: 'var(--color-primary)',
}

export default async function LibraryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await db.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  })

  const courses = dbUser
    ? await db.course.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { modules: true } },
          modules: { select: { isCompleted: true } },
        },
      })
    : []

  return (
    <div className="flex flex-col min-h-screen px-4 py-24 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 border-b border-[var(--color-surface-3)] pb-8 gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(0,200,255,0.3)] flex items-center gap-4">
            <BookOpen className="w-8 h-8 text-[var(--color-primary)]" />
            Knowledge Library
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2 font-mono text-sm max-w-xl">
            {courses.length > 0
              ? `${courses.length} course${courses.length !== 1 ? 's' : ''} in your archive. Archive of generated neural training programs.`
              : 'Your archive is empty. Generate your first course to get started.'}
          </p>
        </div>
        <Link
          href="/generate"
          id="generate-new-course"
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[#03050a] font-display font-bold text-sm uppercase rounded-xl hover:bg-[var(--color-success)] transition-all shadow-[0_0_20px_rgba(0,200,255,0.2)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Generate New Course
        </Link>
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
          <div className="w-20 h-20 rounded-2xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)] flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-[var(--color-text-quaternary)]" />
          </div>
          <h2 className="text-xl font-display font-bold text-white uppercase mb-2">No Courses Yet</h2>
          <p className="text-sm font-mono text-[var(--color-text-quaternary)] mb-8 max-w-sm">
            Type a prompt on the generate page and your AI-crafted course will appear here.
          </p>
          <Link
            href="/generate"
            className="flex items-center gap-2 px-8 py-3 bg-[var(--color-primary)] text-[#03050a] font-mono font-bold text-sm uppercase rounded-xl hover:bg-[var(--color-success)] transition-colors"
          >
            <Zap className="w-4 h-4" />
            Generate First Course
          </Link>
        </div>
      )}

      {/* Course Grid */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const completedModules = course.modules.filter((m) => m.isCompleted).length
            const totalModules = course._count.modules
            const pct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
            const color = LEVEL_COLOR[course.level] ?? 'var(--color-primary)'

            return (
              <Link key={course.id} href={`/course/${course.id}`}>
                <SpotlightCard className="p-6 cursor-pointer group h-full flex flex-col">
                  <div className="flex flex-col gap-2 mb-4">
                    <span
                      className="text-xs font-mono px-2 py-1 rounded inline-flex items-center gap-1.5 w-fit"
                      style={{ color, backgroundColor: `${color}15` }}
                    >
                      <Shield className="w-3 h-3" />
                      {course.domain} // {course.level}
                    </span>
                    <h3 className="text-lg font-display font-bold text-white group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 uppercase leading-snug">
                      {course.title}
                    </h3>
                    {course.summary && (
                      <p className="text-xs font-mono text-[var(--color-text-quaternary)] line-clamp-2">
                        {course.summary}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-[var(--color-surface-3)]">
                    <div className="flex items-center justify-between font-mono text-xs text-[var(--color-text-tertiary)] mb-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {totalModules} Modules
                      </span>
                      <span
                        className={pct === 100 ? 'text-[var(--color-success)]' : ''}
                      >
                        {pct === 100 ? '✓ COMPLETED' : `${pct}%`}
                      </span>
                    </div>

                    {pct < 100 && (
                      <div className="w-full h-1 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, var(--color-primary), var(--color-success))`,
                          }}
                        />
                      </div>
                    )}

                    <p className="text-[10px] font-mono text-[var(--color-text-quaternary)] mt-2">
                      {new Date(course.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </SpotlightCard>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
