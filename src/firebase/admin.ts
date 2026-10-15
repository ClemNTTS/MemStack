import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseServices } from './client'

export async function readAdminStatus(uid: string) {
  const { auth } = getFirebaseServices()
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise.')
  const result = await httpsCallable<Record<string,never>,{admin:boolean}>(getFunctions(auth.app,'europe-west9'),'getAdminStatus')({})
  if (auth.currentUser?.uid !== uid || typeof result.data?.admin !== 'boolean') throw new Error('Vérification indisponible.')
  return result.data
}
