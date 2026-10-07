import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

// Public web identifiers. Firestore rules control access to user data.
const firebaseConfig = {
  apiKey: 'AIzaSyBcZDgXKPhqcFNG_UKSo_Bs_dODgSD4NkQ',
  authDomain: 'memstack-9f581.firebaseapp.com',
  projectId: 'memstack-9f581',
  storageBucket: 'memstack-9f581.firebasestorage.app',
  messagingSenderId: '754791118815',
  appId: '1:754791118815:web:5a051be2bc1c47c480766a',
}

const localHost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
const useEmulators = localHost && import.meta.env.VITE_FIREBASE_EMULATORS === 'true'
let servicesConfigured = false

export function getFirebaseServices() {
  const app = getApps().some((candidate) => candidate.name === '[DEFAULT]')
    ? getApp()
    : initializeApp(useEmulators ? { ...firebaseConfig, projectId: 'demo-memstack' } : firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  if (!servicesConfigured) {
    if (useEmulators) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
      connectFirestoreEmulator(db, 'localhost', 8080)
    } else if (import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      })
    }
    servicesConfigured = true
  }
  return { auth, db }
}
