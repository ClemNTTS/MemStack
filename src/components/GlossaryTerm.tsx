import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { GlossaryEntry } from './lessonGlossary'
import './lessonGlossary.css'

export default function GlossaryTerm({ text, entry }: { text: string; entry: GlossaryEntry }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ left: 12, top: 12 })
  const trigger = useRef<HTMLButtonElement>(null)
  const bubble = useRef<HTMLSpanElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const id = useId()
  const keepOpen = () => { clearTimeout(closeTimer.current); setOpen(true) }
  const leave = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      if (document.activeElement !== trigger.current) setOpen(false)
    }, 160)
  }

  const placeBubble = () => {
    if (!trigger.current || !bubble.current) return
    const anchor = trigger.current.getBoundingClientRect()
    const tip = { width: bubble.current.offsetWidth, height: bubble.current.offsetHeight }
    const left = Math.max(12, Math.min(anchor.left, document.documentElement.clientWidth - tip.width - 12))
    const below = anchor.bottom + 10
    setPosition({ left, top: below + tip.height < window.innerHeight - 12 ? below : Math.max(12, anchor.top - tip.height - 10) })
  }
  useLayoutEffect(() => { if (open) placeBubble() }, [open])

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const outside = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !bubble.current?.contains(event.target as Node)) close()
    }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    window.addEventListener('resize', close)
    const reposition = () => {
      const rect = trigger.current?.getBoundingClientRect()
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) close()
      else placeBubble()
    }
    window.addEventListener('scroll', reposition, true)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [open])
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  return <><button className="lesson-glossary-term" type="button" ref={trigger} aria-label={`Définition : ${text}`} aria-expanded={open} aria-describedby={open ? id : undefined} onPointerEnter={event => { if (event.pointerType === 'mouse') keepOpen() }} onPointerLeave={leave} onFocus={keepOpen} onBlur={() => setOpen(false)} onClick={keepOpen}>{text}</button>{open && createPortal(<span className="lesson-glossary-tooltip" id={id} role="tooltip" ref={bubble} style={position} onPointerEnter={keepOpen} onPointerLeave={leave}><strong>{entry.title}</strong><span>{entry.definition}</span></span>, document.body)}</>
}
