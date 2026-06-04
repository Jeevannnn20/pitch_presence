export default function FeedbackCard({ moment }) {
  if (!moment) return null

  const isStrength = moment.type === 'strength'

  return (
    <article
      key={`${moment.timestamp}-${moment.message}`}
      className={`pp-glass animate-[feedbackIn_0.25s_ease-out] rounded-[24px] p-5 ${
        isStrength ? 'border-l-4 border-l-[#10b981]' : 'border-l-4 border-l-[#ef4444]'
      }`}
    >
      <style>{`
        @keyframes feedbackIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-full ${isStrength ? 'bg-[#10b981]/10 text-[#9ff4d0]' : 'bg-[#ef4444]/10 text-[#ffb4b4]'}`}>
          {isStrength ? '✓' : '⚠'}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 font-mono text-sm text-white/85">
          {moment.timestamp}
        </span>
        <span className={`text-sm font-semibold ${isStrength ? 'text-[#9ff4d0]' : 'text-[#ffb4b4]'}`}>
          {isStrength ? 'Strength' : 'Warning'}
        </span>
      </div>
      <p className="mt-4 text-base leading-7 text-white/90">{moment.message}</p>
    </article>
  )
}
