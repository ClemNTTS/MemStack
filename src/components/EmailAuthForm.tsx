import { useState } from 'react'
import { loginWithEmail, registerWithEmail, resetPassword, authenticationMessage } from '../firebase/emailAuth'
import './authForms.css'

export default function EmailAuthForm() {
  const [mode,setMode] = useState<'login'|'register'|'reset'>('login')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [name,setName] = useState('')
  const [busy,setBusy] = useState(false)
  const [message,setMessage] = useState('')
  const [error,setError] = useState('')
  function changeMode(next: typeof mode) {setMode(next);setPassword('');setMessage('');setError('')}
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true);setMessage('');setError('')
    try {
      if (mode === 'register') await registerWithEmail(email,password,name)
      else if (mode === 'reset') {await resetPassword(email);setMessage('Si un compte peut être réinitialisé à cette adresse, tu recevras un email avec la marche à suivre.')}
      else await loginWithEmail(email,password)
      setPassword('')
    } catch (failure) {setError(authenticationMessage(failure))}
    finally {setBusy(false)}
  }
  return <section className="email-auth" aria-label="Connexion par email">
    <p className="auth-divider">ou avec ton adresse email</p>
    <div className="auth-tabs"><button type="button" disabled={busy} aria-pressed={mode==='login'} onClick={()=>changeMode('login')}>Se connecter</button><button type="button" disabled={busy} aria-pressed={mode==='register'} onClick={()=>changeMode('register')}>Créer un compte</button></div>
    <form onSubmit={event=>{void submit(event)}}>
      {mode==='register' && <label>Pseudo<input required minLength={2} maxLength={40} autoComplete="nickname" value={name} disabled={busy} onChange={event=>setName(event.target.value)} /></label>}
      <label>Adresse email<input required type="email" autoComplete="email" value={email} disabled={busy} onChange={event=>setEmail(event.target.value)} /></label>
      {mode!=='reset' && <label>Mot de passe<input required type="password" minLength={mode==='register'?12:undefined} maxLength={128} autoComplete={mode==='register'?'new-password':'current-password'} value={password} disabled={busy} onChange={event=>setPassword(event.target.value)} />{mode==='register' && <span>12 caractères minimum. Une longue phrase fonctionne bien.</span>}</label>}
      <button className="catalog-button" disabled={busy} type="submit">{busy?'Un instant…':mode==='register'?'Créer mon compte':mode==='reset'?'Recevoir le lien de réinitialisation':'Ouvrir mon atelier'}</button>
    </form>
    {mode==='login' && <button className="auth-link" disabled={busy} onClick={()=>changeMode('reset')}>Mot de passe oublié ?</button>}
    {mode==='reset' && <button className="auth-link" disabled={busy} onClick={()=>changeMode('login')}>Retour à la connexion</button>}
    {message && <p role="status">{message}</p>}{error && <p className="inline-error" role="alert">{error}</p>}
  </section>
}
