import type { ChallengeAttempt, ChallengeOutcome } from '../types/challenge'
import { challenges, getChallengeVersion } from '../data/challenges.ts'

export const challengeIds = new Set(challenges.map(challenge => challenge.id))

export function validateChallengeForm(challengeId: string, observations: string, actions: string) {
  if (!challengeIds.has(challengeId) || typeof observations !== 'string' || typeof actions !== 'string') throw new Error('Défi inconnu')
  const fields = { observations: observations.trim(), actions: actions.trim() }
  if (!fields.observations || !fields.actions || fields.observations.length > 2000 || fields.actions.length > 2000) throw new Error('Deux réponses de 1 à 2 000 caractères sont requises')
  const answer = `${fields.observations}\n\n${fields.actions}`
  if (answer.length > 4000) throw new Error('La réponse complète est limitée à 4 000 caractères')
  return { ...fields, answer }
}

export function validateChallengeAnswer(challengeId: string, answer: string): string {
  if (!challengeIds.has(challengeId) || typeof answer !== 'string') throw new Error('Challenge inconnu')
  const value = answer.trim()
  if (!value || value.length > 4000) throw new Error('Une réponse de 1 à 4 000 caractères est requise')
  return value
}

export function isChallengeOutcome(value: unknown): value is ChallengeOutcome {
  return value === '' || value === 'retry' || value === 'understood'
}

export function decodeChallengeAttempt(id: string, input: unknown): ChallengeAttempt | null {
  if (!/^[a-zA-Z0-9-]{1,128}$/.test(id) || !input || typeof input !== 'object' || Array.isArray(input)) return null
  const value = input as Record<string, unknown>
  const keys = Object.keys(value).sort().join(',')
  const expected = value.version === 2 ? 'actions,answer,challengeId,challengeVersion,observations,outcome,submittedAt,version' : 'answer,challengeId,challengeVersion,outcome,submittedAt,version'
  if (keys !== expected || (value.version !== 1 && value.version !== 2) ||
      typeof value.challengeId !== 'string' || !challengeIds.has(value.challengeId) ||
      !Number.isInteger(value.challengeVersion) || (value.challengeVersion as number) < 1 || (value.challengeVersion as number) > 1000 ||
      typeof value.answer !== 'string' || !value.answer.trim() || value.answer.length > 4000 ||
      typeof value.submittedAt !== 'string' || !isChallengeOutcome(value.outcome)) return null
  const timestamp = new Date(value.submittedAt)
  if (!Number.isFinite(timestamp.getTime()) || timestamp.toISOString() !== value.submittedAt) return null
  if (!getChallengeVersion(value.challengeId, value.challengeVersion as number)) return null
  if (value.version === 2) {
    try {
      if (value.challengeVersion !== 2) return null
      const form = validateChallengeForm(value.challengeId, value.observations as string, value.actions as string)
      if (form.answer !== value.answer || form.observations !== value.observations || form.actions !== value.actions) return null
      return { id, version: 2, challengeId: value.challengeId, challengeVersion: 2, ...form, submittedAt: value.submittedAt, outcome: value.outcome }
    } catch { return null }
  }
  return { id, version: 1, challengeId: value.challengeId, challengeVersion: value.challengeVersion as number, answer: value.answer, submittedAt: value.submittedAt, outcome: value.outcome }
}

export function matchesAttemptSubmission(attempt: ChallengeAttempt, challengeId: string, challengeVersion: number, answer: string): boolean {
  return attempt.challengeId === challengeId && attempt.challengeVersion === challengeVersion && attempt.answer === answer
}

// The transaction uses the same ID on retry; a different immutable payload must never overwrite it.
export async function acknowledgeChallengeAttempt(
  write: () => Promise<void>,
  read: () => Promise<ChallengeAttempt | null>,
  challengeId: string,
  challengeVersion: number,
  answer: string,
): Promise<ChallengeAttempt> {
  let writeError: unknown
  try { await write() } catch (error) { writeError = error }
  const attempt = await read()
  if (!attempt || !matchesAttemptSubmission(attempt, challengeId, challengeVersion, answer)) {
    throw writeError ?? new Error('Tentative non confirmée par le serveur')
  }
  return attempt
}
