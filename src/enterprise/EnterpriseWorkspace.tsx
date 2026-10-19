import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent, ReactNode } from 'react'
import { BookOpen, Building2, ChevronRight, Flag, RotateCcw, Trophy, Users } from 'lucide-react'
import { appHref, currentRoute, usesHashRoutes } from '../navigation/browser'
import { useProgress } from '../progress/ProgressProvider'
import { getEnterpriseWorkspace, joinEnterpriseOrganization, commitEnterpriseLearningAction, manageEnterpriseOrganization, assessEnterprisePracticeAnswer } from '../firebase/enterprise'
import type { EnterpriseWorkspace as Workspace, EnterpriseLearningAction, EnterpriseLearningResult, VerifyEnterprisePractice } from '../types/enterprise'
import type { EnterpriseChallenge } from '../types/enterpriseContent'
import { enterpriseCurriculum, enterpriseLessons, enterpriseChallenges, enterpriseTracks } from '../data/enterprise'
import { enterprisePlan, enterpriseScope } from './model'
import CardSession from '../components/CardSession'
import { reviewEventId } from '../progress/merge'
import LessonText from '../components/LessonText'
import AccountBar from '../components/AccountBar'
import EnterpriseBillingPage from './EnterpriseBillingPage'
import EnterpriseLessonView from './EnterpriseLessonView'
import EnterpriseLearningPath from './EnterpriseLearningPath'
import '../catalog.css'
import '../navigation.css'
import './enterprise.css'
import './enterprise-refinements.css'
import './enterprise-path.css'

type Action = Omit<Extract<EnterpriseLearningAction,{type:'lesson'}>,'organizationId'|'requestId'> | Omit<Extract<EnterpriseLearningAction,{type:'card'}>,'organizationId'|'requestId'> | Omit<Extract<EnterpriseLearningAction,{type:'challenge'}>,'organizationId'|'requestId'>

