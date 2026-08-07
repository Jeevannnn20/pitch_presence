// Vercel serverless function: proxies the coaching-debrief request to OpenRouter
// so the API key never ships in the browser bundle.
//
// Env (server-side only, NOT VITE_-prefixed):
//   OPENROUTER_API_KEY   required  - bearer token, kept off the client
//   OPENROUTER_MODEL     optional  - model slug (default below); swap without code changes
//   OPENROUTER_SITE_URL  optional  - sent as HTTP-Referer for OpenRouter dashboard attribution
//   OPENROUTER_APP_NAME  optional  - sent as X-Title for OpenRouter dashboard attribution

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
Be specific. Reference exact timestamps. Be direct and honest - this is coaching, not encouragement.

Scoring rules:
- If attemptQuality.status is "silent", "too_short", "too_few_words", or "thin_answer", do not give generous scores. Respect scoresHint as a ceiling.
- Use contentCoverage and practiceContext.answerKey to judge whether the answer actually addressed the problem, not just whether delivery sounded polished.
- If transcript.wordCount is near zero, say the attempt is not meaningfully scorable.`

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    // Fail with a non-2xx so the client falls back to its deterministic localDebrief.
    return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured' })
  }

  // Vercel parses JSON bodies into an object; tolerate a raw string too.
  let signals = req.body
  if (typeof signals === 'string') {
    try {
      signals = JSON.parse(signals)
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }
  }
  if (!signals || typeof signals !== 'object') {
    return res.status(400).json({ error: 'Missing signals payload' })
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  }
  if (process.env.OPENROUTER_SITE_URL) headers['HTTP-Referer'] = process.env.OPENROUTER_SITE_URL
  if (process.env.OPENROUTER_APP_NAME) headers['X-Title'] = process.env.OPENROUTER_APP_NAME

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 1400,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(signals) }
        ]
      })
    })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '')
      console.warn(`OpenRouter request failed (${upstream.status}): ${detail.slice(0, 500)}`)
      return res.status(502).json({ error: 'Upstream model request failed' })
    }

    const data = await upstream.json()
    const text = data?.choices?.[0]?.message?.content || ''
    if (!text) {
      return res.status(502).json({ error: 'Empty model response' })
    }
    return res.status(200).json({ text })
  } catch (error) {
    console.warn('OpenRouter proxy error:', error)
    return res.status(502).json({ error: 'Model request error' })
  }
}
