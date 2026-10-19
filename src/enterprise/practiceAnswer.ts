export function guidedPracticeAnswer(lessonId: string, draft: string): string {
  if (lessonId !== 'ent-answer-or-action') return draft
  const [assistant = '', ...personalParts] = draft.split('\n\n')
  const personal = personalParts.join('\n\n')
  if (!assistant.trim() || !personal.trim()) return ''
  return `Ce que Léa peut demander à son assistant IA : ${assistant}\nCe qu’elle doit faire elle-même : ${personal}`
}
