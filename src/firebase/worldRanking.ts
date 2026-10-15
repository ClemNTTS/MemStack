import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseServices } from './client'

export type RankingMember = { rank: number, alias: string, streak: number, isYou?: boolean }
export type WorldRankingData = { day: string, participants: number, leaders: RankingMember[], self: RankingMember }
export async function getWorldRanking() {
  const { auth } = getFirebaseServices()
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Connexion requise.')
  const response = await httpsCallable<Record<string,never>,WorldRankingData>(getFunctions(auth.app,'europe-west9'),'getWorldRanking')({})
  if (auth.currentUser?.uid !== uid) throw new Error('Compte modifié.')
  return response.data
}
export async function setRankingAlias(alias: string) {
  const { auth } = getFirebaseServices()
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Connexion requise.')
  await httpsCallable(getFunctions(auth.app,'europe-west9'),'setRankingAlias')({alias})
  if (auth.currentUser?.uid !== uid) throw new Error('Compte modifié.')
}
