import { useMemo, useState } from 'react'
import { buildTranscriptReview, formatTranscriptTime } from '../lib/transcriptReview.js'

function tokenClass(token) {
  if (token.type !== 'word') return ''

  const base = 'mx-0.5 my-1 inline rounded-md px-1.5 py-1 leading-8 transition'

  if (token.flags.includes('filler')) {
    return `${base} border border-[#f59e0b]/25 bg-[#f59e0b]/10 text-[#ffd28a]`
  }

  if (token.flags.includes('moment_warning')) {
    return `${base} border border-[#ef4444]/25 bg-[#ef4444]/10 text-[#ffb4b4]`
  }

  if (token.flags.includes('moment_strength')) {
    return `${base} border border-[#10b981]/25 bg-[#10b981]/10 text-[#a7f3d0]`
  }

  if (token.flags.includes('fast')) {
    return `${base} border-b border-white/40 text-white`
  }

  if (token.flags.includes('slow')) {
    return `${base} border-b border-white/25 text-white/75`
  }

  return `${base} text-white/72 hover:bg-white/[0.055]`
}

function Stat({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="pp-label">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-white">{value}</p>
      {detail && <p className="mt-1 text-xs text-white/50">{detail}</p>}
    </div>
  )
}

export default function TranscriptReview({ signals = {}, moments = [] }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const review = useMemo(() => buildTranscriptReview(signals, moments), [signals, moments])
  const hasTranscript = review.tokens.some((token) => token.type === 'word')

  const filteredTokens = useMemo(() => {
    if (activeFilter === 'all') return review.tokens
    return review.tokens.filter((token) => token.type === 'pause' || token.flags?.includes(activeFilter))
  }, [activeFilter, review.tokens])

  if (!hasTranscript) {
    return (
      <section className="pp-glass rounded-[24px] p-5">
        <p className="pp-label">Transcript Review</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">No transcript available</h2>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Whisper did not return word-level timestamps for this attempt, so there is no transcript to annotate.
        </p>
      </section>
    )
  }

  const longestPause = review.summary.longestPause
  const fastestWindow = review.summary.fastestWindow

  return (
    <section className="pp-glass rounded-[24px] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="pp-label">Transcript Review</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">What you actually said</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Highlighted words connect the coaching back to filler language, pacing, pauses, and flagged moments.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ['all', 'All'],
            ['filler', 'Fillers'],
            ['fast', 'Fast'],
            ['slow', 'Slow'],
            ['moment_warning', 'Warnings']
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveFilter(value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeFilter === value
                  ? 'border-white/25 bg-white/15 text-white'
                  : 'border-white/10 bg-white/[0.045] text-white/60 hover:border-white/25'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Fillers" value={review.summary.fillerCount} detail="um, uh, like, so..." />
        <Stat label="Average WPM" value={review.summary.averageWpm} detail="Across the full answer" />
        <Stat
          label="Longest Pause"
          value={longestPause ? `${longestPause.duration.toFixed(1)}s` : '0s'}
          detail={longestPause ? `Around ${longestPause.displayStart}` : 'No dead air flagged'}
        />
        <Stat
          label="Fastest Window"
          value={fastestWindow ? `${fastestWindow.wpm}` : '0'}
          detail={fastestWindow ? `WPM around ${fastestWindow.displayStart}` : 'No pace window'}
        />
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-5">
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-3 py-1 text-[#ffd28a]">Filler</span>
          <span className="rounded-full border border-white/15 bg-white/[0.055] px-3 py-1 text-white/70">Fast pace</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/60">Slow pace</span>
          <span className="rounded-full border border-[#ef4444]/25 bg-[#ef4444]/10 px-3 py-1 text-[#ffb4b4]">Warning moment</span>
        </div>

        <div className="max-h-[420px] overflow-y-auto pr-2 text-[15px] leading-8">
          {filteredTokens.map((token) => {
            if (token.type === 'pause') {
              return (
                <span
                  key={token.id}
                  className="mx-2 inline-flex items-center rounded-full border border-[#ef4444]/25 bg-[#ef4444]/10 px-2 py-1 align-middle text-xs font-semibold text-[#ffb4b4]"
                  title={`Pause at ${token.displayStart}`}
                >
                  pause {token.duration.toFixed(1)}s
                </span>
              )
            }

            return (
              <button
                key={token.id}
                type="button"
                className={tokenClass(token)}
                title={`${formatTranscriptTime(token.start)}${token.linkedMoment ? ` · ${token.linkedMoment.message}` : ''}`}
              >
                {token.word}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
