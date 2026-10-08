import { useSyncExternalStore } from 'react'

export interface InstallPrompt extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let prompt: InstallPrompt | null = null
const listeners = new Set<() => void>()
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  prompt = event as InstallPrompt
  for (const listener of listeners) listener()
})
window.addEventListener('appinstalled', () => clearInstallPrompt())

export function clearInstallPrompt() {
  prompt = null
  for (const listener of listeners) listener()
}

export function useInstallPrompt() {
  return useSyncExternalStore(listener => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, () => prompt)
}
