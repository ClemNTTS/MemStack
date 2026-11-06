export type FictionalConversationMessage = {
  id: string
  speaker: 'Léa' | 'Assistant IA'
  text: string
  document?: { title: string; text: string }
}

const steps = [
  'ent-answer-or-action-message-1',
  'ent-answer-or-action-message-2',
  'ent-answer-or-action-message-3',
  'ent-answer-or-action-message-4',
  'ent-answer-or-action-practice-1',
  'ent-answer-or-action-question-1',
  'ent-answer-or-action-question-2',
]

// This is authored teaching content, not a generated answer or a connected mailbox.
export function firstLessonConversation(stepId: string, checkedIds: readonly string[]) {
  const position = steps.indexOf(stepId)
  const answered = (index: number) => position >= index && checkedIds.includes(steps[index])
  let stage = position >= 1 ? 1 : 0
  if (answered(1)) stage = 2
  if (answered(1) && answered(2)) stage = 3
  if (answered(1) && answered(2) && answered(3)) stage = 4
  const messages: FictionalConversationMessage[] = []
  if (stage >= 1) messages.push({
    id: 'prompt', speaker: 'Léa',
    text: 'Prépare un mail pour inviter l’équipe à une réunion jeudi à 10 h.',
  })
  if (stage >= 2) messages.push({
    id: 'first-draft', speaker: 'Assistant IA',
    text: 'Voici un brouillon :\n\nObjet : Réunion d’équipe jeudi à 10 h\n\nBonjour à toutes et à tous,\nJe vous propose de nous retrouver jeudi à 10 h pour notre réunion d’équipe.\nÀ jeudi !\nLéa',
  })
  if (stage >= 3) messages.push({
    id: 'document', speaker: 'Léa',
    text: 'Voici le document de la réunion. Retrouve la salle et ajoute-la au brouillon.',
    document: { title: 'Document de la réunion', text: 'Réunion d’équipe · jeudi à 10 h\nLieu : salle Bleue' },
  }, {
    id: 'revised-draft', speaker: 'Assistant IA',
    text: 'Le document indique « salle Bleue ». Voici le brouillon complété :\n\nObjet : Réunion d’équipe jeudi à 10 h\n\nBonjour à toutes et à tous,\nRetrouvons-nous jeudi à 10 h, en salle Bleue, pour notre réunion d’équipe.\nÀ jeudi !\nLéa',
  })
  return {
    stage,
    messages,
    label: stage >= 3 ? 'Brouillon complété' : stage >= 2 ? 'Brouillon prêt' : stage === 1 ? 'Le prompt de Léa' : 'La conversation de Léa',
    handoff: stage >= 4,
  }
}
