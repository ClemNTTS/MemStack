import { appHref } from '../navigation/browser'
import Memo from './Memo'
import './premiumReminder.css'

export default function PremiumReminder({ reason }: { reason: 'lesson' | 'reviews' | 'challenges' }) {
  const copy = reason === 'lesson' ? { title: 'Ta découverte du jour est faite.', text: 'Reviens demain pour une nouvelle leçon, ou poursuis dès maintenant avec Premium. Tes nouvelles cartes et la relecture restent disponibles.' }
    : reason === 'reviews' ? { title: 'Cinq rappels, une belle avancée.', text: 'Tes cinq cartes dues du jour sont révisées. Retrouve les suivantes demain, ou continue les révisions dues avec Premium.' }
      : { title: 'Prêt à mettre tes idées à l’épreuve ?', text: 'Les 36 défis font partie de Premium. Lis un dossier, trouve tes réponses et découvre une correction expliquée après ta tentative.' }
  return <aside className="premium-reminder" aria-label="Continuer avec Premium"><Memo /><div><p className="lesson-category">Ton prochain petit pas</p><h2>{copy.title}</h2><p>{copy.text}</p><a className="catalog-button" href={appHref(`/premium?reason=${reason}`)}>Découvrir Premium <span aria-hidden="true">↗</span></a></div></aside>
}
