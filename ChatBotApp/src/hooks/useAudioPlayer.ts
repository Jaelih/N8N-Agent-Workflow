import { useEffect, useRef, useState } from 'react'
import { playAudio } from '../lib/audioManager'

export interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
}

/**
 * Automatically plays the given audioUrl as soon as it is available.
 * Cleans up on unmount. Relies on the global audioManager singleton so
 * only one audio stream is ever active at a time.
 */
export function useAudioPlayer(audioUrl: string | undefined): AudioPlayerState {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioUrl) return

    let cancelled = false

    const start = async () => {
      const audio = await playAudio(audioUrl, () => {
        if (!cancelled) {
          setIsPlaying(false)
          setCurrentTime(0)
        }
      })

      if (!audio || cancelled) {
        if (audio) audio.pause()
        return
      }

      audioRef.current = audio

      const onPlay = () => { if (!cancelled) setIsPlaying(true) }
      const onPause = () => { if (!cancelled) setIsPlaying(false) }
      const onMeta = () => { if (!cancelled) setDuration(audio.duration) }
      const onTime = () => { if (!cancelled) setCurrentTime(audio.currentTime) }

      audio.addEventListener('play', onPlay)
      audio.addEventListener('pause', onPause)
      audio.addEventListener('loadedmetadata', onMeta)
      audio.addEventListener('timeupdate', onTime)

      // Seed values immediately if metadata is already loaded
      if (audio.readyState >= 1) setDuration(audio.duration)
      if (audio.readyState >= 3) setCurrentTime(audio.currentTime)
    }

    start()

    return () => {
      cancelled = true
      // Do NOT call stopCurrentAudio() here – the global manager handles it
      // when the next audio starts. Stopping on unmount would silence audio
      // that should keep playing while the message is still visible.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl])

  return { isPlaying, currentTime, duration }
}
