const HISTORY_KEY = 'pitch-presence-history'
const MAX_ATTEMPTS = 50

function averageScore(scores = {}) {
  const values = Object.values(scores)
    .map((item) => Number(item?.score))
    .filter(Number.isFinite)

  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

export function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeHistory(attempts) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(attempts.slice(0, MAX_ATTEMPTS)))
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

export function saveAttempt(result) {
  const debrief = result?.debrief
  const signals = result?.signals
  const practiceContext = result?.practiceContext || signals?.practiceContext
  const rubricBaseline = result?.rubricBaseline || signals?.rubricBaseline

  if (!debrief || !signals) return null

  const attempt = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    mode: result.selectedMode || signals.selectedMode || practiceContext?.mode || 'Startup Pitch',
    targetId: practiceContext?.targetId || '',
    targetName: practiceContext?.targetName || 'General practice',
    promptId: practiceContext?.promptId || '',
    promptTitle: practiceContext?.promptTitle || 'Practice prompt',
    promptText: practiceContext?.promptText || '',
    isCustomPrompt: Boolean(practiceContext?.isCustomPrompt),
    duration: signals.duration || result.duration || 0,
    overallScore: averageScore(debrief.scores),
    rubricScore: rubricBaseline?.overall || 0,
    scores: debrief.scores || {},
    fixes: debrief.fixes || [],
    verdict: debrief.verdict || '',
    summary: {
      wordCount: signals.transcript?.wordCount || 0,
      averageWpm: signals.summary?.averageWpm || 0,
      fillerCount: signals.summary?.fillerCount || 0,
      silenceGapCount: signals.summary?.silenceGapCount || 0
    }
  }
  attempt.fingerprint = [
    attempt.mode,
    attempt.targetId,
    attempt.promptId,
    Math.round(attempt.duration),
    attempt.overallScore,
    attempt.rubricScore,
    attempt.verdict
  ].join('|')

  const existing = readHistory()
  const duplicate = existing.find(
    (item) =>
      item.fingerprint === attempt.fingerprint ||
      item.createdAt === attempt.createdAt ||
      (item.mode === attempt.mode &&
        item.targetName === attempt.targetName &&
        item.promptTitle === attempt.promptTitle &&
        Math.abs(new Date(item.createdAt).getTime() - new Date(attempt.createdAt).getTime()) < 3000)
  )

  if (duplicate) return duplicate

  writeHistory([attempt, ...existing])
  return attempt
}
