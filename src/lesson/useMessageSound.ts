import { useEffect, useRef, useState } from 'react'

const soundKey = 'memstack.message-sound'

export function useMessageSound() {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(soundKey) === 'on' } catch { return false }
  })
  const context = useRef<AudioContext | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => () => { void context.current?.close().catch(() => {}) }, [])

  function play() {
    if (!enabled) return
    try {
      const audio = context.current && context.current.state !== 'closed' ? context.current : new AudioContext()
      context.current = audio
      void audio.resume().then(() => {
        if (audio.state !== 'running') return
        const oscillator = audio.createOscillator()
        const gain = audio.createGain()
        oscillator.type = 'sine'
        const now = audio.currentTime
        oscillator.frequency.setValueAtTime(740, now)
        oscillator.frequency.exponentialRampToValueAtTime(1040, now + 0.07)
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.035, now + 0.012)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13)
        oscillator.connect(gain)
        gain.connect(audio.destination)
        oscillator.start(now)
        oscillator.stop(now + 0.14)
        oscillator.onended = () => {
          oscillator.disconnect()
          gain.disconnect()
        }
      }).catch(() => setUnavailable(true))
    } catch { setUnavailable(true) }
  }

  function toggle() {
    const next = !enabled
    setEnabled(next)
    try { localStorage.setItem(soundKey, next ? 'on' : 'off') } catch { /* Session preference remains usable. */ }
  }

  return { enabled, toggle, play, unavailable }
}
