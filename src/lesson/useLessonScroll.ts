import { useEffect, useRef } from 'react'

// Media can change a message's height after React has rendered it.
export function useLessonScroll(turn: string, active: boolean, target: 'end' | 'current' = 'end') {
  const contentRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const content = contentRef.current
    if (!content || !active) return
    let following = true
    let frame = 0
    const follow = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!following) return
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        if (getComputedStyle(content).overflowY === 'visible') {
          const current = target === 'current' ? content.querySelector<HTMLElement>('[data-current="true"]') : null
          if (current) current.scrollIntoView({ block: current.offsetHeight > innerHeight - 150 ? 'start' : 'nearest', behavior })
          else endRef.current?.scrollIntoView({ block: 'nearest', behavior })
        } else {
          content.scrollTo({ top: content.scrollHeight, behavior })
        }
      })
    }
    const stopFollowing = () => { following = false }
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Enter', ' '].includes(event.key)) stopFollowing()
    }
    const observer = new ResizeObserver(follow)
    for (const child of content.children) observer.observe(child)
    content.addEventListener('load', follow, true)
    window.addEventListener('wheel', stopFollowing, { passive: true })
    window.addEventListener('touchstart', stopFollowing, { passive: true })
    window.addEventListener('pointerdown', stopFollowing, { passive: true })
    window.addEventListener('keydown', onKey)
    follow()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      content.removeEventListener('load', follow, true)
      window.removeEventListener('wheel', stopFollowing)
      window.removeEventListener('touchstart', stopFollowing)
      window.removeEventListener('pointerdown', stopFollowing)
      window.removeEventListener('keydown', onKey)
    }
  }, [turn, active, target])

  return { contentRef, endRef }
}