export default function EnterpriseWorkspace() {
  const account = useProgress()
  const uid = account.user!.uid
  const [route,setRoute] = useState(currentRoute)
  const [workspace,setWorkspace] = useState<Workspace | null>(null)
  const [error,setError] = useState('')
  const [refresh,setRefresh] = useState(0)
  const [busy,setBusy] = useState(false)
  const [drafts,setDrafts] = useState<Record<string,string>>({})
  const [code,setCode] = useState('')
  const generation = useRef(0)
  const scope = useRef('')
  const inFlight = useRef(false)
  const receipts = useRef(new Map<string,string>())
  const params = new URLSearchParams(route.split('?')[1] ?? '')
  const orgId = params.get('org') ?? undefined
  const path = route.split('?')[0]
  const selectedTrack = enterpriseTracks.find(item => item.id === params.get('track')) ?? enterpriseTracks[0]
  const billingView = path === '/enterprise/billing' || path === '/enterprise/subscribe' || (path === '/enterprise' && params.get('setup') === 'subscribe')
  const previousPage = useRef(path)
  const verifyPractice = useCallback<VerifyEnterprisePractice>(async (lessonId, answer, practiceVersion) => {
    const organizationId = workspace?.organization?.id
    const currentScope = organizationId ? enterpriseScope(uid, organizationId) : ''
    const operation = generation.current
    if (!organizationId || (orgId && orgId !== organizationId) || scope.current !== currentScope) throw new Error('Le contexte de cet atelier a changé.')
    const result = await assessEnterprisePracticeAnswer(uid, { organizationId, lessonId, answer, practiceVersion })
    if (generation.current !== operation || scope.current !== currentScope) throw new Error('Le contexte de cet atelier a changé.')
    return result
  }, [uid, workspace?.organization?.id, orgId])
  const link = (suffix = '', trackId = selectedTrack?.id) => {
    const search = new URLSearchParams()
    const organizationId = workspace?.organization?.id ?? orgId
    if (organizationId) search.set('org', organizationId)
    if (trackId) search.set('track', trackId)
    return appHref(`/enterprise${suffix}${search.size ? `?${search}` : ''}`)
  }
  useEffect(() => {
    const organizationId = workspace?.organization?.id
    if (organizationId) setDrafts(previous => Object.fromEntries(Object.entries(previous).filter(([key]) => key.startsWith(`${uid}:${organizationId}:`))))
  }, [uid, workspace?.organization?.id])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (Object.values(drafts).some(value => value.trim())) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [drafts])
  useEffect(() => {
    const update = () => { setRoute(currentRoute()); window.scrollTo(0,0) }
    window.addEventListener('hashchange',update); window.addEventListener('popstate',update)
    return () => { window.removeEventListener('hashchange',update); window.removeEventListener('popstate',update) }
  },[])
  useEffect(() => {
    document.title = 'Mon organisation · MemStack Entreprise'
    const operation = ++generation.current
    scope.current = ''
    setWorkspace(null); setError(''); setBusy(false); inFlight.current = false
    if (!account.online || billingView) return
    void getEnterpriseWorkspace(uid,orgId).then(value => {
      if (generation.current !== operation) return
      if (orgId && value.organization?.id !== orgId) throw new Error('Organisation incompatible.')
      scope.current = value.organization ? enterpriseScope(uid,value.organization.id) : ''
      setWorkspace(value)
    }).catch(() => { if (generation.current === operation) setError('L’espace Entreprise est indisponible ou ton accès a changé. Aucun contenu personnel n’est utilisé à sa place.') })
    return () => { generation.current++; scope.current = '' }
  },[uid,orgId,account.online,refresh,billingView])
  useEffect(() => { document.getElementById('enterprise-content')?.focus({preventScroll:true}) },[route])
  useEffect(() => {
    if (previousPage.current !== path && ['/enterprise','/enterprise/ranking','/enterprise/team'].includes(path)) setRefresh(value=>value+1)
    previousPage.current = path
  },[path])

  function navigate(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = (event.target as Element).closest('a')
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return
    const url = new URL(anchor.href)
    if (url.origin !== location.origin) return
    const next = usesHashRoutes ? url.hash.slice(1) : `${url.pathname}${url.search}`
    if (next !== '/enterprise' && !next.startsWith('/enterprise/') && !next.startsWith('/enterprise?')) return
    event.preventDefault()
    if (next === route) return
    history.pushState(null,'',appHref(next)); setRoute(next); window.scrollTo(0,0)
  }
  async function commit(action: Action): Promise<EnterpriseLearningResult | null> {
    if (!workspace?.organization || inFlight.current || !account.online || !navigator.onLine) return null
    const organizationId = workspace.organization.id
    const currentScope = enterpriseScope(uid,organizationId)
    const operation = generation.current
    const key = `${currentScope}:${JSON.stringify(action)}`
    const requestId = receipts.current.get(key) ?? crypto.randomUUID()
    receipts.current.set(key,requestId)
    inFlight.current = true; setBusy(true); setError('')
    try {
      const result = await commitEnterpriseLearningAction(uid,{...action,organizationId,requestId})
      if (generation.current !== operation || scope.current !== currentScope) return null
      setWorkspace(previous => {
        if (!previous || previous.organization?.id !== organizationId) return previous
        const progress = previous.progress
        return {...previous,progress: result.type === 'lesson' ? {...progress,lessons:{...progress.lessons,[result.lessonId]:{completedAt:result.completedAt}}} : result.type === 'card' ? {...progress,cards:{...progress.cards,[result.card.cardId]:result.card},reviews:[...progress.reviews.filter(event => reviewEventId(event) !== reviewEventId(result.event)),result.event]} : {...progress,attempts:[result,...progress.attempts.filter(attempt => attempt.id !== result.id)]}}
      })
      receipts.current.delete(key)
      return result
    } catch (failure) {
      if (generation.current === operation && scope.current === currentScope) {
        if (String((failure as {code?:string})?.code).includes('permission-denied')) {
          scope.current = ''; setWorkspace(null)
          setError('Ton accès à cette organisation a changé. Demande à ton responsable de vérifier ton invitation.')
        } else if(String((failure as {code?:string})?.code).includes('failed-precondition')) setError('Cette mission ou ce questionnaire a changé. Actualise la page avant de faire une nouvelle tentative.'); else setError('Enregistrement impossible. Ta mission ou ta carte est conservée. Vérifie ton accès et ta connexion, puis réessaie.')
      }
      return null
    } finally { if (generation.current === operation) {inFlight.current = false;setBusy(false)} }
  }
  async function join(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    const operation = generation.current
    setBusy(true);setError('')
    try {
      const result = await joinEnterpriseOrganization(uid,code.trim())
      if (generation.current !== operation) return
      setCode(''); history.pushState(null,'',appHref(`/enterprise?org=${encodeURIComponent(result.organizationId)}`)); setRoute(currentRoute()); setRefresh(value=>value+1)
    } catch { if (generation.current === operation) setError('Invitation invalide, expirée ou destinée à une autre adresse email.') }
    finally { if (generation.current === operation) setBusy(false) }
  }
  const organization = workspace?.organization
  const plan = workspace ? enterprisePlan(workspace.progress,Date.now(),selectedTrack?.id) : null
  const lesson = enterpriseLessons.find(item => path === `/enterprise/lessons/${item.id}`)
  const challenge = enterpriseChallenges.find(item => path === `/enterprise/challenges/${item.id}`)
  const draftKey = lesson && organization ? `${uid}:${organization.id}:${lesson.id}` : ''
  const navigation = [{path:'',label:'Mon chemin',icon:BookOpen},{path:'/reviews',label:'Révisions',icon:RotateCcw},{path:'/challenges',label:'Situations',icon:Flag},{path:'/ranking',label:'Classement',icon:Trophy},...(organization?.role==='manager'?[{path:'/team',label:'Mon équipe',icon:Users},{path:'/billing',label:'Abonnement',icon:Building2}]:[])]
  let page: ReactNode
  if (billingView) page = <EnterpriseBillingPage key={enterpriseScope(uid,orgId??'create')} uid={uid} organizationId={orgId} onOpen={()=>setRefresh(value=>value+1)} onCreated={id=>{history.pushState(null,'',appHref('/enterprise/billing?org='+encodeURIComponent(id)));setRoute(currentRoute())}} />
  else if (!workspace) page = <section className="enterprise-empty"><Building2 size={35} /><h1>Ton espace Entreprise</h1><p role="status">{error || 'On retrouve tes organisations…'}</p>{error && <button className="catalog-button" onClick={()=>setRefresh(value=>value+1)}>Réessayer</button>}</section>
  else if (!organization || !plan) page = <section className="enterprise-empty"><p className="lesson-category">Bienvenue dans MemStack Entreprise</p><h1>Un chemin partagé avec ton équipe.</h1><p>Rejoins ton organisation avec le code transmis par ton responsable. Les missions, cartes et situations de cet espace restent séparées de ton apprentissage développeur.</p><form onSubmit={event=>{void join(event)}}><label>Code d’invitation<input value={code} onChange={event=>setCode(event.target.value)} autoComplete="off" required minLength={20} maxLength={100} /></label><button className="catalog-button" disabled={busy}>{busy?'Vérification…':'Rejoindre mon organisation'}</button></form><p className="dashboard-note">Utilise le compte correspondant à l’adresse email invitée.</p><a className="catalog-button secondary" href={appHref('/enterprise?setup=subscribe')}>Créer mon organisation</a><p><a className="text-link" href={appHref('/business')}>Découvrir l’offre et le programme →</a></p></section>
  else if (organization.learningEnabled === false) page = organization.role === 'manager' ? <EnterpriseBillingPage key={enterpriseScope(uid,organization.id)} uid={uid} organizationId={organization.id} onOpen={()=>setRefresh(value=>value+1)} onCreated={()=>{}} /> : <section className="enterprise-empty"><h1>Ton organisation prépare la suite.</h1><p>Son abonnement n’est pas actif pour le moment. Ton responsable peut consulter sa facturation pour rétablir l’accès aux missions et aux cartes.</p><button className="catalog-button secondary" onClick={()=>setRefresh(value=>value+1)}>Vérifier mon accès</button></section>
  else if (lesson) page = <EnterpriseLessonView key={`${enterpriseScope(uid, organization.id)}:${lesson.id}`} lesson={lesson} completed={plan.complete(lesson.id)} available={plan.available(lesson)} busy={busy} onComplete={()=>commit({type:'lesson',lessonId:lesson.id})} returnHref={link()} cardsHref={link('/reviews')} onVerify={verifyPractice} draft={drafts[draftKey] ?? ''} onDraftChange={draft=>setDrafts(previous=>({...previous,[draftKey]:draft}))} />
  else if (path === '/enterprise/reviews') page = <EnterpriseReviews key={scope.current} workspace={workspace} busy={busy} onCommit={commit} returnHref={link()} />
  else if (challenge) page = <EnterpriseChallengeView key={`${scope.current}:${challenge.id}`} challenge={challenge} available={plan.available(challenge)} workspace={workspace} busy={busy} onSubmit={answers=>commit({type:'challenge',challengeId:challenge.id,catalogVersion:enterpriseCurriculum.version,answers})} returnHref={link('/challenges')} />
  else if (path === '/enterprise/challenges') page = <>
    <EnterpriseHeading eyebrow="Appliquer la méthode" title="Une situation pour relier tes acquis." description="Examine les pièces fictives et fais tes choix. Une correction expliquée apparaît après l’enregistrement serveur. Ces questionnaires consolident la méthode ; ils ne certifient pas une pratique en outil réel." />
    {[...enterpriseTracks.map(track=>({id:track.id,title:track.title,items:enterpriseChallenges.filter(item=>track.challengeIds.includes(item.id))})).sort((a,b)=>Number(b.id===selectedTrack?.id)-Number(a.id===selectedTrack?.id)),{id:'references',title:'Situations complémentaires historiques',items:enterpriseChallenges.filter(item=>!enterpriseTracks.some(track=>track.challengeIds.includes(item.id)))}].map(group=><details className="enterprise-challenge-group" open={group.id!=='references'} key={group.id}><summary>{group.title}{group.id===selectedTrack?.id?' · parcours choisi':''}</summary><div className="enterprise-situation-grid">{group.items.map(item=><article className="enterprise-panel" key={item.id}><h3>{item.title}</h3><p>{item.scenario.slice(0,180)}…</p>{plan.available(item)?<a className="catalog-button secondary" href={link(`/challenges/${item.id}`,group.id==='references'?selectedTrack?.id:group.id)}>Ouvrir le dossier <ChevronRight size={17}/></a>:<p className="dashboard-note">Termine les missions préalables. <a href={link('',group.id==='references'?selectedTrack?.id:group.id)}>Voir le chemin →</a></p>}</article>)}</div></details>)}
  </>
  else if (path === '/enterprise/ranking') page = <EnterpriseRanking workspace={workspace} onRefresh={()=>setRefresh(value=>value+1)} />
  else if (path === '/enterprise/team') page = organization.role==='manager' ? <EnterpriseTeam key={scope.current} workspace={workspace} uid={uid} onReload={()=>setRefresh(value=>value+1)} /> : <section className="enterprise-panel"><h1>Un accès responsable d’équipe est nécessaire.</h1><a href={link()}>Retour à mon chemin</a></section>
  else if (path !== '/enterprise') page = <section className="enterprise-panel"><h1>Cette étape n’existe pas dans ton organisation.</h1><a href={link()}>Revenir à mon chemin</a></section>
  else page = <EnterpriseLearningPath workspace={workspace} trackId={enterpriseTracks.find(item=>item.id===params.get('track'))?.id} link={link} ranking={<EnterpriseRanking workspace={workspace} compact onRefresh={()=>setRefresh(value=>value+1)} />} />
  return <div className="enterprise-app" onClick={navigate}><a className="skip-link" href="#enterprise-content">Aller au contenu</a><header className="site-header enterprise-header"><a className="brand" href={link()}>memstack<span> / entreprise</span></a><a className="enterprise-switch" href={appHref('/courses')}>Espace Développement ↗</a><AccountBar enterprise enterpriseOrganizationId={organization?.id ?? orgId} /></header><div className="enterprise-context"><Building2 size={17} aria-hidden="true"/>{organization?<><strong>{organization.name}</strong><label className="sr-only" htmlFor="enterprise-org">Changer d’organisation</label><select id="enterprise-org" value={organization.id} disabled={busy} onChange={event=>{history.pushState(null,'',appHref(`/enterprise?org=${encodeURIComponent(event.target.value)}${selectedTrack?`&track=${encodeURIComponent(selectedTrack.id)}`:''}`));setRoute(currentRoute())}}>{workspace.organizations.map(org=><option value={org.id} key={org.id}>{org.name}</option>)}</select></>:<span>Ton environnement professionnel</span>}<a href={appHref('/business')}>L’offre Entreprise</a></div>{organization&&<nav className="enterprise-navigation" aria-label="Navigation Entreprise">{navigation.map(item=><a key={item.path} href={link(item.path)} aria-current={path===`/enterprise${item.path}`?'page':undefined}><item.icon size={18} aria-hidden="true"/><span>{item.label}</span></a>)}</nav>}<main id="enterprise-content" tabIndex={-1} className="enterprise-main">{error&&workspace&&<p className="inline-error" role="alert">{error}</p>}{page}</main></div>
}

