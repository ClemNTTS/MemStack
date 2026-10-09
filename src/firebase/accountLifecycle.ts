import { getApp } from 'firebase/app'
import { GoogleAuthProvider, reauthenticateWithPopup, signOut } from 'firebase/auth'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseServices } from './client'

let connected = false
function ownAccount(uid: string) {
  const { auth } = getFirebaseServices()
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  return auth
}
function functions() {
  const instance = getFunctions(getApp(), 'europe-west9')
  if (!connected && import.meta.env.VITE_FIREBASE_EMULATORS === 'true' && ['localhost', '127.0.0.1'].includes(location.hostname)) {
    connectFunctionsEmulator(instance, 'localhost', 5001)
    connected = true
  }
  return instance
}
export async function exportOwnAccount(uid: string) {
  ownAccount(uid)
  const result = await httpsCallable<Record<string, never>, unknown>(functions(), 'exportAccountData', { timeout: 180000 })({})
  ownAccount(uid)
  if (!result.data || typeof result.data !== 'object' || !('version' in result.data) || result.data.version !== 1) throw new Error('Export invalide')
  return result.data
}
export async function deleteOwnAccount(uid: string) {
  const auth = ownAccount(uid)
  await reauthenticateWithPopup(auth.currentUser!, new GoogleAuthProvider())
  ownAccount(uid)
  const result = await httpsCallable<{ confirmation: string }, { deleted: boolean }>(functions(), 'deleteAccountData', { timeout: 540000 })({ confirmation: 'SUPPRIMER' })
  if (result.data?.deleted !== true) throw new Error('Suppression non confirmée')
  // A different signed-in account must never be logged out by a late response.
  if (auth.currentUser?.uid === uid) await signOut(auth)
}
