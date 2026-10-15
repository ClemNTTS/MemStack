import { useEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent, ReactNode } from 'react'
import { BookOpen, Building2, ChevronRight, Flag, RotateCcw, Trophy, Users } from 'lucide-react'
import { appHref, currentRoute, usesHashRoutes } from '../navigation/browser'
import { useProgress } from '../progress/ProgressProvider'
import { getEnterpriseWorkspace, joinEnterpriseOrganization, commitEnterpriseLearningAction, manageEnterpriseOrganization } from '../firebase/enterprise'
import type { EnterpriseWorkspace as Workspace, EnterpriseLearningAction, EnterpriseLearningResult } from '../types/enterprise'
import type { EnterpriseLesson, EnterpriseChallenge } from '../types/enterpriseContent'
import { enterpriseCurriculum, enterpriseChapters, enterpriseLessons, enterpriseChallenges } from '../data/enterprise'
import { enterprisePlan, enterpriseRewards, enterpriseScope } from './model'
import CardSession from '../components/CardSession'
import { reviewEventId } from '../progress/merge'
import LessonText from '../components/LessonText'
import AccountBar from '../components/AccountBar'
import EnterpriseBillingPage from './EnterpriseBillingPage'
import '../catalog.css'
import '../navigation.css'
import './enterprise.css'

type Action = Omit<Extract<EnterpriseLearningAction,{type:'lesson'}>,'organizationId'|'requestId'> | Omit<Extract<EnterpriseLearningAction,{type:'card'}>,'organizationId'|'requestId'> | Omit<Extract<EnterpriseLearningAction,{type:'challenge'}>,'organizationId'|'requestId'>

