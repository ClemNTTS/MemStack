import { useState } from 'react'
import { catalogCourses, catalogLessons } from '../data/catalog'
import { useProgress } from '../progress/ProgressProvider'
import { useLearningPreference } from '../progress/learningPreference'
import { planLearning } from '../review/catalogPlan'
import { CourseProgress, PageHeading, courseMetadata, prerequisitesLabel, themes } from './CatalogShared'
import WorkshopBackground from './WorkshopBackground'

function CoursesPage({ courseId }: { courseId?: string }) {
  const { progress } = useProgress()
  const { activeCourseId, setActiveCourseId } = useLearningPreference()
  const [theme, setTheme] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const selected = catalogCourses.find(course => course.id === courseId)
  function activate(id: string) {
    setError(setActiveCourseId(id) ? '' : 'Impossible de mémoriser ce choix. Vérifie le stockage de ton navigateur puis réessaie.')
  }
  if (courseId && !selected) return <main className="dashboard"><PageHeading eyebrow="Parcours introuvable" title="Un autre chemin ?" description="Ce parcours n’existe pas dans le catalogue." /><a className="dashboard-cta" href="/courses">Explorer les parcours</a></main>
  if (selected) {
    const metadata = courseMetadata(selected.id)!
    const plan = planLearning(selected, progress)
    const active = activeCourseId === selected.id
    return <main className="dashboard">
      <WorkshopBackground stage="rest" beat={0} />
      <a className="text-link breadcrumb" href="/courses">← Tous les parcours</a>
      <PageHeading eyebrow={selected.theme} title={selected.title} description="Un chemin court, une notion à la fois. Les révisions t’accompagnent ensuite." />
      <section className="course-intro"><div><span className="dashboard-chip">{selected.lessonIds.length} leçons</span><p className="muted">Prérequis : {prerequisitesLabel(selected.id)}</p><CourseProgress course={selected} progress={progress} /></div><div className="course-activation">{active ? <span className="active-indicator">● Ton parcours actif</span> : <button className="catalog-button" type="button" onClick={() => activate(selected.id)}>Choisir ce parcours</button>}<p className="dashboard-note">Le choix est mémorisé sur cet appareil.<br />Découverte libre, dans l’ordre du parcours.</p></div></section>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <ol className="learning-path" aria-label={`Leçons de ${selected.title}`}>
        {selected.lessonIds.map((id, index) => {
          const lesson = catalogLessons.find(lesson => lesson.id === id)!
          const completed = Object.hasOwn(progress.completedLessons, id)
          const next = plan.nextLesson?.id === id
          const available = active && plan.lesson?.id === id
          const state = completed ? 'Terminée' : available ? 'Prochaine leçon conseillée' : next ? 'Prochaine leçon' : 'À venir'
          return <li className="path-step" key={id} data-completed={completed} data-next={next}>
            <span className="path-node" aria-hidden="true">{completed ? '✓' : String(index + 1).padStart(2, '0')}</span>
            <article className="path-card"><div className="path-card-top"><span className="dashboard-chip">{state}</span><span className="dashboard-note">{lesson.estimatedMinutes} min</span></div><h2>{lesson.title}</h2><p>{metadata.lessons.find(lesson => lesson.id === id)?.objective}</p>{completed ? <a className="text-link" href={`/lessons/${id}`}>Relire la leçon →</a> : available ? <a className="dashboard-cta" href="/today?start=lesson">Découvrir avec Mémo →</a> : null}</article>
          </li>
        })}
      </ol>
    </main>
  }
  const filtered = catalogCourses.filter(course => (theme === 'all' || course.theme === theme) && `${course.title} ${course.theme}`.toLocaleLowerCase('fr-FR').includes(search.toLocaleLowerCase('fr-FR')))
  return <main className="dashboard">
    <WorkshopBackground stage="rest" beat={0} />
    <PageHeading eyebrow={`${themes.length} thèmes · ${catalogCourses.length} parcours`} title="Trace ton prochain chemin." description="Choisis ce que tu veux comprendre. Mémo t’accompagne au rythme qui te convient." />
    <div className="catalog-filters"><label>Rechercher un parcours<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Docker, React, sécurité…" /></label><label>Thème<select value={theme} onChange={event => setTheme(event.target.value)}><option value="all">Tous les thèmes</option>{themes.map(theme => <option key={theme.id} value={theme.title}>{theme.title}</option>)}</select></label></div>
    <p className="results-count" role="status">{filtered.length} parcours · {catalogLessons.length} leçons dans le catalogue</p>
    {filtered.length === 0 && <section className="overview-panel"><h2>Aucun chemin trouvé.</h2><p>Essaie un autre mot ou change de thème.</p><button className="catalog-button secondary" onClick={() => { setSearch(''); setTheme('all') }}>Effacer les filtres</button></section>}
    <div className="catalog-grid">{filtered.map(course => <article className="catalog-course" data-active={course.id === activeCourseId} key={course.id}><div className="path-card-top"><span className="dashboard-chip">{course.theme}</span>{course.id === activeCourseId && <span className="active-indicator">● Actif</span>}</div><h2><a href={`/courses/${course.id}`}>{course.title}</a></h2><p>Pour commencer : {courseMetadata(course.id)?.lessons[0].objective}</p><CourseProgress course={course} progress={progress} /><a className="text-link" href={`/courses/${course.id}`}>Voir le parcours →</a></article>)}</div>
  </main>
}

export default CoursesPage