function EnterpriseHeading({eyebrow,title,description,secondary=false}:{eyebrow:string;title:string;description:string;secondary?:boolean}) {return <header className="enterprise-heading"><p className="lesson-category">{eyebrow}</p>{secondary?<h2>{title}</h2>:<h1>{title}</h1>}<p>{description}</p></header>}

function EnterpriseReviews({workspace,onCommit,returnHref}:{workspace:Workspace;busy:boolean;onCommit:(action:Action)=>Promise<EnterpriseLearningResult|null>;returnHref:string}) {
  const plan=enterprisePlan(workspace.progress)
  const [batch,setBatch]=useState(()=>plan.pending.length?plan.pending:plan.due.slice(0,5))
  const [revision,setRevision]=useState(0)
  if(!batch.length)return <section className="enterprise-empty"><img src={`${import.meta.env.BASE_URL}memo/learning.webp`} width="130" height="120" alt="Mémo et son livre"/><h1>{plan.pending.length?'De nouvelles cartes sont prêtes.':'Tes cartes gardent leur rythme.'}</h1><p>Aucune carte n’est due dans cette organisation pour le moment. Les cartes de l’espace Développement restent dans leur propre environnement.</p><a className="catalog-button" href={returnHref}>Reprendre mon chemin →</a></section>
  const next=()=>{const current=enterprisePlan(workspace.progress);setBatch(current.pending.length?current.pending:current.due.slice(0,5));setRevision(value=>value+1)}
  return <><a className="text-link" href={returnHref}>← Mon chemin Entreprise</a><CardSession environment={{homeHref:returnHref,label:'mon chemin Entreprise'}} key={revision} cards={batch} progress={workspace.progress.cards} onRate={async result=>Boolean(await onCommit({type:'card',cardId:result.cardId,rating:result.rating}))} progressLabel={`${workspace.organization!.name} · cartes Entreprise uniquement`} nextLessonLabel="Tes révisions continuent après la fin du parcours. Les nouvelles missions enrichissent cet espace." onContinueReviews={plan.due.length?next:undefined} onContinueLearningCards={plan.pending.length?next:undefined} onChooseLesson={()=>{location.href=returnHref}} /></>
}

