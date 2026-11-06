import { useCallback, useEffect, useRef, useState } from 'react'
import { getEnterpriseLessonDraft, saveEnterpriseLessonDraft } from '../firebase/enterprise'
import type { EnterpriseLessonDraftSnapshot, EnterpriseLessonDraftState } from '../types/enterprise'
import EnterpriseLessonView from './EnterpriseLessonView'
import type { EnterpriseLessonViewProps } from './EnterpriseLessonView'
import { emptyLessonDraft, isValidLessonDraft, lessonContentVersion, lessonDraftKey } from './lessonResume'
import './enterprise-resume.css'

type Props = EnterpriseLessonViewProps & {
  uid: string
  organizationId: string
  onDraftSaved: (snapshot: EnterpriseLessonDraftSnapshot) => void
  onAccessChanged: () => void
}

const notices = {
  expired: 'La reprise précédente a expiré. Tu peux repartir du début ; tes missions validées sont conservées.',
  'content-changed': 'Le contenu de cette mission a changé. Une nouvelle session commence pour garder les consignes et tes réponses cohérentes.',
  completed: 'Cette mission est déjà terminée. Sa reprise précédente a été retirée.',
  'invalid-state': 'La reprise précédente ne peut pas être restaurée. Tu peux commencer une nouvelle session.',
}

