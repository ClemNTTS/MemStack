import { useProgress } from '../progress/ProgressProvider'
import { planCourse } from '../review/coursePlan'
import { createDailyQueue } from '../review/dailyQueue'
import { cards } from '../data/cards'
import { dockerCourse, dockerLessons } from '../data/dockerCourse'
import WorkshopBackground from './WorkshopBackground'

function Dashboard() {
  const { progress, user } = useProgress()
  const plan = planCourse(dockerCourse, dockerLessons, progress)
  const queue = createDailyQueue(cards, plan.pendingCardIds, progress)
  const reviews = queue.filter((item) => item.kind === 'review').length
  const sessionTitle = plan.lesson ? plan.lesson.title : plan.pendingCardIds.length
    ? 'Retrouvons les cartes en cours' : reviews ? 'Un petit rappel avec Mémo' : 'Tout est à jour'
  const badges = [
    { symbol: '✦', title: 'Premier déclic', description: 'Terminer une première leçon.', unlocked: plan.completedCount > 0 },
    { symbol: '↺', title: 'Mémoire en mouvement', description: 'Répondre à une première carte de révision.', unlocked: progress.history.some((event) => event.kind === 'review') },
    { symbol: '◇', title: 'Cap sur Docker', description: 'Terminer les trois leçons Docker.', unlocked: plan.completedCount === dockerCourse.lessonIds.length },
  ]
  return (
    <main className="dashboard">
      <WorkshopBackground stage="rest" beat={0} />
      <header className="dashboard-header">
        <a className="brand" href="/">memstack<span> / l’atelier</span></a>
        <nav aria-label="Navigation principale"><a href="#today">Aujourd’hui</a><a href="#courses">Parcours</a><a href="#badges">Badges</a></nav>
      </header>
      <div className="dashboard-heading"><div><p className="lesson-category">Ton espace de connaissances</p><h1>Une idée de plus.<br /><span>Un peu mieux retenue.</span></h1><p>Avec Mémo, construis tes connaissances une session à la fois.</p></div><img className="memo-learning" src={`${import.meta.env.BASE_URL}memo/learning.png`} alt="Mémo assis, en train d’apprendre avec un livre ouvert" width="300" height="250" /></div>
      <section className="dashboard-session" id="today" aria-labelledby="today-title">
        <div><p className="lesson-category">01 / Aujourd’hui</p><h2 id="today-title">{sessionTitle}</h2>
          <p>{plan.lesson ? `${plan.lesson.estimatedMinutes} min de découverte · ${plan.lesson.cardIds.length} nouvelles cartes` : plan.pendingCardIds.length ? `${plan.pendingCardIds.length} cartes à découvrir` : reviews ? 'Un court retour sur tes connaissances.' : 'Reviens demain pour continuer à apprendre et réviser.'}{reviews > 0 && ` · ${reviews} révision${reviews > 1 ? 's' : ''} disponible${reviews > 1 ? 's' : ''}`}</p>
          {!plan.lesson && plan.nextLesson && <p className="dashboard-note">{plan.learnedToday ? 'Demain' : 'À suivre'} : {plan.nextLesson.title}</p>}
        </div><a className="dashboard-cta" href="/today">{plan.lesson || queue.length ? 'Ouvrir ma session' : 'Voir ma session'} <span aria-hidden="true">↗</span></a>
      </section>
      <section id="courses" aria-labelledby="course-title">
        <div className="section-heading"><div><p className="lesson-category">02 / Tes parcours</p><h2 id="course-title">Les bases de Docker</h2></div><span className="dashboard-chip">DevOps</span></div>
        <div className="course-overview"><span>{plan.completedCount} leçon{plan.completedCount > 1 ? 's' : ''} sur 3 terminée{plan.completedCount > 1 ? 's' : ''}</span><progress aria-label="Progression du parcours Docker" max={3} value={plan.completedCount} /></div>
        <ol className="course-lessons">{dockerCourse.lessonIds.map((id, index) => {
          const lesson = dockerLessons.find((item) => item.id === id)!
          const completed = Object.hasOwn(progress.completedLessons, id)
          const available = plan.lesson?.id === id
          return <li className="course-row" data-completed={completed} key={id}>
            <span className="lesson-number" aria-hidden="true">{completed ? '✓' : `0${index + 1}`}</span>
            <div><h3>{lesson.title}</h3><p>{lesson.estimatedMinutes} min · {completed ? `Terminée le ${new Date(progress.completedLessons[id]).toLocaleDateString('fr-FR')}` : available ? 'À découvrir aujourd’hui' : plan.nextLesson?.id === id && plan.learnedToday ? 'Disponible demain' : 'À venir'}</p></div>
            {completed ? <a href={`/lessons/${id}`}>Relire <span aria-hidden="true">↗</span></a> : available ? <a href="/today">Découvrir <span aria-hidden="true">↗</span></a> : <span className="dashboard-note">À venir</span>}
          </li>
        })}</ol>
      </section>
      <section id="badges" aria-labelledby="badges-title">
        <div className="section-heading"><div><p className="lesson-category">03 / Petites victoires</p><h2 id="badges-title">Tes badges</h2></div><span className="dashboard-note">{badges.filter((badge) => badge.unlocked).length} / {badges.length} obtenus</span></div>
        <div className="badge-grid">{badges.map((badge) => <article className="badge-card" data-unlocked={badge.unlocked} key={badge.title}><span className="badge-symbol" aria-hidden="true">{badge.symbol}</span><h3>{badge.title}</h3><p>{badge.description}</p><span className="badge-status">{badge.unlocked ? 'Obtenu' : 'À débloquer'}</span></article>)}</div>
      </section>
      <footer className="dashboard-footer">Une idée à la fois.<span>{user ? 'Progression liée à ton compte Google.' : 'Progression sauvegardée dans ce navigateur.'}</span></footer>
    </main>
  )
}

export default Dashboard
