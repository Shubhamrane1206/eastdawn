'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Zap,
  Shield,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  FlaskConical,
  HelpCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

type Stage = 'idle' | 'generating' | 'saving' | 'done' | 'error'

interface ParsedModule {
  title: string
  type: 'READING' | 'LAB' | 'QUIZ'
  orderIndex: number
  content: string
}

interface ParsedCourse {
  title: string
  summary: string
  domain: string
  level: string
  modules: ParsedModule[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  'Teach me web application pentesting as a junior developer...',
  'I need an advanced course on threat intelligence and OSINT...',
  'Give me a beginner-friendly intro to network security fundamentals...',
  'I\'m a sysadmin learning cloud security on AWS for the first time...',
  'Deep dive into malware reverse engineering with real samples...',
  'Show me how to set up a SOC, from detection rules to incident response...',
]

const STAGES_LIST = ['Initializing AI Engine', 'Parsing Intent', 'Planning Curriculum', 'Generating Modules', 'Indexing Content', 'Saving Course']

const MODULE_TYPE_ICON = {
  READING: BookOpen,
  LAB: FlaskConical,
  QUIZ: HelpCircle,
}

const MODULE_TYPE_COLOR = {
  READING: 'var(--color-primary)',
  LAB: 'var(--color-success)',
  QUIZ: 'var(--color-warning)',
}

// ─── Placeholder cycling hook ─────────────────────────────────────────────────

function useCyclingPlaceholder() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % EXAMPLE_PROMPTS.length), 3000)
    return () => clearInterval(t)
  }, [])
  return EXAMPLE_PROMPTS[idx]
}

// ─── Stage progress ───────────────────────────────────────────────────────────

