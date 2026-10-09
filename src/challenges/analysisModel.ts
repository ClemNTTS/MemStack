import type { ChallengeAnalysis } from '../types/challenge'

export function decodeChallengeAnalysis(input: unknown): ChallengeAnalysis | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const value = input as Record<string, unknown>
  if (!['processing', 'completed', 'failed', 'needs_review'].includes(value.status as string) ||
      typeof value.message !== 'string' || value.message.length > 20000 ||
      (value.status === 'completed' ? !value.message.trim() : value.status !== 'needs_review' && value.message !== '') ||
      !Number.isInteger(value.challengeVersion) || (value.challengeVersion as number) < 1 ||
      !Number.isInteger(value.rubricVersion) || (value.rubricVersion as number) < 1 ||
      typeof value.promptVersion !== 'string' || !value.promptVersion.trim() || value.promptVersion.length > 100 ||
      typeof value.model !== 'string' || value.model.length > 200 ||
      (value.verdict !== undefined && (value.status !== 'completed' || !['validated', 'retry'].includes(value.verdict as string))) ||
      (value.status === 'completed' && value.promptVersion === 'challenge-feedback-v3' && value.verdict === undefined)) return null
  return { status: value.status as ChallengeAnalysis['status'], message: value.message, challengeVersion: value.challengeVersion as number,
    rubricVersion: value.rubricVersion as number, model: value.model, promptVersion: value.promptVersion,
    ...(value.verdict === undefined ? {} : { verdict: value.verdict as ChallengeAnalysis['verdict'] }) }
}
