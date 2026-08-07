// Local (localStorage) history primitives + the pure attempt builder.
// The async local+cloud orchestration lives in historyStore.js, which reuses the
// builder and dedupe logic here so there is a single source of truth for the
// attempt shape and fingerprint.

const HISTORY_KEY = 'pitch-presence-history'
const MAX_ATTEMPTS = 50

export function averageScore(scores = {}) {
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

// Build a normalized attempt (including its dedupe fingerprint) from a raw result.
// Returns null when the result is not scorable. Pure — no storage side effects.
export function buildAttempt(result) {
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

  return attempt
}

// Find an already-stored attempt that this one duplicates (same fingerprint, same
// timestamp, or the same prompt within a 3s window).
export function findLocalDuplicate(existing, attempt) {
  return existing.find(
    (item) =>
      item.fingerprint === attempt.fingerprint ||
      item.createdAt === attempt.createdAt ||
      (item.mode === attempt.mode &&
        item.targetName === attempt.targetName &&
        item.promptTitle === attempt.promptTitle &&
        Math.abs(new Date(item.createdAt).getTime() - new Date(attempt.createdAt).getTime()) < 3000)
  )
}

// Optimistically persist an attempt to localStorage, deduped. Returns the stored
// attempt (the existing one if a duplicate) and whether it was newly added.
export function commitLocalAttempt(attempt) {
  const existing = readHistory()
  const duplicate = findLocalDuplicate(existing, attempt)
  if (duplicate) return { attempt: duplicate, isNew: false }
  writeHistory([attempt, ...existing])
  return { attempt, isNew: true }
}
