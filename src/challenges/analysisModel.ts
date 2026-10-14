import type { ChallengeAnalysis } from '../types/challenge'

export function decodeChallengeAnalysis(input: unknown): ChallengeAnalysis | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const value = input as Record<string, unknown>
  const indices = value.missedCheckpointIndices
  const isV7 = value.promptVersion === 'challenge-feedback-v7'
  const criteria = value.criterionResults
  if (isV7 && value.status === 'completed') {
    if (!Array.isArray(criteria) || !criteria.length || criteria.length > 100 || criteria.some(result => typeof result !== 'boolean') || !Array.isArray(indices)) return null
    const missed = criteria.flatMap((result, index) => result ? [] : [index])
    if (JSON.stringify(indices) !== JSON.stringify(missed) || value.verdict !== (criteria.filter(Boolean).length * 100 > criteria.length * 70 ? 'validated' : 'retry')) return null
  } else if (criteria !== undefined) return null
  if (indices !== undefined && (value.status !== 'completed' || !Array.isArray(indices) || indices.some(index => !Number.isInteger(index) || index < 0 || index > 99) || new Set(indices).size !== indices.length || (!isV7 && (value.verdict === 'validated' ? indices.length !== 0 : value.verdict !== 'retry' || indices.length === 0)))) return null
  if (value.status === 'completed' && ['challenge-feedback-v4', 'challenge-feedback-v5', 'challenge-feedback-v6'].includes(value.promptVersion as string) && (indices === undefined || value.verdict === undefined)) return null
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
    ...(value.verdict === undefined ? {} : { verdict: value.verdict as ChallengeAnalysis['verdict'] }),
    ...(indices === undefined ? {} : { missedCheckpointIndices: [...indices as number[]] }),
    ...(criteria === undefined ? {} : { criterionResults: [...criteria as boolean[]] }) }
}
