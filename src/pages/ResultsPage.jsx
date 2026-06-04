import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ScoreCard from '../components/ScoreCard.jsx'
import Timeline from '../components/Timeline.jsx'
import TranscriptReview from '../components/TranscriptReview.jsx'
import { saveAttempt } from '../lib/history.js'

function readStoredResult() {
  try {
    const stored = sessionStorage.getItem('pitch-presence-result')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function formatDuration(seconds = 0) {
  const safe = Math.max(0, Math.round(seconds))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

function practiceUrl(practiceContext, selectedMode) {
  if (!practiceContext) return '/record'
  const params = new URLSearchParams({
    mode: selectedMode || practiceContext.mode || 'Startup Pitch',
    target: practiceContext.targetId || '',
    prompt: practiceContext.promptId || ''
  })

  if (practiceContext.isCustomPrompt && practiceContext.promptText) {
    params.set('custom', practiceContext.promptText)
  }

  return `/record?${params.toString()}`
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const result = useMemo(() => location.state || readStoredResult(), [location.state])
  const debrief = result?.debrief
  const signals = result?.signals
  const selectedMode = result?.selectedMode || signals?.selectedMode || 'Startup Pitch'
  const practiceContext = result?.practiceContext || signals?.practiceContext
  const rubricBaseline = result?.rubricBaseline || signals?.rubricBaseline
  const attemptQuality = signals?.attemptQuality
  const contentCoverage = signals?.contentCoverage

  useEffect(() => {
    if (result?.debrief && result?.signals) {
      saveAttempt(result)
    }
  }, [result])

  async function shareResults() {
    if (!debrief || !signals) return
    const summary = [
      `Pitch Presence Coach - ${selectedMode}`,
      practiceContext ? `Scenario: ${practiceContext.targetName} - ${practiceContext.promptTitle}` : '',
      `Duration: ${formatDuration(signals.duration)}`,
      `Verdict: ${debrief.verdict}`,
      rubricBaseline ? `Local rubric baseline: ${rubricBaseline.overall}` : '',
      `Scores: ${Object.entries(debrief.scores || {})
        .map(([key, value]) => `${key} ${value.score}`)
        .join(', ')}`,
      `Fixes: ${(debrief.fixes || []).join(' | ')}`
    ].filter(Boolean).join('\n')

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(summary)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = summary
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  if (!debrief || !signals) {
    return (
      <main className="pp-page grid min-h-screen place-items-center px-4 text-white">
        <div className="pp-glass max-w-md rounded-[28px] p-6 text-center">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">No debrief yet</h1>
          <p className="mt-3 text-white/60">Record a pitch first so the coach has signal data to analyze.</p>
          <Link
            to="/record"
            className="pp-primary mt-5 inline-flex rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            Go to Recorder
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pp-page min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <style>{`
        @keyframes pageIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="mx-auto max-w-7xl animate-[pageIn_0.3s_ease-out] space-y-8">
        <header>
          <div className="mb-5 flex items-center justify-between gap-4">
            <button type="button" onClick={() => navigate('/record')} className="text-sm font-medium text-white/50 transition hover:text-white">
              ← Record Again
            </button>
            <div className="flex flex-wrap justify-end gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-semibold text-white/70">{selectedMode}</span>
              {practiceContext && (
                <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-semibold text-white/70">
                  {practiceContext.targetName}
                </span>
              )}
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 font-mono text-xs text-white/50">{formatDuration(signals.duration)}</span>
            </div>
          </div>
          <h1 className="text-center text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">Pitch Debrief</h1>
          <div className="pp-glass mt-7 rounded-[24px] border-l-[3px] border-l-white/30 p-5">
            <p className="text-base leading-[1.7] text-white/90">{debrief.verdict}</p>
          </div>
        </header>

        {practiceContext && (
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="pp-glass rounded-[24px] p-5">
              <p className="pp-label">Scenario Practiced</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">
                {practiceContext.targetName}: {practiceContext.promptTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/60">{practiceContext.interviewerStyle}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[15px] leading-7 text-white/80">{practiceContext.promptText}</p>
              </div>
              <p className="mt-3 text-xs leading-5 text-white/40">{practiceContext.sourceBasis}</p>
              {!!practiceContext.referenceLinks?.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {practiceContext.referenceLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-medium text-white/60 transition hover:border-white/25 hover:text-white"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </article>

            {rubricBaseline && (
              <article className="pp-glass rounded-[24px] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="pp-label">Local Rubric Baseline</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">Reference score</h2>
                  </div>
                  <span className="rounded-full border border-[#10b981]/25 bg-[#10b981]/10 px-4 py-2 text-2xl font-bold tabular-nums text-[#10b981]">
                    {rubricBaseline.overall}
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {(rubricBaseline.dimensions || []).map((dimension) => (
                    <div key={dimension.name}>
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-white/80">{dimension.name}</span>
                        <span className="font-mono text-sm text-white/50">{dimension.score}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-white/75"
                          style={{ width: `${dimension.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-white/40">{rubricBaseline.basis}</p>
              </article>
            )}
          </section>
        )}

        {(attemptQuality || contentCoverage) && (
          <section className="grid gap-4 lg:grid-cols-2">
            {attemptQuality && (
              <article className="pp-glass rounded-[24px] p-5">
                <p className="pp-label">Attempt Quality</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs text-white/40">Status</p>
                    <p className="mt-1 text-sm font-semibold capitalize text-white/80">
                      {String(attemptQuality.status || 'unknown').replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs text-white/40">Words</p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-white">{attemptQuality.wordCount || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs text-white/40">Score cap</p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-white">{attemptQuality.maxScore ?? 100}</p>
                  </div>
                </div>
                {!!attemptQuality.warnings?.length && (
                  <p className="mt-4 text-sm leading-6 text-[#f59e0b]">{attemptQuality.warnings[0]}</p>
                )}
              </article>
            )}

            {contentCoverage && (
              <article className="pp-glass rounded-[24px] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="pp-label">Answer Coverage</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">Expected concepts</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-xl font-bold tabular-nums text-white">
                    {contentCoverage.score || 0}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/50">
                  Covered {contentCoverage.coveredCount || 0} of {contentCoverage.totalCount || 0} answer-key elements.
                </p>
                {!!contentCoverage.missed?.length && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {contentCoverage.missed.slice(0, 5).map((item) => (
                      <span key={item.label} className="rounded-full border border-[#ef4444]/20 bg-[#ef4444]/10 px-3 py-1 text-xs font-medium text-[#ffb4b4]">
                        Missing: {item.label}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            )}
          </section>
        )}

        <section className="pp-glass rounded-[24px] p-5 sm:p-6">
          <ScoreCard scores={debrief.scores} />
        </section>

        <Timeline moments={debrief.moments || []} duration={signals.duration} />

        <TranscriptReview signals={signals} moments={debrief.moments || []} />

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-[-0.02em] text-white">3 Things to Fix</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {(debrief.fixes || []).map((fix, index) => (
              <article
                key={fix}
                className="pp-glass pp-glass-hover rounded-[24px] p-5"
              >
                <p className="text-5xl font-bold leading-none text-white/20">{String(index + 1).padStart(2, '0')}</p>
                <p className="mt-5 text-[15px] font-medium leading-[1.6] text-white/80">{fix}</p>
                <p className="mt-6 text-xs font-semibold text-white/60">Practice this →</p>
              </article>
            ))}
          </div>
        </section>

        <div className="flex flex-col items-center justify-center gap-3 pb-8 sm:flex-row">
          <Link
            to={practiceUrl(practiceContext, selectedMode)}
            className="pp-primary grid h-12 place-items-center rounded-2xl px-6 text-sm font-semibold transition"
          >
            Practice Again
          </Link>
          <Link
            to="/history"
            className="grid h-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/[0.08]"
          >
            View History
          </Link>
          <button
            type="button"
            onClick={shareResults}
            className="h-12 rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/[0.08]"
          >
            Share Results
          </button>
        </div>
      </div>

      {copied && (
        <div className="fixed bottom-5 right-5 animate-[toastIn_0.2s_ease-out] rounded-full border border-[#10b981]/25 bg-[#10b981]/10 px-4 py-2 text-sm font-semibold text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          Copied!
        </div>
      )}
    </main>
  )
}
