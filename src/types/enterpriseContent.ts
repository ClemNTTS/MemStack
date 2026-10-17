export type EnterpriseOption = { id: string; text: string; feedback: string }

export type EnterpriseStep =
  | { id: string; type: 'message'; text: string }
  | { id: string; type: 'image'; src: string; alt: string; caption: string }
  | { id: string; type: 'question'; prompt: string; options: EnterpriseOption[]; correctOptionId: string }

export type EnterpriseCard = { id: string; question: string; answer: string }
export type EnterpriseChapter = { id: string; title: string; description: string }
export type EnterpriseLesson = {
  id: string
  chapterId: string
  title: string
  estimatedMinutes: number
  objective: string
  steps: EnterpriseStep[]
  documents?: { stepId: string; title: string; src: string; text: string }[]
  cards: EnterpriseCard[]
  sources: string[]
  continuous?: boolean
  prerequisiteLessonIds?: string[]
}
export type EnterpriseChallenge = {
  id: string
  chapterId: string
  title: string
  prerequisiteLessonIds?: string[]
  scenario: string
  files: { name: string; content: string }[]
  questions: { id: string; prompt: string; options: { id: string; text: string }[] }[]
}
export type EnterpriseCurriculum = {
  version: number
  title: string
  description: string
  chapters: EnterpriseChapter[]
  lessons: EnterpriseLesson[]
  challenges: EnterpriseChallenge[]
  foundationLessonIds?: string[]
  tracks?: EnterpriseTrack[]
}

export type EnterpriseTrack = {
  id: string
  title: string
  description: string
  outcome: string
  audience: string
  lessonIds: string[]
  challengeIds: string[]
}
