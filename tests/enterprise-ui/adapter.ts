import { enterpriseLessons, enterpriseTracks } from '../../src/data/enterprise'
import type { EnterpriseWorkspace, EnterpriseLearningAction } from '../../src/types/enterprise'

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
  return { organizations, organization: organizations.find(item => item.id === org)!, progress: data.progress, settings: data.settings, ranking: [], members: [] }
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
