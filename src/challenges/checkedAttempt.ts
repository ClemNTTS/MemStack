import { challenges } from '../data/challenges.ts'
import type { ChallengeAttempt, CheckedChallengeResult } from '../types/challenge'

export function validateChallengeSelections(challengeId: string, selections: Record<string, string>) {
  const challenge = challenges.find(entry => entry.id === challengeId)
  const questions = challenge?.questions
  if (!questions?.length || !selections || typeof selections !== 'object' || Array.isArray(selections)
    || Object.keys(selections).length !== questions.length) throw new Error('Réponds à toutes les questions.')
  return Object.fromEntries(questions.map(question => {
    const value = Object.hasOwn(selections, question.id) ? selections[question.id] : undefined
    if (typeof value !== 'string' || !question.options.some(option => option.id === value)) throw new Error('Choisis une réponse par question.')
    return [question.id, value]
  }))
}

export function decodeCheckedAttempt(id: string, value: Record<string, unknown>): ChallengeAttempt | null {
  if (Object.keys(value).sort().join(',') !== 'answer,challengeId,challengeVersion,outcome,result,rubricVersion,selections,submittedAt,version'
    || value.version !== 3 || value.challengeVersion !== 3 || value.outcome !== '' || typeof value.challengeId !== 'string'
    || typeof value.submittedAt !== 'string' || typeof value.answer !== 'string') return null
  const challenge = challenges.find(entry => entry.id === value.challengeId)
  if (!challenge || value.rubricVersion !== challenge.rubricVersion) return null
  try {
    if (new Date(value.submittedAt).toISOString() !== value.submittedAt) return null
    const selections = validateChallengeSelections(challenge.id, value.selections as Record<string, string>)
    if (value.answer !== JSON.stringify(selections)) return null
    const result = value.result as CheckedChallengeResult
    if (!result || typeof result !== 'object' || Array.isArray(result)
      || Object.keys(result).sort().join(',') !== 'correctCount,criterionResults,feedback,graderVersion,missedCheckpointIndices,totalCount,verdict'
      || !Array.isArray(result.feedback) || result.feedback.length !== challenge.questions!.length
      || result.feedback.some(text => typeof text !== 'string' || !text.trim() || text.length > 2000)
      || result.graderVersion !== 'challenge-checks-v1' || result.totalCount !== challenge.questions!.length
      || !Array.isArray(result.criterionResults) || result.criterionResults.length !== result.totalCount
      || result.criterionResults.some(entry => typeof entry !== 'boolean')
      || result.correctCount !== result.criterionResults.filter(Boolean).length
      || result.verdict !== (result.correctCount * 100 > result.totalCount * 70 ? 'validated' : 'retry')) return null
    const missed = [...new Set(challenge.questions!.filter((_, index) => !result.criterionResults[index]).map(question => question.checkpointIndex))]
    if (JSON.stringify(result.missedCheckpointIndices) !== JSON.stringify(missed)) return null
    return { id, version: 3, challengeId: challenge.id, challengeVersion: 3, rubricVersion: challenge.rubricVersion,
      selections, answer: value.answer, submittedAt: value.submittedAt, outcome: '', result: { ...result,
        criterionResults: [...result.criterionResults], missedCheckpointIndices: [...missed] } }
  } catch { return null }
}
