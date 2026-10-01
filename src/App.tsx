import LessonView from './components/LessonView'
import { todayLesson } from './data/todayLesson'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/today') {
    return (
      <main className="app-shell">
        <LessonView lesson={todayLesson} />
      </main>
    )
  }

  return (
    <main className="app-shell home">
      <h1>MemStack</h1>
      {path === '/' ? (
        <>
          <p>Une courte leçon pour avancer aujourd'hui.</p>
          <a className="primary-link" href="/today">Voir la leçon du jour</a>
        </>
      ) : (
        <>
          <p>Cette page n'existe pas.</p>
          <a href="/">Retour à l'accueil</a>
        </>
      )}
    </main>
  )
}

export default App
