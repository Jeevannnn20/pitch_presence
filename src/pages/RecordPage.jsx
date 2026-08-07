import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import CameraFeed from '../components/CameraFeed.jsx'
import LiveMetrics from '../components/LiveMetrics.jsx'
import useAudioAnalyzer from '../hooks/useAudioAnalyzer.js'
import useMediaPipe from '../hooks/useMediaPipe.js'
import useRecorder from '../hooks/useRecorder.js'
import useWhisper from '../hooks/useWhisper.js'
import {
  buildPracticeContext,
  computeRubricBaseline,
  getModePack,
  getPrompt,
  getTarget
} from '../data/interviewPacks.js'
import analyzeSignals from '../lib/analyzeSignals.js'
import { getClaudeDebrief } from '../lib/claudeDebrief.js'
import AccountMenu from '../components/AccountMenu.jsx'

// Display grouping for the mode picker. Categories render as labeled sections in
// this order; a mode's `category` must match one of these strings.
const CATEGORY_ORDER = ['Job Interviews', 'HR / Behavioral', 'Admissions', 'Pitch & Sales']

const modes = [
  {
    title: 'Startup Pitch',
    category: 'Pitch & Sales',
    subtitle: 'Investor presence + conviction',
    focus: 'conviction, storytelling arc, investor presence signals',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M12 3c3.2 1.7 5 4.4 5 8l3 3-4 1-1 4-3-3c-3.6 0-6.3-1.8-8-5 3.2-.4 5.6-2.8 6-6l2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M14 8.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Case Interview',
    category: 'Job Interviews',
    subtitle: 'Structure + frameworks',
    focus: 'structured pauses, framework clarity, logical pacing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M9 7V5.8C9 4.8 9.8 4 10.8 4h2.4c1 0 1.8.8 1.8 1.8V7" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 7h14v11.5c0 .8-.7 1.5-1.5 1.5h-11c-.8 0-1.5-.7-1.5-1.5V7Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 12h14M10 12v1h4v-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Tech Interview',
    category: 'Job Interviews',
    subtitle: 'Clarity + confidence',
    focus: 'explanation clarity, confidence when uncertain, pacing on complex ideas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="m9 7-5 5 5 5M15 7l5 5-5 5M13 5l-2 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'Product Management',
    category: 'Job Interviews',
    subtitle: 'Product sense + execution',
    focus: 'product sense, user empathy, metrics, prioritization, strategy, and leadership communication',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M4 12.5 12 17l8-4.5M4 17.5 12 22l8-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'Software Engineering',
    category: 'Job Interviews',
    subtitle: 'Design + tradeoffs',
    focus: 'technical decomposition, code quality, system tradeoffs, collaboration, and learning agility',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M7 8h10M7 12h7M7 16h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M5.5 3.5h13c.8 0 1.5.7 1.5 1.5v14c0 .8-.7 1.5-1.5 1.5h-13c-.8 0-1.5-.7-1.5-1.5V5c0-.8.7-1.5 1.5-1.5Z" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    )
  },
  {
    title: 'DSA Problem Solving',
    category: 'Job Interviews',
    subtitle: 'Algorithms + narration',
    focus: 'problem clarification, algorithm choice, edge cases, complexity analysis, and calm step-by-step reasoning',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M8.5 7h7M7 8.5v7M8.5 17h7M17 8.5v7M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Developer Relations',
    category: 'Job Interviews',
    subtitle: 'Demo + technical story',
    focus: 'developer empathy, technical demo clarity, API explanation, community trust, and persuasive teaching',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M8 9.5 5.5 12 8 14.5M16 9.5l2.5 2.5-2.5 2.5M13.5 7 10.5 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 4h16v16H4V4Z" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    )
  },
  {
    title: 'Campus Placement',
    category: 'Job Interviews',
    subtitle: 'On-campus + service cos',
    focus: 'self-introduction clarity, project explanation, company fit, and calm confidence under standard placement questions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M4 20V7l8-3.5L20 7v13M4 20h16" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 20v-4h6v4M9 9.5h.01M15 9.5h.01M9 13h.01M15 13h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'HR / Behavioral',
    category: 'HR / Behavioral',
    subtitle: 'STAR stories + fit',
    focus: 'STAR structure, honest self-reflection, ownership, and composure on personal and behavioral questions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Admissions',
    category: 'Admissions',
    subtitle: 'MBA · grad · scholarship',
    focus: 'motivation clarity, goal specificity, research or program fit, and authentic reflective delivery',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M3 9l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M7 11v4c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4M21 9v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'Sales Call',
    category: 'Pitch & Sales',
    subtitle: 'Energy + persuasion',
    focus: 'energy arc, persuasion buildup, closing energy in final 30 seconds',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M4 19h16M6 16l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 8h3v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
]

function formatTimer(seconds = 0) {
  const safe = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

function StatusBadge({ status }) {
  const normalized = String(status || 'Idle')
  const styles = {
    Ready: 'border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]',
    Idle: 'border-white/10 bg-white/[0.055] text-white/50',
    Waiting: 'border-white/10 bg-white/[0.055] text-white/50',
    Recording: 'animate-[recordPulse_1.5s_ease-in-out_infinite] border-[#ef4444]/25 bg-[#ef4444]/10 text-[#ef4444]',
    Processing: 'border-white/15 bg-white/10 text-white/70',
    Error: 'border-[#ef4444]/25 bg-[#ef4444]/10 text-[#ef4444]'
  }

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[normalized] || styles.Idle}`}>
      {normalized}
    </span>
  )
}

function ProcessingScreen({ stage, message, whisperStatus, whisperProgress }) {
  const steps = [
    ['stopping', 'Recording complete'],
    ['transcribing', 'Transcribing with Whisper'],
    ['analyzing', 'Analyzing signals'],
    ['debrief', 'Generating debrief']
  ]
  const activeIndex = Math.max(0, steps.findIndex(([key]) => key === stage))
  const stagedProgress = stage === 'transcribing' ? Math.max(30, Math.min(90, 30 + whisperProgress * 0.6)) : (activeIndex + 1) * 25

  return (
    <div className="pp-page fixed inset-0 z-30 grid place-items-center px-4">
      <style>{`
        @keyframes orbSpin { to { transform: rotate(360deg); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="w-full max-w-md text-center">
        <div className="mx-auto h-28 w-28 animate-[orbSpin_4s_linear_infinite] rounded-full bg-[conic-gradient(from_90deg,#4f6ef7,#8b5cf6,#10b981,#4f6ef7)] p-1 shadow-[0_0_60px_rgba(79,110,247,0.35)]">
          <div className="h-full w-full rounded-full bg-[#070708]" />
        </div>
        <h1 className="mt-8 text-2xl font-semibold tracking-[-0.02em] text-white">{message}</h1>
        <div className="mx-auto mt-7 max-w-sm space-y-3 text-left">
          {steps.map(([key, label], index) => {
            const done = index < activeIndex || (key === 'transcribing' && whisperStatus === 'complete')
            const active = index === activeIndex
            return (
              <div key={key} className="flex items-center gap-3 text-sm font-medium text-white/50">
                {done ? (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[#10b981]/10 text-[#10b981]">✓</span>
                ) : active ? (
                  <span className="h-5 w-5 animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-white/40 border-t-transparent" />
                ) : (
                  <span className="h-5 w-5 rounded-full border border-white/10" />
                )}
                <span className={active || done ? 'text-white' : ''}>{label}</span>
              </div>
            )
          })}
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${stagedProgress}%` }} />
          </div>
        </div>
        <p className="mt-8 text-sm text-white/40">Your video never leaves this device</p>
      </div>
    </div>
  )
}

export default function RecordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const recognizedTextRef = useRef('')
  const [stream, setStream] = useState(null)
  const [permissionError, setPermissionError] = useState('')
  const [view, setView] = useState('setup')
  const [phase, setPhase] = useState('ready')
  const [processingMessage, setProcessingMessage] = useState('')
  const [processingStage, setProcessingStage] = useState('stopping')
  const [selectedMode, setSelectedMode] = useState(() => searchParams.get('mode') || 'Startup Pitch')
  const [selectedTargetId, setSelectedTargetId] = useState(() => searchParams.get('target') || 'yc-seed')
  const [selectedPromptId, setSelectedPromptId] = useState(() => searchParams.get('prompt') || 'why-now')
  const [customPrompt, setCustomPrompt] = useState(() => searchParams.get('custom') || '')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [liveFillerCount, setLiveFillerCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { isRecording, startRecording, stopRecording } = useRecorder(stream)
  const {
    visionMetrics,
    visionSamples,
    resetVisionSamples,
    startCalibration,
    calibrationStatus,
    calibrationProgress,
    calibrationProfile,
    visionStatus
  } = useMediaPipe(videoRef, isRecording)
  const { energy, energySamples, resetAudioSamples, resumeAudio } = useAudioAnalyzer(stream, isRecording)
  const { transcribe, whisperStatus, whisperProgress } = useWhisper()

  const requestMedia = useCallback(async () => {
    if (streamRef.current) return streamRef.current

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })

      streamRef.current = mediaStream
      setStream(mediaStream)
      setPermissionError('')
      return mediaStream
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Camera and microphone permissions are required to run Pitch Presence Coach.'
      setPermissionError(message)
      throw new Error(message)
    }
  }, [])

  const stopMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
  }, [])

  useEffect(() => {
    return () => stopMedia()
  }, [stopMedia])

  useEffect(() => {
    if (!isRecording) return undefined
    const startedAt = Date.now()
    const interval = window.setInterval(() => setElapsedSeconds((Date.now() - startedAt) / 1000), 250)
    return () => window.clearInterval(interval)
  }, [isRecording])

  const liveMetrics = useMemo(
    () => ({
      eyeContact: visionMetrics.eyeContact,
      posture: visionMetrics.posture,
      headAlignment: visionMetrics.headAlignment,
      movementControl: visionMetrics.movementControl,
      energy
    }),
    [energy, visionMetrics]
  )

  const selectedModeConfig = useMemo(() => modes.find((mode) => mode.title === selectedMode) || modes[0], [selectedMode])
  const modePack = useMemo(() => getModePack(selectedMode), [selectedMode])
  const selectedTarget = useMemo(() => getTarget(selectedMode, selectedTargetId), [selectedMode, selectedTargetId])
  const selectedPrompt = useMemo(
    () => getPrompt(selectedMode, selectedTarget.id, selectedPromptId),
    [selectedMode, selectedTarget.id, selectedPromptId]
  )

  useEffect(() => {
    const nextPack = getModePack(selectedMode)
    const targetExists = nextPack.targets.some((target) => target.id === selectedTargetId)
    if (!targetExists) {
      const nextTarget = nextPack.targets[0]
      setSelectedTargetId(nextTarget.id)
      setSelectedPromptId(nextTarget.prompts[0].id)
    }
  }, [selectedMode, selectedTargetId])

  useEffect(() => {
    const nextTarget = getTarget(selectedMode, selectedTargetId)
    const promptExists = nextTarget.prompts.some((prompt) => prompt.id === selectedPromptId)
    if (!promptExists) {
      setSelectedPromptId(nextTarget.prompts[0].id)
    }
  }, [selectedMode, selectedTargetId, selectedPromptId])

  function selectMode(modeTitle) {
    setSelectedMode(modeTitle)
    setCustomPrompt('')
  }

  function selectTarget(targetId) {
    setSelectedTargetId(targetId)
    setCustomPrompt('')
  }

  function selectPrompt(promptId) {
    setSelectedPromptId(promptId)
    setCustomPrompt('')
  }

  async function enterStudio() {
    setView('studio')
    try {
      await requestMedia()
    } catch {
      // The studio still opens so the user can see exactly what permission is missing.
    }
  }

  function returnToSetup() {
    if (isRecording || isBusy) return
    stopMedia()
    setView('setup')
  }

  async function handleStart() {
    if (phase === 'processing') return
    if (!stream) {
      try {
        await requestMedia()
      } catch {
        return
      }
    }
    setElapsedSeconds(0)
    setLiveFillerCount(0)
    recognizedTextRef.current = ''
    setPhase('recording')
    resetVisionSamples()
    resetAudioSamples()
    await resumeAudio()
    startRecording()

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.onresult = (event) => {
        let nextText = ''
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          nextText += `${event.results[index][0].transcript} `
        }
        recognizedTextRef.current += nextText
        const matches = recognizedTextRef.current
          .toLowerCase()
          .match(/\b(um|uh|like|basically|literally|so|right)\b|\byou know\b/g)
        setLiveFillerCount(matches?.length || 0)
      }
      recognitionRef.current = recognition
      try {
        recognition.start()
      } catch {
        recognitionRef.current = null
      }
    }
  }

  async function handleStop() {
    setPhase('processing')
    setProcessingStage('stopping')
    setProcessingMessage('Recording complete')
    recognitionRef.current?.stop()
    recognitionRef.current = null

    try {
      const { blob, duration } = await stopRecording()

      setProcessingStage('transcribing')
      setProcessingMessage('Transcribing with Whisper')
      let transcript

      try {
        transcript = await transcribe(blob)
      } catch (error) {
        transcript = { text: '', words: [] }
      }

      const browserTranscript = recognizedTextRef.current.trim()
      if (browserTranscript && !transcript.text?.trim()) {
        transcript = { ...transcript, text: browserTranscript }
      }

      setProcessingStage('analyzing')
      setProcessingMessage('Analyzing signals')
      const practiceContext = buildPracticeContext({
        mode: selectedMode,
        targetId: selectedTargetId,
        promptId: selectedPromptId,
        customPrompt
      })
      const localSignals = analyzeSignals({
        selectedMode,
        transcript,
        practiceContext,
        visionSamples: {
          eyeContact: [...visionSamples.eyeContact],
          posture: [...visionSamples.posture],
          headAlignment: [...(visionSamples.headAlignment || [])],
          movementControl: [...(visionSamples.movementControl || [])]
        },
        energySamples: [...energySamples],
        duration
      })
      const rubricBaseline = computeRubricBaseline(localSignals, practiceContext)
      const signals = {
        ...localSignals,
        selectedMode,
        calibration: {
          status: calibrationStatus,
          usedPersonalBaseline: Boolean(calibrationProfile)
        },
        visionQuality: visionStatus,
        practiceContext,
        rubricBaseline,
        coachingContext: `The user is practicing a ${practiceContext.mode} for ${practiceContext.targetName}. Tailor feedback to ${practiceContext.focus}. Interviewer style: ${practiceContext.interviewerStyle}. Problem statement: ${practiceContext.promptText}. Treat the included rubricBaseline as the local benchmark, not as a replacement for qualitative coaching.`
      }

      setProcessingStage('debrief')
      setProcessingMessage('Generating debrief')
      const debrief = await getClaudeDebrief(signals)
      const result = { debrief, signals, duration, selectedMode, practiceContext, rubricBaseline }

      sessionStorage.setItem('pitch-presence-result', JSON.stringify(result))
      navigate('/results', { state: result })
    } catch (error) {
      setPhase('ready')
      setProcessingMessage('')
      setPermissionError(error instanceof Error ? error.message : 'Recording failed. Please try again.')
    }
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (view !== 'studio' || event.code !== 'Space' || event.repeat || phase === 'processing') return
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName)) return
      event.preventDefault()
      if (isRecording) {
        handleStop()
      } else {
        handleStart()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isRecording, phase, stream, view])

  const isBusy = phase === 'processing'
  const sessionStatus =
    view === 'setup'
      ? 'Choose Practice'
      : isBusy
        ? 'Processing'
        : isRecording
          ? 'Recording'
          : stream
            ? 'Ready to Record'
            : 'Waiting for Camera'
  const activePromptText = customPrompt.trim() || selectedPrompt.text

  if (view === 'studio') {
    return (
      <main className="fixed inset-0 overflow-hidden bg-black text-white">
        <style>{`
          @keyframes pageIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes recordPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>

        <CameraFeed
          ref={videoRef}
          stream={stream}
          isRecording={isRecording}
          elapsedSeconds={elapsedSeconds}
          immersive
          showOverlays={false}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/65 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="pp-pill absolute left-4 top-4 flex items-center gap-3 px-3 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.07] text-white/80">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M4 13v-2M8 17V7M12 20V4M16 16V8M20 13v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Pitch Presence</p>
            <p className="text-[11px] text-white/50">{selectedTarget.name}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={returnToSetup}
          disabled={isRecording || isBusy}
          className="pp-pill absolute left-4 top-20 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/25 disabled:opacity-40"
        >
          Change setup
        </button>

        <div className="pp-pill absolute left-1/2 top-4 -translate-x-1/2 px-4 py-2 font-mono text-sm font-semibold tabular-nums text-white">
          {isRecording && <span className="mr-2 inline-block h-2 w-2 animate-[recordPulse_1.5s_ease-in-out_infinite] rounded-full bg-[#ef4444]" />}
          {formatTimer(elapsedSeconds)}
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          className="pp-pill absolute right-4 top-4 z-30 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/25"
        >
          {sidebarOpen ? 'Hide panel' : 'Show panel'}
        </button>

        <aside
          className={`absolute bottom-4 right-4 top-16 z-20 w-[390px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[28px] border border-white/15 bg-black/70 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1.5rem)]'
          }`}
        >
          <div className="space-y-4">
            {permissionError && (
              <div className="rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-4 text-sm font-semibold text-[#ef4444]">
                {permissionError}
              </div>
            )}

            <section className="rounded-[22px] border border-white/10 bg-black/45 p-4">
              <p className="pp-label">Problem Statement</p>
              <h1 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white">
                {customPrompt.trim() ? 'Custom prompt' : selectedPrompt.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/80">{activePromptText}</p>
            </section>

            <section className="rounded-[22px] border border-white/10 bg-black/45 p-4">
              <p className="pp-label">Coaching Info</p>
              <p className="mt-2 text-sm leading-6 text-white/60">{selectedTarget.focus}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedTarget.rubric.map((dimension) => (
                  <span
                    key={dimension.name}
                    className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-medium text-white/60"
                  >
                    {dimension.name}
                  </span>
                ))}
              </div>
            </section>

            <div className="[&>div]:border-white/10 [&>div]:bg-black/45 [&>div]:shadow-none [&>div]:backdrop-blur-xl">
              <LiveMetrics metrics={liveMetrics} fillerCount={liveFillerCount} visionStatus={visionStatus} />
            </div>

            <section className="rounded-[22px] border border-white/10 bg-black/45 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="pp-label">Session</p>
                  <p className="mt-1 text-sm text-white/60">{sessionStatus}</p>
                </div>
                <StatusBadge status={stream ? 'Ready' : permissionError ? 'Error' : 'Waiting'} />
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-medium text-white/50">Vision</dt>
                  <dd><StatusBadge status={['ready', 'tracking', 'partial', 'fallback', 'searching'].includes(visionStatus?.state) ? 'Ready' : visionStatus?.state === 'error' ? 'Error' : 'Processing'} /></dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-medium text-white/50">Recorder</dt>
                  <dd><StatusBadge status={isRecording ? 'Recording' : isBusy ? 'Processing' : 'Idle'} /></dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-medium text-white/50">Whisper</dt>
                  <dd><StatusBadge status={isBusy ? 'Processing' : whisperStatus === 'error' ? 'Error' : 'Idle'} /></dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-medium text-white/50">Calibration</dt>
                  <dd><StatusBadge status={calibrationStatus === 'ready' ? 'Ready' : calibrationStatus === 'failed' ? 'Error' : 'Idle'} /></dd>
                </div>
              </dl>
            </section>
          </div>
        </aside>

        <div className="absolute bottom-5 left-1/2 z-30 flex w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 items-center justify-center gap-3 rounded-[28px] border border-white/10 bg-black/32 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => startCalibration(3000)}
            disabled={!stream || isRecording || calibrationStatus === 'calibrating'}
            className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {calibrationStatus === 'calibrating' ? 'Hold still...' : calibrationStatus === 'ready' ? 'Recalibrate' : 'Calibrate'}
          </button>

          {!isRecording ? (
            <button
              type="button"
              onClick={handleStart}
              disabled={!stream || isBusy}
              className="pp-primary h-14 flex-[1.4] rounded-2xl px-5 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
            >
              Start Recording
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="h-14 flex-[1.4] animate-[recordPulse_1.5s_ease-in-out_infinite] rounded-2xl bg-[#ef4444] px-5 text-base font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] transition hover:brightness-110"
            >
              Stop Recording
            </button>
          )}

          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/10"
          >
            {sidebarOpen ? 'Hide' : 'Panel'}
          </button>
        </div>

        {calibrationStatus === 'calibrating' && (
          <div className="absolute bottom-24 left-1/2 z-30 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-full border border-white/10 bg-black/35 p-2 backdrop-blur-xl">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4f6ef7] to-[#8b5cf6] transition-all duration-150"
                style={{ width: `${Math.round(calibrationProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {isBusy && (
          <ProcessingScreen
            stage={processingStage}
            message={processingMessage}
            whisperStatus={whisperStatus}
            whisperProgress={whisperProgress}
          />
        )}
      </main>
    )
  }

  return (
    <main className="pp-page min-h-screen px-4 py-4 text-white sm:px-6 lg:px-8">
      <style>{`
        @keyframes pageIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes recordPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="mx-auto max-w-7xl animate-[pageIn_0.3s_ease-out]">
        <nav className="mb-6 flex min-h-10 items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="pp-pill grid h-9 w-9 place-items-center rounded-full text-white/80">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M4 13v-2M8 17V7M12 20V4M16 16V8M20 13v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-white sm:text-base">Pitch Presence</span>
          </div>
          <div className="pp-pill px-3 py-1.5 text-xs font-medium text-white/60 sm:text-sm">
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${
                isBusy ? 'animate-[spin_0.8s_linear_infinite] border border-white/40 border-t-transparent' : isRecording ? 'animate-[recordPulse_1.5s_ease-in-out_infinite] bg-[#ef4444]' : 'bg-white/40'
              }`}
            />
            {sessionStatus}
          </div>
          <p className="hidden text-xs text-white/40 sm:block">
            {view === 'studio' ? 'Press Space to start' : 'Setup first, record next'}
          </p>
          <Link
            to="/history"
            className="pp-pill hidden px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:border-white/25 hover:text-white lg:inline-flex"
          >
            History
          </Link>
          <AccountMenu />
        </nav>

        {view === 'setup' ? (
          <>
            <div className="mb-6 space-y-5">
              {CATEGORY_ORDER.map((category) => {
                const categoryModes = modes.filter((mode) => mode.category === category)
                if (!categoryModes.length) return null
                return (
                  <section key={category}>
                    <p className="pp-label mb-2">{category}</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {categoryModes.map((mode) => {
                        const active = selectedMode === mode.title
                        return (
                          <button
                            key={mode.title}
                            type="button"
                            onClick={() => selectMode(mode.title)}
                            className={`rounded-[24px] border p-4 text-left transition duration-150 hover:scale-[1.02] ${
                              active
                                ? 'border-white/25 bg-white/[0.12] shadow-[0_22px_70px_rgba(0,0,0,0.28)]'
                                : 'border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.075]'
                            }`}
                          >
                            <span className={active ? 'text-white' : 'text-white/50'}>{mode.icon}</span>
                            <span className="mt-3 block text-[15px] font-semibold tracking-[-0.02em] text-white">{mode.title}</span>
                            <span className="mt-1 block text-[11px] text-white/40">{mode.subtitle}</span>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="pp-glass rounded-[28px] p-6">
                <p className="pp-label">Practice Setup</p>
                <h1 className="mt-2 max-w-xl text-4xl font-semibold tracking-[-0.02em] text-white">Choose the room before you step into it</h1>
                <p className="mt-4 text-sm leading-6 text-white/60">{selectedTarget.sourceBasis}</p>
                {!!selectedTarget.referenceLinks?.length && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTarget.referenceLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/60 transition hover:border-white/25 hover:text-white"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-white/40">
                      Company / Style
                    </span>
                    <select
                      value={selectedTargetId}
                      onChange={(event) => selectTarget(event.target.value)}
                      className="pp-focus h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-3 text-sm font-medium text-white transition"
                    >
                      {modePack.targets.map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-white/40">
                      Sample Problem
                    </span>
                    <select
                      value={selectedPromptId}
                      onChange={(event) => selectPrompt(event.target.value)}
                      className="pp-focus h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-3 text-sm font-medium text-white transition"
                    >
                      {selectedTarget.prompts.map((prompt) => (
                        <option key={prompt.id} value={prompt.id}>
                          {prompt.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-white/40">
                    Or paste your own problem statement
                  </span>
                  <textarea
                    value={customPrompt}
                    onChange={(event) => setCustomPrompt(event.target.value)}
                    placeholder="Paste a real case prompt, system design question, pitch scenario, or sales objection here..."
                    rows={5}
                    className="pp-focus w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-white transition placeholder:text-white/30"
                  />
                </label>

                {permissionError && (
                  <div className="mt-5 rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-4 text-sm font-semibold text-[#ef4444]">
                    {permissionError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={enterStudio}
                  className="pp-primary mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl text-base font-semibold transition"
                >
                  <span>{selectedModeConfig.icon}</span>
                  Enter Recording Studio
                </button>
              </div>

              <aside className="space-y-4">
                <div className="pp-glass rounded-[28px] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="pp-label">
                        {customPrompt.trim() ? 'Your Prompt' : selectedPrompt.title}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white/70">{selectedTarget.name}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-semibold text-white/60">
                      Base rubric enabled
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-7 text-white/80">{activePromptText}</p>
                </div>

                <div className="pp-glass rounded-[28px] p-5">
                  <p className="pp-label">Coaching Focus</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{selectedTarget.focus}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTarget.rubric.map((dimension) => (
                      <span
                        key={dimension.name}
                        className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-medium text-white/60"
                      >
                        {dimension.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pp-glass rounded-[28px] p-5">
                  <p className="pp-label">Before You Record</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs font-medium text-white/40">Camera</p>
                      <p className="mt-1 text-sm font-semibold text-white/85">Opens in studio</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs font-medium text-white/40">Baseline</p>
                      <p className="mt-1 text-sm font-semibold text-white/85">Calibrate there</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs font-medium text-white/40">Flow</p>
                      <p className="mt-1 text-sm font-semibold text-white/85">Stop → results</p>
                    </div>
                  </div>
                </div>
              </aside>
            </section>
          </>
        ) : (
          <>
            {permissionError && (
              <div className="mb-5 rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-4 text-sm font-semibold text-[#ef4444]">
                {permissionError}
              </div>
            )}

            <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#1e1e30] bg-[#0f0f1a] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/40">Recording Studio</p>
                <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-[#f0f0ff]">
                  {selectedTarget.name}: {customPrompt.trim() ? 'Custom prompt' : selectedPrompt.title}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#2a2a45] bg-[#080810] px-3 py-1.5 font-mono text-sm font-semibold tabular-nums text-[#f0f0ff]">
                  {formatTimer(elapsedSeconds)}
                </span>
                <button
                  type="button"
                  onClick={returnToSetup}
                  disabled={isRecording || isBusy}
                  className="rounded-full border border-[#2a2a45] bg-[#080810] px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:border-white/40 hover:text-[#f0f0ff] disabled:opacity-40"
                >
                  Change setup
                </button>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,58%)_minmax(340px,42%)]">
              <CameraFeed ref={videoRef} stream={stream} isRecording={isRecording} elapsedSeconds={elapsedSeconds} />
              <aside className="space-y-5">
                <div className="rounded-2xl border border-[#1e1e30] bg-[#0f0f1a] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/40">Problem Statement</p>
                  <p className="mt-3 text-[15px] leading-7 text-[#f0f0ff]">{activePromptText}</p>
                </div>

                <div className="rounded-2xl border border-[#1e1e30] bg-[#0f0f1a] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/40">Coaching Info</p>
                  <p className="mt-2 text-sm leading-6 text-white/50">{selectedTarget.focus}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTarget.rubric.map((dimension) => (
                      <span
                        key={dimension.name}
                        className="rounded-full border border-[#2a2a45] bg-[#13131f] px-3 py-1 text-xs font-medium text-white/50"
                      >
                        {dimension.name}
                      </span>
                    ))}
                  </div>
                </div>

                <LiveMetrics metrics={liveMetrics} fillerCount={liveFillerCount} />

                <div className="rounded-2xl border border-[#1e1e30] bg-[#0f0f1a] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/40">Vision Calibration</p>
                      <p className="mt-1 text-sm text-white/50">
                        {calibrationStatus === 'ready' ? 'Personal baseline active' : 'Optional before recording'}
                      </p>
                    </div>
                    <StatusBadge status={calibrationStatus === 'ready' ? 'Ready' : calibrationStatus === 'failed' ? 'Error' : 'Idle'} />
                  </div>
                  <button
                    type="button"
                    onClick={() => startCalibration(3000)}
                    disabled={!stream || isRecording || calibrationStatus === 'calibrating'}
                    className="mt-4 h-12 w-full rounded-[14px] border border-white/40/35 bg-[#4f6ef7]/10 text-sm font-semibold text-[#f0f0ff] transition hover:border-white/40 hover:bg-[#4f6ef7]/15 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {calibrationStatus === 'calibrating'
                      ? 'Hold still...'
                      : calibrationStatus === 'ready'
                        ? 'Recalibrate Gaze'
                        : 'Calibrate Camera Gaze'}
                  </button>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#1e1e30]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4f6ef7] to-[#8b5cf6] transition-all duration-150"
                      style={{ width: `${Math.round(calibrationProgress * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#1e1e30] bg-[#0f0f1a] p-5">
                  <h2 className="text-xl font-bold tracking-[-0.02em] text-[#f0f0ff]">Session</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="font-medium text-white/50">Camera</dt>
                      <dd><StatusBadge status={stream ? 'Ready' : permissionError ? 'Error' : 'Waiting'} /></dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="font-medium text-white/50">Recorder</dt>
                      <dd><StatusBadge status={isRecording ? 'Recording' : isBusy ? 'Processing' : 'Idle'} /></dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="font-medium text-white/50">Whisper</dt>
                      <dd><StatusBadge status={isBusy ? 'Processing' : whisperStatus === 'error' ? 'Error' : 'Idle'} /></dd>
                    </div>
                  </dl>
                </div>

                <div>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={handleStart}
                      disabled={!stream || isBusy}
                      className="flex h-14 w-full items-center justify-center gap-3 rounded-[14px] bg-gradient-to-r from-[#4f6ef7] to-[#6366f1] text-base font-semibold text-white shadow-[0_0_20px_rgba(79,110,247,0.3)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <span>{selectedModeConfig.icon}</span>
                      Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStop}
                      className="flex h-14 w-full animate-[recordPulse_1.5s_ease-in-out_infinite] items-center justify-center gap-3 rounded-[14px] bg-[#ef4444] text-base font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition hover:brightness-110"
                    >
                      <span className="h-3.5 w-3.5 rounded-sm bg-white" />
                      Stop Recording
                    </button>
                  )}
                  <p className="mt-3 text-center text-xs text-white/40">Tip: Look directly at the camera, not the screen</p>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>

      {isBusy && (
        <ProcessingScreen
          stage={processingStage}
          message={processingMessage}
          whisperStatus={whisperStatus}
          whisperProgress={whisperProgress}
        />
      )}
    </main>
  )
}
