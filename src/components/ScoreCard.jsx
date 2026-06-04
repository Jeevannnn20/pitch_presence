const labels = {
  eyeContact: 'Eye Contact',
  posture: 'Posture',
  energy: 'Energy',
  pace: 'Pace',
  clarity: 'Clarity'
}

function scoreColor(score) {
  if (score > 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export default function ScoreCard({ scores = {} }) {
  return (
    <section className="grid grid-cols-3 justify-items-center gap-x-3 gap-y-7 lg:grid-cols-5" aria-label="Scorecard">
      {Object.entries(labels).map(([key, label]) => {
        const item = scores?.[key] || { score: 0, comment: 'No score available.' }
        const score = Math.max(0, Math.min(100, Math.round(item.score || 0)))
        const radius = 42
        const circumference = 2 * Math.PI * radius
        const dashOffset = circumference - (score / 100) * circumference

        return (
          <article key={key} className="flex max-w-[124px] flex-col items-center text-center">
            <div className="relative h-[100px] w-[100px]" aria-label={`${label} score ${score}`}>
              <svg className="-rotate-90" width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={scoreColor(score)}
                  strokeLinecap="round"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-[stroke-dashoffset] duration-1000 ease-out"
                  style={{ filter: `drop-shadow(0 0 10px ${scoreColor(score)}55)` }}
                />
              </svg>
              <span
                className="absolute inset-0 grid place-items-center text-[22px] font-bold text-white tabular-nums"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {score}
              </span>
            </div>
            <h3 className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-white/50">{label}</h3>
            <p className="mt-2 max-w-[110px] text-center text-[11px] italic leading-5 text-white/40">{item.comment}</p>
          </article>
        )
      })}
    </section>
  )
}
