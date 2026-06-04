import { useCallback, useEffect, useRef, useState } from 'react'

export default function useAudioAnalyzer(stream, isCollecting) {
  const [energy, setEnergy] = useState(0)
  const samplesRef = useRef([])
  const startedAtRef = useRef(0)
  const intervalRef = useRef(null)
  const contextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)

  const resetSamples = useCallback(() => {
    samplesRef.current = []
    startedAtRef.current = performance.now()
  }, [])

  const resumeAudio = useCallback(async () => {
    if (contextRef.current?.state === 'suspended') {
      await contextRef.current.resume()
    }
  }, [])

  useEffect(() => {
    if (!stream) return undefined

    const audioTracks = stream.getAudioTracks()
    if (!audioTracks.length) return undefined

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const context = new AudioContextClass()
    const analyser = context.createAnalyser()
    const source = context.createMediaStreamSource(new MediaStream(audioTracks))

    analyser.fftSize = 2048
    source.connect(analyser)

    contextRef.current = context
    analyserRef.current = analyser
    sourceRef.current = source

    return () => {
      window.clearInterval(intervalRef.current)
      source.disconnect()
      context.close()
    }
  }, [stream])

  useEffect(() => {
    window.clearInterval(intervalRef.current)

    if (!isCollecting || !analyserRef.current) {
      return undefined
    }

    const analyser = analyserRef.current
    const buffer = new Float32Array(analyser.fftSize)

    intervalRef.current = window.setInterval(() => {
      analyser.getFloatTimeDomainData(buffer)
      const sumSquares = buffer.reduce((sum, value) => sum + value * value, 0)
      const rms = Math.sqrt(sumSquares / buffer.length)
      const normalized = Math.min(1, rms * 8)
      const timestamp = (performance.now() - startedAtRef.current) / 1000

      setEnergy(normalized)
      samplesRef.current.push({ timestamp, value: normalized, rms })
    }, 500)

    return () => window.clearInterval(intervalRef.current)
  }, [isCollecting])

  return {
    energy,
    energySamples: samplesRef.current,
    resetAudioSamples: resetSamples,
    resumeAudio
  }
}
