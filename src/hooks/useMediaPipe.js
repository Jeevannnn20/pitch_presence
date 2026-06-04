import { useCallback, useEffect, useRef, useState } from 'react'

const emptyMetrics = {
  eyeContact: 0,
  posture: 0,
  headAlignment: 0,
  movementControl: 0
}

const emptyVisionStatus = {
  state: 'loading',
  source: 'tasks-vision',
  faceDetected: false,
  poseDetected: false,
  sampleCount: 0,
  confidence: 0,
  message: 'Loading vision models'
}

const FACE_MODEL_PATH = '/mediapipe/models/face_landmarker.task'
const POSE_MODEL_PATH = '/mediapipe/models/pose_landmarker_lite.task'
const TASKS_WASM_PATH = '/mediapipe/tasks-vision/wasm'

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function averageNumbers(values) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function averagePoint(points) {
  if (!points.length) return { x: 0, y: 0 }
  return {
    x: averageNumbers(points.map((point) => point.x)),
    y: averageNumbers(points.map((point) => point.y))
  }
}

function landmarkVisibility(point) {
  return point?.visibility ?? point?.presence ?? 1
}

function getFaceFeatures(faceLandmarks) {
  if (!faceLandmarks?.length || faceLandmarks.length < 468) {
    return { detected: false }
  }

  const leftIris = faceLandmarks.length >= 478 ? averagePoint(faceLandmarks.slice(468, 473)) : faceLandmarks[468]
  const rightIris = faceLandmarks.length >= 478 ? averagePoint(faceLandmarks.slice(473, 478)) : faceLandmarks[473] || faceLandmarks[468]
  const irisCenter = rightIris
    ? {
        x: (leftIris.x + rightIris.x) / 2,
        y: (leftIris.y + rightIris.y) / 2
      }
    : averagePoint([faceLandmarks[33], faceLandmarks[263]])

  const nose = faceLandmarks[1]
  const leftEye = faceLandmarks[33]
  const rightEye = faceLandmarks[263]
  const leftCheek = faceLandmarks[234]
  const rightCheek = faceLandmarks[454]
  const chin = faceLandmarks[152]
  const forehead = faceLandmarks[10]

  if (!nose || !leftEye || !rightEye || !leftCheek || !rightCheek || !chin || !forehead) {
    return { detected: false }
  }

  const eyeCenter = averagePoint([leftEye, rightEye])
  const faceCenter = averagePoint([leftCheek, rightCheek])
  const faceWidth = Math.max(0.001, Math.abs(rightCheek.x - leftCheek.x))
  const faceHeight = Math.max(0.001, Math.abs(chin.y - forehead.y))

  return {
    detected: true,
    source: 'tasks-face',
    gazeX: (irisCenter.x - nose.x) / faceWidth,
    gazeY: (irisCenter.y - eyeCenter.y) / faceHeight,
    headYaw: (nose.x - faceCenter.x) / faceWidth,
    headPitch: (nose.y - eyeCenter.y) / faceHeight,
    faceCenterX: faceCenter.x,
    faceCenterY: faceCenter.y,
    faceWidth,
    faceHeight
  }
}

function getPoseFeatures(poseLandmarks) {
  if (!poseLandmarks?.length) {
    return { detected: false }
  }

  const nose = poseLandmarks[0]
  const leftShoulder = poseLandmarks[11]
  const rightShoulder = poseLandmarks[12]
  const leftHip = poseLandmarks[23]
  const rightHip = poseLandmarks[24]

  if (
    !nose ||
    !leftShoulder ||
    !rightShoulder ||
    landmarkVisibility(leftShoulder) < 0.35 ||
    landmarkVisibility(rightShoulder) < 0.35
  ) {
    return { detected: false }
  }

  const shoulderCenter = averagePoint([leftShoulder, rightShoulder])
  const hipCenter = leftHip && rightHip ? averagePoint([leftHip, rightHip]) : shoulderCenter
  const shoulderWidth = Math.max(0.001, Math.abs(rightShoulder.x - leftShoulder.x))
  const shoulderSlope = (leftShoulder.y - rightShoulder.y) / shoulderWidth
  const headOffset = (nose.x - shoulderCenter.x) / shoulderWidth
  const torsoLean = (shoulderCenter.x - hipCenter.x) / shoulderWidth

  return {
    detected: true,
    source: 'tasks-pose',
    shoulderSlope,
    headOffset,
    torsoLean,
    shoulderCenterX: shoulderCenter.x,
    shoulderCenterY: shoulderCenter.y,
    shoulderWidth
  }
}

