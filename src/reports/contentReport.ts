import type { Card } from '../types/card'
import type { Lesson } from '../types/lesson'
import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge'

export const reportKinds = ['factual', 'unclear', 'code', 'other'] as const
export type ReportKind = typeof reportKinds[number]
export type ReportContext = {
  lessonId: string
  cardId: string
  contentSnapshot: string
  targetType?: 'challenge' | 'analysis'
  challengeId?: string
  challengeVersion?: number
  rubricVersion?: number
  attemptId?: string
  promptVersion?: string
  model?: string
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
  if (input.targetType) {
    if (!['challenge', 'analysis'].includes(input.targetType) || input.lessonId !== '' || input.cardId !== ''
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.challengeId ?? '') || (input.challengeId?.length ?? 0) > 128
      || !Number.isInteger(input.challengeVersion) || (input.challengeVersion ?? 0) < 1
      || !Number.isInteger(input.rubricVersion) || (input.rubricVersion ?? 0) < 1
      || (input.targetType === 'analysis' && (!/^[a-zA-Z0-9-]{1,128}$/.test(input.attemptId ?? '')
        || !input.promptVersion || input.promptVersion.length > 100 || !input.model || input.model.length > 100))
      || (input.targetType === 'challenge' && (input.attemptId !== '' || input.promptVersion !== '' || input.model !== ''))) {
      throw new Error('Cible du signalement invalide')
    }
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.lessonId) || input.lessonId.length > 128
    || (input.cardId !== '' && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.cardId) || input.cardId.length > 128))) {
    throw new Error('Identifiant de contenu invalide')
  }
  if (!reportKinds.includes(input.kind)) throw new Error('Type de problème invalide')
  if (!comment || comment.length > 2000) throw new Error('Décris le problème en 1 à 2 000 caractères.')
  if (!input.contentSnapshot || input.contentSnapshot.length > 12000) throw new Error('Contenu trop long pour le signalement.')
  if (!/^[a-f0-9]{64}$/.test(input.contentVersion)) throw new Error('Version du contenu invalide')
  return { ...input, comment }
}

export function challengeReportContext(challenge: Challenge): ReportContext {
  return { lessonId: '', cardId: '', targetType: 'challenge', challengeId: challenge.id,
    challengeVersion: challenge.version, rubricVersion: challenge.rubricVersion, attemptId: '', promptVersion: '', model: '',
    contentSnapshot: JSON.stringify({ challenge }) }
}

export function analysisReportContext(challenge: Challenge, attempt: ChallengeAttempt, analysis: ChallengeAnalysis): ReportContext {
  if (analysis.status !== 'completed' || attempt.challengeId !== challenge.id) throw new Error('Analyse indisponible')
  // Never include the learner answer in the editorial report or a public proposal.
  return { lessonId: '', cardId: '', targetType: 'analysis', challengeId: challenge.id,
    challengeVersion: analysis.challengeVersion, rubricVersion: analysis.rubricVersion, attemptId: attempt.id,
    promptVersion: analysis.promptVersion, model: analysis.model,
    contentSnapshot: JSON.stringify({ analysis }) }
}

export async function contentVersion(snapshot: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(snapshot))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
