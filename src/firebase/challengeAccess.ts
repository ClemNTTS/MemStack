import { doc, getDocFromServer } from 'firebase/firestore'
import { getFirebaseServices } from './client'

export async function readChallengeAccess(uid: string): Promise<boolean> {
  const { auth, db } = getFirebaseServices()
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  const snapshot = await getDocFromServer(doc(db, 'users', uid, 'settings', 'challengeAccess'))
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  return snapshot.exists() && snapshot.data().aiEnabled === true
}
