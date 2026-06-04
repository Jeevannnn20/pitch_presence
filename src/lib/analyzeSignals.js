const FILLERS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'so', 'right']
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'can',
  'cover',
  'do',
  'for',
  'from',
  'given',
  'how',
  'if',
  'in',
  'including',
  'is',
  'it',
  'of',
  'on',
  'or',
  'should',
  'that',
  'the',
  'then',
  'this',
  'to',
  'under',
  'what',
  'where',
  'why',
  'with',
  'would',
  'you',
  'your'
])

export function formatTimestamp(seconds = 0) {
  const safe = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safe / 60)
  const remainingSeconds = String(safe % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function average(values) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function bucketAverage(samples = [], windowSeconds = 5) {
  const buckets = new Map()

  samples.forEach((sample) => {
    const index = Math.floor(sample.timestamp / windowSeconds)
    const existing = buckets.get(index) || []
    existing.push(sample.value)
    buckets.set(index, existing)
  })

  return [...buckets.entries()].map(([index, values]) => ({
    start: index * windowSeconds,
    end: index * windowSeconds + windowSeconds,
    average: average(values)
  }))
}

function detectFillerWords(words = []) {
  const found = []

  words.forEach((word, index) => {
    const normalized = word.word.toLowerCase().replace(/[^a-z\s]/g, '').trim()
    const next = words[index + 1]?.word.toLowerCase().replace(/[^a-z\s]/g, '').trim()
    const phrase = `${normalized} ${next || ''}`.trim()

    if (FILLERS.includes(phrase)) {
      found.push({ word: phrase, timestamp: word.start })
      return
    }

    if (FILLERS.includes(normalized) && !['you'].includes(normalized)) {
      found.push({ word: normalized, timestamp: word.start })
    }
  })

  return found
}

function cleanWord(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9+\s-]/g, '').trim()
}

function normalizeWords(transcript = {}, duration = 0) {
  const existingWords = Array.isArray(transcript.words) ? transcript.words : []
  const validWords = existingWords
    .map((word, index) => ({
      word: String(word.word || '').trim(),
      start: Number.isFinite(word.start) ? Math.max(0, word.start) : 0,
      end: Number.isFinite(word.end) ? Math.max(0, word.end) : 0,
      index
    }))
    .filter((word) => word.word)

  if (validWords.length) {
    return validWords.map((word, index) => ({
      ...word,
      end: word.end > word.start ? word.end : word.start + 0.25,
      index
    }))
  }

  const textWords = String(transcript.text || '')
    .split(/\s+/)
    .map(cleanWord)
    .filter(Boolean)

  if (!textWords.length) return []

  const spacing = duration > 0 ? Math.max(0.25, duration / textWords.length) : 0.5
  return textWords.map((word, index) => ({
    word,
    start: index * spacing,
    end: index * spacing + Math.min(0.35, spacing),
    index
  }))
}

function analyzePace(words = [], duration = 0) {
  const totalWindows = Math.max(1, Math.ceil(duration / 10))
  const windows = Array.from({ length: totalWindows }, (_, index) => ({
    start: index * 10,
    end: index * 10 + 10,
    wordCount: 0,
    wpm: 0,
    flag: 'ok'
  }))

  words.forEach((word) => {
    const index = Math.min(windows.length - 1, Math.floor(word.start / 10))
    windows[index].wordCount += 1
  })

  windows.forEach((window) => {
    window.wpm = Math.round(window.wordCount * 6)
    if (window.wordCount === 0) window.flag = 'silent'
    if (window.wpm > 180) window.flag = 'too_fast'
    if (window.wpm > 0 && window.wpm < 100) window.flag = 'too_slow'
  })

  return windows
}

function detectEnergyDrops(samples = []) {
  if (samples.length < 4) return []

  const baseline = average(samples.slice(0, Math.min(8, samples.length)).map((sample) => sample.value)) || 0.01
  const smoothed = samples.map((sample, index) => {
    const nearby = samples.slice(Math.max(0, index - 2), index + 3)
    return {
      timestamp: sample.timestamp,
      value: average(nearby.map((item) => item.value))
    }
  })

  return smoothed
    .filter((sample) => sample.value < baseline * 0.7 && sample.timestamp > 3)
    .filter((sample, index, array) => index === 0 || sample.timestamp - array[index - 1].timestamp > 4)
    .map((sample) => ({
      timestamp: sample.timestamp,
      value: sample.value,
      baseline
    }))
}

function detectSilenceGaps(words = []) {
  const gaps = []

  for (let index = 1; index < words.length; index += 1) {
    const previous = words[index - 1]
    const current = words[index]
    const gap = current.start - previous.end

    if (gap > 2) {
      gaps.push({
        start: previous.end,
        end: current.start,
        duration: gap
      })
    }
  }

  return gaps
}

