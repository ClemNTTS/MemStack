import { enterpriseTracks } from '../data/enterprise.ts'
import type { EnterpriseLesson } from '../types/enterpriseContent'
import type { EnterpriseLessonDraftSummary } from '../types/enterprise'

export function resolveEnterpriseTrack(explicit: string | null | undefined, saved: string | null | undefined) {
  return enterpriseTracks.find(track => track.id === explicit)
    ?? enterpriseTracks.find(track => track.id === saved)
}

export function enterpriseResumeCandidate(lessons: EnterpriseLesson[], summaries: EnterpriseLessonDraftSummary[], now = Date.now()) {
  return summaries.flatMap(summary => {
    const lesson = lessons.find(item => item.id === summary.lessonId && item.steps.some(step => step.id === summary.stepId))
    const updated = Date.parse(summary.updatedAt)
    return lesson && Number.isFinite(updated) && updated <= now && Date.parse(summary.expiresAt) > now
      ? [{ lesson, summary }] : []
  }).sort((a, b) => Date.parse(b.summary.updatedAt) - Date.parse(a.summary.updatedAt))[0]
}