export default function EnterpriseWorkspace() {
  const account = useProgress()
  const uid = account.user!.uid
  const [route,setRoute] = useState(currentRoute)
  const [workspace,setWorkspace] = useState<Workspace | null>(null)
  const [error,setError] = useState('')
  const [refresh,setRefresh] = useState(0)
  const [busy,setBusy] = useState(false)
  const [code,setCode] = useState('')
  const generation = useRef(0)
  const scope = useRef('')
  const inFlight = useRef(false)
  const receipts = useRef(new Map<string,string>())
  const params = new URLSearchParams(route.split('?')[1] ?? '')
  const orgId = params.get('org') ?? undefined
  const path = route.split('?')[0]
  const billingView = path === '/enterprise/billing' || path === '/enterprise/subscribe' || (path === '/enterprise' && params.get('setup') === 'subscribe')
  const previousPage = useRef(path)
  const link = (suffix = '') => appHref(`/enterprise${suffix}${workspace?.organization?.id || orgId ? `?org=${encodeURIComponent(workspace?.organization?.id ?? orgId!)}` : ''}`)
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
  const plan = workspace ? enterprisePlan(workspace.progress) : null
  const rewards = workspace ? enterpriseRewards(workspace.progress) : null
  const lesson = enterpriseLessons.find(item => path === `/enterprise/lessons/${item.id}`)
  const challenge = enterpriseChallenges.find(item => path === `/enterprise/challenges/${item.id}`)
  const completedChapter = (chapterId: string) => enterpriseLessons.filter(item=>item.chapterId===chapterId && !item.continuous).every(item=>plan?.complete(item.id))
  const navigation = [{path:'',label:'Mon chemin',icon:BookOpen},{path:'/reviews',label:'Révisions',icon:RotateCcw},{path:'/challenges',label:'Situations',icon:Flag},{path:'/ranking',label:'Classement',icon:Trophy},...(organization?.role==='manager'?[{path:'/team',label:'Mon équipe',icon:Users},{path:'/billing',label:'Abonnement',icon:Building2}]:[])]
  let page: ReactNode
  if (billingView) page = <EnterpriseBillingPage key={enterpriseScope(uid,orgId??'create')} uid={uid} organizationId={orgId} onOpen={()=>setRefresh(value=>value+1)} onCreated={id=>{history.pushState(null,'',appHref('/enterprise/billing?org='+encodeURIComponent(id)));setRoute(currentRoute())}} />
  else if (!workspace) page = <section className="enterprise-empty"><Building2 size={35} /><h1>Ton espace Entreprise</h1><p role="status">{error || 'On retrouve tes organisations…'}</p>{error && <button className="catalog-button" onClick={()=>setRefresh(value=>value+1)}>Réessayer</button>}</section>
  else if (!organization || !plan) page = <section className="enterprise-empty"><p className="lesson-category">Bienvenue dans MemStack Entreprise</p><h1>Un chemin partagé avec ton équipe.</h1><p>Rejoins ton organisation avec le code transmis par ton responsable. Les missions, cartes et situations de cet espace restent séparées de ton apprentissage développeur.</p><form onSubmit={event=>{void join(event)}}><label>Code d’invitation<input value={code} onChange={event=>setCode(event.target.value)} autoComplete="off" required minLength={20} maxLength={100} /></label><button className="catalog-button" disabled={busy}>{busy?'Vérification…':'Rejoindre mon organisation'}</button></form><p className="dashboard-note">Utilise le compte correspondant à l’adresse email invitée.</p><a className="catalog-button secondary" href={appHref('/enterprise?setup=subscribe')}>Créer mon organisation</a><p><a className="text-link" href={appHref('/business')}>Découvrir l’offre et le programme →</a></p></section>
  else if (organization.learningEnabled === false) page = organization.role === 'manager' ? <EnterpriseBillingPage key={enterpriseScope(uid,organization.id)} uid={uid} organizationId={organization.id} onOpen={()=>setRefresh(value=>value+1)} onCreated={()=>{}} /> : <section className="enterprise-empty"><h1>Ton organisation prépare la suite.</h1><p>Son abonnement n’est pas actif pour le moment. Ton responsable peut consulter sa facturation pour rétablir l’accès aux missions et aux cartes.</p><button className="catalog-button secondary" onClick={()=>setRefresh(value=>value+1)}>Vérifier mon accès</button></section>
  else if (lesson) page = <EnterpriseLessonView key={`${scope.current}:${lesson.id}`} lesson={lesson} completed={plan.complete(lesson.id)} available={plan.next?.id===lesson.id} busy={busy} onComplete={()=>commit({type:'lesson',lessonId:lesson.id})} returnHref={link()} cardsHref={link('/reviews')} />
  else if (path === '/enterprise/reviews') page = <EnterpriseReviews key={scope.current} workspace={workspace} busy={busy} onCommit={commit} returnHref={link()} />
  else if (challenge) page = <EnterpriseChallengeView key={`${scope.current}:${challenge.id}`} challenge={challenge} available={completedChapter(challenge.chapterId)} workspace={workspace} busy={busy} onSubmit={answers=>commit({type:'challenge',challengeId:challenge.id,catalogVersion:enterpriseCurriculum.version,answers})} returnHref={link('/challenges')} />
  else if (path === '/enterprise/challenges') page = <><EnterpriseHeading eyebrow="Mettre tes réflexes à l’épreuve" title="Des décisions, dans leur contexte." description="Les dossiers Aster sont fictifs. Examine les éléments, choisis les réponses et retrouve une correction expliquée après enregistrement." /><div className="enterprise-situation-grid">{enterpriseChallenges.map(item=><article className="enterprise-panel" key={item.id}><span className="lesson-category">{enterpriseChapters.find(chapter=>chapter.id===item.chapterId)?.title}</span><h2>{item.title}</h2><p>{item.scenario.slice(0,180)}…</p>{completedChapter(item.chapterId)?<a className="catalog-button secondary" href={link(`/challenges/${item.id}`)}>Ouvrir le dossier <ChevronRight size={17}/></a>:<p className="dashboard-note">Termine les missions de ce chapitre pour préparer cette situation.</p>}</article>)}</div></>
  else if (path === '/enterprise/ranking') page = <EnterpriseRanking workspace={workspace} onRefresh={()=>setRefresh(value=>value+1)} />
  else if (path === '/enterprise/team') page = organization.role==='manager' ? <EnterpriseTeam key={scope.current} workspace={workspace} uid={uid} onReload={()=>setRefresh(value=>value+1)} /> : <section className="enterprise-panel"><h1>Un accès responsable d’équipe est nécessaire.</h1><a href={link()}>Retour à mon chemin</a></section>
  else if (path !== '/enterprise') page = <section className="enterprise-panel"><h1>Cette étape n’existe pas dans ton organisation.</h1><a href={link()}>Revenir à mon chemin</a></section>
  else page = <><section className="enterprise-welcome"><div><p className="lesson-category">{organization.name} · ton apprentissage continu</p><h1>L’IA au travail,<br/><em>un réflexe à la fois.</em></h1><p>Des situations concrètes, un chemin guidé et les rappels qui font durer tes acquis.</p><span className="enterprise-level">Niveau {rewards!.level} · {workspace.ranking.find(member=>member.self)?.streak ?? 0} j de suite · {rewards!.xp} XP · {rewards!.next} XP avant le suivant</span><span className="enterprise-progress-label">{plan.completed} / {plan.guided.length} missions du parcours initial</span><progress value={plan.completed} max={plan.guided.length} aria-label="Progression du parcours Entreprise" /></div><img src={`${import.meta.env.BASE_URL}memo/journey-guide.webp`} width="200" height="180" alt="Mémo guide ton chemin Entreprise" /></section><div className="enterprise-dashboard-grid"><section className="enterprise-panel enterprise-next"><p className="lesson-category">Ton prochain petit pas</p><h2>{plan.pending.length ? 'Relie ta découverte à ta mémoire.' : plan.next?.title ?? 'Ton parcours initial est terminé. Le chemin continue.'}</h2><p>{plan.pending.length ? `${plan.pending.length} nouvelles cartes issues de tes missions t’attendent.` : plan.next?.objective ?? 'Retrouve tes cartes dues, relis une mission et découvre les nouvelles leçons de ton organisation.'}</p>{plan.pending.length?<a className="catalog-button" href={link('/reviews')}>Découvrir mes cartes →</a>:plan.next?<a className="catalog-button" href={link(`/lessons/${plan.next.id}`)}>Reprendre ma mission · {plan.next.estimatedMinutes} min →</a>:<a className="catalog-button" href={link('/reviews')}>Entretenir mes acquis →</a>}{plan.due.length>0 && <a className="text-link" href={link('/reviews')}>{plan.due.length} cartes dues dans cette organisation →</a>}</section><EnterpriseRanking workspace={workspace} compact onRefresh={()=>setRefresh(value=>value+1)} /></div><section className="enterprise-badges" aria-label="Badges de chapitre"><h2>Les connexions que tu construis</h2><p>40 XP par mission terminée, 10 XP au premier rappel d’une carte. Tes badges représentent les chapitres terminés dans cette organisation.</p><div>{rewards!.badges.map(badge=><span key={badge.id} data-earned={badge.earned}>{badge.earned?'✦':'◇'} {badge.title}</span>)}</div></section><section className="enterprise-path"><EnterpriseHeading secondary eyebrow="Ton parcours guidé" title="Travailler avec l’IA, des usages aux projets utiles." description="Avance dans l’ordre. Tu peux relire les missions terminées ; tes révisions restent disponibles à chaque étape." />{enterpriseChapters.map((chapter,index)=>{const lessons=plan.guided.filter(item=>item.chapterId===chapter.id);return <section className="enterprise-chapter" key={chapter.id}><header><span>{String(index+1).padStart(2,'0')}</span><div><h3>{chapter.title}</h3><p>{chapter.description}</p></div>{completedChapter(chapter.id)&&<span className="enterprise-complete">✓ Chapitre terminé</span>}</header><ol>{lessons.map(item=><li key={item.id} data-current={plan.next?.id===item.id}><span aria-hidden="true">{plan.complete(item.id)?'✓':plan.next?.id===item.id?'→':'○'}</span><div><strong>{item.title}</strong><span>{item.estimatedMinutes} min · {plan.complete(item.id)?'À relire':plan.next?.id===item.id?'Ta prochaine mission':'À venir'}</span></div>{(plan.complete(item.id)||plan.next?.id===item.id)&&<a href={link(`/lessons/${item.id}`)} aria-label={`${plan.complete(item.id)?'Relire':'Commencer'} : ${item.title}`}><ChevronRight size={22}/></a>}</li>)}</ol></section>})}</section><section className="enterprise-continuing"><p className="lesson-category">Après le parcours, les connexions continuent</p><h2>Des acquis qui vivent. De nouvelles idées à découvrir.</h2><p>Tes cartes restent programmées après la dernière mission. Les nouvelles leçons publiées enrichissent cet espace, avec leurs exemples et leurs cartes.</p><div className="enterprise-situation-grid">{enterpriseLessons.filter(item=>item.continuous).map(item=><article className="enterprise-panel" key={item.id}><h3>{item.title}</h3><p>{item.objective}</p>{plan.complete(item.id)||plan.next?.id===item.id?<a href={link(`/lessons/${item.id}`)}>{plan.complete(item.id)?'Relire':'Découvrir'} →</a>:<span>Après les missions précédentes</span>}</article>)}</div></section></>
  return <div className="enterprise-app" onClick={navigate}><a className="skip-link" href="#enterprise-content">Aller au contenu</a><header className="enterprise-header"><a className="brand" href={link()}>memstack<span> / entreprise</span></a><a className="enterprise-switch" href={appHref('/courses')}>Espace Développement ↗</a><AccountBar enterprise enterpriseOrganizationId={organization?.id ?? orgId} /></header><div className="enterprise-context"><Building2 size={17} aria-hidden="true"/>{organization?<><strong>{organization.name}</strong><label className="sr-only" htmlFor="enterprise-org">Changer d’organisation</label><select id="enterprise-org" value={organization.id} disabled={busy} onChange={event=>{history.pushState(null,'',appHref(`/enterprise?org=${encodeURIComponent(event.target.value)}`));setRoute(currentRoute())}}>{workspace.organizations.map(org=><option value={org.id} key={org.id}>{org.name}</option>)}</select></>:<span>Ton environnement professionnel</span>}<a href={appHref('/business')}>L’offre Entreprise</a></div>{organization&&<nav className="enterprise-navigation" aria-label="Navigation Entreprise">{navigation.map(item=><a key={item.path} href={link(item.path)} aria-current={path===`/enterprise${item.path}`?'page':undefined}><item.icon size={18} aria-hidden="true"/><span>{item.label}</span></a>)}</nav>}<main id="enterprise-content" tabIndex={-1} className="enterprise-main">{error&&workspace&&<p className="inline-error" role="alert">{error}</p>}{page}</main></div>
}

