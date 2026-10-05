import TodaySession from './components/TodaySession'
import Dashboard from './components/Dashboard'
import LessonReplay from './components/LessonReplay'
import AccountBar from './components/AccountBar'
import { useProgress } from './progress/ProgressProvider'
import { cards } from './data/cards'
import { dockerCourse, dockerLessons } from './data/dockerCourse'

function App() {
  const account = useProgress()
  return <><AccountBar />{account.ready ? <Pages key={`${account.user?.uid ?? 'guest'}-${account.revision}`} /> : <main className="app-shell"><h1>Ton atelier</h1><p>{account.error ? 'La progression ne peut pas encore être affichée.' : 'Chargement de ta progression…'}</p></main>}</>
}

function Pages() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return <Dashboard />
  const lesson = dockerLessons.find((item) => path === `/lessons/${item.id}`)
  if (lesson) return <LessonReplay lesson={lesson} />

  if (path === '/today') {
    return (
      <main className="app-shell">
        <TodaySession course={dockerCourse} lessons={dockerLessons} cards={cards} />
      </main>
    )
  }

  return (
    <main className="app-shell home">
      <h1>MemStack</h1>
      <p>Cette page n'existe pas.</p>
      <a href="/">Retour à l'accueil</a>
    </main>
  )
}

export default App
