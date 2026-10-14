import { useState } from 'react'
import { useProgress } from '../progress/ProgressProvider'
import { sendVerification, refreshVerification, authenticationMessage } from '../firebase/emailAuth'
import './authForms.css'

export default function EmailVerification() {
  const account=useProgress()
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  async function action(check: boolean) {
    if(busy) return
    setBusy(true);setMessage('');setError('')
    try {
      if(check) {if(await refreshVerification()) account.retry();else setMessage('Ton adresse n’est pas encore confirmée. Ouvre le lien reçu par email puis réessaie.')}
      else {await sendVerification();setMessage('Un email de vérification vient d’être envoyé. Pense aussi aux courriers indésirables.')}
    } catch(failure) {setError(authenticationMessage(failure))}
    finally {setBusy(false)}
  }
  return <section className="email-auth"><p>Confirme l’adresse <strong>{account.user?.email}</strong> avec le lien de vérification reçu par email. Tu retrouveras ensuite ton atelier.</p><div className="auth-actions"><button className="catalog-button" disabled={busy} onClick={()=>{void action(true)}}>J’ai vérifié mon adresse</button><button className="catalog-button secondary" disabled={busy} onClick={()=>{void action(false)}}>Renvoyer l’email</button><button className="auth-link" disabled={busy} onClick={()=>{void account.logout()}}>Utiliser un autre compte</button></div>{message && <p role="status">{message}</p>}{error && <p role="alert" className="inline-error">{error}</p>}</section>
}
