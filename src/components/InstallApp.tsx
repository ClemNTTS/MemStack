import { useEffect, useState } from 'react'
import { clearInstallPrompt, useInstallPrompt } from '../pwa/install'
import './install-app.css'

function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function InstallApp() {
  const [installed, setInstalled] = useState(isInstalled)
  const prompt = useInstallPrompt()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  useEffect(() => {
    const display = window.matchMedia('(display-mode: standalone)')
    const update = () => setInstalled(isInstalled())
    const complete = () => setInstalled(true)
    window.addEventListener('appinstalled', complete)
    display.addEventListener('change', update)
    return () => {
      window.removeEventListener('appinstalled', complete)
      display.removeEventListener('change', update)
    }
  }, [])

  async function install() {
    if (!prompt) return
    setBusy(true)
    setMessage('')
    try {
      await prompt.prompt()
      const choice = await prompt.userChoice
      clearInstallPrompt()
      setMessage(choice.outcome === 'accepted'
        ? 'Installation demandée. Retrouve MemStack sur ton écran d’accueil.'
        : 'Tu peux aussi installer MemStack depuis le menu du navigateur.')
    } catch {
      clearInstallPrompt()
      setMessage('Ouvre le menu du navigateur pour ajouter MemStack à ton écran d’accueil.')
    } finally { setBusy(false) }
  }

  if (installed) return null
  return <section className="install-app" aria-labelledby="install-app-title">
    <h2 id="install-app-title">MemStack sur ton téléphone</h2>
    <p>Ajoute l’application à ton écran d’accueil pour la retrouver facilement.</p>
    {prompt && <button type="button" className="install-app-button" disabled={busy} onClick={() => { void install() }}>{busy ? 'Installation…' : 'Installer MemStack'}</button>}
    <details>
      <summary>{isApple ? 'Installer sur iPhone ou iPad' : 'Comment installer l’application ?'}</summary>
      <ol>{isApple ? <>
        <li>Ouvre MemStack dans Safari.</li>
        <li>Dans le menu de partage, choisis « Sur l’écran d’accueil ».</li>
        <li>Si proposé, active « Ouvrir comme app web », puis touche « Ajouter ».</li>
      </> : <>
        <li>Ouvre MemStack dans Chrome ou un navigateur compatible.</li>
        <li>Ouvre le menu du navigateur, puis choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».</li>
        <li>Confirme l’ajout pour retrouver l’icône MemStack.</li>
      </>}</ol>
      <p>Une connexion Internet et ton compte Google restent nécessaires. À la première ouverture de l’application installée, une reconnexion peut être demandée.</p>
    </details>
    {message && <p role="status">{message}</p>}
  </section>
}

export default InstallApp
