import { useEffect, useState } from 'react'
import { useProgress } from '../progress/ProgressProvider'
import { addPassword, resetPassword, authenticationMessage } from '../firebase/emailAuth'
import { getFirebaseServices } from '../firebase/client'
import './authForms.css'

export default function AccountSecurityPanel() {
  const account=useProgress()
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const hasPassword=account.user?.providerData.some(provider=>provider.providerId==='password')
  useEffect(()=>{setPassword('');setConfirm('');setMessage('');setError('')},[account.user?.uid])
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if(busy || !account.user?.email) return
    if(!hasPassword && password!==confirm) {setError('Les deux mots de passe doivent être identiques.');return}
    const uid=account.user.uid
    setBusy(true);setMessage('');setError('')
    try {
      if(hasPassword) await resetPassword(account.user.email)
      else await addPassword(password)
      if(getFirebaseServices().auth.currentUser?.uid!==uid) return
      setPassword('');setConfirm('')
      setMessage(hasPassword?'Si la réinitialisation est disponible, un lien vient d’être envoyé à ton adresse email.':'La connexion par email est ajoutée à ton compte. Ta progression et tes droits restent les mêmes.')
    } catch(failure) {setError(authenticationMessage(failure))}
    finally {setBusy(false)}
  }
  return <section className="overview-panel"><h2>Connexion et sécurité</h2><p>{account.user?.email}</p><p>{hasPassword?'Tu peux te connecter avec ton adresse email et ton mot de passe.':'Tu utilises Google. Ajoute un mot de passe si tu veux aussi te connecter directement par email.'}</p><div className="email-auth"><form onSubmit={event=>{void submit(event)}}>{!hasPassword && <><label>Nouveau mot de passe<input required minLength={12} maxLength={128} autoComplete="new-password" type="password" value={password} disabled={busy} onChange={event=>setPassword(event.target.value)} /><span>12 caractères minimum. Google te demandera de confirmer ton identité.</span></label><label>Confirmer le mot de passe<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirm} disabled={busy} onChange={event=>setConfirm(event.target.value)} /></label></>}<button className="catalog-button secondary" disabled={busy || !account.online}>{busy?'Un instant…':hasPassword?'Réinitialiser mon mot de passe':'Ajouter la connexion par email'}</button></form></div>{message && <p role="status">{message}</p>}{error && <p className="inline-error" role="alert">{error}</p>}</section>
}
