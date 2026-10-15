import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { manageEnterpriseOrganization } from '../firebase/enterprise'
import { useProgress } from '../progress/ProgressProvider'
import { appHref } from '../navigation/browser'

export default function EnterpriseAdminPanel() {
  const {user,online}=useProgress()
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [created,setCreated]=useState<{organizationId:string;code:string}|null>(null)
  const requestId=useRef(crypto.randomUUID())
  const [organizationId,setOrganizationId]=useState('')
  async function create(event:FormEvent){
    event.preventDefault()
    if(!user||busy)return
    const accountId=user.uid
    setBusy(true);setMessage('');setCreated(null)
    try{
      const result=await manageEnterpriseOrganization(accountId,{action:'create',name,managerEmail:email,requestId:requestId.current})
      if(result.code){setCreated({organizationId:result.organizationId,code:result.code});setOrganizationId(result.organizationId);requestId.current=crypto.randomUUID()}
    }catch{setMessage('L’organisation n’a pas été confirmée. Réessaie avec les mêmes informations pour reprendre cette création.')}
    finally{setBusy(false)}
  }
  async function changeAccess(enabled:boolean){
    if(!user||busy)return
    setBusy(true);setMessage('')
    try{await manageEnterpriseOrganization(user.uid,{action:'enable',organizationId,enabled});setMessage(enabled?'L’accès de cette organisation est activé.':'L’accès de cette organisation est suspendu. Sa progression est conservée.')}
    catch{setMessage('La modification n’a pas été confirmée. Vérifie l’identifiant et ton rôle administrateur.')}
    finally{setBusy(false)}
  }
  async function restoreManager(){
    if(!user||busy||!organizationId||!email)return
    setBusy(true);setMessage('');setCreated(null)
    try{const result=await manageEnterpriseOrganization(user.uid,{action:'inviteManager',organizationId,email});if(result.code)setCreated({organizationId:result.organizationId,code:result.code})}
    catch{setMessage('L’invitation responsable n’a pas été confirmée. Vérifie l’organisation, l’adresse et ton rôle administrateur.')}
    finally{setBusy(false)}
  }
  return <section className="overview-panel" style={{marginTop:28}}><p className="lesson-category">MemStack Entreprise · pilotes administrés</p><h2>Ouvrir un espace d’organisation</h2><p>Crée un pilote après accord commercial. Le responsable reçoit un code à usage unique à transmettre manuellement ; aucun paiement ni email n’est déclenché ici.</p><form onSubmit={event=>{void create(event)}} className="enterprise-admin-form"><label>Nom de l’organisation<input required minLength={2} maxLength={100} value={name} onChange={event=>setName(event.target.value)} disabled={busy}/></label><label>Adresse de connexion du responsable<input type="email" required value={email} onChange={event=>setEmail(event.target.value)} disabled={busy}/></label><button className="catalog-button" disabled={busy||!online}>{busy?'Enregistrement…':'Créer le pilote et son invitation'}</button></form>{created&&<div role="status"><h3>Pilote créé</h3><p>Le responsable ouvre <a href={appHref('/enterprise')}>l’espace Entreprise</a> avec l’adresse invitée, puis saisit ce code. Il expire sous sept jours.</p><label>Code du responsable<input readOnly value={created.code} onFocus={event=>event.currentTarget.select()}/></label></div>}<details style={{marginTop:25}}><summary>Suspendre ou réactiver un pilote</summary><label>Identifiant de l’organisation<input value={organizationId} maxLength={128} onChange={event=>setOrganizationId(event.target.value)} disabled={busy}/></label><div style={{display:'flex',gap:15,flexWrap:'wrap',marginTop:18}}><button className="catalog-button secondary" disabled={busy||!online||!organizationId} onClick={()=>{void changeAccess(false)}}>Suspendre l’accès</button><button className="catalog-button secondary" disabled={busy||!online||!organizationId} onClick={()=>{void changeAccess(true)}}>Réactiver l’accès</button></div><h3>Rétablir un responsable</h3><p>Saisis ci-dessus l’adresse du responsable et l’identifiant de cette organisation. Cette invitation ne réactive pas une organisation suspendue : réactive son accès avant que le responsable rejoigne l’espace.</p><button className="catalog-button secondary" disabled={busy||!online||!organizationId||!email} onClick={()=>{void restoreManager()}}>Créer une invitation responsable</button></details>{message&&<p role="status">{message}</p>}</section>
}
