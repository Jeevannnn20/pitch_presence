import { forwardRef, useEffect } from 'react'

function formatTimer(seconds = 0) {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0')
  const remaining = String(safe % 60).padStart(2, '0')
  return `${minutes}:${remaining}`
}

const CameraFeed = forwardRef(function CameraFeed({ stream, isRecording, elapsedSeconds = 0, immersive = false, showOverlays = true }, ref) {
  useEffect(() => {
    if (ref?.current && stream) {
      ref.current.srcObject = stream
    }
  }, [ref, stream])

  return (
    <div
      className={`relative overflow-hidden bg-black ${
        immersive
          ? 'h-full min-h-0 rounded-none border-0 shadow-none'
          : 'min-h-[360px] rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.35)] lg:min-h-[620px]'
      } ${
        !immersive && !isRecording && stream ? 'animate-[readyBorder_3s_ease-in-out_infinite]' : immersive ? '' : 'border-white/10'
      }`}
    >
      <style>{`
        @keyframes readyBorder {
          0%, 100% { border-color: rgba(255,255,255,0.095); box-shadow: 0 0 0 rgba(255,255,255,0); }
          50% { border-color: rgba(255,255,255,0.2); box-shadow: 0 0 34px rgba(255,255,255,0.1); }
        }
        @keyframes recordPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.62; transform: scale(0.985); }
        }
      `}</style>
      <video
        ref={ref}
        className={immersive ? 'h-full w-full object-cover' : 'h-full min-h-[360px] w-full object-cover lg:min-h-[620px]'}
        autoPlay
        muted
        playsInline
        aria-label="Live camera preview"
      />
      {showOverlays && isRecording && (
        <div className="absolute bottom-14 left-4 flex animate-[recordPulse_1.5s_ease-in-out_infinite] items-center gap-2 rounded-full border border-[#ef4444]/25 bg-[#ef4444]/20 px-3 py-1.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.25)] backdrop-blur-md">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
          REC
        </div>
      )}
      {showOverlays && isRecording && (
        <div className="absolute bottom-14 right-4 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 font-mono text-sm font-semibold tabular-nums text-white backdrop-blur-md">
          {formatTimer(elapsedSeconds)}
        </div>
      )}
      <div className={immersive ? 'absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-medium text-white/60 backdrop-blur-md' : 'absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/45 px-4 py-3 text-sm font-medium text-white/60 backdrop-blur-md'}>
        Video stays on this device · Processed locally
      </div>
    </div>
  )
})

export default CameraFeed
