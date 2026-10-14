import dossiers from '../../shared/challengeDossiers.json' with { type: 'json' }
import questionCatalog from '../../shared/challengeQuestions.json' with { type: 'json' }
import type { Challenge } from '../types/challenge'

export const challenges: Challenge[] = dossiers.challenges.filter(challenge => challenge.version === 2).map(challenge => {
  const assessment = questionCatalog.challenges.find(entry => entry.id === challenge.id)
  if (!assessment) throw new Error(`Questions manquantes : ${challenge.id}`)
  return { ...challenge, version: assessment.challengeVersion, rubricVersion: assessment.rubricVersion, questions: assessment.questions }
})
export const challengeVersions: Challenge[] = [...dossiers.challenges, ...challenges]

export function getChallengeVersion(id: string, version: number): Challenge | undefined {
  return challengeVersions.find(challenge => challenge.id === id && challenge.version === version)
}
