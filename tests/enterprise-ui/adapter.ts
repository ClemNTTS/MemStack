import { enterpriseLessons, enterpriseTracks } from '../../src/data/enterprise'
import type { EnterpriseWorkspace, EnterpriseLearningAction, EnterpriseLessonDraftMutation, EnterpriseLessonDraftSnapshot } from '../../src/types/enterprise'
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
  return { organizations, organization: organizations.find(item => item.id === org)!, progress: data.progress, settings: data.settings, ranking: [], members: [], lessonDrafts }
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
