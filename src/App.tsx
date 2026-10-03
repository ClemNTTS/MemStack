import TodaySession from './components/TodaySession'
import { cards } from './data/cards'
import { todayLesson } from './data/todayLesson'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/today') {
    return (
      <main className="app-shell">
        <TodaySession lesson={todayLesson} cards={cards} />
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
