import { appHref } from '../navigation/browser'
import { useState } from 'react'
import { useProgress } from '../progress/ProgressProvider'
import { useLearningPreference } from '../progress/learningPreference'
import { badgesFor, learningStats } from './CatalogShared'
import WorkshopBackground from './WorkshopBackground'
import InstallApp from './InstallApp'
import AccountDataControls from './AccountDataControls'
import LearningRewards from './LearningRewards'
import SubscriptionPanel from './SubscriptionPanel'
import './profile.css'
import AccountSecurityPanel from './AccountSecurityPanel'

function ProfilePage() {
  const { progress, user } = useProgress()
  const { dailyLessonGoal, setDailyLessonGoal, saving, error } = useLearningPreference()
  const [goalMessage, setGoalMessage] = useState('')
  async function changeGoal(goal: number) {
    setGoalMessage('')
    if (await setDailyLessonGoal(goal)) setGoalMessage('Objectif synchronisé avec ton compte.')
  }
  const stats = learningStats(progress)
  const badges = badgesFor(progress)
  const name = user?.displayName?.split(' ')[0] || 'Ton espace'
  const initials = (user?.displayName || 'M').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('')
  return <main className="dashboard profile-page">
    <WorkshopBackground stage="rest" beat={0} />
    <header className="profile-heading">
      <div className="profile-avatar" aria-hidden="true">{initials}</div>
      <div><p className="lesson-category">Mon compte</p><h1>{name}, à ton rythme.</h1><p>Ta progression, tes petites victoires et tes préférences, au même endroit.</p></div>
      <a className="catalog-button secondary" href={appHref('/today')}>Continuer à apprendre →</a>
    </header>
    <LearningRewards />
    <section className="profile-stat-grid" aria-label="Ta progression">
      <div><strong>{stats.completed}</strong><span>{stats.completed === 1 ? 'leçon terminée' : 'leçons terminées'}</span></div>
      <div><strong>{stats.learned}</strong><span>{stats.learned === 1 ? 'carte découverte' : 'cartes découvertes'}</span></div>
      <div><strong>{stats.due}</strong><span>{stats.due === 1 ? 'carte à réviser' : 'cartes à réviser'}</span><a href={appHref('/reviews')}>Retrouver mes cartes →</a></div>
    </section>
    <SubscriptionPanel />
    <AccountSecurityPanel />
    <section className="profile-badges" aria-labelledby="profile-badges-title">
      <div className="section-heading"><div><p className="lesson-category">La collection de tes efforts</p><h2 id="profile-badges-title">Tes petites victoires</h2></div><span className="profile-badge-count">{badges.filter(badge => badge.unlocked).length} / {badges.length} obtenus</span></div>
      <div className="badge-grid">{badges.map(badge => <article className="badge-card" data-unlocked={badge.unlocked} key={badge.title}><span className="badge-symbol" aria-hidden="true">{badge.symbol}</span><h3>{badge.title}</h3><p>{badge.description}</p><span className="badge-status">{badge.unlocked ? '✦ Obtenu' : 'À débloquer'}</span></article>)}</div>
    </section>
    <div className="profile-settings-grid">
      <section className="overview-panel rhythm-settings" aria-labelledby="rhythm-title"><p className="lesson-category">Tes préférences</p><h2 id="rhythm-title">Un rendez-vous avec toi.</h2><p>Choisis un objectif qui te motive. C’est un repère personnel : les limites de ton offre restent les mêmes.</p><label>Objectif de nouvelles leçons par jour<select value={dailyLessonGoal} disabled={saving} onChange={event => { void changeGoal(Number(event.target.value)) }} aria-describedby="goal-note">{Array.from({ length: 10 }, (_, index) => index + 1).map(goal => <option key={goal} value={goal}>{goal} leçon{goal > 1 ? 's' : ''}</option>)}</select></label><p id="goal-note" className="dashboard-note">Retrouve cet objectif sur tous tes appareils. Les échéances des cartes suivent ta mémorisation.</p>{saving && <p role="status">Sauvegarde de ton objectif…</p>}{goalMessage && <p role="status">{goalMessage}</p>}{error && <p className="inline-error" role="alert">{error}</p>}</section>
      <section className="overview-panel profile-reports"><p className="lesson-category">On apprend aussi de tes retours</p><h2>Mes signalements</h2><p>Une explication à améliorer ou une erreur repérée ? Retrouve tes retours et leur suivi.</p><a className="catalog-button secondary" href={appHref('/reports')}>Voir mes signalements →</a></section>
    </div>
    <InstallApp />
    <details className="profile-data-details"><summary>Mes données et la gestion du compte<span>Exporter ma progression ou supprimer mon compte</span></summary><AccountDataControls /></details>
  </main>
}

export default ProfilePage
