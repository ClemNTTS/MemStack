import { lazy, Suspense } from 'react'
import AccountBar from './components/AccountBar'
import AccessGate from './components/AccessGate'
import AccountDataControls from './components/AccountDataControls'
import { useProgress } from './progress/ProgressProvider'

const LearningWorkspace = lazy(() => import('./components/LearningWorkspace'))

function App() {
  const account = useProgress()
  return account.user && account.online && account.ready
    ? <Suspense fallback={<main className="app-shell"><p role="status">Mémo prépare ton atelier…</p></main>}><LearningWorkspace /></Suspense>
    : <><AccessGate />{account.user && <AccountBar />}{account.user && account.online && account.error && <main className="dashboard"><AccountDataControls /></main>}</>
}

export default App
