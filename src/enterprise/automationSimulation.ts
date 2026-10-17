export type AutomationCase = 'duplicate' | 'incomplete' | 'notification'
export type AutomationAction = 'create' | 'reuse' | 'request' | 'retry' | 'alert'
export type AutomationSimulation = { kind: AutomationCase; cards: number; retries: number; waiting: boolean; done: boolean; message: string }

export function startAutomationSimulation(kind: AutomationCase): AutomationSimulation {
  return { kind, cards: kind === 'incomplete' ? 0 : 1, retries: 0, waiting: false, done: false, message: '' }
}

export function advanceAutomationSimulation(state: AutomationSimulation, action: AutomationAction): AutomationSimulation {
  if (state.done) return state
  if (action === 'create') return { ...state, message: state.kind === 'incomplete' ? 'Choix refusé dans ce laboratoire. L’adresse manque : une fiche serait inutilisable. Garde la demande dans une file à compléter.' : 'Choix refusé dans ce laboratoire. La fiche existe déjà. Recréer tout le traitement produirait un doublon ; recherche la référence et reprends seulement l’étape nécessaire.' }
  if (state.kind === 'duplicate' && action === 'reuse') return { ...state, done: true, message: 'La même référence INT-88 retrouve sa fiche. Son état confirmé est conservé : une demande renvoyée ne remet pas le travail à zéro.' }
  if (state.kind === 'incomplete' && action === 'request') return { ...state, waiting: true, done: true, message: 'INT-89 rejoint la file « à compléter », avec motif adresse manquante et responsable planificateur. Aucune fiche de destination créée. Après complément, le traitement devra reprendre avec la même référence.' }
  if (state.kind === 'notification' && action === 'retry') {
    if (state.retries >= 2) return { ...state, message: 'Les deux nouvelles tentatives sont consommées. Alerte le planificateur ; recommencer la création ne résoudrait pas la notification.' }
    const retries = state.retries + 1
    return { ...state, retries, message: `Reprise ${retries}/2 : la notification échoue encore dans ce scénario. La fiche INT-88 reste unique. ${retries === 2 ? 'Alerte maintenant le planificateur.' : 'Une dernière reprise est possible, au délai convenu avec le référent.'}` }
  }
  if (state.kind === 'notification' && action === 'alert' && state.retries === 2) return { ...state, done: true, message: 'Le planificateur reçoit l’alerte avec INT-88, l’étape notification et les deux reprises échouées. La création réussie n’est pas rejouée.' }
  return { ...state, message: state.kind === 'notification' ? 'La fiche a été retrouvée et sa création vérifiée. Reprends uniquement la notification, au maximum deux nouvelles tentatives après l’échec initial, puis alerte.' : 'Pars de la référence et de ce qui existe déjà : une répétition retrouve sa fiche ; une demande incomplète attend son complément.' }
}
