export const film = { duration: 48, fps: 30, width: 1920, height: 1080 }

export const scenes = [
  { start: 0, end: 5, name: 'ideas' },
  { start: 5, end: 11, name: 'assistants' },
  { start: 11, end: 17, name: 'automation' },
  { start: 17, end: 23, name: 'projects' },
  { start: 23, end: 31, name: 'practice' },
  { start: 31, end: 39, name: 'collective' },
  { start: 39, end: 48, name: 'signature' }
]

export const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n))
export const ease = n => 1 - (1 - clamp(n)) ** 3
export const progress = (time, start, duration = .8) => ease((time - start) / duration)
export const mix = (a, b, p) => a + (b - a) * p

export function sceneOpacity(time, scene) {
  return clamp((time - scene.start + .32) / .45) * clamp((scene.end - time + .12) / .32)
}
