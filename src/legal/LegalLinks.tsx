import { appHref } from '../navigation/browser'
import './legal.css'

export default function LegalLinks() {
  return <nav className="legal-links" aria-label="Informations légales">
    <a href={appHref('/legal')}>Mentions légales</a>
    <a href={appHref('/privacy')}>Confidentialité</a>
    <a href={appHref('/terms')}>Utilisation et abonnements</a>
    <a href={appHref('/enterprise-data')}>Données des équipes</a>
  </nav>
}
