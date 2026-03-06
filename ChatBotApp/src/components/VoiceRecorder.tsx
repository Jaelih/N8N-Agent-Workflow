import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { resumeAudioContext, stopCurrentAudio } from '../lib/audioManager'

export type VoiceStatus = 'idle' | 'recording' | 'processing' | 'sending' | 'success' | 'error'

// 5 frequency-band indices sampled from the analyser's 256-bin array.
// These cover roughly: sub-bass, bass, low-mid, mid, high-mid.
const BAND_INDICES = [3, 8, 18, 38, 75]
const MIN_H = 3   // px — resting height when silent
const MAX_H = 20  // px — max height at full volume
const LERP  = 0.28 // smoothing factor (0 = frozen, 1 = instant)

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onRecordingStart?: () => void
  onRecordingError?: (error: Error) => void
  voiceStatus?: VoiceStatus
  disabled?: boolean
}

export default function VoiceRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingError,
  voiceStatus = 'idle',
  disabled,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording]   = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  // Live bar heights driven by Web Audio AnalyserNode
  const [barHeights, setBarHeights]     = useState<number[]>([MIN_H, MIN_H, MIN_H, MIN_H, MIN_H])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const timerRef         = useRef<number | null>(null)
  const audioCtxRef      = useRef<AudioContext | null>(null)
  const analyserRef      = useRef<AnalyserNode | null>(null)
  const rafRef           = useRef<number | null>(null)
  // Smoothed heights live outside React state to avoid stale-closure issues
  const smoothRef        = useRef<number[]>([MIN_H, MIN_H, MIN_H, MIN_H, MIN_H])

  // ── Audio-level animation loop ───────────────────────────────────────────
  const startAnalyserLoop = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      analyser.getByteFrequencyData(data)

      const next = BAND_INDICES.map((binIdx) => {
        // Average 3 adjacent bins for a slightly smoother reading
        const avg = (data[binIdx - 1] + data[binIdx] + data[binIdx + 1]) / 3
        return MIN_H + (avg / 255) * (MAX_H - MIN_H)
      })

      // Lerp toward target heights
      smoothRef.current = smoothRef.current.map((cur, i) =>
        cur + (next[i] - cur) * LERP
      )

      setBarHeights([...smoothRef.current])
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const stopAnalyserLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    analyserRef.current?.disconnect()
    analyserRef.current = null
    // Close context asynchronously so MediaRecorder can finish
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    smoothRef.current = [MIN_H, MIN_H, MIN_H, MIN_H, MIN_H]
    setBarHeights([MIN_H, MIN_H, MIN_H, MIN_H, MIN_H])
  }, [])

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0)
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      stopAnalyserLoop()
    }
  }, [stopAnalyserLoop])

  // ── Start / Stop ─────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      await resumeAudioContext()
      stopCurrentAudio()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Set up Web Audio AnalyserNode on the live mic stream
      const audioCtx = new AudioContext()
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.6
      audioCtx.createMediaStreamSource(stream).connect(analyser)
      audioCtxRef.current = audioCtx
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        onRecordingComplete(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      onRecordingStart?.()
      startAnalyserLoop()

    } catch (error) {
      console.error('Error accessing microphone:', error)
      onRecordingError?.(error instanceof Error ? error : new Error('Microphone access denied'))
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      stopAnalyserLoop()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Derive button disabled state — block button when processing/sending
  const isBusy = voiceStatus === 'processing' || voiceStatus === 'sending'
  const isButtonDisabled = disabled || isBusy

  return (
    <div className="flex items-center flex-shrink-0">

      {/* ── Recording: waveform circle + timer ────────────────────── */}
      {isRecording ? (
        <div className="flex items-center gap-2">
          {/* Sound wave circle button — click to stop */}
          <button
            onClick={stopRecording}
            aria-label="Stop recording"
            className="relative flex items-center justify-center h-10 w-10 rounded-full
              bg-red-500 shadow-lg
              hover:bg-red-600 active:scale-95
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
          >
            {/* Outer glow ring */}
            <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping" />
            {/* 5 bars driven by live audio levels */}
            <div className="relative flex items-center gap-[3px]">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-white"
                  style={{
                    height: `${h}px`,
                    transition: 'height 40ms linear',
                  }}
                />
              ))}
            </div>
          </button>
          {/* Timer */}
          <span className="text-sm font-medium text-red-600 tabular-nums">
            {formatTime(recordingTime)}
          </span>
        </div>
      ) : (
        /* ── Idle / busy: normal mic button ──────────────────────── */
        <Button
          onClick={startRecording}
          disabled={isButtonDisabled}
          size="icon"
          aria-label="Start voice message"
          className={`rounded-full h-10 w-10 shadow-md hover:shadow-lg transition-all ${
            voiceStatus === 'error' ? 'ring-2 ring-red-400' : ''
          }`}
        >
          {isBusy ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
      )}
    </div>
  )
}


