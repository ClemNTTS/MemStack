import { enterpriseLessons, enterpriseTracks } from '../../src/data/enterprise'
import type { EnterpriseWorkspace, EnterpriseLearningAction, EnterpriseLessonDraftMutation, EnterpriseLessonDraftSnapshot, EnterpriseLessonAssessment, EnterpriseLessonAnswer } from '../../src/types/enterprise'
import practices from '../../src/data/enterprisePractices.json'

// Simulated server persistence exists only in this dedicated test server.
const key = (org: string) => `memstack-ui-fixture:${org}`
const stamp = () => new Date().toISOString()
const empty = () => ({ lessons: {}, cards: {}, reviews: [], attempts: [] })
function read(org: string) {
  return JSON.parse(localStorage.getItem(key(org)) ?? 'null') ?? { settings: null, progress: empty(), resumes: {} }
}
function write(org: string, value: ReturnType<typeof read>) {
  localStorage.setItem(key(org), JSON.stringify(value))
}
const organizations = [{ id: 'qa-a', name: 'Aster · fictif', role: 'manager' as const }, { id: 'qa-b', name: 'Boréal · fictif', role: 'learner' as const }]
export async function getEnterpriseWorkspace(_uid: string, org = 'qa-a'): Promise<EnterpriseWorkspace> {
  const data = read(org)
  const lessonDrafts = []
  for (const lessonId of Object.keys(data.resumes ?? {})) {
    const saved = await getEnterpriseLessonDraft(_uid, org, lessonId)
    if (saved.state && saved.updatedAt && saved.expiresAt) lessonDrafts.push({ lessonId, revision: saved.revision, stepId: saved.state.stepId, updatedAt: saved.updatedAt, expiresAt: saved.expiresAt })
  }
  return { organizations, organization: organizations.find(item => item.id === org)!, progress: data.progress, settings: data.settings, ranking: [], members: [], lessonDrafts, lessonAssessments: data.lessonAssessments ?? {}, assessmentDay: parisDay(Date.now()) }
}
async function contentVersion(lessonId: string) {
  const lesson = enterpriseLessons.find(item => item.id === lessonId)!
  const practice = (practices as Record<string, unknown>)[lessonId] ?? null
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ lesson, practice })))
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}
export async function getEnterpriseLessonDraft(_uid: string, organizationId: string, lessonId: string): Promise<EnterpriseLessonDraftSnapshot> {
  const data = read(organizationId)
  const version = await contentVersion(lessonId)
  const saved = data.resumes?.[lessonId]
  const state = saved?.state && !data.progress.lessons[lessonId] && saved.contentVersion === version && Date.parse(saved.expiresAt) > Date.now() ? saved.state : null
  return { organizationId, lessonId, revision: saved?.revision ?? 0, contentVersion: version, state, updatedAt: saved?.updatedAt, expiresAt: saved?.expiresAt }
}
export async function saveEnterpriseLessonDraft(_uid: string, input: EnterpriseLessonDraftMutation): Promise<EnterpriseLessonDraftSnapshot> {
  const data = read(input.organizationId)
  data.resumes ??= {}
  const saved = data.resumes[input.lessonId]
  if (saved?.mutationId === input.mutationId) return getEnterpriseLessonDraft(_uid, input.organizationId, input.lessonId)
  if ((saved?.revision ?? 0) !== input.expectedRevision) throw { code: 'functions/aborted' }
  if (data.progress.lessons[input.lessonId]) throw { code: 'functions/failed-precondition' }
  const version = await contentVersion(input.lessonId)
  if (version !== input.contentVersion) throw { code: 'functions/failed-precondition' }
  data.resumes[input.lessonId] = { ...input, revision: input.expectedRevision + 1, updatedAt: stamp(), expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() }
  write(input.organizationId, data)
  return getEnterpriseLessonDraft(_uid, input.organizationId, input.lessonId)
}
export async function setEnterpriseLearningPreferences(_uid: string, organizationId: string, activeTrackId: string) {
  const input = { organizationId, activeTrackId }
  if (!enterpriseTracks.some(track => track.id === input.activeTrackId)) throw new Error('Invalid track')
  const data = read(input.organizationId)
  data.settings = { activeTrackId: input.activeTrackId, updatedAt: stamp() }
  write(input.organizationId, data)
  return { organizationId: input.organizationId, settings: data.settings }
}
export async function commitEnterpriseLearningAction(_uid: string, input: EnterpriseLearningAction) {
  const data = read(input.organizationId)
  if (input.type === 'lesson') {
    if (enterpriseLessons.find(lesson => lesson.id === input.lessonId)?.steps.some(step => step.type === 'question') && !data.progress.lessons[input.lessonId] && (!data.lessonAssessments?.[input.lessonId]?.passed || data.lessonAssessments[input.lessonId].contentVersion !== await contentVersion(input.lessonId))) throw { code: 'functions/failed-precondition' }
    const completedAt = stamp()
    data.progress.lessons[input.lessonId] = { completedAt }
    if (data.resumes?.[input.lessonId]) data.resumes[input.lessonId] = { revision: data.resumes[input.lessonId].revision + 1, state: null }
    write(input.organizationId, data)
    return { type: 'lesson', lessonId: input.lessonId, completedAt }
  }
  if (input.type === 'card') {
    const reviewedAt = stamp()
    const card = { cardId: input.cardId, intervalDays: 1, lastReviewedAt: reviewedAt, dueAt: new Date(Date.now() + 86400000).toISOString() }
    const event = { cardId: input.cardId, rating: input.rating, reviewedAt, kind: 'new' }
    data.progress.cards[input.cardId] = card
    data.progress.reviews.push(event)
    write(input.organizationId, data)
    return { type: 'card', card, event }
  }
  throw new Error('Challenge submission outside this fixture')
}
function parisDay(now: number) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(now))
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)!.value).join('-')
}
function tomorrowParis(now: number) {
  const midnight = Date.parse(`${parisDay(now)}T00:00:00Z`) + 86400000
  const format = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', timeZoneName: 'shortOffset' })
  const offset = Number(format.formatToParts(new Date(midnight)).find(part => part.type === 'timeZoneName')!.value.replace('GMT', '')) * 3600000
  return new Date(midnight - offset).toISOString()
}
export async function submitEnterpriseLessonAnswer(_uid: string, input: EnterpriseLessonAnswer): Promise<EnterpriseLessonAssessment> {
  const data = read(input.organizationId)
  const now = Date.now()
  const lesson = enterpriseLessons.find(item => item.id === input.lessonId)!
  if (!lesson?.steps.some(step => step.type === 'question') || data.progress.lessons[input.lessonId] || input.contentVersion !== await contentVersion(input.lessonId)) throw { code: 'functions/failed-precondition' }
  data.lessonAssessments ??= {}
  data.assessmentReceipts ??= {}
  const receipt = data.assessmentReceipts[input.requestId]
  if (receipt) {
    if (JSON.stringify(receipt.input) !== JSON.stringify(input)) throw { code: 'functions/already-exists' }
    return receipt.result
  }
  let previous: EnterpriseLessonAssessment | undefined = data.lessonAssessments[input.lessonId]
  if (previous?.finished && !previous.passed && previous.retryAt && Date.parse(previous.retryAt) <= now) previous = undefined
  if (previous && previous.contentVersion !== input.contentVersion) {
    if (previous.finished && !previous.passed) throw { code: 'functions/resource-exhausted' }
    previous = undefined
  }
  const questions = lesson.steps.filter(step => step.type === 'question')
  const question = questions.find(step => step.id === input.questionId)
  const selected = question?.options.find(option => option.id === input.optionId)
  if (!question || !selected) throw { code: 'functions/invalid-argument' }
  if (previous?.answers[input.questionId]) {
    if (previous.answers[input.questionId] !== input.optionId) throw { code: 'functions/already-exists' }
    return previous
  }
  if (previous?.finished || questions[previous?.checks.length ?? 0]?.id !== input.questionId) throw { code: 'functions/failed-precondition' }
  const correctOption = question.options.find(option => option.id === question.correctOptionId)!
  const checks = [...(previous?.checks ?? []), { questionId: question.id, selectedOptionId: selected.id, correctOptionId: correctOption.id, correct: selected.id === correctOption.id, explanation: selected.feedback, questionText: question.prompt, correctAnswerText: correctOption.text, selectedAnswerText: selected.text }]
  const correct = checks.filter(check => check.correct).length
  const finished = checks.length === questions.length
  const passed = finished && correct === questions.length
  const result: EnterpriseLessonAssessment = { lessonId: input.lessonId, attemptDay: previous?.attemptDay ?? parisDay(now), contentVersion: input.contentVersion, answers: { ...(previous?.answers ?? {}), [question.id]: selected.id }, checks, correct, total: questions.length, finished, passed, retryAt: finished && !passed ? tomorrowParis(now) : null, updatedAt: new Date(now).toISOString() }
  data.lessonAssessments[input.lessonId] = result
  data.assessmentReceipts[input.requestId] = { input, result }
  if (finished && !passed && data.resumes?.[input.lessonId]) data.resumes[input.lessonId] = { revision: data.resumes[input.lessonId].revision + 1, state: null }
  write(input.organizationId, data)
  return result
}
export async function assessEnterprisePracticeAnswer() { throw { code: 'functions/failed-precondition' } }
export async function joinEnterpriseOrganization() { throw new Error('Not available in test fixture') }
export async function manageEnterpriseOrganization() { throw new Error('Not available in test fixture') }
export async function getEnterpriseBilling() { throw new Error('No billing in test fixture') }
export const createEnterpriseOrganization = getEnterpriseBilling
export const createEnterpriseCheckout = getEnterpriseBilling
export const createEnterprisePortal = getEnterpriseBilling
export const retryEnterpriseBillingSync = getEnterpriseBilling

// Readable fixture IDs for manual navigation without touching live accounts.
export const firstMissionId = enterpriseLessons[0].id
