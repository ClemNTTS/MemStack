import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Public web identifiers. Firestore rules control access to user data.
const firebaseConfig = {
  apiKey: 'AIzaSyBcZDgXKPhqcFNG_UKSo_Bs_dODgSD4NkQ',
  authDomain: 'memstack-9f581.firebaseapp.com',
  projectId: 'memstack-9f581',
  storageBucket: 'memstack-9f581.firebasestorage.app',
  messagingSenderId: '754791118815',
  appId: '1:754791118815:web:5a051be2bc1c47c480766a',
}

export function getFirebaseServices() {
  const app = getApps().some((candidate) => candidate.name === '[DEFAULT]')
    ? getApp()
    : initializeApp(firebaseConfig)
  return { auth: getAuth(app), db: getFirestore(app) }
}
