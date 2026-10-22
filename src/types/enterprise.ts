import type { CardProgress } from './card'
import type { ReviewEvent } from './progress'

export type EnterpriseOrganization = { id: string; name: string; role: 'manager' | 'learner'; learningEnabled?: boolean }
export type EnterpriseLearningPreferences = { activeTrackId: string; updatedAt: string }
export type EnterpriseLessonDraftState = {
  stepId: string
  answers: Record<string,string>
  checkedIds: string[]
  draft: string
  practiceAnswers: Record<string,string>
}
export type EnterpriseLessonDraftSummary = { lessonId: string; revision: number; stepId: string; updatedAt: string; expiresAt: string }
export type EnterpriseLessonDraftSnapshot = {
  organizationId: string
  lessonId: string
  revision: number
  contentVersion: string
  state: EnterpriseLessonDraftState | null
  updatedAt?: string
  expiresAt?: string
  notice?: 'expired' | 'content-changed' | 'completed' | 'invalid-state'
}
export type EnterpriseLessonDraftMutation = { organizationId: string; lessonId: string; contentVersion: string; expectedRevision: number; mutationId: string; state: EnterpriseLessonDraftState | null }
export type EnterpriseChallengeAttempt = {
  type: 'challenge'; id: string; challengeId: string; submittedAt: string
  catalogVersion: number; assessmentVersion: number; challengeTitle: string
  answers: Record<string,string>; checks: { questionId: string; correct: boolean; correctOptionId: string; explanation: string; questionText: string; correctAnswerText: string; selectedAnswerText: string }[]
  correct: number; total: number; passed: boolean
}
export type EnterpriseWorkspace = {
  organizations: EnterpriseOrganization[]
  organization: EnterpriseOrganization | null
  settings?: EnterpriseLearningPreferences | null
  lessonDrafts?: EnterpriseLessonDraftSummary[]
  progress: { lessons: Record<string,{completedAt:string}>; cards: Record<string,CardProgress>; reviews: ReviewEvent[]; attempts: EnterpriseChallengeAttempt[] }
  ranking: { alias: string; streak: number; rank: number; self: boolean }[]
  members: { uid: string; alias: string; role: 'manager' | 'learner'; active: boolean; summary: { lessons: number; cards: number; attempts: number }; lastActivityAt: string | null }[]
}
export type EnterpriseLearningAction = { organizationId: string; requestId: string } & (
  { type: 'lesson'; lessonId: string } | { type: 'card'; cardId: string; rating: 'recalled' | 'forgotten' } |
  { type: 'challenge'; challengeId: string; answers: Record<string,string>; catalogVersion: number }
)
export type EnterpriseLearningResult = { type: 'lesson'; lessonId: string; completedAt: string } |
  { type: 'card'; card: CardProgress; event: ReviewEvent } | EnterpriseChallengeAttempt
export type EnterpriseManagementAction =
  { action: 'create'; name: string; managerEmail: string; requestId: string } |
  { action: 'invite'; organizationId: string; email: string } |
  { action: 'inviteManager'; organizationId: string; email: string } |
  { action: 'myAlias'; organizationId: string; alias: string } |
  { action: 'revoke'; organizationId: string; uid: string } |
  { action: 'enable'; organizationId: string; enabled: boolean }

export type EnterpriseBillingStatus = {
  enabled: boolean; organizationId: string; name: string; suspended: boolean; status: 'pending' | 'active' | 'inactive' | 'pilot'
  unitAmount: number; interval: 'month'; taxBehavior: 'inclusive'; activeMembers: number; billedMembers: number
  paidUntil: string | null; cancelAtPeriodEnd: boolean; canManage: boolean; syncPending: boolean
}
export type EnterprisePracticeFeedback = {
  status: 'good' | 'almost' | 'retry'
  message: string
  strengths: string[]
  nextStep: string
}

export type VerifyEnterprisePractice = (lessonId: string, answer: string, practiceVersion: string) => Promise<EnterprisePracticeFeedback>
