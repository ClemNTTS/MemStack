import { appAsset, appHref } from '../navigation/browser'
import { challenges } from '../data/challenges'
import { useState } from 'react'
import { catalogCourses } from '../data/catalog'
import { useChallenges } from '../challenges/ChallengeProvider'
import { PageHeading, themes } from './CatalogShared'
import WorkshopBackground from './WorkshopBackground'
import './challenges.css'

function ChallengesPage() {
  const { attempts, loading, error, retry } = useChallenges()
  const [theme, setTheme] = useState('all')
  const [search, setSearch] = useState('')
  const courseFor = (courseId: string) => catalogCourses.find(course => course.id === courseId)
  const filtered = challenges.filter(challenge => {
    const course = courseFor(challenge.courseId)
    return (theme === 'all' || course?.theme === theme) && `${challenge.title} ${course?.title} ${course?.theme}`.toLocaleLowerCase('fr-FR').includes(search.trim().toLocaleLowerCase('fr-FR'))
  })
  return <main className="dashboard challenges-page">
    <WorkshopBackground stage="rest" beat={0} />
    <div className="challenges-intro">
      <PageHeading eyebrow={`L’atelier pratique · ${themes.length} thèmes`} title="Et si tu devais le résoudre ?" description="Lis les fichiers, pose ton diagnostic et propose une action. Compare ensuite ton raisonnement avec la correction et, si disponible, le retour personnalisé." />
      <img src={appAsset('memo/learning.webp')} alt="" width="160" height="160" />
    </div>
    <p className="dashboard-note">Les défis sont accessibles librement. Tes tentatives sont synchronisées ; ton autoévaluation est un repère personnel, sans note automatique.</p>
    {loading && <p role="status">Chargement de tes tentatives…</p>}
    {error && <div className="inline-error" role="alert"><p>{error}</p><button className="catalog-button secondary" type="button" onClick={retry}>Réessayer</button></div>}
    <div className="catalog-filters"><label>Rechercher un défi<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Docker, React, sécurité…" /></label><label>Thématique<select value={theme} onChange={event => setTheme(event.target.value)}><option value="all">Toutes les thématiques</option>{themes.map(entry => <option key={entry.id} value={entry.title}>{entry.title}</option>)}</select></label></div>
    <p className="results-count" role="status">{filtered.length} défis affichés · {challenges.length} dans le catalogue</p>
    {filtered.length === 0 && <section className="overview-panel"><h2>Aucun défi trouvé.</h2><p>Essaie un autre mot ou change de thématique.</p><button className="catalog-button secondary" onClick={() => { setSearch(''); setTheme('all') }}>Effacer les filtres</button></section>}
    <div className="challenge-grid">
      {filtered.map(challenge => {
        const history = attempts.filter(attempt => attempt.challengeId === challenge.id)
        const latest = history[0]
        return <article className="challenge-tile" key={challenge.id}>
          <div className="path-card-top"><span className="dashboard-chip">{courseFor(challenge.courseId)?.theme}</span><span className="dashboard-note">{challenge.estimatedMinutes} min</span></div>
          <h2><a href={appHref(`/challenges/${challenge.id}`)}>{challenge.title}</a></h2>
          <p>{courseFor(challenge.courseId)?.title} · {challenge.files.length} fichier{challenge.files.length > 1 ? 's' : ''} à lire</p>
          <p className="challenge-status">{loading ? 'Historique en cours de chargement' : history.length ? `${history.length} tentative${history.length > 1 ? 's' : ''} · ${latest.outcome === 'understood' ? 'Dernier repère : compris' : latest.outcome === 'retry' ? 'Dernier repère : à retravailler' : 'Autoévaluation à compléter'}` : 'À explorer'}</p>
          <a className="dashboard-cta" href={appHref(`/challenges/${challenge.id}`)}>{history.length ? 'Reprendre le défi' : 'Essayer ce défi'} →</a>
        </article>
      })}
    </div>
  </main>
}

export default ChallengesPage
