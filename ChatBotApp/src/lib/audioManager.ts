/**
 * Singleton audio manager.
 * Ensures only one audio stream plays at a time and provides
 * AudioContext unlock for iOS Safari / Chrome autoplay restrictions.
 */

let _audioContext: AudioContext | null = null
let _currentAudio: HTMLAudioElement | null = null

// ─── AudioContext ─────────────────────────────────────────────────────────────

function getAudioContext(): AudioContext {
  if (!_audioContext) {
    _audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
  }
  return _audioContext
}

/**
 * Must be called from a user-gesture handler (mic button click, etc.)
 * so that the AudioContext is in 'running' state before we try to play.
 */
export async function resumeAudioContext(): Promise<void> {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
  } catch (err) {
    console.warn('[audioManager] Could not resume AudioContext:', err)
  }
}

// ─── Playback ──────────────────────────────────────────────────────────────────

/**
 * Stop whatever is currently playing (if anything).
 */
export function stopCurrentAudio(): void {
  if (_currentAudio) {
    _currentAudio.pause()
    _currentAudio.currentTime = 0
    _currentAudio = null
  }
}

/**
 * Play an audio URL immediately.
 * Stops any currently playing audio first.
 * Handles autoplay restrictions safely.
 *
 * @returns The HTMLAudioElement that was created, or null on failure.
 */
export async function playAudio(
  url: string,
  onEnded?: () => void
): Promise<HTMLAudioElement | null> {
  // Stop whatever is currently playing
  stopCurrentAudio()

  const audio = new Audio(url)
  _currentAudio = audio

  // Ensure AudioContext is running (required on iOS Safari)
  await resumeAudioContext()

  audio.addEventListener('ended', () => {
    if (_currentAudio === audio) _currentAudio = null
    onEnded?.()
  })

  try {
    await audio.play()
  } catch (err) {
    // Autoplay blocked – surface warning but don't crash
    console.warn('[audioManager] audio.play() blocked:', err)
    if (_currentAudio === audio) _currentAudio = null
    return null
  }

  return audio
}

/**
 * Returns the currently active audio element (or null).
 */
export function getCurrentAudio(): HTMLAudioElement | null {
  return _currentAudio
}