function scoreFromFlags(total, flagged, penalty = 18) {
  if (!total) return 0
  return Math.max(0, Math.min(100, Math.round(100 - flagged * penalty - Math.max(0, total - flagged - 1) * 2)))
}

function analyzeAttemptQuality({ words, duration }) {
  const substantiveWords = words
    .map((word) => cleanWord(word.word))
    .filter((word) => word && !STOP_WORDS.has(word) && word.length > 2)
  const wordCount = words.length
  const substantiveWordCount = substantiveWords.length
  const speakingDensity = duration > 0 ? wordCount / duration : 0

  let status = 'valid'
  let multiplier = 1
  let maxScore = 100
  const warnings = []

  if (duration < 4) {
    status = 'too_short'
    multiplier = Math.min(multiplier, 0.18)
    maxScore = Math.min(maxScore, 18)
    warnings.push('Recording was too short to evaluate.')
  }

  if (wordCount === 0) {
    status = 'silent'
    multiplier = 0
    maxScore = 0
    warnings.push('No transcript words were detected.')
  } else if (wordCount < 8) {
    status = 'too_few_words'
    multiplier = Math.min(multiplier, 0.25)
    maxScore = Math.min(maxScore, 25)
    warnings.push('Too few words were spoken for a meaningful answer.')
  } else if (wordCount < 20 || substantiveWordCount < 10) {
    status = 'thin_answer'
    multiplier = Math.min(multiplier, 0.55)
    maxScore = Math.min(maxScore, 55)
    warnings.push('The answer was too thin to support a strong score.')
  }

  if (duration >= 8 && speakingDensity < 0.55) {
    multiplier = Math.min(multiplier, 0.45)
    maxScore = Math.min(maxScore, 45)
    warnings.push('Most of the recording appears to be silence.')
  }

  return {
    status,
    isValid: status === 'valid',
    multiplier,
    maxScore,
    wordCount,
    substantiveWordCount,
    speakingDensity,
    warnings
  }
}

function getAnswerKeyGroups(practiceContext = {}) {
  const groups = practiceContext.answerKey?.groups || practiceContext.answerKey || []
  return Array.isArray(groups) ? groups : []
}

function analyzeContentCoverage(text = '', words = [], practiceContext = {}) {
  const groups = getAnswerKeyGroups(practiceContext)
  const normalizedText = ` ${cleanWord(text || words.map((word) => word.word).join(' '))} `
  const normalizedWordSet = new Set(
    normalizedText
      .split(/\s+/)
      .map(cleanWord)
      .filter(Boolean)
  )

  if (!groups.length) {
    return {
      score: words.length ? 50 : 0,
      coveredCount: 0,
      totalCount: 0,
      covered: [],
      missed: [],
      basis: 'No answer-key terms were configured for this prompt.'
    }
  }

  const results = groups.map((group) => {
    const terms = (group.terms || [])
      .flatMap((term) => String(term).split('|'))
      .map(cleanWord)
      .filter(Boolean)
    const matchedTerms = terms.filter((term) => {
      if (term.includes(' ')) return normalizedText.includes(` ${term} `)
      return normalizedWordSet.has(term)
    })

    return {
      label: group.label || terms[0] || 'Expected element',
      terms,
      matchedTerms,
      covered: matchedTerms.length > 0
    }
  })

  const covered = results.filter((item) => item.covered)
  const missed = results.filter((item) => !item.covered)
  const score = Math.round((covered.length / Math.max(1, results.length)) * 100)

  return {
    score,
    coveredCount: covered.length,
    totalCount: results.length,
    covered: covered.map((item) => ({ label: item.label, matchedTerms: item.matchedTerms })),
    missed: missed.map((item) => ({ label: item.label, terms: item.terms.slice(0, 6) })),
    basis: 'Local content score computed from prompt-specific answer-key terms and expected answer elements.'
  }
}

function gatedScore(score, attemptQuality) {
  return Math.max(0, Math.min(attemptQuality.maxScore, Math.round(score * attemptQuality.multiplier)))
}

