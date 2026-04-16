'use client'

import { useState, useTransition } from 'react'
import { deleteCourse } from '@/app/admin-actions'
import { Search, Trash2, BookOpen, Globe, Lock } from 'lucide-react'

type Course = {
  id: string
  title: string
  domain: string
  level: string
  isPublic: boolean
  createdAt: Date
  user: { name: string | null; email: string | null }
  _count: { modules: number }
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'var(--color-success)',
  Intermediate: 'var(--color-warning)',
  Advanced: 'var(--color-secondary)',
  Expert: 'var(--color-primary)',
}

export default function CoursesClient({ initialCourses }: { initialCourses: Course[] }) {
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = initialCourses.filter((c) => {
    if (!search) return true
    return (
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.domain.toLowerCase().includes(search.toLowerCase()) ||
      c.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.user.email?.toLowerCase().includes(search.toLowerCase())
    )
  })

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteCourse(id)
      setConfirmDelete(null)
    })
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-quaternary)]" />
        <input
          id="course-search"
          type="text"
          placeholder="Search courses, domains, operators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-10 bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] focus:border-[var(--color-primary)] rounded-lg text-sm font-mono text-white placeholder-[var(--color-text-quaternary)] focus:outline-none transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-surface-3)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-surface-3)]">
                {['Course', 'Owner', 'Domain', 'Level', 'Modules', 'Visibility', 'Created', 'Actions'].map((h) => (
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 font-mono text-[var(--color-text-quaternary)]">
                    No courses found.
                  </td>
                </tr>
              )}
              {filtered.map((course, i) => (
                <tr
                  key={course.id}
                  className={`border-b border-[var(--color-surface-3)] last:border-none transition-colors hover:bg-[var(--color-surface-2)]/50 ${
                    i % 2 === 0 ? 'bg-[var(--color-surface-1)]' : 'bg-[var(--color-surface-1)]/50'
                  }`}
                >
                  {/* Course */}
                  <td className="px-5 py-4 max-w-[220px]">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[var(--color-secondary)] flex-shrink-0" />
                      <p className="font-mono text-white text-sm truncate">{course.title}</p>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="px-5 py-4">
                    <p className="font-mono text-sm text-[var(--color-text-secondary)]">
                      {course.user.name ?? '—'}
                    </p>
                    <p className="font-mono text-[10px] text-[var(--color-text-quaternary)]">
                      {course.user.email}
                    </p>
                  </td>

                  {/* Domain */}
                  <td className="px-5 py-4 font-mono text-xs text-[var(--color-primary)]">
                    {course.domain}
                  </td>

                  {/* Level */}
                  <td className="px-5 py-4">
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded border"
                      style={{
                        color: LEVEL_COLORS[course.level] ?? '#fff',
                        borderColor: `${LEVEL_COLORS[course.level] ?? '#fff'}30`,
                        backgroundColor: `${LEVEL_COLORS[course.level] ?? '#fff'}10`,
                      }}
                    >
                      {course.level}
                    </span>
                  </td>

                  {/* Modules */}
                  <td className="px-5 py-4 font-mono text-sm text-[var(--color-text-secondary)]">
                    {course._count.modules}
                  </td>

                  {/* Visibility */}
                  <td className="px-5 py-4">
                    {course.isPublic ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--color-success)]">
                        <Globe className="w-3 h-3" /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--color-text-quaternary)]">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="px-5 py-4 font-mono text-xs text-[var(--color-text-quaternary)]">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    {confirmDelete === course.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          id={`course-delete-confirm-${course.id}`}
                          onClick={() => handleDelete(course.id)}
                          disabled={isPending}
                          className="text-[10px] font-mono text-red-400 hover:underline uppercase"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-[10px] font-mono text-[var(--color-text-quaternary)] hover:underline uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`course-delete-${course.id}`}
                        onClick={() => setConfirmDelete(course.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-[var(--color-text-quaternary)] hover:text-red-400 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
