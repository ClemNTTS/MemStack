import type { Card } from '../types/card'
import type { Lesson } from '../types/lesson'

export const reportKinds = ['factual', 'unclear', 'code', 'other'] as const
export type ReportKind = typeof reportKinds[number]
export type ReportContext = {
  lessonId: string
  cardId: string
  contentSnapshot: string
}
export type ContentReportInput = ReportContext & {
  kind: ReportKind
  comment: string
  contentVersion: string
}

export function lessonReportContext(lesson: Lesson, cards: Card[]): ReportContext {
  return {
    lessonId: lesson.id,
    cardId: '',
    contentSnapshot: JSON.stringify({ lesson, cards: lesson.cardIds.map(id => {
      const card = cards.find(entry => entry.id === id)
      if (!card) throw new Error('Carte de la leçon introuvable')
      return card
    }) }),
  }
}

export function cardReportContext(card: Card, lessons: Lesson[]): ReportContext {
  const lesson = lessons.find(entry => entry.cardIds.includes(card.id))
  if (!lesson) throw new Error('Leçon de la carte introuvable')
  return { lessonId: lesson.id, cardId: card.id, contentSnapshot: JSON.stringify({ card }) }
}

export function validateContentReport(input: ContentReportInput): ContentReportInput {
  const comment = input.comment.trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.lessonId) || input.lessonId.length > 128
    || (input.cardId !== '' && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.cardId) || input.cardId.length > 128))) {
    throw new Error('Identifiant de contenu invalide')
  }
  if (!reportKinds.includes(input.kind)) throw new Error('Type de problème invalide')
  if (!comment || comment.length > 2000) throw new Error('Décris le problème en 1 à 2 000 caractères.')
  if (!input.contentSnapshot || input.contentSnapshot.length > 12000) throw new Error('Contenu trop long pour le signalement.')
  if (!/^[a-f0-9]{64}$/.test(input.contentVersion)) throw new Error('Version du contenu invalide')
  return { ...input, comment }
}

export async function contentVersion(snapshot: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(snapshot))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
