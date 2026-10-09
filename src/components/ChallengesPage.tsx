import { appAsset, appHref } from '../navigation/browser'
import { challenges } from '../data/challenges'
import { useState } from 'react'
import { catalogCourses } from '../data/catalog'
import { useChallenges } from '../challenges/ChallengeProvider'
import { getChallengeThemeProgress } from '../challenges/themeAccess'
import { getChallengeExamSummary } from '../challenges/examSummary'
import { getThemeSummary } from '../challenges/themeSummary'
import { challengeAiEnabled } from '../firebase/challengeAnalyses'
import { useProgress } from '../progress/ProgressProvider'
import { PageHeading, themes } from './CatalogShared'
import WorkshopBackground from './WorkshopBackground'
import './challenges.css'
import './themeSummary.css'
import AiAccessPanel from './AiAccessPanel'
import { matchesExamStatus } from '../challenges/statusFilter'

const statusLabels = {
  validated: 'Validé',
  retry: 'À retravailler',
  unattempted: 'Jamais tenté',
  pending: 'Analyse en attente',
  unavailable: 'Analyse indisponible',
  historical: 'Historique sans verdict actuel',
}

function ChallengesPage() {
  const { attempts, loading, error, retry, analyses, analysesLoading, analysesReady, analysesError, refreshAnalyses } = useChallenges()
  const { progress } = useProgress()
  const [theme, setTheme] = useState('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const courseFor = (courseId: string) => catalogCourses.find(course => course.id === courseId)
  const resultsReady = !loading && !error && analysesReady
  const exams = challenges.map(challenge => ({
    challenge,
    theme: courseFor(challenge.courseId)?.theme,
    access: getChallengeThemeProgress(challenge, catalogCourses, progress.completedLessons),
    summary: resultsReady ? getChallengeExamSummary(challenge, attempts, analyses) : null,
  }))
  const scoped = exams.filter(exam => theme === 'all' || exam.theme === theme)
  const filtered = scoped.filter(({ challenge, theme: challengeTheme, summary }) => matchesExamStatus(statusFilter, summary?.status, resultsReady) && `${challenge.title} ${courseFor(challenge.courseId)?.title} ${challengeTheme}`.toLocaleLowerCase('fr-FR').includes(search.trim().toLocaleLowerCase('fr-FR')))
  const next = resultsReady ? scoped.find(exam => exam.access.unlocked && exam.summary?.status === 'retry')
    ?? scoped.find(exam => exam.access.unlocked && exam.summary?.status === 'unattempted') : undefined
  const count = (entries: typeof exams, status: keyof typeof statusLabels) => entries.filter(exam => exam.summary?.status === status).length

  return <main className="dashboard challenges-page">
    <WorkshopBackground stage="rest" beat={0} />
    <div className="challenges-intro">
      <PageHeading eyebrow={`L’atelier pratique · ${themes.length} thèmes`} title="Et si tu devais le résoudre ?" description="Lis les fichiers, pose ton diagnostic et propose une action. Retrouve ici les verdicts IA de tes examens et choisis ton prochain défi." />
      <img src={appAsset('memo/learning.webp')} alt="" width="160" height="160" />
    </div>
    <p className="dashboard-note">Les défis sont réservés aux membres ayant accès à l’option IA et se débloquent après toutes les leçons de leur thématique. Tes tentatives sont synchronisées ; seule l’analyse IA évalue tes réponses.</p>
    <AiAccessPanel />
    {loading && <p role="status">Chargement de tes tentatives…</p>}
    {error && <div className="inline-error" role="alert"><p>{error}</p><button className="catalog-button secondary" type="button" onClick={retry}>Réessayer</button></div>}
    {!loading && !error && analysesLoading && <p role="status">Chargement des résultats d’examen…</p>}
    {analysesError && <div className="inline-error" role="alert"><p>{analysesError}</p><button className="catalog-button secondary" type="button" onClick={refreshAnalyses}>Recharger les résultats</button></div>}
    {resultsReady && <section className="exam-overview" aria-labelledby="exam-overview-title">
      <h2 id="exam-overview-title">Ton bilan des examens</h2>
      <button className="catalog-button secondary" type="button" onClick={refreshAnalyses}>Actualiser le bilan</button>
      <p className="dashboard-note">Tout le catalogue · un défi compte une seule fois. Une validation IA sur la version actuelle reste acquise.</p>
      <dl className="exam-counts">
        {(['validated', 'retry', 'unattempted'] as const).map(status => <div key={status}><dt>{statusLabels[status]}</dt><dd>{count(exams, status)} <span>/ {exams.length}</span></dd></div>)}
      </dl>
      <p className="exam-other-statuses">{count(exams, 'pending')} en attente · {count(exams, 'unavailable')} analyses indisponibles · {count(exams, 'historical')} historiques sans verdict actuel</p>
      <p className="dashboard-note">Ces trois états ne constituent ni une réussite ni un échec. Un historique sans verdict actuel demande une nouvelle tentative pour obtenir une validation de la version actuelle. Les défis verrouillés sont inclus dans le bilan.</p>
      <details className="exam-theme-details">
        <summary>Voir la synthèse par thématique</summary>
        <div className="exam-theme-grid">{themes.map(entry => {
          const entries = exams.filter(exam => exam.theme === entry.title)
          const synthesis = getThemeSummary(entry.title, catalogCourses, challenges, progress.completedLessons, attempts, analyses)
          return <section className="exam-theme" key={entry.id} aria-label={`Bilan ${entry.title}`}>
            <h3>{entry.title}</h3>
            <dl className="theme-learning-counts">
              <div><dt>Leçons terminées</dt><dd>{synthesis.lessonsCompleted} / {synthesis.lessonsTotal}</dd></div>
              <div><dt>Examens validés par l’IA</dt><dd>{synthesis.examsValidated} / {synthesis.examsTotal}</dd></div>
              <div><dt>Points à consolider</dt><dd>{synthesis.notions.length}</dd></div>
            </dl>
            <p className="dashboard-note">Les leçons terminées indiquent ta progression de lecture. Les examens et points à consolider reposent sur les analyses IA actuelles.</p>
            {synthesis.notions.length > 0 ? <ul className="theme-consolidation">{synthesis.notions.map(notion => <li key={`${notion.challengeId}:${notion.checkpointIndex}`}><a href={appHref(`/challenges/${notion.challengeId}`)}>{notion.label}</a></li>)}</ul> : <p className="dashboard-note">Aucun point précis identifié dans les résultats actuels. Cela ne prouve pas la maîtrise de la thématique.</p>}
            {synthesis.retriesWithoutNotions > 0 && <p className="dashboard-note">{synthesis.retriesWithoutNotions} défi{synthesis.retriesWithoutNotions > 1 ? 's' : ''} à retravailler sans détail structuré des points manqués. Consulte leur retour IA.</p>}
            <p>{count(entries, 'validated')} validés · {count(entries, 'retry')} à retravailler · {count(entries, 'unattempted')} jamais tentés</p>
            <p className="dashboard-note">{count(entries, 'pending')} en attente · {count(entries, 'unavailable')} indisponibles · {count(entries, 'historical')} historiques</p>
            <button className="catalog-button secondary" type="button" onClick={() => { setTheme(entry.title); setSearch('') }}>Afficher les défis {entry.title} →</button>
          </section>
        })}</div>
      </details>
    </section>}
    <div className="catalog-filters"><label>Rechercher un défi<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Docker, React, sécurité…" /></label><label>Thématique<select value={theme} onChange={event => setTheme(event.target.value)}><option value="all">Toutes les thématiques</option>{themes.map(entry => <option key={entry.id} value={entry.title}>{entry.title}</option>)}</select></label></div>
    {resultsReady && !challengeAiEnabled && <section className="exam-next" aria-labelledby="exam-consultation-title">
      <h2 id="exam-consultation-title">Consulter tes défis</h2>
      <p>L’analyse IA est indisponible sur cette version. Les nouvelles tentatives sont suspendues ; ton historique reste consultable.</p>
    </section>}
    {resultsReady && challengeAiEnabled && <section className="exam-next" aria-labelledby="exam-next-title">
      <h2 id="exam-next-title">Ta prochaine tentative</h2>
      {theme !== 'all' && <p>{theme} : {count(scoped, 'validated')} validés · {count(scoped, 'retry')} à retravailler · {count(scoped, 'unattempted')} jamais tentés.</p>}
      <p className="dashboard-note">{theme === 'all' ? 'Toutes les thématiques' : theme} · priorité aux défis à retravailler, puis jamais tentés, parmi les thématiques débloquées. La recherche ne change pas cette suggestion.</p>
      {next ? <><p><strong>{next.challenge.title}</strong> · {statusLabels[next.summary!.status]}</p><a className="dashboard-cta" href={appHref(`/challenges/${next.challenge.id}`)}>{next.summary?.status === 'retry' ? 'Retravailler ce défi' : 'Essayer ce défi'} →</a></> : <p>Aucun défi à retravailler ou jamais tenté disponible dans cette sélection. Consulte les résultats ci-dessous ou termine les leçons d’une thématique.</p>}
    </section>}
    <label>État d’examen<select value={statusFilter} disabled={!resultsReady} onChange={event => setStatusFilter(event.target.value)}><option value="all">Tous les états</option>{Object.entries(statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></label>
    <p className="dashboard-note">Le filtre d’état ne change pas la prochaine tentative proposée.</p>
    <p className="results-count" role="status">{filtered.length} défis affichés · {challenges.length} dans le catalogue</p>
    {filtered.length === 0 && resultsReady && <section className="overview-panel"><h2>Aucun défi trouvé.</h2><p>Essaie un autre mot ou change de thématique ou d’état.</p><button className="catalog-button secondary" onClick={() => { setSearch(''); setTheme('all'); setStatusFilter('all') }}>Effacer les filtres</button></section>}
    <div className="challenge-grid">
      {filtered.map(({ challenge, access, summary }) => {
        const history = attempts.filter(attempt => attempt.challengeId === challenge.id)
        return <article className="challenge-tile" key={challenge.id}>
          <div className="path-card-top"><span className="dashboard-chip">{courseFor(challenge.courseId)?.theme}</span><span className="dashboard-note">{challenge.estimatedMinutes} min</span></div>
          <h2>{access.unlocked ? <a href={appHref(`/challenges/${challenge.id}`)}>{challenge.title}</a> : challenge.title}</h2>
          <p>{courseFor(challenge.courseId)?.title} · {challenge.files.length} fichier{challenge.files.length > 1 ? 's' : ''} à lire</p>
          <p className="challenge-status">{summary ? statusLabels[summary.status] : error || analysesError ? 'Résultat non disponible : recharge les données.' : 'Résultat en cours de chargement'}</p>
          {!loading && !error && history.length > 0 && <p className="dashboard-note">{history.length} tentative{history.length > 1 ? 's' : ''}</p>}
          {access.unlocked ? <a className="dashboard-cta" href={appHref(`/challenges/${challenge.id}`)}>{challengeAiEnabled && summary?.status === 'retry' ? 'Retravailler ce défi' : history.length ? 'Voir le défi et son historique' : 'Voir ce défi'} →</a> : <><p className="dashboard-note">Termine la thématique pour débloquer ce défi · {access.completed} / {access.total} leçons terminées.</p><a className="text-link" href={appHref('/courses')}>Voir les parcours →</a></>}
        </article>
      })}
    </div>
  </main>
}

export default ChallengesPage
