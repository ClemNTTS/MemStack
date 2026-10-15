import { useState } from 'react'
import type { FormEvent } from 'react'
import { appHref } from '../navigation/browser'

export default function EnterprisePilotBrief() {
  const [name,setName]=useState('')
  const [people,setPeople]=useState('')
  const [goal,setGoal]=useState('')
  const [context,setContext]=useState('')
  const [message,setMessage]=useState('')
  function prepare(event:FormEvent){
    event.preventDefault()
    const text=`MemStack Entreprise — préparation d’un pilote\n\nOrganisation : ${name}\nÉquipe envisagée : ${people} personnes\nObjectif : ${goal}\nSituation actuelle : ${context}\n\nPérimètre à discuter : parcours guidé, révisions continues, nouvelles leçons publiées, classement d’organisation et suivi de l’équipe.\nÀ convenir avant ouverture : participants, responsable, durée d’observation, critères de réussite. Abonnement standard : 10 € TTC par membre actif et par mois, responsables compris.\n\nCe brief ne constitue ni une commande ni un devis. Aucun paiement n’a été déclenché.\n`
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}))
    const link=document.createElement('a');link.href=url;link.download='memstack-brief-pilote.txt';link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)
    setMessage('Ton brief est prêt à transmettre à ton interlocuteur MemStack. Aucun formulaire n’a été envoyé et aucun espace n’a été activé automatiquement.')
  }
  return <section className="enterprise-pilot-brief" id="enterprise-pilot-brief" tabIndex={-1}><p className="enterprise-offer-eyebrow">PRÉPARER ENSEMBLE LE PREMIER PAS</p><h2>Ton pilote, en quelques repères.</h2><p>Prépare un brief à partager avec ton interlocuteur MemStack. Ce brief aide à cadrer les objectifs et les critères de réussite. L’abonnement standard est de 10 € TTC par membre actif et par mois ; le brief ne déclenche aucune souscription.</p><form onSubmit={prepare}><label>Organisation<input value={name} onChange={event=>setName(event.target.value)} required minLength={2} maxLength={100} autoComplete="organization"/></label><label>Nombre de participants envisagé<input type="number" min={1} max={200} value={people} onChange={event=>setPeople(event.target.value)} required/></label><label>Le premier objectif concret<select value={goal} onChange={event=>setGoal(event.target.value)} required><option value="">Choisir un objectif</option><option>Installer les bons réflexes d’utilisation de l’IA</option><option>Cadrer les projets IA avant d’investir</option><option>Renforcer la vérification et la protection des informations</option></select></label><label>Où en est votre équipe ?<textarea rows={5} maxLength={2000} value={context} onChange={event=>setContext(event.target.value)} placeholder="Exemple : une équipe de support teste déjà des assistants, sans méthode commune de vérification." required/></label><p>Reste sur des informations générales. Ce brief est préparé dans ton navigateur ; il n’est pas envoyé automatiquement.</p><button type="submit" className="enterprise-offer-button">Télécharger mon brief de pilote</button><p role="status">{message}</p></form><a href={appHref('/enterprise')}>J’ai déjà mon invitation : rejoindre mon organisation →</a></section>
}
