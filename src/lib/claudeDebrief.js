import { formatTimestamp } from './analyzeSignals.js'

const SYSTEM_PROMPT = `You are a world-class pitch coach and communication trainer. You will receive structured data from a recorded pitch or interview answer. Your job is to return a coaching debrief in the following exact JSON format:
{
"verdict": "2-3 sentence overall assessment",
"scores": {
"eyeContact": { "score": 0-100, "comment": "one line" },
"posture": { "score": 0-100, "comment": "one line" },
"energy": { "score": 0-100, "comment": "one line" },
"pace": { "score": 0-100, "comment": "one line" },
"clarity": { "score": 0-100, "comment": "one line" }
},
"moments": [
{ "timestamp": "0:42", "type": "warning|strength", "message": "specific observation" }
],
"fixes": [
"Specific actionable fix 1",
"Specific actionable fix 2",
"Specific actionable fix 3"
]
}
Be specific. Reference exact timestamps. Be direct and honest - this is coaching, not encouragement.`

function extractJson(text) {
  const trimmed = text.trim()
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('Claude did not return JSON.')
  }
  return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1))
}

function scoreComment(key, score) {
  const comments = {
    eyeContact: score > 75 ? 'You mostly held the camera.' : 'Your gaze drifted enough to weaken connection.',
    posture: score > 75 ? 'Your frame stayed stable.' : 'Your shoulders or head position pulled focus.',
    energy: score > 75 ? 'Your vocal energy carried the pitch.' : 'Your voice dipped at moments that needed conviction.',
    pace: score > 75 ? 'Your speed was easy to follow.' : 'Your pacing had windows that felt rushed or dragged.',
    clarity: score > 75 ? 'Your language was fairly clean.' : 'Fillers and pauses reduced precision.'
  }

  return comments[key]
}

