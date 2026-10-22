import { createHash } from 'node:crypto'
import { AnalysisError } from './analysis.mjs'

const fail = (code,message) => { throw new AnalysisError(code,message) }
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const exact = (value,keys) => record(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value,key))
const id = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value)
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const canonical = value => Array.isArray(value) ? value.map(canonical) : record(value) ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])) : value
export const ENTERPRISE_DRAFT_LIFETIME = 30*86400000

export const enterpriseDraftContentVersion = (lesson,practice) => digest({lesson,practice:practice??null})
export const enterpriseDraftMutationHash = data => digest(canonical(data))

export function validateEnterpriseDraftState(state,lesson) {
  if (!exact(state,['stepId','answers','checkedIds','draft','practiceAnswers']) || !record(state.answers) || !record(state.practiceAnswers)
    || !Array.isArray(state.checkedIds) || typeof state.draft !== 'string' || state.draft.length>5000
    || Buffer.byteLength(JSON.stringify(state),'utf8')>24000) fail('invalid-argument','Reprise de mission invalide ou trop volumineuse.')
  const index = lesson.steps.findIndex(step=>step.id===state.stepId)
  if (index<0) fail('invalid-argument','Étape de reprise inconnue.')
  const questions = new Map(lesson.steps.slice(0,index+1).filter(step=>step.type==='question').map(step=>[step.id,step]))
  if (Object.entries(state.answers).some(([key,value])=>!questions.get(key)?.options.some(option=>option.id===value))
    || new Set(state.checkedIds).size!==state.checkedIds.length
    || state.checkedIds.some(key=>typeof key!=='string' || !questions.has(key) || !Object.hasOwn(state.answers,key))) fail('invalid-argument','Réponses de reprise invalides.')
  for (const step of lesson.steps.slice(0,index)) {
    if (step.type==='question' && (state.answers[step.id]!==step.correctOptionId || !state.checkedIds.includes(step.id))) fail('invalid-argument','La reprise ne peut pas sauter une question non résolue.')
  }
  const diagnoses = lesson.id==='ent-plausible-not-proven' ? ['delay','fees','reference'] : []
  if (Object.entries(state.practiceAnswers).some(([key,value])=>!diagnoses.includes(key) || !['supported','contradicted','unverified'].includes(value))) fail('invalid-argument','Diagnostics de reprise invalides.')
  const practiceIndex = lesson.steps.findIndex(step=>step.type==='message' && step.text.startsWith('Pratique ·'))
  if ((state.draft || Object.keys(state.practiceAnswers).length) && (practiceIndex<0 || index<practiceIndex)) fail('invalid-argument','L’activité n’a pas encore été ouverte à cette étape.')
  return state
}

export function validateEnterpriseDraftRequest(data,catalog,practices,write=false) {
  const keys = write ? ['organizationId','lessonId','contentVersion','expectedRevision','mutationId','state'] : ['organizationId','lessonId']
  if (!exact(data,keys) || !id(data.organizationId) || !id(data.lessonId)) fail('invalid-argument','Demande de reprise invalide.')
  const lesson = catalog?.lessons?.find(lesson=>lesson.id===data.lessonId)
  if (!lesson) fail('invalid-argument','Mission entreprise inconnue.')
  const contentVersion = enterpriseDraftContentVersion(lesson,practices?.[lesson.id])
  if (write) {
    if (!Number.isSafeInteger(data.expectedRevision) || data.expectedRevision<0 || data.expectedRevision>=Number.MAX_SAFE_INTEGER
      || !id(data.mutationId) || data.mutationId.length<16 || typeof data.contentVersion!=='string' || !/^[a-f0-9]{64}$/.test(data.contentVersion)) fail('invalid-argument','Révision ou identifiant de sauvegarde invalide.')
    if (data.contentVersion!==contentVersion) fail('failed-precondition','Le contenu de cette mission a changé. Recharge la mission avant de sauvegarder ta reprise.')
    if (data.state!==null) validateEnterpriseDraftState(data.state,lesson)
  }
  return {lesson,contentVersion}
}

export function enterpriseDraftRevision(saved) {
  if (!saved) return 0
  if (!Number.isSafeInteger(saved.revision) || saved.revision<1 || saved.revision>=Number.MAX_SAFE_INTEGER) fail('unavailable','La révision de cette reprise est indisponible.')
  return saved.revision
}

export function enterpriseDraftTombstone(saved,contentVersion,now,notice) {
  return {revision:enterpriseDraftRevision(saved)+1,contentVersion,state:null,updatedAt:new Date(now).toISOString(),...(notice?{notice}:{})}
}

// A tombstone keeps the revision without retaining the learner's production.
export function resolveEnterpriseDraft(saved,{organizationId,lesson,contentVersion,completed=false,now}) {
  let value = saved
  let notice = completed ? 'completed' : ['expired','content-changed','completed','invalid-state'].includes(saved?.notice) ? saved.notice : undefined
  if (saved && saved.state!==null) {
    if (!completed && saved.contentVersion!==contentVersion) notice = 'content-changed'
    else if (!completed && (!Number.isFinite(Date.parse(saved.expiresAt)) || Date.parse(saved.expiresAt)<=now)) notice = 'expired'
    else if (!completed) {
      try {
        if (typeof saved.updatedAt!=='string' || !Number.isFinite(Date.parse(saved.updatedAt))) fail('invalid-argument','Date de reprise invalide.')
        validateEnterpriseDraftState(saved.state,lesson)
      }
      catch { notice = 'invalid-state' }
    }
    if (notice) value = enterpriseDraftTombstone(saved,contentVersion,now,notice)
  }
  const snapshot = {
    organizationId,lessonId:lesson.id,revision:enterpriseDraftRevision(value),contentVersion,
    state:value?.state??null,
    ...(value?.updatedAt?{updatedAt:value.updatedAt}:{}),
    ...(value?.state && value.expiresAt?{expiresAt:value.expiresAt}:{}),
    ...(notice?{notice}:{}),
  }
  return {snapshot,purge:value!==saved?value:null}
}
