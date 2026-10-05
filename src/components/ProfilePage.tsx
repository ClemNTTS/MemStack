import { appHref } from '../navigation/browser'
import { useState } from 'react'
import { useProgress } from '../progress/ProgressProvider'
import { useLearningPreference } from '../progress/learningPreference'
import { badgesFor, learningStats, PageHeading } from './CatalogShared'
import WorkshopBackground from './WorkshopBackground'

function ProfilePage() {
  const { progress } = useProgress()
  const { dailyLessonGoal, setDailyLessonGoal } = useLearningPreference()
  const [goalMessage, setGoalMessage] = useState('')
  const stats = learningStats(progress)
  const badges = badgesFor(progress)
  return <main className="dashboard profile-page"><WorkshopBackground stage="rest" beat={0} /><PageHeading eyebrow="Ton apprentissage" title="Chaque petit pas compte." description="Ces repères reconnaissent ta régularité et tes découvertes. Terminer une leçon ne garantit pas encore de la retenir." />
    <section className="stats-strip" aria-label="Ta progression"><div><strong>{stats.completed}</strong><span>{stats.completed === 1 ? 'leçon terminée' : 'leçons terminées'}</span></div><div><strong>{stats.learned}</strong><span>{stats.learned === 1 ? 'carte découverte' : 'cartes découvertes'}</span></div><div><strong>{stats.due}</strong><span>{stats.due === 1 ? 'carte due' : 'cartes dues'}</span></div></section>
    <section className="overview-panel rhythm-settings" aria-labelledby="rhythm-title"><h2 id="rhythm-title">Ton rendez-vous, ton rythme.</h2><p>Un objectif quotidien pour te donner un repère, sans bloquer la découverte ni les révisions. Tu peux aussi consacrer ta session uniquement aux cartes.</p><label>Objectif de nouvelles leçons par jour<select value={dailyLessonGoal} onChange={event => setGoalMessage(setDailyLessonGoal(Number(event.target.value)) ? 'Objectif enregistré sur cet appareil.' : 'Impossible de sauvegarder cet objectif. Réessaie après avoir vérifié le stockage du navigateur.')} aria-describedby="goal-note">{Array.from({ length: 10 }, (_, index) => index + 1).map(goal => <option key={goal} value={goal}>{goal} leçon{goal > 1 ? 's' : ''}</option>)}</select></label><p id="goal-note" className="dashboard-note">Préférence propre à ce compte et à cet appareil. Ce repère ne change pas les échéances de tes cartes.</p>{goalMessage && <p role="status">{goalMessage}</p>}</section>
    <section><div className="section-heading"><h2>Tes petites victoires</h2><span className="dashboard-note">{badges.filter(badge => badge.unlocked).length} / {badges.length} badges obtenus</span></div><div className="badge-grid">{badges.map(badge => <article className="badge-card" data-unlocked={badge.unlocked} key={badge.title}><span className="badge-symbol" aria-hidden="true">{badge.symbol}</span><h3>{badge.title}</h3><p>{badge.description}</p><span className="badge-status">{badge.unlocked ? 'Obtenu' : 'À débloquer'}</span></article>)}</div></section>
    <section className="overview-panel retention-note"><h2>Découvrir, puis retrouver.</h2><p>Les cartes découvertes ont reçu une première réponse. Pour travailler la mémorisation, réponds avant de révéler la carte, puis indique si tu l’avais retrouvée. Les échéances s’espacent avec tes rappels.</p><a className="text-link" href={appHref('/reviews')}>Voir mes révisions →</a></section>
  </main>
}

export default ProfilePage
