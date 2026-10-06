import type { ChallengeAttempt, ChallengeOutcome } from '../types/challenge'
import { challenges } from '../data/challenges.ts'

export const challengeIds = new Set(challenges.map(challenge => challenge.id))

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
  if (keys !== 'answer,challengeId,challengeVersion,outcome,submittedAt,version' || value.version !== 1 ||
      typeof value.challengeId !== 'string' || !challengeIds.has(value.challengeId) ||
      !Number.isInteger(value.challengeVersion) || (value.challengeVersion as number) < 1 || (value.challengeVersion as number) > 1000 ||
      typeof value.answer !== 'string' || !value.answer.trim() || value.answer.length > 4000 ||
      typeof value.submittedAt !== 'string' || !isChallengeOutcome(value.outcome)) return null
  const timestamp = new Date(value.submittedAt)
  if (!Number.isFinite(timestamp.getTime()) || timestamp.toISOString() !== value.submittedAt) return null
  return { id, version: 1, challengeId: value.challengeId, challengeVersion: value.challengeVersion as number, answer: value.answer,
    submittedAt: value.submittedAt, outcome: value.outcome }
}

export function matchesAttemptSubmission(attempt: ChallengeAttempt, challengeId: string, challengeVersion: number, answer: string): boolean {
  return attempt.version === 1 && attempt.challengeId === challengeId && attempt.challengeVersion === challengeVersion && attempt.answer === answer
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
