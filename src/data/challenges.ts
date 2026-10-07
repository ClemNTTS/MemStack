import dossiers from '../../shared/challengeDossiers.json' with { type: 'json' }
import type { Challenge } from '../types/challenge'

export const challengeVersions: Challenge[] = dossiers.challenges
export const challenges = challengeVersions.filter(challenge => challenge.version === 2)

export function getChallengeVersion(id: string, version: number): Challenge | undefined {
  return challengeVersions.find(challenge => challenge.id === id && challenge.version === version)
}