export default function EnterpriseMissionSession(props: Props) {
  const { uid, organizationId, lesson } = props
  const identity = `${uid}:${organizationId}:${lesson.id}`
  const [replaying] = useState(props.completed)
  const [loaded, setLoaded] = useState<{ identity: string; snapshot: EnterpriseLessonDraftSnapshot; initial: EnterpriseLessonDraftState } | null>(null)
  const [current, setCurrent] = useState<EnterpriseLessonDraftState | null>(null)
  const [baseline, setBaseline] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [reset, setReset] = useState(0)
  const [loadingError, setLoadingError] = useState('')
  const [needsAppRefresh, setNeedsAppRefresh] = useState(false)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [conflict, setConflict] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const callbacks = useRef(props)
  callbacks.current = props
  const generation = useRef(0)
  const inFlight = useRef(false)
  const retry = useRef<{ key: string; mutationId: string } | null>(null)

  useEffect(() => {
    const operation = ++generation.current
    setLoaded(null); setCurrent(null); setLoadingError(''); setNeedsAppRefresh(false); setMessage(''); setConflict(false); setConfirmReset(false); setSaving(false); setClearing(false); inFlight.current = false; retry.current = null
    if (replaying) return
    void (async () => {
      try {
        const contentVersion = await lessonContentVersion(lesson)
        const snapshot = await getEnterpriseLessonDraft(uid, organizationId, lesson.id)
        if (generation.current !== operation) return
        if (snapshot.organizationId !== organizationId || snapshot.lessonId !== lesson.id || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0) throw new Error('Reprise incompatible.')
        if (snapshot.contentVersion !== contentVersion) {
          setNeedsAppRefresh(true)
          setLoadingError('Le contenu disponible sur le serveur a changé. Actualise l’application pour ouvrir la nouvelle version de cette mission.')
          return
        }
        if (snapshot.state && !isValidLessonDraft(lesson, snapshot.state)) throw new Error('Reprise invalide.')
        const initial = snapshot.state ?? emptyLessonDraft(lesson)
        setLoaded({ identity, snapshot, initial }); setCurrent(initial); setBaseline(lessonDraftKey(initial)); setReset(value => value + 1)
        callbacks.current.onDraftChange(initial.draft)
        callbacks.current.onDraftSaved(snapshot)
        if (snapshot.notice) setMessage(notices[snapshot.notice] ?? 'Une nouvelle session commence.')
      } catch (error) {
        if (generation.current !== operation) return
        if (String((error as { code?: string }).code).includes('permission-denied')) callbacks.current.onAccessChanged()
        setLoadingError('Impossible de retrouver ta reprise. Vérifie ta connexion puis réessaie pour charger la bonne session.')
      }
    })()
    return () => { generation.current++ }
  }, [uid, organizationId, lesson, identity, refresh, replaying])

  const onSessionChange = useCallback((state: EnterpriseLessonDraftState) => {
    setCurrent(previous => previous && lessonDraftKey(previous) === lessonDraftKey(state) ? previous : state)
  }, [])

  async function save(clear = false) {
    if (!loaded || loaded.identity !== identity || !current || inFlight.current || props.busy || props.completed || conflict) return
    const operation = generation.current
    const state = clear ? null : current
    if (state && !isValidLessonDraft(lesson, state)) { setMessage('Termine la vérification de la question en cours avant de sauvegarder cette étape.'); return }
    const expectedRevision = loaded.snapshot.revision
    const key = JSON.stringify({ identity, expectedRevision, state: state && lessonDraftKey(state) })
    if (retry.current?.key !== key) retry.current = { key, mutationId: crypto.randomUUID() }
    const mutationId = retry.current.mutationId
    inFlight.current = true; setSaving(true); setClearing(clear); setMessage(''); setConfirmReset(false)
    try {
      const snapshot = await saveEnterpriseLessonDraft(uid, { organizationId, lessonId: lesson.id, contentVersion: loaded.snapshot.contentVersion, expectedRevision, mutationId, state })
      if (generation.current !== operation) return
      if (snapshot.organizationId !== organizationId || snapshot.lessonId !== lesson.id || snapshot.contentVersion !== loaded.snapshot.contentVersion || !Number.isSafeInteger(snapshot.revision) || snapshot.revision <= expectedRevision || (snapshot.state && !isValidLessonDraft(lesson, snapshot.state))) throw new Error('Confirmation incompatible.')
      const savedState = snapshot.state ?? emptyLessonDraft(lesson)
      if (state && (!snapshot.state || lessonDraftKey(snapshot.state) !== lessonDraftKey(state))) throw new Error('Confirmation incomplète.')
      retry.current = null
      setLoaded(previous => previous ? { ...previous, snapshot, ...(clear ? { initial: savedState } : {}) } : previous)
      setBaseline(lessonDraftKey(savedState))
      if (clear) { setCurrent(savedState); callbacks.current.onDraftChange(''); setReset(value => value + 1) }
      callbacks.current.onDraftSaved(snapshot)
      setMessage(clear ? 'Reprise effacée après confirmation du serveur. Une nouvelle session commence.' : 'Le serveur a confirmé ta sauvegarde. Tu retrouveras cette étape et tes réponses sur un autre appareil.')
    } catch (error) {
      if (generation.current !== operation) return
      const code = String((error as { code?: string }).code)
      if (code.includes('permission-denied')) callbacks.current.onAccessChanged()
      if (code.includes('failed-precondition') || code.includes('already-exists') || code.includes('aborted')) {
        setConflict(true)
        setMessage('La reprise a changé dans une autre session, ou le contenu a évolué. Recharge la version du serveur avant de sauvegarder. Tes modifications restent affichées ici.')
      } else setMessage('Sauvegarde non confirmée. Tes modifications restent ici. Réessaie sans fermer cette page.')
    } finally {
      if (generation.current === operation) { inFlight.current = false; setSaving(false); setClearing(false) }
    }
  }

  if (replaying) return <EnterpriseLessonView {...props} />
  if (!loaded || loaded.identity !== identity || !current) return <section className="enterprise-panel" aria-busy={!loadingError}><h1>{lesson.title}</h1><p role="status">{loadingError || 'On retrouve ton étape et tes réponses enregistrées…'}</p>{loadingError && <button type="button" className="catalog-button" onClick={() => { if (needsAppRefresh) window.location.reload(); else setRefresh(value => value + 1) }}>{needsAppRefresh ? 'Actualiser l’application' : 'Réessayer de charger ma reprise'}</button>}<a className="text-link" href={props.returnHref}>Revenir à mon parcours</a></section>
  if (loaded.snapshot.notice === 'completed') return <EnterpriseLessonView {...props} completed />
  const dirty = lessonDraftKey(current) !== baseline
  const controls = <aside className="enterprise-resume" aria-label="Reprise de la mission">
    <p>Enregistrer envoie ton étape et tes réponses fictives dans ton compte, pour cette organisation. Ton responsable ne les voit pas.</p>
    <details><summary>Ce qui est enregistré</summary><p>Ton étape, tes choix et ton texte sont accessibles sur tes autres appareils. La reprise reste disponible 30 jours après sa sauvegarde. À expiration, elle sera retirée lors d’un prochain accès.</p><p>Le retour IA, les exemples ouverts et le laboratoire ne sont pas enregistrés. Le laboratoire redémarre à la reprise. Enregistrer une reprise ne valide pas la mission et ne rapporte pas d’XP.</p></details>
    <p role="status">{saving ? 'Enregistrement sur le serveur…' : dirty ? 'Modifications non enregistrées.' : loaded.snapshot.state ? 'Cette étape correspond à ta dernière sauvegarde confirmée.' : 'Aucune reprise enregistrée pour cette mission.'}</p>
    <div className="enterprise-resume-actions">
      <button type="button" className="catalog-button secondary" disabled={saving || props.busy || props.completed || conflict || !dirty} onClick={() => { void save() }}>Enregistrer ma reprise</button>
      <button type="button" className="text-link" disabled={saving || props.busy || props.completed || conflict} onClick={() => setConfirmReset(true)}>Recommencer la mission</button>
    </div>
    {confirmReset && <div className="enterprise-resume-confirm"><p>Effacer la reprise enregistrée et les modifications de cette session pour repartir du début ? Les missions déjà validées restent acquises.</p><button className="catalog-button secondary" type="button" disabled={saving || props.busy} onClick={() => { void save(true) }}>Effacer et recommencer</button><button className="text-link" type="button" onClick={() => setConfirmReset(false)}>Garder ma session</button></div>}
    {message && <p role="status">{message}</p>}
    {conflict && <><p>Recharger remplacera les modifications affichées par la reprise du serveur. Garde une copie de ton texte si tu veux le conserver.</p><button className="catalog-button secondary" type="button" onClick={() => setRefresh(value => value + 1)}>Recharger la reprise du serveur</button></>}
  </aside>
  return <EnterpriseLessonView {...props} key={`${identity}:${reset}`} initialState={loaded.initial} busy={props.busy || saving} interactionDisabled={clearing} draft={current.draft} onDraftChange={draft => { setCurrent(previous => previous ? { ...previous, draft } : previous); props.onDraftChange(draft) }} onSessionChange={onSessionChange} sessionControls={controls} hasUnsavedChanges={dirty} onComplete={async () => {
    if (inFlight.current) return null
    const operation = generation.current
    const result = await props.onComplete()
    if (result && generation.current === operation) { setBaseline(lessonDraftKey(current)); props.onDraftChange('') }
    return result
  }} />
}