function EnterpriseRanking({workspace,compact=false,onRefresh}:{workspace:Workspace;compact?:boolean;onRefresh?:()=>void}) {
  const {user}=useProgress()
  const [alias,setAlias]=useState(workspace.ranking.find(member=>member.self)?.alias??'')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const active=useRef(true)
  useEffect(()=>{active.current=true;return()=>{active.current=false}},[])
  async function save(event:FormEvent){
    event.preventDefault()
    if(!user||busy)return
    setBusy(true);setMessage('')
    try{await manageEnterpriseOrganization(user.uid,{action:'myAlias',organizationId:workspace.organization!.id,alias});if(active.current)onRefresh?.()}
    catch(failure){if(active.current && String((failure as {code?:string})?.code).includes('permission-denied'))onRefresh?.();if(active.current)setMessage('Le pseudo n’a pas été enregistré. Utilise 2 à 24 caractères ; trois changements par jour maximum.')}
    finally{if(active.current)setBusy(false)}
  }
  return <section className="enterprise-panel enterprise-ranking"><p className="lesson-category">Ensemble, dans ton organisation</p><h2>Le classement de {workspace.organization!.name}</h2><p>Une mission ou une carte dans cet espace entretient ta série. Les séries égales partagent la même place.</p><ol>{workspace.ranking.slice(0,compact?5:200).map((member,index)=><li key={`${member.alias}:${index}`} data-self={member.self}><span>#{member.rank}</span><strong>{member.alias}{member.self?' · toi':''}</strong><span>{member.streak} j</span></li>)}</ol>{!workspace.ranking.length&&<p>La première activité ouvrira le chemin.</p>}<p className="dashboard-note">Seules les activités de cette organisation comptent. Journée de référence : heure de Paris.</p>{!compact&&<><button className="catalog-button secondary" onClick={onRefresh}>Actualiser le classement</button><form className="enterprise-alias-form" onSubmit={event=>{void save(event)}}><label>Mon pseudo dans cette organisation<input value={alias} onChange={event=>setAlias(event.target.value)} required minLength={2} maxLength={24} disabled={busy} autoComplete="nickname"/></label><p>Visible seulement par les membres de cette organisation. Ton pseudo Développement reste distinct.</p><button className="catalog-button" disabled={busy}>{busy?'Enregistrement…':'Enregistrer mon pseudo'}</button><p role="status">{message}</p></form></>}</section>
}

function EnterpriseChallengeView({challenge,available,workspace,busy,onSubmit,returnHref}:{challenge:EnterpriseChallenge;available:boolean;workspace:Workspace;busy:boolean;onSubmit:(answers:Record<string,string>)=>Promise<EnterpriseLearningResult|null>;returnHref:string}) {
  const [answers,setAnswers]=useState<Record<string,string>>({})
  const [result,setResult]=useState<Extract<EnterpriseLearningResult,{type:'challenge'}>|null>(null)
  const previous=workspace.progress.attempts.filter(attempt=>attempt.challengeId===challenge.id)
  if(!available)return <section className="enterprise-panel"><h1>Prépare cette situation.</h1><p>Termine les missions préalables avant d’ouvrir ce dossier.</p><a href={returnHref}>Revenir aux situations →</a></section>
  return <section className="enterprise-challenge"><a className="text-link" href={returnHref}>← Toutes les situations</a><EnterpriseHeading eyebrow="Dossier fictif · mise en situation" title={challenge.title} description={challenge.scenario}/>{challenge.files.map(file=><details className="enterprise-dossier" key={file.name} open><summary>{file.name}</summary><LessonText glossary text={file.content}/></details>)}{result?<section className="enterprise-panel" role="status"><h2>{result.passed?'Des réflexes bien reliés.':'Quelques points à reprendre.'}</h2><p>{result.correct} réponses correctes sur {result.total}. Cette tentative est enregistrée dans cette organisation.</p>{result.checks.map(check=>{const question=challenge.questions.find(item=>item.id===check.questionId);return <div className="enterprise-result" key={check.questionId}><h3>{check.correct?'✓':'↻'} {check.questionText ?? question?.prompt}</h3><p>{check.correctAnswerText ?? question?.options.find(option=>option.id===check.correctOptionId)?.text}</p><LessonText glossary text={check.explanation ?? 'Cette correction appartient à une ancienne version.'}/></div>})}<button className="catalog-button secondary" onClick={()=>{setResult(null);setAnswers({})}}>Faire une nouvelle tentative</button></section>:<form onSubmit={event=>{event.preventDefault();void onSubmit(answers).then(value=>{if(value?.type==='challenge')setResult(value)})}}>{challenge.questions.map((question,index)=><fieldset disabled={busy} key={question.id}><legend>{index+1}. {question.prompt}</legend>{question.options.map(option=><label className="enterprise-option" key={option.id}><input type="radio" name={question.id} required checked={answers[question.id]===option.id} onChange={()=>setAnswers(previous=>({...previous,[question.id]:option.id}))}/><span>{option.text}</span></label>)}</fieldset>)}<button className="catalog-button" disabled={busy||challenge.questions.some(question=>!answers[question.id])}>{busy?'Enregistrement…':'Enregistrer et voir ma correction'}</button></form>}<details className="enterprise-history"><summary>Mes tentatives dans cette organisation ({previous.length})</summary>{previous.map(attempt=><article className="enterprise-panel" key={attempt.id}><h3>{new Date(attempt.submittedAt).toLocaleString('fr-FR')} · {attempt.correct}/{attempt.total}</h3><p>Version {attempt.catalogVersion} · {attempt.passed?'Réussie':'À retravailler'}{attempt.catalogVersion!==enterpriseCurriculum.version?' · version historique':''}</p>{attempt.checks.map(check=><div key={check.questionId}><h4>{check.correct?'✓':'↻'} {check.questionText}</h4><p>Ta réponse : {check.selectedAnswerText}</p><p>Réponse expliquée : {check.correctAnswerText}</p><LessonText glossary text={check.explanation}/></div>)}</article>)}</details><p className="dashboard-note">{previous.length} tentative(s) dans cette organisation. Une nouvelle tentative conserve les précédentes.</p></section>
}

function EnterpriseTeam({workspace,uid,onReload}:{workspace:Workspace;uid:string;onReload:()=>void}) {
  const [email,setEmail]=useState('')
  const [invitation,setInvitation]=useState('')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const organizationId=workspace.organization!.id
  async function invite(event:FormEvent){event.preventDefault();setBusy(true);setError('');setInvitation('');try{const result=await manageEnterpriseOrganization(uid,{action:'invite',organizationId,email});setInvitation(result.code??'');setEmail('')}catch(failure){if(String((failure as {code?:string})?.code).includes('permission-denied'))onReload();setError('Invitation non créée. Vérifie l’adresse et ton accès responsable.')}finally{setBusy(false)}}
  async function revoke(memberUid:string){setBusy(true);setError('');try{await manageEnterpriseOrganization(uid,{action:'revoke',organizationId,uid:memberUid});onReload()}catch(failure){if(String((failure as {code?:string})?.code).includes('permission-denied'))onReload();setError('Le retrait n’a pas été enregistré.')}finally{setBusy(false)}}
  return <><EnterpriseHeading eyebrow={`Responsable · ${workspace.organization!.name}`} title="Un chemin pour ton équipe." description="Invite les collaborateurs avec leur adresse de connexion. Le code est à transmettre toi-même ; aucun email n’est envoyé automatiquement."/><section className="enterprise-panel"><h2>Inviter un collaborateur</h2><p className="enterprise-team-note">Chaque invitation acceptée ajoute un accès actif à l’abonnement de l’organisation : 10 € TTC par mois, avec ajustement de période calculé par Stripe. Une invitation non acceptée ne compte pas. Le retrait d’un accès ajuste également le nombre de membres.</p><form className="enterprise-invite" onSubmit={event=>{void invite(event)}}><label>Adresse email<input type="email" value={email} onChange={event=>setEmail(event.target.value)} required disabled={busy}/></label><button className="catalog-button" disabled={busy}>{busy?'Enregistrement…':'Créer une invitation'}</button></form>{invitation&&<div className="enterprise-invitation" role="status"><strong>Invitation créée · usage unique, valable sept jours.</strong><label>Code à transmettre<input readOnly value={invitation} onFocus={event=>event.currentTarget.select()}/></label><p>Le collaborateur ouvre MemStack → Entreprise avec l’adresse invitée, puis saisit ce code.</p></div>}{error&&<p className="inline-error" role="alert">{error}</p>}</section><section className="enterprise-panel"><h2>Les membres de ton organisation</h2><ul className="enterprise-members">{workspace.members.map(member=><li key={member.uid}><div><strong>{member.alias}</strong><span>{member.role==='manager'?'Responsable':'Collaborateur'} · {member.active?'Accès actif':'Accès retiré'}</span><span>{member.summary.lessons} missions · {member.summary.cards} cartes découvertes · {member.summary.attempts} tentatives de mise en situation</span><span>{member.lastActivityAt ? 'Dernière activité : '+new Date(member.lastActivityAt).toLocaleDateString('fr-FR') : 'Pas encore d’activité'}</span></div>{member.active&&member.role!=='manager'&&<button className="catalog-button secondary" disabled={busy} onClick={()=>{void revoke(member.uid)}}>Retirer l’accès</button>}</li>)}</ul><p className="dashboard-note">Les réponses détaillées des collaborateurs restent personnelles. Le classement affiche uniquement les pseudos et les séries de cette organisation.</p></section></>
}
