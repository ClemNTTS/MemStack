import { useState } from 'react'
import { catalogCourses, catalogLessons } from '../data/catalog'
import { useProgress } from '../progress/ProgressProvider'
import { PageHeading, themes } from './CatalogShared'
import WorkshopBackground from './WorkshopBackground'

function LibraryPage() {
  const { progress } = useProgress()
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState('all')
  const completed = catalogLessons.filter(lesson => Object.hasOwn(progress.completedLessons, lesson.id))
    .sort((a, b) => progress.completedLessons[b.id].localeCompare(progress.completedLessons[a.id]))
  const entries = completed.map(lesson => ({ lesson, course: catalogCourses.find(course => course.lessonIds.includes(lesson.id))! }))
  const filtered = entries.filter(({ lesson, course }) => (theme === 'all' || course.theme === theme) && `${lesson.title} ${course.title} ${course.theme}`.toLocaleLowerCase('fr-FR').includes(search.toLocaleLowerCase('fr-FR')))
  return <main className="dashboard"><WorkshopBackground stage="rest" beat={0} /><PageHeading eyebrow="Ta bibliothèque" title="Les idées restent à portée." description="Retrouve tes leçons terminées. La relecture ne modifie ni ta progression ni tes échéances." />
    <div className="catalog-filters"><label>Rechercher une leçon<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Une notion, un titre…" /></label><label>Thème<select value={theme} onChange={event => setTheme(event.target.value)}><option value="all">Tous les thèmes</option>{themes.map(theme => <option key={theme.id} value={theme.title}>{theme.title}</option>)}</select></label></div>
    <p className="results-count" role="status">{filtered.length} leçon{filtered.length > 1 ? 's' : ''} retrouvée{filtered.length > 1 ? 's' : ''}</p>
    {filtered.length === 0 ? <section className="overview-panel library-empty"><img src={`${import.meta.env.BASE_URL}memo/learning.png`} alt="" width="160" /><h2>{completed.length ? 'Cette idée se cache ailleurs.' : 'Ta première idée t’attend.'}</h2><p>{completed.length ? 'Essaie une autre recherche ou un autre thème.' : 'Termine une leçon et retrouve-la ici, prête à être relue.'}</p>{completed.length ? <button className="catalog-button secondary" onClick={() => { setSearch(''); setTheme('all') }}>Effacer les filtres</button> : <a className="dashboard-cta" href="/today">Commencer ma session →</a>}</section> : <div className="library-list">{filtered.map(({ lesson, course }) => <article className="library-entry" key={lesson.id}><div><p className="lesson-category">{course.theme} · {course.title}</p><h2>{lesson.title}</h2><p className="muted">{lesson.estimatedMinutes} min · Terminée le {new Date(progress.completedLessons[lesson.id]).toLocaleDateString('fr-FR')}</p></div><a className="dashboard-cta secondary" href={`/lessons/${lesson.id}`}>Relire →</a></article>)}</div>}
  </main>
}

export default LibraryPage