function StageIndicator({ currentStage }: { currentStage: number }) {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-center mb-8">
      {STAGES_LIST.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase transition-all duration-500 ${
              i < currentStage
                ? 'bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/30'
                : i === currentStage
                ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/50 animate-pulse'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-quaternary)] border border-[var(--color-surface-3)]'
            }`}
          >
            {i < currentStage ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : i === currentStage ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-current opacity-40" />
            )}
            {s}
          </div>
          {i < STAGES_LIST.length - 1 && (
            <ChevronRight className="w-3 h-3 text-[var(--color-text-quaternary)]" />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Module Card ──────────────────────────────────────────────────────────────

function ModuleCard({
  mod,
  index,
  isActive,
}: {
  mod: Partial<ParsedModule>
  index: number
  isActive: boolean
}) {
  const Icon = mod.type ? MODULE_TYPE_ICON[mod.type] : BookOpen
  const color = mod.type ? MODULE_TYPE_COLOR[mod.type] : 'var(--color-text-quaternary)'

  return (
    <div
      className={`relative p-5 rounded-xl border transition-all duration-500 ${
        isActive
          ? 'border-[var(--color-primary)]/60 bg-[var(--color-primary)]/5 shadow-[0_0_20px_rgba(0,200,255,0.08)]'
          : mod.title
          ? 'border-[var(--color-surface-3)] bg-[var(--color-surface-1)]'
          : 'border-[var(--color-surface-3)] bg-[var(--color-surface-1)] opacity-40'
      }`}
    >
      {isActive && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent animate-pulse" />
      )}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-display font-bold shrink-0"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30`, color }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
        {mod.type && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase border"
            style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}
          >
            <Icon className="w-2.5 h-2.5" />
            {mod.type}
          </div>
        )}
        {isActive && (
          <div className="ml-auto flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-3 bg-[var(--color-primary)] rounded-full"
                style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite` }}
              />
            ))}
          </div>
        )}
      </div>
      {mod.title ? (
        <p className="font-mono text-sm font-semibold text-white leading-snug">{mod.title}</p>
      ) : (
        <div className="h-4 bg-[var(--color-surface-3)] rounded animate-pulse w-3/4" />
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GenerateClient() {
  const router = useRouter()
  const placeholder = useCyclingPlaceholder()

  const [prompt, setPrompt] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [stageIndex, setStageIndex] = useState(0)
  const [modules, setModules] = useState<Partial<ParsedModule>[]>(
    Array(6).fill({})
  )
  const [courseTitle, setCourseTitle] = useState('')
  const [courseSummary, setCourseSummary] = useState('')
  const [courseId, setCourseId] = useState('')
  const [error, setError] = useState('')
  const [rawBuffer, setRawBuffer] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const activeModuleRef = useRef(0)

  // Try to parse partially-accumulated JSON to show modules live
  const tryParsePartial = useCallback((text: string) => {
    // Extract title
    const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/)
    if (titleMatch && !courseTitle) setCourseTitle(titleMatch[1])

    // Extract summary
    const summaryMatch = text.match(/"summary"\s*:\s*"([^"]+)"/)
    if (summaryMatch && !courseSummary) setCourseSummary(summaryMatch[1])

    // Try to extract individual module titles as they appear
    const moduleTitleMatches = [...text.matchAll(/"title"\s*:\s*"([^"]+)"/g)]
    // First title match is the course title, subsequent ones are modules
    if (moduleTitleMatches.length > 1) {
      const newModules = [...modules]
      for (let i = 1; i < moduleTitleMatches.length && i <= 6; i++) {
        if (!newModules[i - 1]?.title) {
          newModules[i - 1] = { ...newModules[i - 1], title: moduleTitleMatches[i][1] }
          activeModuleRef.current = i - 1
        }
      }
      setModules(newModules)
    }

    // Try to extract module types
    const typeMatches = [...text.matchAll(/"type"\s*:\s*"(READING|LAB|QUIZ)"/g)]
    if (typeMatches.length > 0) {
      const newModules = [...modules]
      typeMatches.forEach((m, i) => {
        if (i < 6) {
          newModules[i] = { ...newModules[i], type: m[1] as 'READING' | 'LAB' | 'QUIZ' }
        }
      })
      setModules(newModules)
    }
  }, [courseTitle, courseSummary, modules])

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 5) return
    setStage('generating')
    setStageIndex(1)
    setModules(Array(6).fill({}))
    setCourseTitle('')
    setCourseSummary('')
    setError('')
    setRawBuffer('')
    activeModuleRef.current = 0

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      // Advance stages over time to feel responsive
      const stageTimer = setInterval(() => {
        setStageIndex((prev) => Math.min(prev + 1, STAGES_LIST.length - 2))
      }, 4000)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // Process SSE lines
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'chunk') {
              setRawBuffer((prev) => {
                const newBuf = prev + data.text
                tryParsePartial(newBuf)
                return newBuf
              })
              setStageIndex((prev) => Math.max(prev, 3))
            } else if (data.type === 'done') {
              clearInterval(stageTimer)
              setStageIndex(STAGES_LIST.length - 1)
              setStage('done')
              setCourseId(data.courseId)
            } else if (data.type === 'error') {
              clearInterval(stageTimer)
              setError(data.message)
              setStage('error')
            }
          } catch {
            // skip malformed
          }
        }
      }

      clearInterval(stageTimer)
    } catch (err) {
      setError(String(err))
      setStage('error')
    }
  }

  const currentActiveModule = activeModuleRef.current

  return (
    <div className="min-h-screen bg-[var(--color-base)] flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[var(--color-surface-3)] flex items-center px-6 gap-4 bg-[var(--color-surface-1)]/60 backdrop-blur-md shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[var(--color-text-quaternary)] hover:text-[var(--color-primary)] transition-colors font-mono text-xs uppercase"
        >
          <ArrowLeft className="w-3 h-3" />
          Command Center
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
          AI Engine Online
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* ── IDLE STATE ── */}
        {stage === 'idle' && (
          <div className="w-full max-w-3xl">
            {/* Title */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 mb-6">
                <Zap className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span className="text-[10px] font-mono text-[var(--color-primary)] uppercase tracking-widest">
                  AI Course Engine v2.0 — Llama 3.3 Powered
                </span>
              </div>
              <h1 className="text-5xl font-display font-bold text-white uppercase tracking-tight drop-shadow-[0_0_30px_rgba(0,200,255,0.3)] mb-4">
                Generate Your Course
              </h1>
              <p className="text-[var(--color-text-secondary)] font-mono text-sm max-w-xl mx-auto">
                Describe your learning goal in plain language. EASTDAWN will generate a complete 6-module professional cybersecurity curriculum — instantly.
              </p>
            </div>

            {/* Prompt Box */}
            <div className={`relative rounded-2xl transition-all duration-300 ${
              isFocused
                ? 'shadow-[0_0_0_1px_rgba(0,200,255,0.6),0_0_40px_rgba(0,200,255,0.15)]'
                : 'shadow-[0_0_0_1px_rgba(15,31,58,1)]'
            }`}>
              {/* Animated corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--color-primary)] rounded-tl-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--color-primary)] rounded-tr-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--color-primary)] rounded-bl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--color-primary)] rounded-br-2xl pointer-events-none" />

              <div className="bg-[var(--color-surface-1)] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 font-mono text-[10px] text-[var(--color-text-quaternary)] uppercase">
                  <Shield className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Eastdawn AI // Prompt Interface</span>
                  <span className="ml-auto text-[var(--color-primary)]">READY</span>
                </div>

                <textarea
                  id="course-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
                  }}
                  placeholder={placeholder}
                  rows={4}
                  className="w-full bg-transparent text-white font-mono text-base placeholder-[var(--color-text-quaternary)] resize-none focus:outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-surface-3)]">
                  <p className="text-[10px] font-mono text-[var(--color-text-quaternary)]">
                    ⌘ + Enter to execute quickly
                  </p>
                  <button
                    id="execute-prompt-btn"
                    onClick={handleGenerate}
                    disabled={prompt.trim().length < 5}
                    className="flex items-center gap-2 px-8 py-3 bg-[var(--color-primary)] text-[#03050a] font-display font-bold text-sm uppercase rounded-xl hover:bg-[var(--color-success)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,200,255,0.3)] hover:shadow-[0_0_30px_rgba(0,220,120,0.4)]"
                  >
                    <Zap className="w-4 h-4" />
                    Execute Prompt
                  </button>
                </div>
              </div>
            </div>

            {/* Example chips */}
            <div className="mt-8">
              <p className="text-[10px] font-mono text-[var(--color-text-quaternary)] uppercase tracking-widest mb-3 text-center">
                Example Prompts
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLE_PROMPTS.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p.replace('...', ''))}
                    className="px-3 py-1.5 rounded-lg border border-[var(--color-surface-3)] bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:border-[var(--color-primary)]/40 hover:text-white text-[11px] font-mono transition-all duration-150 text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GENERATING STATE ── */}
        {(stage === 'generating' || stage === 'saving') && (
          <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 mb-4 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 text-[var(--color-primary)] animate-spin" />
                <span className="text-[10px] font-mono text-[var(--color-primary)] uppercase tracking-widest">
                  Generating Curriculum...
                </span>
              </div>
              {courseTitle && (
                <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight mt-2 transition-all duration-500">
                  {courseTitle}
                </h1>
              )}
              {courseSummary && (
                <p className="text-[var(--color-text-secondary)] font-mono text-sm mt-2 max-w-2xl mx-auto">
                  {courseSummary}
                </p>
              )}
            </div>

            <StageIndicator currentStage={stageIndex} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod, i) => (
                <ModuleCard
                  key={i}
                  mod={mod}
                  index={i}
                  isActive={i === currentActiveModule && !mod.title}
                />
              ))}
            </div>

            <p className="text-center text-[10px] font-mono text-[var(--color-text-quaternary)] mt-6 animate-pulse">
              AI is synthesizing your personalized curriculum — this may take 20–40 seconds
            </p>
          </div>
        )}

        {/* ── DONE STATE ── */}
        {stage === 'done' && (
          <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 mb-6">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                <span className="text-xs font-mono text-[var(--color-success)] uppercase tracking-widest">
                  Course Generated &amp; Saved
                </span>
              </div>
              <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight drop-shadow-[0_0_20px_rgba(0,220,120,0.3)] mb-3">
                {courseTitle}
              </h1>
              <p className="text-[var(--color-text-secondary)] font-mono text-sm max-w-2xl mx-auto">
                {courseSummary}
              </p>
            </div>

            {/* Module Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {modules.map((mod, i) => (
                <ModuleCard key={i} mod={mod} index={i} isActive={false} />
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                id="enter-course-btn"
                onClick={() => router.push(`/course/${courseId}`)}
                className="flex items-center justify-center gap-2 px-10 py-4 bg-[var(--color-primary)] text-[#03050a] font-display font-bold text-sm uppercase rounded-xl hover:bg-[var(--color-success)] transition-all duration-200 shadow-[0_0_30px_rgba(0,200,255,0.3)]"
              >
                Enter Course
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setStage('idle')
                  setPrompt('')
                }}
                className="flex items-center justify-center gap-2 px-8 py-4 border border-[var(--color-surface-3)] text-[var(--color-text-secondary)] font-mono text-sm uppercase rounded-xl hover:border-[var(--color-primary)]/40 hover:text-white transition-all duration-200"
              >
                Generate Another
              </button>
            </div>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {stage === 'error' && (
          <div className="w-full max-w-xl text-center">
            <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold text-white uppercase mb-2">
                Generation Failed
              </h2>
              <p className="text-sm font-mono text-[var(--color-text-quaternary)] mb-6 break-words">
                {error || 'An unexpected error occurred. Please try again.'}
              </p>
              <button
                onClick={() => setStage('idle')}
                className="px-8 py-3 bg-[var(--color-primary)] text-[#03050a] font-mono font-bold text-sm uppercase rounded-xl hover:bg-[var(--color-success)] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
