import { appHref } from '../navigation/browser'
import { useProgress } from '../progress/ProgressProvider'
import { useLearningPreference } from '../progress/learningPreference'
import { planLearning, getRelearningSuggestions } from '../review/catalogPlan'
import { localDay } from '../review/dailyQueue'
import { catalogCourses, catalogLessons } from '../data/catalog'
import { CourseProgress, learningStats } from './CatalogShared'
import WorkshopBackground from './WorkshopBackground'

function Dashboard() {
  const { progress } = useProgress()
  const { activeCourseId, dailyLessonGoal } = useLearningPreference()
  const course = catalogCourses.find(course => course.id === activeCourseId)!
  const plan = planLearning(course, progress)
  const stats = learningStats(progress)
  const today = localDay(new Date())
  const discoveredToday = Object.values(progress.completedLessons).filter(at => localDay(new Date(at)) === today).length
  const suggestions = getRelearningSuggestions(progress)
  const lastLesson = catalogLessons.filter(lesson => Object.hasOwn(progress.completedLessons, lesson.id))
    .sort((a, b) => progress.completedLessons[b.id].localeCompare(progress.completedLessons[a.id]))[0]
  return <main className="dashboard">
    <WorkshopBackground stage="rest" beat={0} />
    <div className="dashboard-heading learning-hero">
      <div><p className="lesson-category">Ton rendez-vous avec Mémo</p><h1>Une idée de plus.<br /><span>Un peu mieux retenue.</span></h1><p>Un petit pas chaque jour. Tu choisis quand t’arrêter.</p><div className="hero-meta"><a href={appHref('/profile')}>Repère du jour : {discoveredToday} / {dailyLessonGoal} leçon{dailyLessonGoal > 1 ? 's' : ''}</a><span>{discoveredToday >= dailyLessonGoal ? 'Objectif atteint · tu peux continuer' : 'À ton rythme, sans limite'}</span></div></div>
      <img className="memo-learning" src={`${import.meta.env.BASE_URL}memo/learning.webp`} alt="Mémo apprend avec son livre ouvert" width="300" height="250" />
    </div>
    <section className="dashboard-session" aria-labelledby="today-title">
      <div><p className="lesson-category">Prochaine leçon conseillée · {course.theme}</p><h2 id="today-title">{plan.lesson?.title ?? 'Un chemin parcouru.'}</h2><p>{plan.lesson ? `${plan.lesson.estimatedMinutes} min · ${plan.lesson.cardIds.length} nouvelles cartes · ${course.title}` : 'Ton parcours est terminé. Tes cartes continuent de revenir aux bonnes échéances.'}</p>
        {(stats.due > 0 || plan.pendingCardIds.length > 0) && <p className="dashboard-note">Mémo te conseille de consolider tes cartes d’abord. La découverte reste accessible.</p>}
      </div><a className="dashboard-cta" href={appHref(plan.lesson ? '/today?start=lesson' : '/courses')}>{plan.lesson ? 'Découvrir cette leçon' : 'Explorer les parcours'} <span aria-hidden="true">↗</span></a>
    </section>
    <section className="stats-strip" aria-label="Ton apprentissage">
      <div><strong>{stats.completed}</strong><span>{stats.completed === 1 ? 'leçon terminée' : 'leçons terminées'}</span></div><div><strong>{stats.learned}</strong><span>{stats.learned === 1 ? 'carte découverte' : 'cartes découvertes'}</span></div><div><strong>{stats.due}</strong><span>{stats.due === 1 ? 'carte due' : 'cartes dues'}</span></div>
    </section>
    <div className="dashboard-columns">
      <section className="overview-panel" aria-labelledby="consolidate-title"><p className="lesson-category">À consolider · tous les parcours</p><h2 id="consolidate-title">Un peu de temps pour tes cartes ?</h2><p className="muted">{stats.due ? `${stats.due} carte${stats.due > 1 ? 's' : ''} due${stats.due > 1 ? 's' : ''}. Révise par lots de cinq, puis continue si tu le souhaites.` : 'Aucune révision due pour le moment. Les prochaines cartes reviendront à leur échéance.'}</p>{plan.pendingCardIds.length > 0 && <p className="muted">{plan.pendingCardIds.length} carte{plan.pendingCardIds.length > 1 ? 's' : ''} de leçons terminées à découvrir.</p>}<div className="panel-actions">{plan.pendingCardIds.length > 0 && <a className="text-link" href={appHref('/today?start=cards')}>Reprendre mes cartes →</a>}<a className="text-link" href={appHref('/reviews')}>{stats.due ? 'Réviser mes cartes' : 'Voir mes prochaines révisions'} →</a></div></section>
      <section className="overview-panel" aria-labelledby="active-course"><p className="lesson-category">Ton parcours actif</p><h2 id="active-course">{course.title}</h2><p className="muted">{course.theme} · {course.lessonIds.length} petites leçons</p><CourseProgress course={course} progress={progress} /><a className="text-link" href={appHref(`/courses/${course.id}`)}>Voir mon chemin <span aria-hidden="true">→</span></a></section>
    </div>
    {suggestions.length > 0 && <section className="relearning-section" aria-labelledby="relearning-title"><div className="section-heading"><div><p className="lesson-category">Revoir une explication</p><h2 id="relearning-title">Ces idées méritent un petit détour.</h2></div></div><div className="relearning-grid">{suggestions.map(({ lesson, forgottenCardCount }) => <article className="overview-panel" key={lesson.id}><h3>{lesson.title}</h3><p className="muted">{forgottenCardCount} carte{forgottenCardCount > 1 ? 's' : ''} oubliée{forgottenCardCount > 1 ? 's' : ''} lors de révisions sur plusieurs jours. Mémo te propose de retrouver l’explication.</p><a className="text-link" href={appHref(`/lessons/${lesson.id}`)}>Revoir avec Mémo →</a></article>)}</div></section>}
    {lastLesson && <p className="recent-replay muted">Dernière découverte : {lastLesson.title}. <a className="text-link" href={appHref(`/lessons/${lastLesson.id}`)}>Relire →</a></p>}
    <section className="overview-panel retention-note" aria-labelledby="practice-title"><p className="lesson-category">L’atelier pratique · Docker</p><h2 id="practice-title">Et si tu devais le résoudre ?</h2><p>Une application qui ne se met pas à jour, des fichiers disparus, une API inaccessible. Trois défis pour poser ton diagnostic, puis comparer ton raisonnement à une correction expliquée.</p><a className="text-link" href={appHref('/challenges')}>Essayer un défi →</a></section>
    <footer className="dashboard-footer">Une idée à la fois.<a href={appHref('/profile')}>Ma progression et mes badges →</a></footer>
  </main>
}

export default Dashboard
