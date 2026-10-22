import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseServices } from './client'
import type { EnterpriseWorkspace, EnterpriseLearningAction, EnterpriseLearningResult, EnterpriseManagementAction, EnterpriseBillingStatus } from '../types/enterprise'
import type { EnterprisePracticeFeedback } from '../types/enterprise'
import type { EnterpriseLearningPreferences } from '../types/enterprise'
import type { EnterpriseLessonDraftSnapshot, EnterpriseLessonDraftMutation } from '../types/enterprise'

async function invoke<Input,Output>(uid: string, name: string, data: Input, timeout = 70000): Promise<Output> {
  const { auth } = getFirebaseServices()
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Une connexion vérifiée est requise.')
  const result = await httpsCallable<Input,Output>(getFunctions(auth.app,'europe-west9'),name, { timeout })(data)
  if (auth.currentUser?.uid !== uid) throw new Error('Le compte actif a changé.')
  return result.data
}
export const getEnterpriseWorkspace = (uid: string, organizationId?: string) => invoke<{organizationId?:string},EnterpriseWorkspace>(uid,'getEnterpriseWorkspace',organizationId ? {organizationId} : {})
export const setEnterpriseLearningPreferences = (uid: string, organizationId: string, activeTrackId: string) => invoke<{organizationId:string;activeTrackId:string},{organizationId:string;settings:EnterpriseLearningPreferences}>(uid,'setEnterpriseLearningPreferences',{organizationId,activeTrackId})
export const getEnterpriseLessonDraft = (uid: string, organizationId: string, lessonId: string) => invoke<{organizationId:string;lessonId:string},EnterpriseLessonDraftSnapshot>(uid,'getEnterpriseLessonDraft',{organizationId,lessonId})
export const saveEnterpriseLessonDraft = (uid: string, data: EnterpriseLessonDraftMutation) => invoke<EnterpriseLessonDraftMutation,EnterpriseLessonDraftSnapshot>(uid,'saveEnterpriseLessonDraft',data)
export const joinEnterpriseOrganization = (uid: string, code: string) => invoke<{code:string},{organizationId:string}>(uid,'joinEnterpriseOrganization',{code})
export const manageEnterpriseOrganization = (uid: string, data: EnterpriseManagementAction) => invoke<EnterpriseManagementAction,{organizationId:string;code?:string;revoked?:boolean;enabled?:boolean;alias?:string}>(uid,'manageEnterpriseOrganization',data)
export const commitEnterpriseLearningAction = (uid: string, data: EnterpriseLearningAction) => invoke<EnterpriseLearningAction,EnterpriseLearningResult>(uid,'commitEnterpriseLearningAction',data)
export const assessEnterprisePracticeAnswer = (uid: string, data: { organizationId: string; lessonId: string; answer: string; practiceVersion: string }) => invoke<typeof data,EnterprisePracticeFeedback>(uid,'assessEnterprisePracticeAnswer',data)
export const createEnterpriseOrganization = (uid: string, name: string, requestId: string) => invoke<{name:string;requestId:string},{organizationId:string}>(uid,'createEnterpriseOrganization',{name,requestId})
export const getEnterpriseBilling = (uid: string, organizationId: string) => invoke<{organizationId:string},EnterpriseBillingStatus>(uid,'getEnterpriseBilling',{organizationId})
export const createEnterpriseCheckout = (uid: string, organizationId: string, requestId: string) => invoke<{organizationId:string;requestId:string},{url:string}>(uid,'createEnterpriseCheckout',{organizationId,requestId})
export const createEnterprisePortal = (uid: string, organizationId: string) => invoke<{organizationId:string},{url:string}>(uid,'createEnterprisePortal',{organizationId})
export const retryEnterpriseBillingSync = (uid: string, organizationId: string) => invoke<{organizationId:string},{pending:boolean;blocked?:boolean}>(uid,'retryEnterpriseBillingSync',{organizationId})