function getFallbackFaceFeatures(detection, video) {
  const box = detection?.boundingBox
  const width = video?.videoWidth || video?.clientWidth || 1
  const height = video?.videoHeight || video?.clientHeight || 1

  if (!box || width <= 1 || height <= 1) {
    return { detected: false }
  }

  const boxX = box.x ?? box.left ?? 0
  const boxY = box.y ?? box.top ?? 0
  const boxWidth = box.width ?? Math.max(0, (box.right ?? 0) - boxX)
  const boxHeight = box.height ?? Math.max(0, (box.bottom ?? 0) - boxY)
  const faceWidth = Math.max(0.001, boxWidth / width)
  const faceHeight = Math.max(0.001, boxHeight / height)
  const faceCenterX = (boxX + boxWidth / 2) / width
  const faceCenterY = (boxY + boxHeight / 2) / height

  return {
    detected: true,
    source: 'browser-face',
    gazeX: (faceCenterX - 0.5) * 0.22,
    gazeY: (faceCenterY - 0.48) * 0.2 + 0.16,
    headYaw: (faceCenterX - 0.5) * 0.35,
    headPitch: (faceCenterY - 0.48) * 0.28 + 0.36,
    faceCenterX,
    faceCenterY,
    faceWidth,
    faceHeight
  }
}

function getFallbackPoseFeatures(face) {
  if (!face.detected) {
    return { detected: false }
  }

  return {
    detected: true,
    source: 'face-estimated-pose',
    shoulderSlope: 0,
    headOffset: (face.faceCenterX - 0.5) / Math.max(0.001, face.faceWidth),
    torsoLean: (face.faceCenterX - 0.5) * 0.4,
    shoulderCenterX: face.faceCenterX,
    shoulderCenterY: clamp(face.faceCenterY + face.faceWidth * 0.9, 0, 1),
    shoulderWidth: clamp(face.faceWidth * 1.9, 0.001, 1)
  }
}

