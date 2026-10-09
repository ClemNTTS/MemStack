export type ChallengeDraft = { observations: string, actions: string }
export type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function challengeDraftKey(uid: string, challengeId: string, version: number) {
  return `memstack.challengeDraft.v1:${encodeURIComponent(uid)}:${encodeURIComponent(challengeId)}:${version}`
}

export function loadChallengeDraft(storage: DraftStorage, uid: string, challengeId: string, version: number): ChallengeDraft {
  const raw = storage.getItem(challengeDraftKey(uid, challengeId, version))
  if (!raw) return { observations: '', actions: '' }
  const data: unknown = JSON.parse(raw)
  if (!data || typeof data !== 'object' || !('observations' in data) || !('actions' in data)
    || typeof data.observations !== 'string' || typeof data.actions !== 'string'
    || data.observations.length > 2000 || data.actions.length > 2000) throw new Error('Brouillon invalide')
  return { observations: data.observations, actions: data.actions }
}

export function saveChallengeDraft(storage: DraftStorage, uid: string, challengeId: string, version: number, draft: ChallengeDraft) {
  const key = challengeDraftKey(uid, challengeId, version)
  if (!draft.observations && !draft.actions) storage.removeItem(key)
  else storage.setItem(key, JSON.stringify(draft))
}

export function removeChallengeDraft(storage: DraftStorage, uid: string, challengeId: string, version: number) {
  storage.removeItem(challengeDraftKey(uid, challengeId, version))
}
