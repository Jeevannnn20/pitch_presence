import { useMemo, useState } from 'react'
import FeedbackCard from './FeedbackCard.jsx'

function timestampToSeconds(timestamp) {
  if (typeof timestamp === 'number') return timestamp
  const parts = String(timestamp || '0:00').split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

export default function Timeline({ moments = [], duration = 1 }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = moments[selectedIndex]
  const safeDuration = Math.max(duration || 1, 1)

  const markers = useMemo(
    () =>
      moments.map((moment, index) => ({
        ...moment,
        index,
        left: Math.min(100, Math.max(0, (timestampToSeconds(moment.timestamp) / safeDuration) * 100))
      })),
    [moments, safeDuration]
  )

  if (!moments.length) {
    return (
      <section className="pp-glass rounded-[24px] p-6">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">Moment Timeline</h2>
        <p className="mt-2 text-white/60">No timestamped moments were generated for this recording.</p>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <div className="pp-glass pp-glass-hover rounded-[24px] p-6">
        <div className="mb-12 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">Moment Timeline</h2>
          <p className="text-sm font-semibold text-white/50">{Math.round(safeDuration)}s</p>
        </div>
        <div className="relative h-20">
          {[0, 25, 50, 75, 100].map((mark) => (
            <span
              key={mark}
              className="absolute top-0 -translate-x-1/2 text-[11px] font-medium text-white/40"
              style={{ left: `${mark}%` }}
            >
              {Math.round((safeDuration * mark) / 100)}s
            </span>
          ))}
          <div className="absolute left-0 right-0 top-12 h-0.5 rounded-full bg-white/10" />
          {markers.map((moment) => {
            const active = moment.index === selectedIndex
            const isStrength = moment.type === 'strength'

            return (
              <div key={`${moment.timestamp}-${moment.index}`} className="group absolute top-12 -translate-x-1/2 -translate-y-1/2" style={{ left: `${moment.left}%` }}>
                <button
                  type="button"
                  className={`h-3.5 w-3.5 rounded-full transition ${
                    isStrength ? 'bg-[#10b981] hover:shadow-[0_0_20px_rgba(16,185,129,0.45)]' : 'bg-[#ef4444] hover:shadow-[0_0_20px_rgba(239,68,68,0.45)]'
                  } ${active ? 'scale-150 ring-4 ring-white/15' : 'hover:scale-125'}`}
                  onClick={() => setSelectedIndex(moment.index)}
                  aria-label={`Show feedback at ${moment.timestamp}`}
                />
                <div className="pointer-events-none absolute bottom-7 left-1/2 z-10 w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/70 p-3 text-left opacity-0 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition group-hover:opacity-100">
                  <p className="font-mono text-xs text-white/50">{moment.timestamp}</p>
                  <p className="mt-1 text-xs leading-5 text-white/85">{moment.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <FeedbackCard moment={selected} />
    </section>
  )
}
