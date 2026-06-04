const metricCopy = {
  eyeContact: 'Eye contact',
  posture: 'Posture',
  headAlignment: 'Head alignment',
  movementControl: 'Movement control',
  energy: 'Energy'
}

const visionMetricKeys = new Set(['eyeContact', 'posture', 'headAlignment', 'movementControl'])

function tone(percent) {
  if (percent >= 70) return '#10b981'
  if (percent >= 40) return '#f59e0b'
  return '#ef4444'
}

function fillerTone(count) {
  if (count > 10) return 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ffb4b4]'
  if (count > 5) return 'border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#ffd28a]'
  return 'border-white/10 bg-white/[0.055] text-white/60'
}

function visionTone(status = {}) {
  if (status.state === 'tracking' && ['mediapipe', 'tasks-vision'].includes(status.source)) {
    return 'border-[#10b981]/25 bg-[#10b981]/10 text-[#a7f3d0]'
  }

  if (status.state === 'partial' || status.state === 'fallback') {
    return 'border-[#10b981]/25 bg-[#10b981]/10 text-[#a7f3d0]'
  }

  if (status.state === 'face-only' || status.state === 'degraded') {
    return 'border-[#f59e0b]/25 bg-[#f59e0b]/10 text-[#ffd28a]'
  }

  if (status.state === 'error') {
    return 'border-[#ef4444]/25 bg-[#ef4444]/10 text-[#ffb4b4]'
  }

  return 'border-white/10 bg-white/[0.055] text-white/60'
}

function visionLabel(status = {}) {
  if (status.state === 'tracking' && ['mediapipe', 'tasks-vision'].includes(status.source)) return 'Landmarks active'
  if (status.state === 'partial') return 'Face landmarks active'
  if (status.state === 'fallback') return 'Face fallback active'
  if (status.state === 'face-only') return 'Face only · no scoring'
  if (status.state === 'degraded') return 'Landmark lock required'
  if (status.state === 'ready') return 'Models ready'
  if (status.state === 'loading') return 'Loading vision'
  if (status.state === 'searching') return 'No person detected'
  return status.message || 'Vision offline'
}

export default function LiveMetrics({ metrics = {}, fillerCount = 0, visionStatus = {} }) {
  const hasVisionLock = ['tracking', 'partial', 'fallback'].includes(visionStatus?.state)

  return (
    <div className="pp-glass pp-glass-hover rounded-[24px] p-5">
      <style>{`
        @keyframes fillerFlash {
          0%, 100% { box-shadow: none; }
          50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.35); }
        }
      `}</style>
      <div className="mb-5">
        <p className="pp-label">Live Presence</p>
        <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">Room signals</h2>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${visionTone(visionStatus)}`}>
            {visionLabel(visionStatus)}
          </span>
          <span className="text-[11px] font-medium text-white/45">
            {hasVisionLock && visionStatus?.confidence
              ? `${visionStatus.confidence}% confidence`
              : 'Needs face in frame'}
          </span>
        </div>
      </div>
      <div className="space-y-5">
        {Object.entries(metricCopy).map(([key, label]) => {
          const unavailable = visionMetricKeys.has(key) && !hasVisionLock
          const value = Number.isFinite(metrics[key]) ? metrics[key] : 0
          const percent = unavailable ? 0 : Math.round(value * 100)
          const color = unavailable ? 'rgba(255,255,255,0.34)' : tone(percent)

          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white/75">{label}</span>
                <span
                  className="text-xl font-bold tabular-nums"
                  style={{ color, fontVariantNumeric: 'tabular-nums' }}
                >
                  {unavailable ? '--' : percent}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${percent}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <span className="text-sm font-medium text-white/75">Filler Words</span>
          <span
            key={fillerCount}
            className={`min-w-12 animate-[fillerFlash_0.45s_ease-out] rounded-full border px-3 py-1 text-center text-lg font-bold tabular-nums ${fillerTone(
              fillerCount
            )}`}
          >
            {fillerCount}
          </span>
        </div>
      </div>
    </div>
  )
}
