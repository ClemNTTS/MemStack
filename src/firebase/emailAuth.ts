import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updateProfile, reload, updatePassword, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth'
import { getFirebaseServices } from './client'

function services() {
  const { auth } = getFirebaseServices()
  auth.languageCode = 'fr'
  return auth
}
const returnUrl = () => ({ url: `${window.location.origin}${import.meta.env.BASE_URL}` })
export async function loginWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(services(),email.trim(),password)
}
export async function registerWithEmail(email: string, password: string, name: string) {
  if (password.length < 12 || password.length > 128) throw new Error('Choisis un mot de passe de 12 à 128 caractères.')
  const auth = services()
  const { user } = await createUserWithEmailAndPassword(auth,email.trim(),password)
  if (auth.currentUser?.uid !== user.uid) throw new Error('Compte modifié.')
  await updateProfile(user,{displayName:name.trim().slice(0,40)})
  if (auth.currentUser?.uid !== user.uid) throw new Error('Compte modifié.')
  await sendEmailVerification(user,returnUrl())
}
export async function sendVerification() {
  const user = services().currentUser
  if (!user) throw new Error('Connexion requise.')
  await sendEmailVerification(user,returnUrl())
}
export async function refreshVerification() {
  const auth = services()
  const user = auth.currentUser
  if (!user) throw new Error('Connexion requise.')
  await reload(user)
  if (auth.currentUser?.uid !== user.uid) throw new Error('Compte modifié.')
  await user.getIdToken(true)
  return user.emailVerified
}
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(services(),email.trim(),returnUrl())
}
export async function addPassword(password: string) {
  const auth = services()
  const user = auth.currentUser
  if (!user?.email || !user.emailVerified || !user.providerData.some(provider=>provider.providerId==='google.com')) throw new Error('Connecte-toi avec Google pour ajouter un mot de passe.')
  if (password.length < 12 || password.length > 128) throw new Error('Choisis un mot de passe de 12 à 128 caractères.')
  await reauthenticateWithPopup(user,new GoogleAuthProvider())
  if (auth.currentUser?.uid !== user.uid) throw new Error('Compte modifié.')
  await updatePassword(user,password)
}
export function authenticationMessage(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : ''
  if (['auth/invalid-credential','auth/invalid-login-credentials','auth/wrong-password','auth/user-not-found'].includes(String(code))) return 'Email ou mot de passe incorrect. Tu peux aussi utiliser Google ou réinitialiser ton mot de passe.'
  if (code === 'auth/email-already-in-use') return 'Cette adresse est déjà utilisée. Connecte-toi à ton compte existant, avec Google si tu l’avais choisi.'
  if (code === 'auth/invalid-email') return 'Vérifie le format de ton adresse email.'
  if (code === 'auth/weak-password' || code === 'auth/password-does-not-meet-requirements') return 'Choisis un mot de passe de 12 à 128 caractères.'
  if (code === 'auth/too-many-requests') return 'Trop de tentatives. Patiente un peu avant de réessayer.'
  if (code === 'auth/network-request-failed') return 'Vérifie ta connexion Internet puis réessaie.'
  return 'Cette opération n’a pas abouti. Réessaie dans un instant.'
}
