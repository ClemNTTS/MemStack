import { lazy, Suspense, useEffect, useState } from 'react'
import AccountBar from './components/AccountBar'
import AccessGate from './components/AccessGate'
import AccountDataControls from './components/AccountDataControls'
import { useProgress } from './progress/ProgressProvider'
import { SubscriptionProvider } from './progress/subscription'
import { appHref, currentRoute } from './navigation/browser'
import LandingPage from './components/LandingPage'

const LearningWorkspace = lazy(() => import('./components/LearningWorkspace'))

function AppContent() {
  const account = useProgress()
  const [, setNavigation] = useState(0)
  const route = currentRoute()
  useEffect(() => {
    const update = () => setNavigation(value => value + 1)
    window.addEventListener('hashchange', update)
    window.addEventListener('popstate', update)
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('popstate', update) }
  }, [])
  const path = route.split('?')[0]
  useEffect(() => {
    if (account.user && account.ready && path === '/login') {
      const destination = new URLSearchParams(route.split('?')[1] ?? '').get('next') === 'premium' ? '/premium' : '/'
      window.location.replace(appHref(destination))
    }
    if (!account.user && (path === '/' || path === '/discover')) document.title = 'MemStack · Comprendre la tech et s’en souvenir'
  }, [account.user, account.ready, path, route])
  if (account.authResolved && !account.user && (path === '/' || path === '/discover')) return <LandingPage />
  return account.user && account.online && account.ready
    ? <Suspense fallback={<main className="app-shell"><p role="status">Mémo prépare ton atelier…</p></main>}><LearningWorkspace /></Suspense>
    : <><AccessGate />{account.user && <AccountBar />}{account.user && account.online && account.error && <main className="dashboard"><AccountDataControls /></main>}</>
}

function App() { return <SubscriptionProvider><AppContent /></SubscriptionProvider> }

export default App
