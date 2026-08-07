// Async history orchestration: localStorage stays the source of truth; Supabase is an
// additive cross-device mirror. Every function degrades to local-only behavior when the
// user is signed out, offline, or Supabase is unconfigured.

import { supabase } from './supabaseClient.js'
import {
  buildAttempt,
  commitLocalAttempt,
  readHistory,
  writeHistory,
  clearHistory
} from './history.js'

const OUTBOX_KEY = 'pitch-presence-outbox'
const migratedKey = (userId) => `pitch-presence-migrated:${userId}`

async function getCurrentUserId() {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data?.session?.user?.id ?? null
  } catch {
    return null
  }
}

// --- shape mapping: client attempt <-> snake_case DB row ---

function attemptToRow(attempt, userId) {
  return {
    user_id: userId,
    client_id: attempt.id,
    created_at: attempt.createdAt,
    mode: attempt.mode,
    target_id: attempt.targetId,
    target_name: attempt.targetName,
    prompt_id: attempt.promptId,
    prompt_title: attempt.promptTitle,
    prompt_text: attempt.promptText,
    is_custom_prompt: Boolean(attempt.isCustomPrompt),
    duration: attempt.duration,
    overall_score: attempt.overallScore,
    rubric_score: attempt.rubricScore,
    scores: attempt.scores || {},
    fixes: attempt.fixes || [],
    verdict: attempt.verdict || '',
    summary: attempt.summary || {},
    fingerprint: attempt.fingerprint
  }
}

function rowToAttempt(row) {
  return {
    id: row.client_id || row.id,
    createdAt: row.created_at,
    mode: row.mode || 'Startup Pitch',
    targetId: row.target_id || '',
    targetName: row.target_name || 'General practice',
    promptId: row.prompt_id || '',
    promptTitle: row.prompt_title || 'Practice prompt',
    promptText: row.prompt_text || '',
    isCustomPrompt: Boolean(row.is_custom_prompt),
    duration: Number(row.duration) || 0,
    overallScore: row.overall_score || 0,
    rubricScore: row.rubric_score || 0,
    scores: row.scores || {},
    fixes: row.fixes || [],
    verdict: row.verdict || '',
    summary: row.summary || {},
    fingerprint: row.fingerprint
  }
}

function unionByFingerprint(...lists) {
  const map = new Map()
  for (const list of lists) {
    for (const item of list) {
      if (!item?.fingerprint) continue
      const prev = map.get(item.fingerprint)
      // Keep the newer copy when the same attempt exists on both sides.
      if (!prev || new Date(item.createdAt).getTime() > new Date(prev.createdAt).getTime()) {
        map.set(item.fingerprint, item)
      }
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

async function upsertRows(attempts, userId) {
  if (!supabase || !userId || !attempts.length) return
  const rows = attempts.map((attempt) => attemptToRow(attempt, userId))
  const { error } = await supabase.from('attempts').upsert(rows, { onConflict: 'user_id,fingerprint' })
  if (error) throw error
}

// --- outbox: attempts that failed to reach the cloud, retried later ---

function readOutbox() {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function enqueueOutbox(attempt) {
  const existing = readOutbox().filter((item) => item.fingerprint !== attempt.fingerprint)
  localStorage.setItem(OUTBOX_KEY, JSON.stringify([attempt, ...existing]))
}

export async function flushOutbox() {
  const userId = await getCurrentUserId()
  if (!userId) return
  const items = readOutbox()
  if (!items.length) return
  try {
    await upsertRows(items, userId)
    localStorage.removeItem(OUTBOX_KEY)
  } catch {
    // Keep the queue; a later online/sign-in event will retry.
  }
}

// --- public API (used by pages + AuthContext) ---

// Save an attempt: optimistic synchronous local write first (UI never blocks), then a
// best-effort cloud upsert. Cloud failures queue to the outbox.
export async function saveAttempt(result) {
  const attempt = buildAttempt(result)
  if (!attempt) return null

  const { attempt: stored } = commitLocalAttempt(attempt)

  const userId = await getCurrentUserId()
  if (userId) {
    try {
      await upsertRows([stored], userId)
    } catch {
      enqueueOutbox(stored)
    }
  }
  return stored
}

// Load history: signed in -> union of cloud + local (and reconcile back into local);
// signed out/offline/unconfigured -> local only.
export async function loadHistory() {
  const userId = await getCurrentUserId()
  if (!userId) return readHistory()

  await flushOutbox()

  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error || !Array.isArray(data)) return readHistory()

  const merged = unionByFingerprint(readHistory(), data.map(rowToAttempt))
  writeHistory(merged)
  return merged
}

// Clear history locally and, when signed in, the user's cloud rows.
export async function clearAttempts() {
  clearHistory()
  localStorage.removeItem(OUTBOX_KEY)
  const userId = await getCurrentUserId()
  if (userId && supabase) {
    await supabase.from('attempts').delete().eq('user_id', userId)
  }
}

// One-time-per-account-per-browser upward migration on sign-in, then pull + merge so the
// just-signed-in device shows the union. Merge is always a union, never a replace.
export async function migrateAndSync(userId) {
  if (!supabase || !userId) return

  await flushOutbox()

  const key = migratedKey(userId)
  const local = readHistory()
  if (!localStorage.getItem(key)) {
    try {
      if (local.length) await upsertRows(local, userId)
      localStorage.setItem(key, '1')
    } catch {
      // Leave the flag unset so migration retries next sign-in.
    }
  }

  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (!error && Array.isArray(data)) {
    writeHistory(unionByFingerprint(readHistory(), data.map(rowToAttempt)))
  }
}
