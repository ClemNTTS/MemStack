import type { Lesson } from '../../types/lesson'
import type { Card } from '../../types/card'

export type ContentPatch = {
  target: 'lesson' | 'step' | 'choice' | 'card'
  id: string
  field: string
  value: string
}

export type ContentCorrection = {
  reportId: string
  lessonId: string
  cardId: string
  contentVersion: string
  patches: ContentPatch[]
  sources: string[]
  reason: string
}

type CatalogEntry = { lesson: Lesson, cards: Card[] }

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Correction invalide')
  return value as Record<string, unknown>
}

// Agent output is data, never source code, paths, transitions or executable commands.
export function applyContentCorrections(original: CatalogEntry[], input: unknown): CatalogEntry[] {
  const file = object(input)
  if (file.version !== 1 || !Array.isArray(file.entries)) throw new Error('Registre de corrections invalide')
  const result = structuredClone(original)
  const seen = new Set<string>()
  for (const value of file.entries) {
    const entry = object(value)
    if (typeof entry.reportId !== 'string' || !/^[a-zA-Z0-9-]{1,128}$/.test(entry.reportId)
      || seen.has(entry.reportId) || typeof entry.lessonId !== 'string'
      || typeof entry.cardId !== 'string' || typeof entry.contentVersion !== 'string'
      || !/^[a-f0-9]{64}$/.test(entry.contentVersion)
      || !Array.isArray(entry.patches) || entry.patches.length < 1 || entry.patches.length > 12
      || typeof entry.reason !== 'string' || entry.reason.length < 1 || entry.reason.length > 4000
      || !Array.isArray(entry.sources) || entry.sources.length < 1 || entry.sources.length > 6
      || !entry.sources.every(source => typeof source === 'string' && source.startsWith('https://'))) {
      throw new Error('Correction invalide ou dupliquée')
    }
    seen.add(entry.reportId)
    const current = result.find(item => item.lesson.id === entry.lessonId)
    if (!current || (entry.cardId && !current.cards.some(card => card.id === entry.cardId))) {
      throw new Error('Cible de correction inconnue')
    }
    const fields = new Set<string>()
    for (const raw of entry.patches) {
      const patch = object(raw)
      if (typeof patch.id !== 'string' || typeof patch.field !== 'string'
        || typeof patch.value !== 'string' || !patch.value.trim() || patch.value.length > 6000) {
        throw new Error('Texte de correction invalide')
      }
      const key = `${patch.target}/${patch.id}/${patch.field}`
      if (fields.has(key)) throw new Error('Champ de correction dupliqué')
      fields.add(key)
      let target: object | undefined
      let allowed: string[] = []
      if (patch.target === 'card') {
        if (entry.cardId && patch.id !== entry.cardId) throw new Error('Correction hors de la carte signalée')
        target = current.cards.find(card => card.id === patch.id)
        allowed = ['question', 'answer']
      } else if (!entry.cardId && patch.target === 'lesson') {
        target = patch.id === current.lesson.id ? current.lesson : undefined
        allowed = ['title']
      } else if (!entry.cardId && patch.target === 'step') {
        const step = current.lesson.steps.find(item => item.id === patch.id)
        target = step
        allowed = step?.type === 'message' ? ['text'] : step?.type === 'question'
          ? ['prompt'] : step?.type === 'image' ? ['alt', 'caption'] : []
      } else if (!entry.cardId && patch.target === 'choice') {
        const [stepId, choiceId, extra] = patch.id.split('/')
        const step = current.lesson.steps.find(item => item.id === stepId)
        target = !extra && step?.type === 'question' ? step.choices.find(choice => choice.id === choiceId) : undefined
        allowed = ['label', 'feedback']
      }
      if (!target || !allowed.includes(patch.field)) throw new Error('Champ de correction interdit')
      const editable = target as Record<string, unknown>
      editable[patch.field] = patch.value
    }
  }
  return result
}
