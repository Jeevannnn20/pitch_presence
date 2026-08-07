import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { readHistory } from '../lib/history.js'
import { clearAttempts, loadHistory } from '../lib/historyStore.js'
import { useAuth } from '../context/AuthContext.jsx'
import AccountMenu from '../components/AccountMenu.jsx'

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(value))
  } catch {
    return 'Recent'
  }
}

function formatDuration(seconds = 0) {
  const safe = Math.max(0, Math.round(seconds))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

function practiceUrl(attempt) {
  const params = new URLSearchParams({
    mode: attempt.mode || 'Startup Pitch',
    target: attempt.targetId || '',
    prompt: attempt.promptId || ''
  })

  if (attempt.isCustomPrompt && attempt.promptText) {
    params.set('custom', attempt.promptText)
  }

  return `/record?${params.toString()}`
}

function Sparkline({ attempts }) {
  const points = attempts
    .slice()
    .reverse()
    .slice(-12)
    .map((attempt) => attempt.overallScore || attempt.rubricScore || 0)

  if (points.length < 2) {
    return <div className="h-20 rounded-xl border border-[#1e1e30] bg-[#080810]" />
  }

  const width = 360
  const height = 84
  const path = points
    .map((score, index) => {
      const x = (index / (points.length - 1)) * width
      const y = height - (Math.max(0, Math.min(100, score)) / 100) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-20 w-full overflow-visible">
      <path d={path} fill="none" stroke="#4f6ef7" strokeLinecap="round" strokeWidth="4" />
      {points.map((score, index) => {
        const x = (index / (points.length - 1)) * width
        const y = height - (Math.max(0, Math.min(100, score)) / 100) * height
        return <circle key={`${score}-${index}`} cx={x} cy={y} fill="#10b981" r="4" />
      })}
    </svg>
  )
}

function StatCard({ label, value, subtext }) {
  return (
    <article className="rounded-2xl border border-[#1e1e30] bg-[#0f0f1a] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#44445a]">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-[#f0f0ff]">{value}</p>
      {subtext && <p className="mt-2 text-xs text-[#8888aa]">{subtext}</p>}
    </article>
  )
}

export default function HistoryPage() {
  const { user, configured } = useAuth()
  // Seed synchronously from local for a zero-flash first paint, then reconcile with the
  // cloud (when signed in) once loadHistory resolves.
  const [attempts, setAttempts] = useState(() => readHistory())
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let active = true
    setSyncing(true)
    loadHistory()
      .then((merged) => {
        if (active) setAttempts(merged)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setSyncing(false)
      })
    return () => {
      active = false
    }
  }, [user])

  const stats = useMemo(() => {
    const scores = attempts.map((attempt) => attempt.overallScore).filter(Number.isFinite)
    const rubricScores = attempts.map((attempt) => attempt.rubricScore).filter(Number.isFinite)
    const best = scores.length ? Math.max(...scores) : 0
    const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
    const rubricAverage = rubricScores.length
      ? Math.round(rubricScores.reduce((sum, score) => sum + score, 0) / rubricScores.length)
      : 0

    return { best, average, rubricAverage }
  }, [attempts])

  async function handleClear() {
    setAttempts([])
    try {
      await clearAttempts()
    } catch (error) {
      console.warn('Clear history failed:', error)
    }
  }

  return (
    <main className="min-h-screen bg-[#080810] px-4 py-6 text-[#f0f0ff] sm:px-6 lg:px-8">
      <style>{`
        @keyframes pageIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div className="mx-auto max-w-7xl animate-[pageIn_0.3s_ease-out] space-y-7">
        <header className="flex flex-col gap-5 border-b border-[#1e1e30] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/record" className="text-sm font-medium text-[#8888aa] transition hover:text-[#f0f0ff]">
              ← Back to Recorder
            </Link>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.02em] text-[#f0f0ff] sm:text-5xl">Practice History</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8888aa]">
              {user
                ? `Synced to your account${syncing ? ' — updating…' : ''}. Your attempts follow you across devices.`
                : configured
                  ? 'Saved only on this browser. Sign in to sync your progress across devices.'
                  : 'Local progress tracking for completed sessions. Your attempts stay in this browser.'}
            </p>
            {!user && configured && (
              <Link
                to="/login"
                className="mt-3 inline-flex rounded-full border border-[#4f6ef7]/40 bg-[#4f6ef7]/10 px-3.5 py-1.5 text-xs font-semibold text-[#aab6ff] transition hover:bg-[#4f6ef7]/20"
              >
                Sign in to sync →
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <AccountMenu />
            {attempts.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="h-11 rounded-[14px] border border-[#2a2a45] px-4 text-sm font-semibold text-[#8888aa] transition hover:border-[#ef4444] hover:text-[#ef4444]"
              >
                Clear
              </button>
            )}
            <Link
              to="/record"
              className="grid h-11 place-items-center rounded-[14px] bg-gradient-to-r from-[#4f6ef7] to-[#6366f1] px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(79,110,247,0.3)]"
            >
              New Practice
            </Link>
          </div>
        </header>

        {attempts.length === 0 ? (
          <section className="rounded-2xl border border-[#1e1e30] bg-[#0f0f1a] p-8 text-center">
            <h2 className="text-2xl font-bold tracking-[-0.02em]">No attempts saved yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8888aa]">
              Complete a recording and your score, prompt, company style, and fixes will show up here automatically.
            </p>
            <Link
              to="/record"
              className="mt-6 inline-grid h-12 place-items-center rounded-[14px] bg-gradient-to-r from-[#4f6ef7] to-[#6366f1] px-6 text-sm font-semibold text-white"
            >
              Start Practice
            </Link>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard label="Attempts" value={attempts.length} subtext="Saved locally" />
              <StatCard label="Average" value={stats.average} subtext="Mean debrief score" />
              <StatCard label="Best" value={stats.best} subtext="Highest debrief score" />
              <StatCard label="Rubric Avg" value={stats.rubricAverage} subtext="Local benchmark" />
            </section>

            <section className="rounded-2xl border border-[#1e1e30] bg-[#0f0f1a] p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#44445a]">Trend</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-[#f0f0ff]">Recent score movement</h2>
                </div>
                <p className="text-xs text-[#8888aa]">Last {Math.min(12, attempts.length)} attempts</p>
              </div>
              <Sparkline attempts={attempts} />
            </section>

            <section className="grid gap-4">
              {attempts.map((attempt) => (
                <article
                  key={attempt.id}
                  className="rounded-2xl border border-[#1e1e30] bg-[#0f0f1a] p-5 transition hover:border-[#2a2a45] hover:bg-[#13131f]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#4f6ef7]/25 bg-[#4f6ef7]/10 px-3 py-1 text-xs font-semibold text-[#4f6ef7]">
                          {attempt.mode}
                        </span>
                        <span className="rounded-full border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-3 py-1 text-xs font-semibold text-[#8b5cf6]">
                          {attempt.targetName}
                        </span>
                        <span className="rounded-full border border-[#2a2a45] bg-[#13131f] px-3 py-1 font-mono text-xs text-[#8888aa]">
                          {formatDuration(attempt.duration)}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold tracking-[-0.02em] text-[#f0f0ff]">{attempt.promptTitle}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#8888aa]">{attempt.promptText}</p>
                      <p className="mt-3 text-xs text-[#44445a]">{formatDate(attempt.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="rounded-2xl border border-[#10b981]/20 bg-[#10b981]/10 px-4 py-3 text-center">
                        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#10b981]">Score</p>
                        <p className="mt-1 text-2xl font-bold tabular-nums text-[#10b981]">{attempt.overallScore}</p>
                      </div>
                      <div className="rounded-2xl border border-[#2a2a45] bg-[#080810] px-4 py-3 text-center">
                        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#8888aa]">Rubric</p>
                        <p className="mt-1 text-2xl font-bold tabular-nums text-[#f0f0ff]">{attempt.rubricScore}</p>
                      </div>
                    </div>
                  </div>

                  {!!attempt.fixes?.length && (
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {attempt.fixes.slice(0, 3).map((fix, index) => (
                        <p key={`${attempt.id}-${fix}`} className="rounded-xl border border-[#1e1e30] bg-[#080810] p-3 text-xs leading-5 text-[#8888aa]">
                          <span className="mr-2 font-bold text-[#44445a]">{String(index + 1).padStart(2, '0')}</span>
                          {fix}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#1e1e30] pt-4">
                    <div className="flex flex-wrap gap-3 text-xs text-[#44445a]">
                      <span>{attempt.summary.wordCount} words</span>
                      <span>{attempt.summary.averageWpm} WPM</span>
                      <span>{attempt.summary.fillerCount} fillers</span>
                      <span>{attempt.summary.silenceGapCount} pauses</span>
                    </div>
                    <Link
                      to={practiceUrl(attempt)}
                      className="rounded-[14px] border border-[#4f6ef7]/35 bg-[#4f6ef7]/10 px-4 py-2 text-sm font-semibold text-[#f0f0ff] transition hover:border-[#4f6ef7]"
                    >
                      Practice Again
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
