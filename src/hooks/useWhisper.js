import { useCallback, useState } from 'react'

function normalizeChunks(chunks = []) {
  return chunks
    .map((chunk) => {
      const timestamp = chunk.timestamp || [chunk.start, chunk.end]
      return {
        word: String(chunk.text || chunk.word || '').trim(),
        start: Number(timestamp?.[0] ?? chunk.start ?? 0),
        end: Number(timestamp?.[1] ?? chunk.end ?? timestamp?.[0] ?? 0)
      }
    })
    .filter((chunk) => chunk.word)
}

export default function useWhisper() {
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const transcribe = useCallback(async (videoBlob) => {
    setStatus('loading-model')
    setProgress(0)
    setError('')

    try {
      const { pipeline, env } = await import('@xenova/transformers')
      env.allowLocalModels = false
      env.useBrowserCache = true

      const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
        progress_callback: (event) => {
          if (event.status === 'progress') {
            setProgress(Math.round(event.progress || 0))
          }
        }
      })

      setStatus('transcribing')
      const audioUrl = URL.createObjectURL(videoBlob)
      const output = await transcriber(audioUrl, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: 'word',
        language: 'english',
        task: 'transcribe'
      })
      URL.revokeObjectURL(audioUrl)

      setProgress(100)
      setStatus('complete')

      return {
        text: output.text || '',
        words: normalizeChunks(output.chunks)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Whisper transcription failed.'
      setError(message)
      setStatus('error')
      throw new Error(message)
    }
  }, [])

  return {
    transcribe,
    whisperStatus: status,
    whisperProgress: progress,
    whisperError: error
  }
}