function getSkinFaceEstimate(video, canvas) {
  const width = 128
  const height = 96
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context || !video.videoWidth || !video.videoHeight) {
    return { detected: false }
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(video, 0, 0, width, height)

  const { data } = context.getImageData(0, 0, width, height)
  let total = 0
  let sumX = 0
  let sumY = 0
  let minX = width
  let maxX = 0
  let minY = height
  let maxY = 0
  let luminanceSum = 0

  for (let y = 4; y < height - 4; y += 1) {
    for (let x = 6; x < width - 6; x += 1) {
      const index = (y * width + x) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
      const skinLike =
        r > 60 &&
        g > 35 &&
        b > 20 &&
        max - min > 12 &&
        r > b * 0.92 &&
        cr > 132 &&
        cr < 180 &&
        cb > 75 &&
        cb < 135

      if (skinLike) {
        total += 1
        sumX += x
        sumY += y
        luminanceSum += r * 0.299 + g * 0.587 + b * 0.114
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (total < 360) {
    return { detected: false }
  }

  const boxWidth = maxX - minX + 1
  const boxHeight = maxY - minY + 1
  const area = boxWidth * boxHeight
  const fillRatio = total / Math.max(1, area)
  const aspect = boxWidth / Math.max(1, boxHeight)
  const faceCenterX = sumX / total / width
  const faceCenterY = sumY / total / height

  if (
    area / (width * height) < 0.035 ||
    area / (width * height) > 0.48 ||
    fillRatio < 0.18 ||
    aspect < 0.45 ||
    aspect > 1.7 ||
    faceCenterX < 0.12 ||
    faceCenterX > 0.88 ||
    faceCenterY < 0.18 ||
    faceCenterY > 0.9
  ) {
    return { detected: false }
  }

  const averageLuminance = luminanceSum / total
  let shadowPixels = 0
  for (let y = minY; y <= minY + boxHeight * 0.62; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const index = (Math.round(y) * width + Math.round(x)) * 4
      const lum = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114
      if (lum < averageLuminance - 28) {
        shadowPixels += 1
      }
    }
  }

  if (shadowPixels / Math.max(1, area) < 0.025) {
    return { detected: false }
  }

  const faceWidth = clamp(boxWidth / width, 0.12, 0.7)
  const faceHeight = clamp(boxHeight / height, 0.16, 0.75)

  return {
    detected: true,
    source: 'skin-face',
    gazeX: (faceCenterX - 0.5) * 0.24,
    gazeY: (faceCenterY - 0.48) * 0.2 + 0.16,
    headYaw: (faceCenterX - 0.5) * 0.34,
    headPitch: (faceCenterY - 0.48) * 0.28 + 0.36,
    faceCenterX,
    faceCenterY,
    faceWidth,
    faceHeight
  }
}

function scoreEyeContact(face, baseline) {
  if (!face.detected) return 0

  const reference = baseline?.face || {
    gazeX: 0,
    gazeY: 0.16,
    headYaw: 0,
    headPitch: 0.36,
    faceCenterX: 0.5,
    faceCenterY: 0.48
  }

  const gazeDriftX = Math.abs(face.gazeX - reference.gazeX)
  const gazeDriftY = Math.abs(face.gazeY - reference.gazeY)
  const headYawDrift = Math.abs(face.headYaw - reference.headYaw)
  const headPitchDrift = Math.abs(face.headPitch - reference.headPitch)
  const centerDrift = Math.abs(face.faceCenterX - reference.faceCenterX) + Math.abs(face.faceCenterY - reference.faceCenterY)

  return clamp(1 - gazeDriftX * 7.5 - gazeDriftY * 5.5 - headYawDrift * 2.4 - headPitchDrift * 1.8 - centerDrift * 0.9)
}

function scorePosture(pose, movementControl) {
  if (!pose.detected) return 0

  const shoulderLevelness = clamp(1 - Math.abs(pose.shoulderSlope) * 2.6)
  const headAlignment = clamp(1 - Math.abs(pose.headOffset) * 2.8)
  const torsoUpright = clamp(1 - Math.abs(pose.torsoLean) * 2.4)
  const openFrame = clamp(pose.shoulderWidth * 3.2)

  return clamp(shoulderLevelness * 0.3 + headAlignment * 0.3 + torsoUpright * 0.2 + openFrame * 0.1 + movementControl * 0.1)
}

function scoreFaceFramingPosture(face, movementControl) {
  if (!face.detected) return 0

  const centered = clamp(1 - Math.abs(face.faceCenterX - 0.5) * 2.4)
  const eyeLevel = clamp(1 - Math.abs(face.faceCenterY - 0.5) * 2.2)
  const frameSize = clamp(1 - Math.abs((face.faceWidth || 0.28) - 0.3) * 2.6)

  return clamp(centered * 0.35 + eyeLevel * 0.3 + frameSize * 0.2 + movementControl * 0.15)
}

function scoreHeadAlignment(face, pose, baseline) {
  const faceScore = face.detected ? scoreEyeContact({ ...face, gazeX: baseline?.face?.gazeX ?? face.gazeX, gazeY: baseline?.face?.gazeY ?? face.gazeY }, baseline) : 0
  const poseScore = pose.detected ? clamp(1 - Math.abs(pose.headOffset) * 2.8) : 0

  if (face.detected && pose.detected) return clamp(faceScore * 0.45 + poseScore * 0.55)
  return face.detected ? faceScore : poseScore
}

function scoreMovementControl(anchor, previousAnchor) {
  if (!anchor) return 0
  if (!previousAnchor) return 0.5

  const drift =
    Math.abs(anchor.x - previousAnchor.x) +
    Math.abs(anchor.y - previousAnchor.y) +
    Math.abs(anchor.width - previousAnchor.width) * 0.7

  return clamp(1 - drift * 12)
}

function makeAnchor(face, pose) {
  if (pose.detected) {
    return {
      x: pose.shoulderCenterX,
      y: pose.shoulderCenterY,
      width: pose.shoulderWidth
    }
  }

  if (face.detected) {
    return {
      x: face.faceCenterX,
      y: face.faceCenterY,
      width: face.faceWidth
    }
  }

  return null
}

function buildCalibrationProfile(samples) {
  const faceSamples = samples.filter((sample) => sample.face.detected).map((sample) => sample.face)
  const poseSamples = samples.filter((sample) => sample.pose.detected).map((sample) => sample.pose)

  if (faceSamples.length < 8) {
    return null
  }

  return {
    face: {
      gazeX: averageNumbers(faceSamples.map((sample) => sample.gazeX)),
      gazeY: averageNumbers(faceSamples.map((sample) => sample.gazeY)),
      headYaw: averageNumbers(faceSamples.map((sample) => sample.headYaw)),
      headPitch: averageNumbers(faceSamples.map((sample) => sample.headPitch)),
      faceCenterX: averageNumbers(faceSamples.map((sample) => sample.faceCenterX)),
      faceCenterY: averageNumbers(faceSamples.map((sample) => sample.faceCenterY)),
      faceWidth: averageNumbers(faceSamples.map((sample) => sample.faceWidth || 0.32))
    },
    pose: poseSamples.length
      ? {
          shoulderSlope: averageNumbers(poseSamples.map((sample) => sample.shoulderSlope)),
          headOffset: averageNumbers(poseSamples.map((sample) => sample.headOffset)),
          torsoLean: averageNumbers(poseSamples.map((sample) => sample.torsoLean))
        }
      : null,
    sampleCount: samples.length,
    calibratedAt: Date.now()
  }
}

async function createLandmarkerTasks({ FaceLandmarker, PoseLandmarker, vision, delegate }) {
  const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: FACE_MODEL_PATH,
      delegate
    },
    runningMode: 'VIDEO',
    numFaces: 1,
    minFaceDetectionConfidence: 0.45,
    minFacePresenceConfidence: 0.45,
    minTrackingConfidence: 0.45,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false
  })

  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: POSE_MODEL_PATH,
      delegate
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.35,
    minPosePresenceConfidence: 0.35,
    minTrackingConfidence: 0.35
  })

  return { faceLandmarker, poseLandmarker, delegate }
}

