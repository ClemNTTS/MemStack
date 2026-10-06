import { appAsset, appHref } from '../navigation/browser'
import { challenges } from '../data/challenges'
import { useChallenges } from '../challenges/ChallengeProvider'
import { PageHeading } from './CatalogShared'
import WorkshopBackground from './WorkshopBackground'
import './challenges.css'

function ChallengesPage() {
  const { attempts, loading, error, retry } = useChallenges()
  return <main className="dashboard challenges-page">
    <WorkshopBackground stage="rest" beat={0} />
    <div className="challenges-intro">
      <PageHeading eyebrow="L’atelier pratique · Docker" title="Et si tu devais le résoudre ?" description="Trois situations pour mettre tes connaissances à l’épreuve. Pose ton diagnostic, compare ta réponse à la correction, puis choisis ce que tu veux retravailler." />
      <img src={appAsset('memo/learning.png')} alt="" width="160" height="160" />
    </div>
    <p className="dashboard-note">Les défis sont accessibles librement. Tes tentatives sont synchronisées ; ton autoévaluation est un repère personnel, sans note automatique.</p>
    {loading && <p role="status">Chargement de tes tentatives…</p>}
    {error && <div className="inline-error" role="alert"><p>{error}</p><button className="catalog-button secondary" type="button" onClick={retry}>Réessayer</button></div>}
    <div className="challenge-grid">
      {challenges.map((challenge, index) => {
        const history = attempts.filter(attempt => attempt.challengeId === challenge.id)
        const latest = history[0]
        return <article className="challenge-tile" key={challenge.id}>
          <div className="path-card-top"><span className="dashboard-chip">Défi {String(index + 1).padStart(2, '0')}</span><span className="dashboard-note">{challenge.estimatedMinutes} min</span></div>
          <h2><a href={appHref(`/challenges/${challenge.id}`)}>{challenge.title}</a></h2>
          <p>Observe la situation, explique ce qui se passe et propose une solution.</p>
          <p className="challenge-status">{loading ? 'Historique en cours de chargement' : history.length ? `${history.length} tentative${history.length > 1 ? 's' : ''} · ${latest.outcome === 'understood' ? 'Dernier repère : compris' : latest.outcome === 'retry' ? 'Dernier repère : à retravailler' : 'Autoévaluation à compléter'}` : 'À explorer'}</p>
          <a className="dashboard-cta" href={appHref(`/challenges/${challenge.id}`)}>{history.length ? 'Reprendre le défi' : 'Essayer ce défi'} →</a>
        </article>
      })}
    </div>
  </main>
}

export default ChallengesPage
