'use client'

import { useState, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import {
  BookOpen,
  FlaskConical,
  HelpCircle,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Map,
  ChevronRight,
  ChevronLeft,
  Shield,
  Zap,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Module {
  id: string
  title: string
  type: string
  orderIndex: number
  content: string
  isCompleted: boolean
  quizData?: any
}

interface Course {
  id: string
  title: string
  summary: string | null
  domain: string
  level: string
  modules: Module[]
  user: { name: string | null }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_TYPE_ICON: Record<string, React.ElementType> = {
  READING: BookOpen,
  LAB: FlaskConical,
  QUIZ: HelpCircle,
}

const MODULE_TYPE_COLOR: Record<string, string> = {
  READING: 'var(--color-primary)',
  LAB: 'var(--color-success)',
  QUIZ: 'var(--color-warning)',
}

const LEVEL_COLOR: Record<string, string> = {
  Beginner: 'var(--color-success)',
  Intermediate: 'var(--color-warning)',
  Advanced: 'var(--color-secondary)',
  Expert: 'var(--color-primary)',
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  course,
  activeIdx,
  onSelect,
  completedSet,
}: {
  course: Course
  activeIdx: number
  onSelect: (i: number) => void
  completedSet: Set<string>
}) {
  const completed = course.modules.filter((m) => completedSet.has(m.id)).length
  const pct = Math.round((completed / course.modules.length) * 100)

  return (
    <aside className="w-72 shrink-0 border-r border-[var(--color-surface-3)] bg-[var(--color-surface-1)] flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Course Info */}
      <div className="p-5 border-b border-[var(--color-surface-3)]">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-text-quaternary)] hover:text-[var(--color-primary)] transition-colors uppercase mb-3"
        >
          <ArrowLeft className="w-3 h-3" />
          Library
        </Link>
        <div
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono uppercase border mb-2"
          style={{
            color: LEVEL_COLOR[course.level] ?? '#fff',
            borderColor: `${LEVEL_COLOR[course.level] ?? '#fff'}30`,
            backgroundColor: `${LEVEL_COLOR[course.level] ?? '#fff'}10`,
          }}
        >
          <Shield className="w-2.5 h-2.5" />
          {course.domain} · {course.level}
        </div>
        <h2 className="font-display text-sm font-bold text-white uppercase leading-snug line-clamp-3">
          {course.title}
        </h2>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[9px] font-mono text-[var(--color-text-quaternary)] mb-1.5">
            <span>Progress</span>
            <span className="text-[var(--color-primary)]">{pct}%</span>
          </div>
          <div className="w-full h-1 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-success)] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modules Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {course.modules.map((mod, i) => {
          const Icon = MODULE_TYPE_ICON[mod.type] ?? BookOpen
          const color = MODULE_TYPE_COLOR[mod.type] ?? 'var(--color-text-secondary)'
          const done = completedSet.has(mod.id)
          const active = i === activeIdx

          return (
            <button
              key={mod.id}
              onClick={() => onSelect(i)}
              className={`w-full text-left px-3 py-3 rounded-lg border transition-all duration-200 group ${
                active
                  ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10'
                  : 'border-transparent hover:border-[var(--color-surface-3)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                  ) : (
                    <Circle className={`w-4 h-4 ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-quaternary)]'}`} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className="w-2.5 h-2.5 shrink-0" style={{ color }} />
                    <span className="text-[8px] font-mono uppercase" style={{ color }}>
                      {mod.type}
                    </span>
                  </div>
                  <p className={`text-xs font-mono leading-snug line-clamp-2 ${active ? 'text-white' : 'text-[var(--color-text-secondary)] group-hover:text-white'} transition-colors`}>
                    {String(i + 1).padStart(2, '0')}. {mod.title}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Roadmap Link */}
      <div className="p-4 border-t border-[var(--color-surface-3)]">
        <Link
          href={`/course/${course.id}/roadmap`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] transition-all font-mono text-xs uppercase"
        >
          <Map className="w-3 h-3" />
          View Roadmap
        </Link>
      </div>
    </aside>
  )
}

// ─── Markdown Components ──────────────────────────────────────────────────────

const mdComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-display font-bold text-white uppercase tracking-tight mt-8 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight mt-6 mb-3" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-base font-display font-bold text-[var(--color-primary)] uppercase tracking-wider mt-5 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-[var(--color-text-secondary)] font-sans text-sm leading-relaxed mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="space-y-1.5 mb-4 ml-4" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="space-y-1.5 mb-4 ml-4 list-decimal" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-[var(--color-text-secondary)] font-sans text-sm flex items-start gap-2">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" style={{ minWidth: '6px' }} />
      <span {...props} />
    </li>
  ),
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <div className="relative my-4 rounded-xl overflow-hidden border border-[var(--color-surface-3)]">
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] border-b border-[var(--color-surface-3)]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase ml-2">
              {className?.replace('language-', '') ?? 'code'}
            </span>
          </div>
          <pre className="bg-[var(--color-surface-1)] p-4 overflow-x-auto">
            <code className="text-[var(--color-success)] font-mono text-xs leading-relaxed" {...props}>
              {children}
            </code>
          </pre>
        </div>
      )
    }
    return (
      <code className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-primary)] font-mono text-xs border border-[var(--color-surface-3)]" {...props}>
        {children}
      </code>
    )
  },
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-2 border-[var(--color-primary)] pl-4 my-4 italic text-[var(--color-text-tertiary)] font-mono text-sm" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-white font-bold" {...props} />
  ),
  a: (props: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-[var(--color-primary)] hover:underline underline-offset-2" {...props} />
  ),
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CourseReader({ course }: { course: Course }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [completedSet, setCompletedSet] = useState<Set<string>>(
    new Set(course.modules.filter((m) => m.isCompleted).map((m) => m.id))
  )
  const [isPending, startTransition] = useTransition()
  
  const [answers, setAnswers] = useState<(number | undefined)[]>([])
  const [quizResult, setQuizResult] = useState<any>(null)
  
  // Reset state when module changes
  useState(() => {
    setAnswers([])
    setQuizResult(null)
  })

  const activeModule = course.modules[activeIdx]
  const ModuleIcon = MODULE_TYPE_ICON[activeModule.type] ?? BookOpen
  const moduleColor = MODULE_TYPE_COLOR[activeModule.type] ?? 'var(--color-text-secondary)'

  const toggleComplete = () => {
    startTransition(async () => {
      const isNowComplete = !completedSet.has(activeModule.id)
      // Optimistic update
      setCompletedSet((prev) => {
        const next = new Set(prev)
        if (isNowComplete) next.add(activeModule.id)
        else next.delete(activeModule.id)
        return next
      })
      // Server update
      await fetch(`/api/modules/${activeModule.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: isNowComplete }),
      })
    })
  }

  const submitQuiz = async () => {
    startTransition(async () => {
      const res = await fetch(`/api/modules/${activeModule.id}/quiz-attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      if (data.success) {
        setQuizResult(data)
        if (data.passed) {
          setCompletedSet(prev => new Set(prev).add(activeModule.id))
        }
      }
    })
  }

  const goNext = () => setActiveIdx((i) => Math.min(i + 1, course.modules.length - 1))
  const goPrev = () => setActiveIdx((i) => Math.max(i - 1, 0))

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base)]">
      <Sidebar
        course={course}
        activeIdx={activeIdx}
        onSelect={setActiveIdx}
        completedSet={completedSet}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[var(--color-base)]/90 backdrop-blur-md border-b border-[var(--color-surface-3)] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono uppercase"
              style={{
                color: moduleColor,
                borderColor: `${moduleColor}30`,
                backgroundColor: `${moduleColor}10`,
              }}
            >
              <ModuleIcon className="w-3 h-3" />
              {activeModule.type}
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-quaternary)]">
              Module {activeIdx + 1} / {course.modules.length}
            </span>
          </div>

          <button
            id="complete-module-btn"
            onClick={toggleComplete}
            disabled={isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-mono uppercase transition-all duration-200 ${
              completedSet.has(activeModule.id)
                ? 'border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)]'
                : 'border-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]'
            }`}
          >
            {completedSet.has(activeModule.id) ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5" />
                Mark Complete
              </>
            )}
          </button>
        </div>

        {/* Module Content */}
        <article className="max-w-3xl mx-auto px-8 py-10">
          {/* Module Header */}
          <div className="mb-10 pb-8 border-b border-[var(--color-surface-3)]">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[var(--color-text-quaternary)]" />
              <span className="text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest">
                {course.domain} · {course.level}
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(0,200,255,0.2)]">
              {activeModule.title}
            </h1>
          </div>

          {/* Markdown Content */}
          <div className="prose-cyberpunk">
            <ReactMarkdown components={mdComponents as never}>
              {activeModule.content}
            </ReactMarkdown>

            {/* Interactive Quiz Wrapper */}
            {activeModule.type === 'QUIZ' && activeModule.quizData && (
              <div className="space-y-8 mt-8 border-t border-[var(--color-surface-3)] pt-8">
                <h2 className="text-2xl font-display font-bold text-white uppercase flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-[var(--color-warning)]" /> Neural Assessment
                </h2>
                {activeModule.quizData.questions?.map((q: any, i: number) => (
                   <div key={i} className="p-6 bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-warning)]/50" />
                      <h3 className="text-lg font-mono font-bold text-white mb-4">{q.question}</h3>
                      <div className="space-y-3">
                         {q.options.map((opt: string, optIdx: number) => (
                            <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[i] === optIdx ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)] hover:border-[var(--color-text-secondary)]'}`}>
                               <input 
                                 type="radio" 
                                 name={`q-${i}`} 
                                 checked={answers[i] === optIdx}
                                 onChange={() => {
                                   const newAnswers = [...answers]
                                   newAnswers[i] = optIdx
                                   setAnswers(newAnswers)
                                 }}
                                 className="sr-only"
                               />
                               <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${answers[i] === optIdx ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-quaternary)]'}`}>
                                  {answers[i] === optIdx && <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />}
                               </div>
                               <span className={`text-sm font-sans ${answers[i] === optIdx ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>{opt}</span>
                            </label>
                         ))}
                      </div>
                   </div>
                ))}
                
                {quizResult ? (
                  <div className={`p-8 text-center rounded-xl border ${quizResult.passed ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/50' : 'bg-red-500/10 border-red-500/50'}`}>
                     <h3 className={`text-2xl font-display font-bold mb-2 uppercase ${quizResult.passed ? 'text-[var(--color-success)]' : 'text-red-400'}`}>
                       {quizResult.passed ? 'SYSTEM COMPROMISED - SUCCESS' : 'ACCESS DENIED - FAILED'}
                     </h3>
                     <p className="font-mono text-sm text-[var(--color-text-secondary)] mb-6">
                       Score: {quizResult.score}% | XP Earned: +{quizResult.xpEarned} | Time Logged: +{quizResult.minutesEarned} MIN
                     </p>
                     {!quizResult.passed ? (
                        <button onClick={() => { setQuizResult(null); setAnswers([]) }} className="px-8 py-3 outline-none bg-transparent border border-red-400/50 text-red-400 hover:bg-red-400 hover:text-[#03050a] text-xs font-display font-bold uppercase rounded transition-colors">
                          Retry Sequence
                        </button>
                     ) : (
                        <button onClick={goNext} className="px-8 py-3 bg-[var(--color-success)] text-[#03050a] text-xs font-display font-bold uppercase rounded shadow-[0_0_15px_rgba(0,220,120,0.3)]">
                          Proceed Next
                        </button>
                     )}
                  </div>
                ) : (
                  <button 
                    onClick={submitQuiz}
                    disabled={isPending || answers.length !== activeModule.quizData.questions.length || answers.includes(undefined)}
                    className="w-full py-5 bg-[var(--color-primary)] text-[#03050a] font-display font-bold text-sm uppercase rounded-xl hover:bg-[var(--color-success)] transition-all shadow-[0_0_15px_rgba(0,200,255,0.2)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Verifying...' : 'Submit Neural Sequence'}
                  </button>
                )}
              </div>
            )}
          </div>
        </article>

        {/* Bottom Navigation */}
        <div className="border-t border-[var(--color-surface-3)] px-8 py-5 flex items-center justify-between max-w-3xl mx-auto">
          <button
            id="prev-module-btn"
            onClick={goPrev}
            disabled={activeIdx === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-surface-3)] text-[var(--color-text-secondary)] font-mono text-xs uppercase hover:border-[var(--color-primary)]/40 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {activeIdx < course.modules.length - 1 ? (
            <button
              id="next-module-btn"
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-[#03050a] font-display font-bold text-xs uppercase hover:bg-[var(--color-success)] transition-all shadow-[0_0_15px_rgba(0,200,255,0.2)]"
            >
              Next Module
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/library"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-success)] text-[#03050a] font-display font-bold text-xs uppercase hover:opacity-90 transition-all shadow-[0_0_15px_rgba(0,220,120,0.2)]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Course Complete
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