function localDebrief(signals) {
  const hints = signals.scoresHint || {}
  const attemptQuality = signals.attemptQuality || {}
  const contentCoverage = signals.contentCoverage || {}

  if (attemptQuality.status === 'silent' || (signals.transcript?.wordCount || 0) === 0) {
    return {
      verdict:
        'This attempt cannot be scored as a real answer because no speech was detected. Record a full response with enough spoken content before trusting delivery, pace, or clarity scores.',
      scores: {
        eyeContact: { score: 0, comment: 'No spoken answer was available to evaluate.' },
        posture: { score: 0, comment: 'Posture is not meaningful without an actual answer.' },
        energy: { score: 0, comment: 'No vocal content was detected.' },
        pace: { score: 0, comment: 'No speaking pace could be measured.' },
        clarity: { score: 0, comment: 'No transcript was produced.' }
      },
      moments: [
        {
          timestamp: '0:00',
          type: 'warning',
          message: 'No transcript words were detected, so the attempt is treated as silence.'
        }
      ],
      fixes: [
        'Record at least 30-60 seconds of spoken answer before reviewing scores.',
        'Start by restating the problem and giving your thesis in the first sentence.',
        'Make sure microphone permission is enabled and speak clearly toward the device.'
      ]
    }
  }

  const firstEye = signals.eyeContactWindows?.find((window) => window.flag !== 'ok')
  const firstPosture = signals.postureWindows?.find((window) => window.flag !== 'ok')
  const firstPace = signals.paceWindows?.find((window) => window.flag !== 'ok')
  const firstFiller = signals.fillerWords?.[0]
  const firstEnergy = signals.energyDrops?.[0]
  const firstMissedContent = contentCoverage.missed?.[0]

  const moments = [
    firstMissedContent && {
      timestamp: '0:00',
      type: 'warning',
      message: `Your answer missed a core expected element: ${firstMissedContent.label}.`
    },
    firstEye && {
      timestamp: firstEye.displayStart,
      type: 'warning',
      message: `Eye contact dropped below target around ${firstEye.displayStart}; reset your gaze to the lens before the next key point.`
    },
    firstPosture && {
      timestamp: firstPosture.displayStart,
      type: 'warning',
      message: `Posture got unstable around ${firstPosture.displayStart}; square your shoulders and keep your head centered.`
    },
    firstPace && {
      timestamp: firstPace.displayStart,
      type: 'warning',
      message: `Pace hit ${firstPace.wpm} WPM around ${firstPace.displayStart}; ${
        firstPace.flag === 'too_fast' ? 'slow down before important claims' : 'tighten the sentence and move forward'
      }.`
    },
    firstFiller && {
      timestamp: firstFiller.displayTime,
      type: 'warning',
      message: `The filler "${firstFiller.word}" appeared at ${firstFiller.displayTime}; replace that beat with a silent pause.`
    },
    firstEnergy && {
      timestamp: firstEnergy.displayTime,
      type: 'warning',
      message: `Energy dropped around ${firstEnergy.displayTime}; lift volume and finish the sentence with intent.`
    },
    {
      timestamp: formatTimestamp(Math.max(0, signals.duration * 0.2)),
      type: 'strength',
      message: 'You completed a full recorded rep with measurable delivery signals, which gives you a concrete baseline to improve.'
    }
  ].filter(Boolean).slice(0, 6)

  const contentLine = contentCoverage.totalCount
    ? `Content coverage hit ${contentCoverage.coveredCount}/${contentCoverage.totalCount} expected elements.`
    : 'No content answer key was available for this prompt.'
  const attemptLine = attemptQuality.status && attemptQuality.status !== 'valid'
    ? `The attempt was marked ${attemptQuality.status.replace(/_/g, ' ')}, so scores were capped.`
    : 'The answer had enough transcript to evaluate.'

  return {
    verdict: `${attemptLine} ${contentLine} The biggest gains will come from covering the expected answer elements while keeping delivery controlled.`,
    scores: {
      eyeContact: { score: hints.eyeContact || 0, comment: scoreComment('eyeContact', hints.eyeContact || 0) },
      posture: { score: hints.posture || 0, comment: scoreComment('posture', hints.posture || 0) },
      energy: { score: hints.energy || 0, comment: scoreComment('energy', hints.energy || 0) },
      pace: { score: hints.pace || 0, comment: scoreComment('pace', hints.pace || 0) },
      clarity: {
        score: hints.clarity || 0,
        comment: contentCoverage.score < 50 ? 'The transcript missed too many expected answer elements.' : scoreComment('clarity', hints.clarity || 0)
      }
    },
    moments,
    fixes: [
      firstMissedContent
        ? `Add a clear sentence covering "${firstMissedContent.label}" in your next answer.`
        : 'Mark three sentences as anchors and look directly into the lens for the full sentence.',
      'Start with a thesis, then walk through the expected answer elements one by one.',
      'Practice the answer in 10-second chunks and keep each chunk between 100 and 180 WPM.'
    ]
  }
}

export async function getClaudeDebrief(signals) {
  const apiKey = import.meta.env?.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    return localDebrief(signals)
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1400,
        temperature: 0.3,
        system: `${SYSTEM_PROMPT}

Scoring rules:
- If attemptQuality.status is "silent", "too_short", "too_few_words", or "thin_answer", do not give generous scores. Respect scoresHint as a ceiling.
- Use contentCoverage and practiceContext.answerKey to judge whether the answer actually addressed the problem, not just whether delivery sounded polished.
- If transcript.wordCount is near zero, say the attempt is not meaningfully scorable.`,
        messages: [
          {
            role: 'user',
            content: JSON.stringify(signals)
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude request failed with ${response.status}`)
    }

    const data = await response.json()
    const text = data.content?.map((part) => part.text || '').join('\n') || ''
    return extractJson(text)
  } catch (error) {
    console.warn('Claude debrief failed, using local debrief:', error)
    return localDebrief(signals)
  }
}
