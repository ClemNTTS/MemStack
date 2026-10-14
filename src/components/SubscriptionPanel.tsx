import { appHref } from '../navigation/browser'
import { useSubscription } from '../progress/subscription'
import '../premium.css'

export default function SubscriptionPanel() {
  const { status, loading, error, busy, refresh, openPortal } = useSubscription()
  return <section className="overview-panel subscription-summary" aria-labelledby="subscription-title">
    <div><p className="lesson-category">Ton abonnement</p><h2 id="subscription-title">{status?.premium ? 'Tu as toute la place pour apprendre.' : 'Un peu chaque jour. Plus, si tu en as envie.'}</h2>
      <p>{status?.premium ? 'MemStack Premium · défis, leçons et révisions dues sans plafond quotidien.' : 'Ton compte gratuit inclut une nouvelle leçon et cinq cartes dues chaque jour.'}</p>
      {status?.premiumPermanent && <p className="dashboard-note">Accès Premium permanent · aucun paiement ni renouvellement.</p>}
      {status?.premium && status.premiumUntil && <p className="dashboard-note">{status.cancelAtPeriodEnd ? 'Premium disponible jusqu’au' : 'Période en cours jusqu’au'} {new Date(status.premiumUntil).toLocaleDateString('fr-FR')}.{status.cancelAtPeriodEnd ? ' Le renouvellement est annulé.' : ''}</p>}
    </div><div className="subscription-summary-actions"><span className="premium-label">{status?.premium ? '✦ Premium' : 'Découverte'}</span><a className="catalog-button secondary" href={appHref('/premium')}>{status?.premium ? 'Voir mes avantages' : 'Découvrir Premium →'}</a>
      {(status?.premium || status?.canManageSubscription) && !status?.premiumPermanent && <button className="catalog-button" disabled={busy || !status?.enabled} onClick={() => { void openPortal() }}>Gérer mon abonnement</button>}
      <button className="premium-text-button" disabled={busy || loading} onClick={refresh}>Vérifier mon abonnement</button>
      {loading && <p role="status">Vérification de l’abonnement…</p>}{busy && <p role="status">Ouverture de Stripe…</p>}{error && <><p className="inline-error" role="alert">{error}</p><button className="premium-text-button" disabled={busy || loading} onClick={refresh}>Réessayer</button></>}
    </div></section>
}
