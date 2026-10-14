import type { Challenge } from '../types/challenge'
import type { DraftStorage } from './challengeDraft'

export const selectionDraftKey = (uid: string, challenge: Challenge) => `memstack.challengeChoices.v1:${encodeURIComponent(uid)}:${challenge.id}:${challenge.version}`

export function loadSelectionDraft(storage: DraftStorage, uid: string, challenge: Challenge): Record<string, string> {
  const raw = storage.getItem(selectionDraftKey(uid, challenge))
  if (!raw) return {}
  const data: unknown = JSON.parse(raw)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Brouillon invalide')
  return Object.fromEntries((challenge.questions ?? []).flatMap(question => {
    const value = (data as Record<string, unknown>)[question.id]
    return typeof value === 'string' && question.options.some(option => option.id === value) ? [[question.id, value]] : []
  }))
}

export function saveSelectionDraft(storage: DraftStorage, uid: string, challenge: Challenge, selections: Record<string, string>) {
  storage.setItem(selectionDraftKey(uid, challenge), JSON.stringify(selections))
}
