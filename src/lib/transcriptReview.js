const FILLERS = new Set(['um', 'uh', 'like', 'basically', 'literally', 'so', 'right'])

export function formatTranscriptTime(seconds = 0) {
  const safe = Math.max(0, Math.floor(seconds))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

function normalizeWord(word = '') {
  return String(word).toLowerCase().replace(/[^a-z\s]/g, '').trim()
}

function timestampToSeconds(timestamp) {
  if (typeof timestamp === 'number') return timestamp
  const parts = String(timestamp || '0:00').split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

function inWindow(word, window) {
  return word.start >= window.start && word.start < window.end
}

export function buildTranscriptReview(signals = {}, moments = []) {
  const words = signals.transcript?.words || []
  const paceWindows = signals.paceWindows || []
  const silenceGaps = signals.silenceGaps || []
  const momentRanges = moments.map((moment) => ({
    ...moment,
    seconds: timestampToSeconds(moment.timestamp)
  }))

  const annotatedWords = words.map((word, index) => {
    const normalized = normalizeWord(word.word)
    const nextNormalized = normalizeWord(words[index + 1]?.word)
    const phrase = `${normalized} ${nextNormalized}`.trim()
    const paceWindow = paceWindows.find((window) => inWindow(word, window))
    const linkedMoment = momentRanges.find((moment) => Math.abs(word.start - moment.seconds) <= 4)
    const flags = []

    if (FILLERS.has(normalized) || phrase === 'you know') {
      flags.push('filler')
    }

    if (paceWindow?.flag === 'too_fast') {
      flags.push('fast')
    }

    if (paceWindow?.flag === 'too_slow') {
      flags.push('slow')
    }

    if (linkedMoment) {
      flags.push(linkedMoment.type === 'strength' ? 'moment_strength' : 'moment_warning')
    }

    return {
      ...word,
      index,
      normalized,
      flags,
      paceFlag: paceWindow?.flag || 'ok',
      linkedMoment
    }
  })

  const tokens = []
  annotatedWords.forEach((word, index) => {
    const previous = annotatedWords[index - 1]
    const gap = previous ? word.start - previous.end : 0
    const silenceGap = silenceGaps.find((item) => Math.abs(item.start - previous?.end) < 0.4 && Math.abs(item.end - word.start) < 0.4)

    if (previous && gap > 2) {
      tokens.push({
        type: 'pause',
        id: `pause-${previous.index}-${word.index}`,
        start: previous.end,
        end: word.start,
        duration: gap,
        displayStart: silenceGap?.displayStart || formatTranscriptTime(previous.end)
      })
    }

    tokens.push({
      type: 'word',
      id: `word-${word.index}`,
      ...word
    })
  })

  const fastestWindow = paceWindows.reduce((fastest, window) => {
    if (!fastest || window.wpm > fastest.wpm) return window
    return fastest
  }, null)
  const slowestWindow = paceWindows
    .filter((window) => window.wordCount > 0)
    .reduce((slowest, window) => {
      if (!slowest || window.wpm < slowest.wpm) return window
      return slowest
    }, null)
  const longestPause = silenceGaps.reduce((longest, gap) => {
    if (!longest || gap.duration > longest.duration) return gap
    return longest
  }, null)

  return {
    tokens,
    summary: {
      fillerCount: signals.summary?.fillerCount || 0,
      averageWpm: signals.summary?.averageWpm || 0,
      longestPause,
      fastestWindow,
      slowestWindow
    }
  }
}
