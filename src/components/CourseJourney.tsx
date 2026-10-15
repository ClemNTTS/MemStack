import { useState } from 'react'
import { ArrowRight, Check, Compass, Flag, Layers, Route, Sparkles } from 'lucide-react'
import { catalogCourses, catalogLessons } from '../data/catalog'
import { appHref } from '../navigation/browser'
import { getJourneyState, journeyGoals } from '../journey/model'
import type { LearningProgress } from '../types/progress'
import { useSubscription } from '../progress/subscription'
import { learningAllowance } from '../review/learningLimits'
import { planLearning } from '../review/catalogPlan'
import { CourseProgress, courseMetadata } from './CatalogShared'
import './courseJourney.css'

type Props = { progress: LearningProgress, activeCourseId: string, saving: boolean, activationError?: string, onActivate: (id: string) => Promise<void> }

export default function CourseJourney({ progress, activeCourseId, saving, activationError, onActivate }: Props) {
  const [goalId, setGoalId] = useState<(typeof journeyGoals)[number]['id']>()
  const journey = getJourneyState({ progress, activeCourseId, goalId })
  const [selectedId, setSelectedId] = useState<string>()
  const selectedStep = journey.steps.find(step => step.courseId === selectedId) ?? journey.steps.find(step => step.courseId === journey.nextCourseId) ?? journey.steps[0]
  const selectedCourse = catalogCourses.find(course => course.id === selectedStep.courseId)!
  const activeCourse = catalogCourses.find(course => course.id === activeCourseId)!
  const nextCourse = catalogCourses.find(course => course.id === journey.nextCourseId) ?? selectedCourse
  const plan = planLearning(activeCourse, progress)
  const premium = useSubscription().status?.premium === true
  const allowance = learningAllowance(progress, premium)
  const pending = plan.pendingCardIds.length
  const now = Date.now()
  const knownCardIds = new Set(catalogLessons.flatMap(lesson => lesson.cardIds))
  const due = Object.entries(progress.cards).filter(([id, card]) => knownCardIds.has(id) && Number.isFinite(Date.parse(card.lastReviewedAt)) && Date.parse(card.lastReviewedAt) <= now && Date.parse(card.dueAt) <= now).length
  const completed = journey.steps.filter(step => step.completed).length
  // Keep prerequisite order even when a theme is visited more than once.
  const pathGroups: { chapter: (typeof journey.chapters)[number], steps: typeof journey.steps }[] = []
  for (const step of journey.steps) {
    const chapter = journey.chapters.find(item => item.courseIds.includes(step.courseId))!
    const previous = pathGroups[pathGroups.length - 1]
    if (previous?.chapter.id === chapter.id) previous.steps.push(step)
    else pathGroups.push({ chapter, steps: [step] })
  }
  function selectStep(id: string) {
    setSelectedId(id)
    requestAnimationFrame(() => {
      const detail = document.getElementById('journey-step-detail')
      detail?.focus({ preventScroll: true })
      if (window.matchMedia('(max-width: 760px)').matches) detail?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    })
  }
  const goalMilestones = {
    interface: ['accessible-ui', 'react-state', 'performance-basics'],
    api: ['node-server', 'rest-design', 'distributed-basics'],
    deployment: ['docker-basics', 'cloud-basics', 'kubernetes-basics'],
  }[journey.goal.id].map(id => catalogCourses.find(course => course.id === id)!)
  const goalOutcome = {
    interface: 'Une interface que tu sais construire, rendre accessible et améliorer.',
    api: 'Une API dont tu comprends les échanges, les données et la fiabilité.',
    deployment: 'Une application que tu sais conteneuriser, déployer et maintenir.',
  }[journey.goal.id]
  function chooseGoal(id: (typeof journeyGoals)[number]['id']) {
    setGoalId(id)
    setSelectedId(undefined)
    requestAnimationFrame(() => {
      const preview = document.getElementById('journey-goal-preview')
      preview?.focus({ preventScroll: true })
      preview?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    })
  }
  function viewGoalMap() {
    const map = document.getElementById('journey-map-title')
    map?.focus({ preventScroll: true })
    map?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  const goalComplete = journey.nextCourseId === null
  const missionIsActive = nextCourse.id === activeCourseId
  const missionLesson = missionIsActive ? plan.lesson : undefined
  const missionHref = goalComplete && !pending && !(due && allowance.reviewsRemaining > 0) ? '/reviews' : pending ? '/today?start=cards' : due && allowance.reviewsRemaining > 0 ? '/reviews' : missionLesson && allowance.lessonsRemaining > 0 ? '/today?start=lesson' : missionLesson ? '/premium' : `/courses/${nextCourse.id}`
  const missionTitle = goalComplete && !pending && !(due && allowance.reviewsRemaining > 0) ? 'Ton cap est atteint. Garde tes idées vivantes.' : pending ? 'Transforme ta découverte en souvenir.' : due && allowance.reviewsRemaining > 0 ? 'Réactive les idées de ton chemin.' : missionLesson ? missionLesson.title : `Prochaine escale : ${nextCourse.title}`
  const missionDescription = goalComplete && !pending && !(due && allowance.reviewsRemaining > 0) ? 'Toutes les leçons de ce cap sont terminées. Tes révisions gardent les connexions solides ; tu peux aussi choisir une nouvelle direction.' : pending ? `${pending} nouvelles cartes t’attendent avant la suite. Elles relient ce que tu viens d’apprendre à ta mémoire.` : due && allowance.reviewsRemaining > 0 ? `${due} cartes sont dues. Un petit rappel aujourd’hui rend la prochaine étape plus facile.` : missionLesson ? `${missionLesson.estimatedMinutes} minutes pour avancer dans « ${activeCourse.title} ».` : 'Explore cette étape puis choisis-la comme parcours actif quand tu te sens prêt.'

  return <div className="course-journey">
    <header className="journey-heading"><div><p className="lesson-category">Ton chemin de données</p><h1>Une idée mène à la suivante.</h1><p>Choisis un cap, suis les connexions. Mémo garde le fil avec toi.</p></div><span className="journey-overall"><Route size={20} aria-hidden="true" /><strong>{completed} / {journey.steps.length}</strong><span>étapes terminées</span></span></header>
    <section className="journey-mission" aria-labelledby="journey-mission-title">
      <div className="journey-memo"><img src={`${import.meta.env.BASE_URL}memo/${goalComplete ? 'journey-celebrate' : 'journey-guide'}.webp`} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = `${import.meta.env.BASE_URL}memo/learning.webp` }} width="200" height="200" alt={goalComplete ? 'Mémo célèbre ton cap terminé' : 'Mémo te montre la prochaine étape du chemin'} /><span>{goalComplete ? 'Un cap accompli !' : 'On avance ensemble ?'}</span></div>
      <div className="journey-mission-copy"><p className="lesson-category"><Sparkles size={15} aria-hidden="true" /> Ta prochaine petite mission</p><h2 id="journey-mission-title">{missionTitle}</h2><p>{missionDescription}</p><div className="journey-mission-actions"><a className="dashboard-cta" href={appHref(missionHref)}>{goalComplete && !pending && !(due && allowance.reviewsRemaining > 0) ? 'Retrouver mes révisions' : pending ? 'Consolider mes cartes' : due && allowance.reviewsRemaining > 0 ? 'Réviser mes cartes' : missionLesson && allowance.lessonsRemaining > 0 ? 'Continuer mon chemin' : missionLesson ? 'Voir mes options Premium' : 'Découvrir cette étape'}<ArrowRight size={18} aria-hidden="true" /></a><a className="text-link" href={appHref(`/courses/${activeCourseId}`)}>Mon parcours actif →</a></div>{missionLesson && allowance.lessonsRemaining === 0 && <p className="dashboard-note">Ta leçon gratuite du jour est terminée. Reviens demain, relis une leçon ou continue avec Premium.</p>}</div>
    </section>
    <section className="journey-directions" aria-labelledby="journey-goal-title"><div className="journey-section-title"><div><p className="lesson-category">Choisis ton cap</p><h2 id="journey-goal-title">Qu’as-tu envie de construire ?</h2></div><p>Change de direction librement.<br />Aucun acquis ne se perd.</p></div><div className="journey-goals">{journeyGoals.map((goal, index) => <button type="button" key={goal.id} aria-pressed={journey.goal.id === goal.id} onClick={() => chooseGoal(goal.id)} aria-controls="journey-goal-preview"><span className="journey-goal-icon" aria-hidden="true">{index === 0 ? <Layers size={22} /> : index === 1 ? <Route size={22} /> : <Flag size={22} />}</span><span><strong>{goal.title}</strong><small>{goal.description}</small></span><span className="journey-goal-check" aria-hidden="true">{journey.goal.id === goal.id ? <Check size={17} /> : <ArrowRight size={17} />}</span></button>)}</div><section id="journey-goal-preview" className="journey-goal-preview" tabIndex={-1} aria-labelledby="journey-goal-preview-title"><div key={journey.goal.id} className="journey-goal-preview-content"><div className="journey-goal-preview-heading"><div><p className="lesson-category">Ton itinéraire se dessine</p><h3 id="journey-goal-preview-title">Cap : {journey.goal.title}</h3></div><span>{completed} / {journey.steps.length} étapes terminées</span></div><p className="journey-goal-outcome">{goalOutcome}</p><ol className="journey-goal-milestones" aria-label="Quelques repères de ce cap">{goalMilestones.map((course, index) => <li key={course.id}><span aria-hidden="true">0{index + 1}</span><a href={appHref('/courses/' + course.id)}>{course.title}</a></li>)}</ol><div className="journey-goal-next"><div><span>{goalComplete ? 'Cap accompli' : 'Prochaine étape conseillée'}</span><strong>{goalComplete ? 'Consolider tes acquis ou choisir un autre cap' : nextCourse.title}</strong><p>{goalComplete ? 'Tes révisions entretiennent les connexions que tu as créées.' : nextCourse.id === activeCourseId ? 'Ton parcours actif fait partie de cet itinéraire. Tu peux continuer sans perdre ton élan.' : ['data-reasoning', 'systems-basics', 'http-basics'].includes(nextCourse.id) ? 'Les fondations sont communes aux trois caps. Elles te préparent aux étapes spécifiques présentées ci-dessus.' : 'Cette connexion te rapproche de ton objectif. Retrouve ses prérequis et ses leçons sur la carte.'}</p></div><button className="catalog-button secondary" type="button" onClick={viewGoalMap}>Voir la carte de ce cap <ArrowRight size={16} aria-hidden="true" /></button></div></div></section><p className="journey-goal-announcement" role="status" aria-live="polite">{journey.goal.title} : {journey.steps.length} étapes, dont {completed} terminées. {goalOutcome}</p><p className="journey-local-note">Ce cap organise ta carte ici. Ton parcours actif reste synchronisé avec ton compte.</p></section>
    <section className="journey-map-section" aria-labelledby="journey-map-title"><div className="journey-section-title"><div><p className="lesson-category">Les idées se connectent</p><h2 id="journey-map-title" tabIndex={-1}>Ton itinéraire, étape par étape.</h2></div><div className="journey-legend"><span><i data-state="completed" />Terminée</span><span><i data-state="current" />Parcours actif</span><span><i />À explorer</span></div></div>
      <div className="journey-map-layout"><div className="journey-map">{pathGroups.map(({ chapter, steps }, chapterIndex) => <section className="journey-chapter" key={`${chapter.id}-${chapterIndex}`} aria-labelledby={`chapter-${chapter.id}-${chapterIndex}`}><header><span className="journey-chapter-number">{String(chapterIndex + 1).padStart(2, '0')}</span><div><h3 id={`chapter-${chapter.id}-${chapterIndex}`}>{chapter.title}{pathGroups.slice(0, chapterIndex).some(group => group.chapter.id === chapter.id) ? ' · suite' : ''}</h3><p>{chapter.description}</p></div><span className="journey-chapter-count" aria-label={`${chapter.completedCourses} sur ${chapter.totalCourses} parcours terminés dans ce chapitre pour ce cap`}>{chapter.completedCourses}/{chapter.totalCourses}<small>chapitre · ce cap</small></span></header><ol className="journey-track">{steps.map((step, index) => { const course = catalogCourses.find(item => item.id === step.courseId)!; return <li key={step.courseId} className="journey-stop" data-side={index % 2 === 0 ? 'left' : 'right'} data-state={step.completed ? 'completed' : step.courseId === activeCourseId ? 'current' : 'upcoming'}><button type="button" className="journey-node" aria-pressed={selectedStep.courseId === step.courseId} aria-controls="journey-step-detail" onClick={() => selectStep(step.courseId)}><span className="journey-orb" aria-hidden="true">{step.completed ? <Check size={23} /> : step.courseId === activeCourseId ? <Compass size={25} /> : <span>{index + 1}</span>}</span><span className="journey-node-copy"><small>{step.completed ? 'Étape terminée' : step.courseId === activeCourseId ? 'Tu es ici' : 'Prochaine connexion'}</small><strong>{course.title}</strong><span>{step.completedLessons}/{step.totalLessons} leçons</span></span></button></li> })}</ol>{!pathGroups.slice(chapterIndex + 1).some(group => group.chapter.id === chapter.id) && <footer className="journey-chapter-badge" data-earned={chapter.badgeEarned}><span aria-hidden="true">{chapter.badgeEarned ? '✦' : '◇'}</span><div><strong>{chapter.badgeTitle}</strong><span>{chapter.badgeEarned ? 'Insigne obtenu · toutes les leçons de ce chapitre sont terminées' : `Insigne de chapitre · terminer ses ${chapter.courseIds.length} parcours, tous caps confondus`}</span></div></footer>}</section>)}</div>
        <aside className="journey-detail" id="journey-step-detail" tabIndex={-1} aria-labelledby="journey-detail-title"><p className="lesson-category">{selectedStep.completed ? 'Une connexion acquise' : selectedCourse.id === activeCourseId ? 'Ton point de départ actuel' : 'Une étape à explorer'}</p><h2 id="journey-detail-title">{selectedCourse.title}</h2><p>{courseMetadata(selectedCourse.id)?.lessons[0].objective}</p><CourseProgress course={selectedCourse} progress={progress} /><div className="journey-detail-stats"><div><strong>{selectedStep.learnedCards}/{selectedStep.totalCards}</strong><span>cartes découvertes</span></div><div><strong>{selectedStep.dueCards}</strong><span>cartes dues</span></div></div><div className="journey-prerequisites"><h3>Les connexions utiles avant</h3>{selectedStep.prerequisiteIds.length ? <ul>{selectedStep.prerequisiteIds.map(id => <li key={id}><span aria-hidden="true">{selectedStep.missingPrerequisiteIds.includes(id) ? '○' : '✓'}</span><a href={appHref(`/courses/${id}`)}>{catalogCourses.find(course => course.id === id)?.title ?? id}</a></li>)}</ul> : <p>Tu peux commencer ici, sans prérequis.</p>}<p className="dashboard-note">Ce sont des repères conseillés : tu restes libre d’explorer.</p></div><div className="journey-detail-actions">{selectedCourse.id !== activeCourseId ? <button className="catalog-button" type="button" disabled={saving} onClick={() => { void onActivate(selectedCourse.id) }}>{saving ? 'Sauvegarde…' : 'Choisir cette étape'}</button> : <span className="active-indicator">● Ton parcours actif</span>}<a className="text-link" href={appHref(`/courses/${selectedCourse.id}`)}>Voir les leçons →</a></div>{activationError && <p className="inline-error" role="alert">{activationError}</p>}<p className="journey-challenge-note">Les leçons dessinent ton chemin. Les cartes entretiennent tes acquis. Les <a href={appHref('/challenges')}>défis Premium</a> les mettent à l’épreuve, sans bloquer la suite.</p>{selectedStep.completed && <img className="journey-celebrate" src={`${import.meta.env.BASE_URL}memo/journey-celebrate.webp`} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = `${import.meta.env.BASE_URL}memo/learning.webp` }} alt="Mémo célèbre ton étape terminée" width="90" height="90" />}</aside>
      </div>
    </section>
  </div>
}
