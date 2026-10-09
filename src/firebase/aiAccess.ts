import { getApp } from 'firebase/app'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseServices } from './client'

export type AiAccessStatus = { aiEnabled: boolean, invited: boolean, serviceEnabled: boolean, dailyLimit: number, remaining: number, globalAvailable: boolean, resetsAt: string, admin: boolean }

async function call<T>(uid: string, name: string, data: unknown): Promise<T> {
  const check = () => { if (!navigator.onLine || getFirebaseServices().auth.currentUser?.uid !== uid) throw new Error('Connexion requise') }
  check()
  const result = await httpsCallable<unknown, T>(getFunctions(getApp(), 'europe-west9'), name)(data)
  check()
  return result.data
}

export function readAiAccessStatus(uid: string) { return call<AiAccessStatus>(uid, 'getChallengeAccessStatus', {}) }
export function updateAiMember(uid: string, email: string, aiEnabled: boolean, betaInvited: boolean) { return call<{ aiEnabled: boolean, betaInvited: boolean }>(uid, 'updateChallengeMemberAccess', { email, aiEnabled, betaInvited }) }
