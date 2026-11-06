import ReactDOM from 'react-dom/client'
import type { ContextType } from 'react'
import type { User } from 'firebase/auth'
import EnterpriseWorkspace from '../../src/enterprise/EnterpriseWorkspace'
import { ProgressContext } from '../../src/progress/ProgressProvider'
import { emptyProgress } from '../../src/progress/storage'
import '../../src/index.css'

const unavailable = () => { throw new Error('Personal account actions are outside this isolated Enterprise fixture') }
const context: NonNullable<ContextType<typeof ProgressContext>> = {
  user: { uid: 'qa-learner', emailVerified: true } as User,
  online: true, ready: true, authResolved: true, revision: 0, error: '',
  status: 'Organisation fictive · aucun compte réel', progress: emptyProgress(),
  persist: unavailable, completeLesson: unavailable, reviewCard: unavailable,
  login: unavailable, logout: unavailable, retry: unavailable, importLocal: unavailable,
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ProgressContext.Provider value={context}>
    <EnterpriseWorkspace />
  </ProgressContext.Provider>,
)
