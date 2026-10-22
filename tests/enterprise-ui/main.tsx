import ReactDOM from 'react-dom/client'
import EnterpriseWorkspace from '../../src/enterprise/EnterpriseWorkspace'
import { ProgressContext } from '../../src/progress/ProgressProvider'
import '../../src/index.css'

const context = { user: { uid: 'qa-learner', emailVerified: true }, online: true, ready: true, status: 'Organisation fictive · aucun compte réel', progress: { cards: {}, history: [], completedLessons: {} } }
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ProgressContext.Provider value={context as React.ContextType<typeof ProgressContext>}>
    <EnterpriseWorkspace />
  </ProgressContext.Provider>,
)