export default function analyzeSignals({ transcript, visionSamples, energySamples, duration, practiceContext }) {
  const words = normalizeWords(transcript, duration)
  const text = transcript?.text || ''
  const eyeWindows = bucketAverage(visionSamples?.eyeContact || [], 5)
  const postureWindows = bucketAverage(visionSamples?.posture || [], 5)
  const headAlignmentWindows = bucketAverage(visionSamples?.headAlignment || [], 5)
  const movementWindows = bucketAverage(visionSamples?.movementControl || [], 5)
  const paceWindows = analyzePace(words, duration)
  const fillers = detectFillerWords(words)
  const energyDrops = detectEnergyDrops(energySamples || [])
  const silenceGaps = detectSilenceGaps(words)

  const lowEyeContact = eyeWindows.filter((window) => window.average < 0.5)
  const lowPosture = postureWindows.filter((window) => window.average < 0.6)
  const lowHeadAlignment = headAlignmentWindows.filter((window) => window.average < 0.6)
  const highMovement = movementWindows.filter((window) => window.average < 0.55)
  const paceFlags = paceWindows.filter((window) => window.flag !== 'ok')
  const averageEnergy = average((energySamples || []).map((sample) => sample.value))
  const attemptQuality = analyzeAttemptQuality({ words, duration })
  const contentCoverage = analyzeContentCoverage(text, words, practiceContext)
  const visionSampleCount = Math.max(
    visionSamples?.eyeContact?.length || 0,
    visionSamples?.posture?.length || 0,
    visionSamples?.headAlignment?.length || 0,
    visionSamples?.movementControl?.length || 0
  )

  const rawScores = {
    eyeContact: scoreFromFlags(eyeWindows.length, lowEyeContact.length),
    posture: Math.round(
      scoreFromFlags(postureWindows.length, lowPosture.length) * 0.7 +
        scoreFromFlags(movementWindows.length, highMovement.length, 14) * 0.3
    ),
    energy: Math.max(0, Math.min(100, Math.round(averageEnergy * 95 + 15 - energyDrops.length * 12))),
    pace: scoreFromFlags(paceWindows.length, paceFlags.length, 16),
    clarity: words.length
      ? Math.max(0, Math.min(100, Math.round(88 - fillers.length * 4 - silenceGaps.length * 8)))
      : 0,
    content: contentCoverage.score
  }
  const contentAdjustedClarity = Math.round(rawScores.clarity * 0.58 + contentCoverage.score * 0.42)

  return {
    duration,
    transcript: {
      text,
      wordCount: words.length,
      words
    },
    summary: {
      averageEyeContact: average(eyeWindows.map((window) => window.average)),
      averagePosture: average(postureWindows.map((window) => window.average)),
      averageHeadAlignment: average(headAlignmentWindows.map((window) => window.average)),
      averageMovementControl: average(movementWindows.map((window) => window.average)),
      averageEnergy,
      averageWpm: duration > 0 ? Math.round((words.length / duration) * 60) : 0,
      fillerCount: fillers.length,
      silenceGapCount: silenceGaps.length,
      contentScore: contentCoverage.score,
      attemptStatus: attemptQuality.status,
      visionSampleCount,
      visionCoverage: duration > 0 ? Math.min(1, visionSampleCount / Math.max(1, duration * 8)) : 0
    },
    attemptQuality,
    contentCoverage,
    rawScores,
    scoresHint: {
      eyeContact: gatedScore(rawScores.eyeContact, attemptQuality),
      posture: gatedScore(rawScores.posture, attemptQuality),
      energy: gatedScore(rawScores.energy, attemptQuality),
      pace: gatedScore(rawScores.pace, attemptQuality),
      clarity: gatedScore(contentAdjustedClarity, attemptQuality),
      content: gatedScore(contentCoverage.score, attemptQuality)
    },
    fillerWords: fillers.map((item) => ({
      ...item,
      displayTime: formatTimestamp(item.timestamp)
    })),
    paceWindows: paceWindows.map((window) => ({
      ...window,
      displayStart: formatTimestamp(window.start)
    })),
    eyeContactWindows: eyeWindows.map((window) => ({
      ...window,
      flag: window.average < 0.5 ? 'low_eye_contact' : 'ok',
      displayStart: formatTimestamp(window.start)
    })),
    postureWindows: postureWindows.map((window) => ({
      ...window,
      flag: window.average < 0.6 ? 'unstable_posture' : 'ok',
      displayStart: formatTimestamp(window.start)
    })),
    headAlignmentWindows: headAlignmentWindows.map((window) => ({
      ...window,
      flag: window.average < 0.6 ? 'head_drift' : 'ok',
      displayStart: formatTimestamp(window.start)
    })),
    movementWindows: movementWindows.map((window) => ({
      ...window,
      flag: window.average < 0.55 ? 'excess_movement' : 'ok',
      displayStart: formatTimestamp(window.start)
    })),
    energyDrops: energyDrops.map((drop) => ({
      ...drop,
      displayTime: formatTimestamp(drop.timestamp)
    })),
    silenceGaps: silenceGaps.map((gap) => ({
      ...gap,
      displayStart: formatTimestamp(gap.start)
    }))
  }
}
