import { AnalysisError } from './analysis.mjs'

export const GRADER_VERSION = 'challenge-checks-v1'
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))

export function validateCheckedSubmission(data, catalog) {
  if (!exactKeys(data, ['attemptId', 'challengeId', 'challengeVersion', 'selections'])
    || typeof data.attemptId !== 'string' || !/^[a-zA-Z0-9-]{1,128}$/.test(data.attemptId)
    || typeof data.challengeId !== 'string' || data.challengeVersion !== 3) {
    throw new AnalysisError('invalid-argument', 'Tentative structurée invalide.')
  }
  const challenge = catalog.find(entry => entry.id === data.challengeId && entry.challengeVersion === 3)
  if (!challenge || !exactKeys(data.selections, challenge.questions.map(question => question.id))) {
    throw new AnalysisError('invalid-argument', 'Réponds à toutes les questions de ce défi.')
  }
  const selections = Object.fromEntries(challenge.questions.map(question => {
    const selected = data.selections[question.id]
    if (typeof selected !== 'string' || !question.options.some(option => option.id === selected)) {
      throw new AnalysisError('invalid-argument', 'Une option inconnue a été envoyée.')
    }
    return [question.id, selected]
  }))
  return { challenge, selections }
}

export function gradeChallengeSelections(challenge, key, selections) {
  if (!key || key.id !== challenge.id || key.challengeVersion !== challenge.challengeVersion
    || key.rubricVersion !== challenge.rubricVersion || key.questions.length !== challenge.questions.length) {
    throw new AnalysisError('failed-precondition', 'Le correcteur de ce défi est indisponible.')
  }
  const criterionResults = challenge.questions.map(question => {
    const answer = key.questions.find(entry => entry.id === question.id)
    if (!answer || !Array.isArray(answer.correctOptionIds) || !answer.correctOptionIds.length
      || answer.correctOptionIds.some(id => !question.options.some(option => option.id === id))) {
      throw new AnalysisError('failed-precondition', 'La correction est invalide.')
    }
    return answer.correctOptionIds.includes(selections[question.id])
  })
  const correctCount = criterionResults.filter(Boolean).length
  return { feedback: challenge.questions.map((question, index) => key.questions.find(entry => entry.id === question.id).explanation ?? (criterionResults[index] ? 'Réponse correcte.' : 'Réponse incorrecte : relis la correction de référence.')), graderVersion: GRADER_VERSION, verdict: correctCount * 100 > criterionResults.length * 70 ? 'validated' : 'retry',
    correctCount, totalCount: criterionResults.length, criterionResults,
    missedCheckpointIndices: [...new Set(challenge.questions.filter((_, index) => !criterionResults[index]).map(question => question.checkpointIndex))] }
}

export async function submitCheckedChallenge({ db, uid, data, questions, answerKeys, dossiers, courses, now, timestamp }) {
  const { challenge, selections } = validateCheckedSubmission(data, questions)
  const result = gradeChallengeSelections(challenge, answerKeys.find(key => key.id === challenge.id), selections)
  const answer = JSON.stringify(selections)
  const ref = db.doc(`users/${uid}/challengeAttempts/${data.attemptId}`)
  return db.runTransaction(async transaction => {
    if ((await transaction.get(db.doc(`_accountLifecycle/${uid}`))).exists) {
      throw new AnalysisError('failed-precondition', 'Ce compte est en cours de suppression.')
    }
    const saved = await transaction.get(ref)
    if (saved.exists) {
      const previous = saved.data()
      if (previous.version !== 3 || previous.challengeId !== challenge.id || previous.challengeVersion !== 3
        || previous.rubricVersion !== challenge.rubricVersion || previous.answer !== answer) {
        throw new AnalysisError('already-exists', 'Cet identifiant appartient à une autre tentative.')
      }
      return previous
    }
    const dossier = dossiers.find(entry => entry.id === challenge.id && entry.version === 2)
    const course = courses.find(entry => entry.id === dossier?.courseId)
    const required = dossier?.lessonIds ?? []
    const themeLessons = [...new Set(courses.filter(entry => entry.theme === course?.theme).flatMap(entry => entry.lessons.map(lesson => lesson.id)))]
    if (!course || !required.length || !required.every(id => course.lessons.some(lesson => lesson.id === id))) {
      throw new AnalysisError('failed-precondition', 'Les prérequis du défi sont indisponibles.')
    }
    const progress = await Promise.all(themeLessons.map(id => transaction.get(db.doc(`users/${uid}/lessons/${id}`))))
    const completed = new Set(themeLessons.filter((_, index) => progress[index].exists && typeof progress[index].data()?.completedAt === 'string'))
    if (completed.size < Math.min(2, themeLessons.length) || required.some(id => !completed.has(id))) {
      throw new AnalysisError('failed-precondition', 'Termine les leçons prérequises de ce défi.')
    }
    const budgetRef = db.doc(`users/${uid}/writeBudgets/attempts`)
    const budget = (await transaction.get(budgetRef)).data()
    const startedAt = budget?.windowStartedAt?.toMillis?.()
    const active = typeof startedAt === 'number' && startedAt > now - 3600000
    if (active && (!Number.isSafeInteger(budget.count) || budget.count < 1)) {
      throw new AnalysisError('failed-precondition', 'Le compteur de tentatives est invalide.')
    }
    const count = active ? budget.count + 1 : 1
    if (count > 20) throw new AnalysisError('resource-exhausted', 'Limite de 20 tentatives par heure atteinte.')
    const attempt = { version: 3, challengeId: challenge.id, challengeVersion: 3, rubricVersion: challenge.rubricVersion,
      selections, answer, outcome: '', result, submittedAt: timestamp }
    transaction.set(budgetRef, { count, windowStartedAt: active ? budget.windowStartedAt : timestamp, documentId: data.attemptId })
    transaction.create(ref, attempt)
    return attempt
  })
}
