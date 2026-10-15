import { learningRewards } from '../progress/gamification'
import { useProgress } from '../progress/ProgressProvider'
import Memo from './Memo'
import './learningRewards.css'

export default function LearningRewards({ hub = false }: { hub?: boolean }) {
  const { progress } = useProgress()
  const rewards = learningRewards(progress)
  return <section className={`overview-panel learning-rewards ${hub?'reward-hub':''}`} aria-labelledby="rewards-title">
    <div className="reward-memo" aria-hidden="true"><Memo /><span>✦</span><span>✧</span></div>
    <div className="reward-copy"><p className="lesson-category">Mémo grandit avec toi</p><h2 id="rewards-title">Niveau {rewards.level} <span>{rewards.xp} XP</span></h2>
      <progress aria-label={`Progression vers le niveau ${rewards.level + 1}`} value={rewards.xp - rewards.levelStart} max={rewards.nextLevelAt - rewards.levelStart} />
      <p className="reward-next-level">Encore {rewards.nextLevelAt - rewards.xp} XP pour le niveau {rewards.level + 1}.</p>
      {!hub && <><p>{rewards.activeToday ? 'Ton petit pas du jour est fait. Mémo est fier de toi !' : 'Une leçon ou une carte : ton prochain petit pas suffit pour continuer ta série.'}</p>
      <details className="reward-explanation"><summary>Comment gagner de l’XP ?</summary><p>20 XP par leçon terminée et 5 XP par carte pratiquée, une fois par jour. Les journées suivent l’heure de Paris.</p></details></>}
    </div>
    <div className="reward-streak" aria-label="Ta régularité"><strong>{rewards.currentStreak}<span>jour{rewards.currentStreak > 1 ? 's' : ''} de suite</span></strong><p>Ta meilleure série<br /><b>{rewards.longestStreak} jour{rewards.longestStreak > 1 ? 's' : ''}</b></p></div>
  </section>
}