export default function useMediaPipe(videoRef, isCollecting) {
  const [metrics, setMetrics] = useState(emptyMetrics)
  const [visionStatus, setVisionStatus] = useState(emptyVisionStatus)
  const [calibrationStatus, setCalibrationStatus] = useState('uncalibrated')
  const [calibrationProgress, setCalibrationProgress] = useState(0)
  const samplesRef = useRef({ eyeContact: [], posture: [], headAlignment: [], movementControl: [] })
  const startedAtRef = useRef(0)
  const collectingRef = useRef(false)
  const calibrationRef = useRef({ active: false, samples: [], startedAt: 0, duration: 3000 })
  const calibrationProfileRef = useRef(null)
  const previousAnchorRef = useRef(null)

  const resetVisionSamples = useCallback(() => {
    samplesRef.current = { eyeContact: [], posture: [], headAlignment: [], movementControl: [] }
    startedAtRef.current = performance.now()
    previousAnchorRef.current = null
  }, [])

  const startCalibration = useCallback((duration = 3000) => {
    calibrationRef.current = {
      active: true,
      samples: [],
      startedAt: performance.now(),
      duration
    }
    setCalibrationStatus('calibrating')
    setCalibrationProgress(0)
  }, [])

  useEffect(() => {
    collectingRef.current = isCollecting
  }, [isCollecting])

  useEffect(() => {
    let cancelled = false
    let inFlight = false
    let lastFrameAt = 0
    let animationId = 0
    let faceLandmarker = null
    let poseLandmarker = null
    let taskDelegate = 'CPU'
    let nativeFaceDetector = null
    const fallbackCanvas = document.createElement('canvas')
    let smoothedMetrics = emptyMetrics
    let frameCount = 0

    if ('FaceDetector' in window) {
      try {
        nativeFaceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
      } catch {
        nativeFaceDetector = null
      }
    }

    async function getFallbackFeatures(video) {
      if (nativeFaceDetector) {
        try {
          const detections = await nativeFaceDetector.detect(video)
          const face = getFallbackFaceFeatures(detections?.[0], video)
          if (face.detected) {
            return { face, pose: getFallbackPoseFeatures(face), source: 'browser-face' }
          }
        } catch {
          nativeFaceDetector = null
        }
      }

      const skinFace = getSkinFaceEstimate(video, fallbackCanvas)
      return { face: skinFace, pose: getFallbackPoseFeatures(skinFace), source: skinFace.detected ? 'skin-face' : 'none' }
    }

    function computeMetrics(face, detectedPose, source) {
      if (!face.detected) {
        previousAnchorRef.current = null
        return emptyMetrics
      }

      const anchor = makeAnchor(face, detectedPose)
      const movementControl = scoreMovementControl(anchor, previousAnchorRef.current)
      previousAnchorRef.current = anchor || previousAnchorRef.current

      const baseline = calibrationProfileRef.current
      const isFallback = source !== 'tasks-vision'
      const fallbackMultiplier = source === 'skin-face' ? 0.72 : 0.82
      const eyeContact = scoreEyeContact(face, baseline)
      const headAlignment = scoreHeadAlignment(face, detectedPose, baseline)
      const posture = detectedPose.detected
        ? scorePosture(detectedPose, movementControl)
        : scoreFaceFramingPosture(face, movementControl)

      return {
        eyeContact: isFallback ? clamp(eyeContact * fallbackMultiplier) : eyeContact,
        posture: isFallback ? clamp(posture * fallbackMultiplier) : posture,
        headAlignment: isFallback ? clamp(headAlignment * fallbackMultiplier) : headAlignment,
        movementControl: isFallback ? clamp(movementControl * fallbackMultiplier) : movementControl
      }
    }

    function updateCalibration(face, pose) {
      const calibration = calibrationRef.current
      if (!calibration.active) return

      const elapsed = performance.now() - calibration.startedAt
      if (face.detected) {
        calibration.samples.push({ face, pose })
      }
      setCalibrationProgress(clamp(elapsed / calibration.duration))

      if (elapsed >= calibration.duration) {
        const profile = buildCalibrationProfile(calibration.samples)
        calibration.active = false
        calibrationProfileRef.current = profile
        setCalibrationProgress(1)
        setCalibrationStatus(profile ? 'ready' : 'failed')
      }
    }

    function publishUnavailableStatus(status) {
      smoothedMetrics = emptyMetrics
      previousAnchorRef.current = null
      updateCalibration({ detected: false }, { detected: false })
      setMetrics(emptyMetrics)
      setVisionStatus({
        sampleCount: frameCount,
        confidence: 0,
        ...status
      })
    }

    function publishMetrics(nextMetrics, face, detectedPose, source) {
      smoothedMetrics = {
        eyeContact: smoothedMetrics.eyeContact * 0.68 + nextMetrics.eyeContact * 0.32,
        posture: smoothedMetrics.posture * 0.68 + nextMetrics.posture * 0.32,
        headAlignment: smoothedMetrics.headAlignment * 0.68 + nextMetrics.headAlignment * 0.32,
        movementControl: smoothedMetrics.movementControl * 0.68 + nextMetrics.movementControl * 0.32
      }

      updateCalibration(face, detectedPose)

      const timestamp = (performance.now() - startedAtRef.current) / 1000
      setMetrics(smoothedMetrics)

      const fullTasksLock = source === 'tasks-vision' && face.detected && detectedPose.detected
      const partialTasksLock = source === 'tasks-vision' && face.detected && !detectedPose.detected

      setVisionStatus({
        state: fullTasksLock ? 'tracking' : partialTasksLock ? 'partial' : 'fallback',
        source,
        faceDetected: face.detected,
        poseDetected: detectedPose.detected,
        sampleCount: frameCount,
        confidence: fullTasksLock ? 94 : partialTasksLock ? 82 : source === 'browser-face' ? 64 : 52,
        message: fullTasksLock
          ? `Face and pose landmarks active (${taskDelegate})`
          : partialTasksLock
            ? `Face landmarks active (${taskDelegate}); posture estimated`
            : source === 'browser-face'
              ? 'Browser face fallback active'
              : 'Camera fallback active'
      })

      if (collectingRef.current) {
        samplesRef.current.eyeContact.push({ timestamp, value: smoothedMetrics.eyeContact })
        samplesRef.current.posture.push({ timestamp, value: smoothedMetrics.posture })
        samplesRef.current.headAlignment.push({ timestamp, value: smoothedMetrics.headAlignment })
        samplesRef.current.movementControl.push({ timestamp, value: smoothedMetrics.movementControl })
      }
    }

    function runTasks(video, now) {
      if (!faceLandmarker) return { face: { detected: false }, pose: { detected: false }, source: 'none' }

      const faceResult = faceLandmarker.detectForVideo(video, now)
      const poseResult = poseLandmarker?.detectForVideo(video, now)
      const face = getFaceFeatures(faceResult?.faceLandmarks?.[0])
      const pose = getPoseFeatures(poseResult?.landmarks?.[0])

      return { face, pose, source: face.detected ? 'tasks-vision' : 'none' }
    }

    const tick = async (now) => {
      const video = videoRef.current

      if (!cancelled && video?.readyState >= 2 && !inFlight && now - lastFrameAt >= 80) {
        inFlight = true
        lastFrameAt = now

        try {
          frameCount += 1
          const tasksResult = runTasks(video, now)

          if (tasksResult.face.detected) {
            publishMetrics(computeMetrics(tasksResult.face, tasksResult.pose, tasksResult.source), tasksResult.face, tasksResult.pose, tasksResult.source)
          } else {
            const fallback = await getFallbackFeatures(video)
            if (fallback.face.detected) {
              publishMetrics(computeMetrics(fallback.face, fallback.pose, fallback.source), fallback.face, fallback.pose, fallback.source)
            } else {
              publishUnavailableStatus({
                state: faceLandmarker ? 'searching' : 'loading',
                source: 'none',
                faceDetected: false,
                poseDetected: false,
                message: faceLandmarker ? 'No person detected' : 'Loading vision models'
              })
            }
          }
        } catch (error) {
          console.warn('Vision frame failed:', error)
          const fallback = await getFallbackFeatures(video)
          if (fallback.face.detected) {
            publishMetrics(computeMetrics(fallback.face, fallback.pose, fallback.source), fallback.face, fallback.pose, fallback.source)
          } else {
            publishUnavailableStatus({
              state: 'degraded',
              source: 'none',
              faceDetected: false,
              poseDetected: false,
              message: 'Vision fallback searching'
            })
          }
        } finally {
          inFlight = false
        }
      }

      animationId = window.requestAnimationFrame(tick)
    }

    async function initializeVisionTasks() {
      try {
        const { FaceLandmarker, FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision')
        if (cancelled) return

        const vision = await FilesetResolver.forVisionTasks(TASKS_WASM_PATH)
        let tasks
        try {
          tasks = await createLandmarkerTasks({ FaceLandmarker, PoseLandmarker, vision, delegate: 'GPU' })
        } catch (gpuError) {
          console.warn('GPU vision delegate failed, falling back to CPU:', gpuError)
          tasks = await createLandmarkerTasks({ FaceLandmarker, PoseLandmarker, vision, delegate: 'CPU' })
        }

        if (cancelled) {
          tasks.faceLandmarker?.close()
          tasks.poseLandmarker?.close()
          return
        }

        faceLandmarker = tasks.faceLandmarker
        poseLandmarker = tasks.poseLandmarker
        taskDelegate = tasks.delegate

        setVisionStatus({
          ...emptyVisionStatus,
          state: 'ready',
          source: 'tasks-vision',
          message: `Vision models ready (${taskDelegate})`
        })
      } catch (error) {
        console.warn('MediaPipe Tasks failed to initialize:', error)
        setVisionStatus({
          state: nativeFaceDetector ? 'degraded' : 'error',
          source: nativeFaceDetector ? 'browser-face' : 'none',
          faceDetected: false,
          poseDetected: false,
          sampleCount: frameCount,
          confidence: 0,
          message: nativeFaceDetector ? 'Using browser face fallback' : 'Vision models failed'
        })
      } finally {
        if (!cancelled) {
          animationId = window.requestAnimationFrame(tick)
        }
      }
    }

    initializeVisionTasks()

    return () => {
      cancelled = true
      window.cancelAnimationFrame(animationId)
      faceLandmarker?.close()
      poseLandmarker?.close()
    }
  }, [videoRef])

  return {
    visionMetrics: metrics,
    visionSamples: samplesRef.current,
    resetVisionSamples,
    startCalibration,
    calibrationStatus,
    calibrationProgress,
    calibrationProfile: calibrationProfileRef.current,
    visionStatus
  }
}
