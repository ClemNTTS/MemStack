import { lazy, Suspense, useEffect, useState } from 'react'
import AccountBar from './components/AccountBar'
import AccessGate from './components/AccessGate'
import AccountDataControls from './components/AccountDataControls'
import { useProgress } from './progress/ProgressProvider'
import { SubscriptionProvider } from './progress/subscription'
import { appHref, currentRoute } from './navigation/browser'
import LandingPage from './components/LandingPage'
import EnterpriseOfferPage from './components/EnterpriseOfferPage'
import LegalPage, { legalPaths } from './legal/LegalPage'
import LegalLinks from './legal/LegalLinks'

const LearningWorkspace = lazy(() => import('./components/LearningWorkspace'))
const EnterpriseWorkspace = lazy(() => import('./enterprise/EnterpriseWorkspace'))

function AppContent() {
  const account = useProgress()
  const [, setNavigation] = useState(0)
  const route = currentRoute()
  useEffect(() => {
    const update = () => setNavigation(value => value + 1)
    window.addEventListener('hashchange', update)
    window.addEventListener('popstate', update)
    window.addEventListener('memstack:navigate', update)
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('popstate', update); window.removeEventListener('memstack:navigate', update) }
  }, [])
  const path = route.split('?')[0]
  useEffect(() => {
    if (account.user && account.ready && path === '/login') {
      const destination = new URLSearchParams(route.split('?')[1] ?? '').get('next') === 'premium' ? '/premium' : '/'
      window.location.replace(appHref(destination))
    }
    if (!account.user && (path === '/' || path === '/discover')) document.title = 'MemStack · Développement pour les devs, IA pour les équipes'
    if (!account.user && path === '/business') document.title = 'MemStack Entreprise · Les bons réflexes avec l’IA'
  }, [account.user, account.ready, path, route])
  if (legalPaths.includes(path)) return <LegalPage path={path} />
  if (account.authResolved && !account.user && (path === '/' || path === '/discover')) return <LandingPage />
  if (account.authResolved && !account.user && path === '/business') return <><EnterpriseOfferPage /><LegalLinks /></>
  return account.user && account.online && account.ready
    ? <><Suspense fallback={<main className="app-shell"><p role="status">Mémo prépare ton atelier…</p></main>}>{path === '/enterprise' || path.startsWith('/enterprise/') ? <EnterpriseWorkspace key={account.user.uid} /> : <LearningWorkspace />}</Suspense>{(path === '/profile' || path === '/premium' || path === '/business' || path === '/enterprise/team') && <LegalLinks />}</>
    : <><AccessGate />{account.user && <AccountBar />}{account.user && account.online && account.error && <main className="dashboard"><AccountDataControls /></main>}<LegalLinks /></>
}

function App() { return <SubscriptionProvider><AppContent /></SubscriptionProvider> }

export default App