function EnterpriseHeading({eyebrow,title,description,secondary=false}:{eyebrow:string;title:string;description:string;secondary?:boolean}) {return <header className="enterprise-heading"><p className="lesson-category">{eyebrow}</p>{secondary?<h2>{title}</h2>:<h1>{title}</h1>}<p>{description}</p></header>}

function EnterpriseLessonView({lesson,completed,available,busy,onComplete,returnHref,cardsHref}:{lesson:EnterpriseLesson;completed:boolean;available:boolean;busy:boolean;onComplete:()=>Promise<EnterpriseLearningResult|null>;returnHref:string;cardsHref:string}) {
  const [index,setIndex]=useState(0)
  const [answer,setAnswer]=useState('')
  const [checked,setChecked]=useState(false)
  const [finished,setFinished]=useState(false)
  const [notes,setNotes]=useState('')
  const step=lesson.steps[index]
  const choice=step?.type==='question'?step.options.find(item=>item.id===answer):undefined
  useEffect(()=>{setAnswer('');setChecked(false);document.getElementById('enterprise-lesson-step')?.focus({preventScroll:true})},[index])
  if(!completed&&!available) return <section className="enterprise-panel"><h1>Une mission à la fois.</h1><p>Retrouve ton prochain petit pas sur le chemin avant de découvrir cette mission.</p><a href={returnHref}>Revenir à mon chemin →</a></section>
  if(finished) return <section className="enterprise-completion"><img src={`${import.meta.env.BASE_URL}memo/journey-celebrate.webp`} width="160" height="140" alt="Mémo célèbre ta mission"/><h1>Une nouvelle connexion.</h1><p>Ta mission est enregistrée dans cette organisation. Retrouve ses cartes pour garder les bons réflexes.</p><a className="catalog-button" href={cardsHref}>Découvrir mes cartes →</a><a className="text-link" href={returnHref}>Revenir à mon chemin →</a></section>
  return <section className="enterprise-lesson"><a className="text-link" href={returnHref}>← Mon chemin Entreprise</a><p className="lesson-category">{completed?'Relecture · aucun changement de progression':'Ta mission du jour'} · {lesson.estimatedMinutes} min</p><h1>{lesson.title}</h1><p>{lesson.objective}</p><progress value={index+1} max={lesson.steps.length} aria-label="Avancement dans la mission"/><p className="dashboard-note">Étape {index+1} sur {lesson.steps.length}</p><article id="enterprise-lesson-step" tabIndex={-1} className="enterprise-lesson-step" key={step.id}>{step.type==='message'?<><LessonText text={step.text}/>{step.text.startsWith('Pratique ·')&&<div className="enterprise-practice"><label>Mon brouillon d’exercice<textarea value={notes} onChange={event=>setNotes(event.target.value)} maxLength={5000} rows={7} placeholder="Travaille ici avec les données fictives du dossier…"/></label><p>Ce brouillon reste disponible pendant cette mission. Copie-le si tu veux le conserver avant de quitter l’écran. Aucun envoi à une IA.</p></div>}</>:step.type==='image'?<figure><img src={`${import.meta.env.BASE_URL}${step.src.replace(/^\//,'')}`} alt={step.alt}/><figcaption>{step.caption}</figcaption></figure>:<><h2>{step.prompt}</h2><fieldset disabled={busy||checked}><legend className="sr-only">Choisis ta réponse</legend>{step.options.map(option=><label className="enterprise-option" key={option.id}><input type="radio" name={step.id} value={option.id} checked={answer===option.id} onChange={()=>setAnswer(option.id)}/><span>{option.text}</span></label>)}</fieldset>{checked&&choice&&<div className="enterprise-feedback" role="status"><strong>{answer===step.correctOptionId?'Tu as retrouvé le bon réflexe.':'Reprenons ce point.'}</strong><LessonText text={choice.feedback}/>{answer!==step.correctOptionId&&<button className="catalog-button secondary" onClick={()=>{setChecked(false);setAnswer('')}}>Réessayer avec cette explication</button>}</div>}</>}</article><div className="enterprise-lesson-actions"><button className="catalog-button secondary" disabled={index===0||busy} onClick={()=>setIndex(value=>value-1)}>Précédent</button>{step.type==='question'&&!checked?<button className="catalog-button" disabled={!answer||busy} onClick={()=>setChecked(true)}>Vérifier mon raisonnement</button>:<button className="catalog-button" disabled={busy||(step.type==='question'&&answer!==step.correctOptionId)} onClick={()=>{if(index<lesson.steps.length-1)setIndex(value=>value+1);else if(completed)setFinished(true);else void onComplete().then(result=>{if(result)setFinished(true)})}}>{busy?'Enregistrement…':index<lesson.steps.length-1?'Continuer →':completed?'Terminer la relecture':'Enregistrer ma mission'}</button>}</div><details className="enterprise-sources"><summary>Sources de cette mission</summary><ul>{lesson.sources.map(source=><li key={source}><a href={source} target="_blank" rel="noopener noreferrer">{new URL(source).hostname} ↗</a></li>)}</ul></details></section>
}

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
  if(!available)return <section className="enterprise-panel"><h1>Prépare cette situation.</h1><p>Termine les missions de ce chapitre avant d’ouvrir son dossier.</p><a href={returnHref}>Revenir aux situations →</a></section>
  return <section className="enterprise-challenge"><a className="text-link" href={returnHref}>← Toutes les situations</a><EnterpriseHeading eyebrow="Dossier fictif · Aster" title={challenge.title} description={challenge.scenario}/>{challenge.files.map(file=><details className="enterprise-dossier" key={file.name} open><summary>{file.name}</summary><LessonText text={file.content}/></details>)}{result?<section className="enterprise-panel" role="status"><h2>{result.passed?'Des réflexes bien reliés.':'Quelques points à reprendre.'}</h2><p>{result.correct} réponses correctes sur {result.total}. Cette tentative est enregistrée dans cette organisation.</p>{result.checks.map(check=>{const question=challenge.questions.find(item=>item.id===check.questionId);return <div className="enterprise-result" key={check.questionId}><h3>{check.correct?'✓':'↻'} {check.questionText ?? question?.prompt}</h3><p>{check.correctAnswerText ?? question?.options.find(option=>option.id===check.correctOptionId)?.text}</p><LessonText text={check.explanation ?? 'Cette correction appartient à une ancienne version.'}/></div>})}<button className="catalog-button secondary" onClick={()=>{setResult(null);setAnswers({})}}>Faire une nouvelle tentative</button></section>:<form onSubmit={event=>{event.preventDefault();void onSubmit(answers).then(value=>{if(value?.type==='challenge')setResult(value)})}}>{challenge.questions.map((question,index)=><fieldset disabled={busy} key={question.id}><legend>{index+1}. {question.prompt}</legend>{question.options.map(option=><label className="enterprise-option" key={option.id}><input type="radio" name={question.id} required checked={answers[question.id]===option.id} onChange={()=>setAnswers(previous=>({...previous,[question.id]:option.id}))}/><span>{option.text}</span></label>)}</fieldset>)}<button className="catalog-button" disabled={busy||challenge.questions.some(question=>!answers[question.id])}>{busy?'Enregistrement…':'Enregistrer et voir ma correction'}</button></form>}<details className="enterprise-history"><summary>Mes tentatives dans cette organisation ({previous.length})</summary>{previous.map(attempt=><article className="enterprise-panel" key={attempt.id}><h3>{new Date(attempt.submittedAt).toLocaleString('fr-FR')} · {attempt.correct}/{attempt.total}</h3><p>Version {attempt.catalogVersion} · {attempt.passed?'Réussie':'À retravailler'}{attempt.catalogVersion!==enterpriseCurriculum.version?' · version historique':''}</p>{attempt.checks.map(check=><div key={check.questionId}><h4>{check.correct?'✓':'↻'} {check.questionText}</h4><p>Ta réponse : {check.selectedAnswerText}</p><p>Réponse expliquée : {check.correctAnswerText}</p><LessonText text={check.explanation}/></div>)}</article>)}</details><p className="dashboard-note">{previous.length} tentative(s) dans cette organisation. Une nouvelle tentative conserve les précédentes.</p></section>
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
