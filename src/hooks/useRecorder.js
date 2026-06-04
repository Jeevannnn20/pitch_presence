import { useCallback, useRef, useState } from 'react'

function getSupportedMimeType() {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm'
  ]

  return candidates.find((type) => window.MediaRecorder?.isTypeSupported(type)) || ''
}

export default function useRecorder(stream) {
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const startedAtRef = useRef(0)
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [videoBlob, setVideoBlob] = useState(null)

  const startRecording = useCallback(() => {
    if (!stream) {
      throw new Error('Camera and microphone are not ready yet.')
    }

    chunksRef.current = []
    setVideoBlob(null)
    setDuration(0)

    const mimeType = getSupportedMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    recorderRef.current = recorder
    startedAtRef.current = performance.now()

    recorder.ondataavailable = (event) => {
      if (event.data?.size) {
        chunksRef.current.push(event.data)
      }
    }

    recorder.start(500)
    setIsRecording(true)
  }, [stream])

  const stopRecording = useCallback(
    () =>
      new Promise((resolve, reject) => {
        const recorder = recorderRef.current
        if (!recorder || recorder.state === 'inactive') {
          reject(new Error('No active recording to stop.'))
          return
        }

        recorder.onstop = () => {
          const elapsed = (performance.now() - startedAtRef.current) / 1000
          const type = recorder.mimeType || 'video/webm'
          const blob = new Blob(chunksRef.current, { type })

          setDuration(elapsed)
          setVideoBlob(blob)
          setIsRecording(false)
          recorderRef.current = null
          resolve({ blob, duration: elapsed })
        }

        recorder.onerror = () => {
          setIsRecording(false)
          reject(new Error('Recording failed. Please try again.'))
        }

        recorder.stop()
      }),
    []
  )

  return {
    isRecording,
    videoBlob,
    duration,
    startRecording,
    stopRecording
  }
}
