import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { appHref } from '../navigation/browser'
import { createEnterpriseOrganization, getEnterpriseBilling, createEnterpriseCheckout, createEnterprisePortal, retryEnterpriseBillingSync } from '../firebase/enterprise'

type Billing = Awaited<ReturnType<typeof getEnterpriseBilling>>

export default function EnterpriseBillingPage({uid,organizationId,onCreated,onOpen}:{uid:string;organizationId?:string;onCreated:(id:string)=>void;onOpen:()=>void}) {
  const [name,setName]=useState('')
  const [data,setData]=useState<Billing|null>(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const [revision,setRevision]=useState(0)
  const requestId=useRef(crypto.randomUUID())
  const checkoutId=useRef(crypto.randomUUID())
  const inFlight=useRef(false)
  const active=useRef(true)
  useEffect(()=>{active.current=true;return()=>{active.current=false}},[])
  useEffect(()=>{
    let cancelled=false
    setData(null);setError('')
    if(organizationId)void getEnterpriseBilling(uid,organizationId).then(value=>{
      if(cancelled)return
      if(value.organizationId!==organizationId)throw new Error('Organisation incompatible.')
      setData(value)
    }).catch(()=>{if(!cancelled)setError('La facturation de cette organisation est indisponible ou ton rôle ne permet pas de la gérer.')})
    return()=>{cancelled=true}
  },[uid,organizationId,revision])
  async function create(event:FormEvent){
    event.preventDefault()
    if(inFlight.current)return
    inFlight.current=true;setBusy(true);setError('')
    try{const result=await createEnterpriseOrganization(uid,name,requestId.current);if(active.current)onCreated(result.organizationId)}
    catch(failure){if(active.current)setError(String((failure as {code?:string})?.code).includes('failed-precondition')?'La souscription Entreprise n’est pas encore ouverte. Aucun paiement n’a été déclenché.':'La création n’a pas été confirmée. Réessaie avec les mêmes informations ; aucun paiement n’a été validé ici.')}
    finally{if(active.current){inFlight.current=false;setBusy(false)}}
  }
  async function redirect(portal:boolean){
    if(!organizationId||inFlight.current)return
    inFlight.current=true;setBusy(true);setError('')
    try{
      const result=portal?await createEnterprisePortal(uid,organizationId):await createEnterpriseCheckout(uid,organizationId,checkoutId.current)
      const url=new URL(result.url)
      if(url.protocol!=='https:'||url.username||url.password||!(portal?url.hostname==='billing.stripe.com':url.hostname==='checkout.stripe.com'))throw new Error('Destination Stripe invalide.')
      if(active.current)location.assign(url.href)
    }catch{if(active.current)setError('Stripe n’a pas pu être ouvert. Actualise le statut avant de recommencer ; ne crée pas un deuxième abonnement pour forcer l’activation.')}
    finally{if(active.current){inFlight.current=false;setBusy(false)}}
  }
  async function sync(){
    if(!organizationId||inFlight.current)return
    inFlight.current=true;setBusy(true);setError('')
    try{await retryEnterpriseBillingSync(uid,organizationId);if(active.current)setRevision(value=>value+1)}
    catch{if(active.current)setError('Le nombre de membres n’a pas encore pu être confirmé. La demande reste en attente de reprise.')}
    finally{if(active.current){inFlight.current=false;setBusy(false)}}
  }
  return <section className="enterprise-billing"><p className="lesson-category">MemStack Entreprise · abonnement d’organisation</p><h1>{organizationId?data?.name??'La facturation de ton organisation':'Un espace pour ton équipe.'}</h1><p>20 missions guidées, des révisions qui continuent et les nouvelles leçons publiées. Chaque organisation garde ses cartes, ses situations et son classement.</p><div className="enterprise-billing-price"><strong>10 € <span>TTC / membre actif / mois</span></strong><p>Responsables compris. Une invitation ne compte qu’une fois acceptée. Le nombre facturé suit les accès actifs ; les ajouts et retraits peuvent créer des ajustements au prorata sur la prochaine facture Stripe.</p></div>{!organizationId?<form className="enterprise-billing-create" onSubmit={event=>{void create(event)}}><label>Nom de l’organisation<input value={name} required minLength={2} maxLength={100} onChange={event=>setName(event.target.value)} disabled={busy} autoComplete="organization"/></label><p>Tu seras le premier responsable, soit un membre actif à 10 € TTC par mois une fois l’abonnement confirmé. La création de l’espace ne déclenche pas de paiement.</p><button className="catalog-button" disabled={busy}>{busy?'Création…':'Créer mon espace et voir l’abonnement'}</button></form>:data?<><div className="enterprise-billing-summary"><div><span>Accès actifs</span><strong>{data.activeMembers}</strong></div><div><span>Accès membres confirmés</span><strong>{data.billedMembers}</strong></div><div><span>Base mensuelle actuelle</span><strong>{(data.activeMembers*10).toLocaleString('fr-FR')} € TTC</strong></div></div><p className="dashboard-note">Base hors ajustements de période. Le récapitulatif et la facture Stripe précisent les montants applicables.</p><section className="enterprise-panel"><h2>{data.suspended?'Cet espace est suspendu par son administrateur.':data.status==='active'?'L’abonnement de ton équipe est actif.':data.status==='pilot'?'Ton organisation dispose d’un pilote administré.':'Confirme l’abonnement pour ouvrir le chemin.'}</h2>{data.suspended&&<p>Contacte l’administrateur MemStack avant de reprendre l’apprentissage. Le portail reste accessible pour consulter les factures ou résilier.</p>}{data.paidUntil&&<p>Accès confirmé jusqu’au {new Date(data.paidUntil).toLocaleDateString('fr-FR')}.{data.cancelAtPeriodEnd?' Le renouvellement est annulé.':''}</p>}{!data.enabled&&['pending','inactive'].includes(data.status)&&<p>La souscription Entreprise n’est pas encore ouverte. Ton espace peut être préparé ; aucun accès payant n’est accordé avant confirmation.</p>}{data.enabled&&!data.suspended&&['pending','inactive'].includes(data.status)&&<button className="catalog-button" disabled={busy} onClick={()=>{void redirect(false)}}>{busy?'Ouverture de Stripe…':'Voir et confirmer l’abonnement sur Stripe'}</button>}{data.canManage&&<button className="catalog-button secondary" disabled={busy} onClick={()=>{void redirect(true)}}>Factures et résiliation sur Stripe ↗</button>}{data.syncPending&&<div><p>Un ajustement du nombre de membres est en cours. Les invitations et retraits ne doivent pas être recréés pour le forcer.</p><button className="catalog-button secondary" disabled={busy} onClick={()=>{void sync()}}>Actualiser le nombre de membres</button></div>}<div className="enterprise-billing-actions"><button className="catalog-button secondary" disabled={busy} onClick={()=>setRevision(value=>value+1)}>Vérifier mon abonnement</button>{!data.suspended&&['active','pilot'].includes(data.status)&&<a className="catalog-button" onClick={onOpen} href={appHref(`/enterprise?org=${encodeURIComponent(organizationId)}`)}>Ouvrir mon organisation →</a>}</div></section></>:!error&&<p role="status">Vérification du statut de l’organisation…</p>}{error&&<p className="inline-error" role="alert">{error}</p>}<p className="dashboard-note">L’abonnement Entreprise est distinct du Premium personnel. Le paiement est effectué sur Stripe, jamais dans ce formulaire.</p><a className="text-link" href={appHref('/business')}>Revoir l’offre et le programme →</a></section>
}
