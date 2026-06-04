# Pitch Presence Coach

Pitch Presence Coach is a browser-based practice tool for startup pitches, case interviews, PM interviews, technical interviews, DSA walkthroughs, developer relations demos, and sales calls.

It records an answer locally, analyzes delivery and transcript quality in the browser, then produces a timestamp-level coaching debrief.

## Live Demo

Try it here:

[https://pitch-presence-coach.vercel.app/record](https://pitch-presence-coach.vercel.app/record)

## What It Does

This app helps you practice speaking under interview or pitch conditions.

You choose a scenario, record yourself answering, and the app gives feedback on:

- what you said
- how clearly you said it
- whether you covered the expected answer points
- how fast or slow you spoke
- filler words like "um", "uh", "like", and "you know"
- long pauses or dead air
- vocal energy
- eye contact and posture signals

The goal is simple: make practice feel closer to a real interview, not just a random webcam recording.

## How To Use It

1. Open the live demo or run the app locally.
2. Choose a practice mode, such as Product Management, DSA Problem Solving, Startup Pitch, or Sales Call.
3. Pick a company/interview style and sample question.
4. Optionally paste your own custom question.
5. Enter the recording studio.
6. Record your answer.
7. Review your scorecard, transcript, timeline moments, missed answer concepts, and suggested fixes.
8. Practice again and compare your attempts over time.

## Use It For Your Own Needs

You can adapt this project for your own interview prep, coaching workflow, or learning product.

Examples:

- Add your own company-specific interview questions.
- Create new prompt packs for PM, SWE, consulting, sales, or founder fundraising.
- Add answer-key terms for each prompt so the app can check whether the answer covered the important ideas.
- Use it as a private practice tool before interviews.
- Use it as a coaching dashboard for students, founders, or job seekers.
- Replace the Claude debrief with your own scoring rules or a backend API.

Most of the practice content lives in:

```text
src/data/interviewPacks.js
```

That is the main file to edit if you want to add new modes, companies, prompts, rubrics, or answer expectations.

## Features

- Full-screen recording studio with webcam preview
- Practice modes for startup, case, PM, SWE, DSA, DevRel, and sales scenarios
- Company/interview-style prompt packs
- Custom prompt support
- Local Whisper transcription via `@xenova/transformers`
- Browser speech-recognition fallback
- Filler word, pace, silence, and speaking-density analysis
- Vocal energy tracking with the Web Audio API
- Face and pose tracking with MediaPipe Tasks Vision
- Attempt-quality gates for silent, too-short, and thin answers
- Prompt-specific answer-key coverage scoring
- Claude synthesis for qualitative coaching debriefs
- Scorecard, timeline moments, transcript review, fixes, and local attempt history

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- `@mediapipe/tasks-vision`
- `@xenova/transformers`
- Web Audio API
- Anthropic Claude API
- Vercel

## Privacy Model

Video and audio recording stay in the browser. Local signal extraction runs on the user's device.

If `VITE_ANTHROPIC_API_KEY` is configured, the app sends structured analysis JSON to Claude for the final written debrief. It does not send raw video to Claude.

Important: this is a frontend-only app. Any API key exposed through `VITE_*` variables is visible to browser users in a production build. For a public production product, move Claude calls behind a backend proxy.

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

## Environment Variables

```bash
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

The Claude key is optional. Without it, the app falls back to a local deterministic debrief.

## Build

```bash
npm run build
```

## Deploy

```bash
vercel --prod
```

Add `VITE_ANTHROPIC_API_KEY` in Vercel only if you accept the frontend-key exposure tradeoff or have added a backend proxy.

## Project Structure

```text
src/
  components/      UI components
  data/            interview packs and prompt/rubric helpers
  hooks/           recorder, audio, vision, and transcription hooks
  lib/             signal analysis, Claude debrief, history, transcript review
  pages/           app pages
```

## License

MIT
