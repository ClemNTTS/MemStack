import { ArrowRight, BookOpen, Code2, Route, RotateCcw, Users, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { appHref } from '../navigation/browser'
import LegalLinks from '../legal/LegalLinks'
import './landing.css'

export default function LandingPage({ connected = false, embedded = false }: { connected?: boolean, embedded?: boolean }) {
  const start = appHref(connected ? '/courses' : '/login')
  const presentation = useRef<HTMLDivElement>(null)
  const [motionPaused, setMotionPaused] = useState(false)
  useEffect(() => {
    const root = presentation.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.setAttribute('data-in-view', String(entry.isIntersecting)))
    }, { threshold: 0.12 })
    const sections = root.querySelectorAll('.landing-main section, .landing-dev-heading')
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])
  function showEnvironment(id: string) {
    const heading = document.getElementById(id)
    heading?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    heading?.focus({ preventScroll: true })
  }
  return <div className="memstack-presentation" ref={presentation} data-motion-paused={motionPaused}>
    {!embedded && <header className="landing-nav"><a className="landing-brand" href={appHref('/')}>memstack<span> / une idée à la fois</span></a><a className="landing-login" href={appHref('/login')}>Se connecter <ArrowRight size={16} aria-hidden="true" /></a></header>}
    <main className="landing-main">
      <section className="landing-dual-hero" aria-labelledby="landing-title">
        <div className="landing-signal-field" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
        <button type="button" className="landing-motion-control" aria-pressed={motionPaused} onClick={() => setMotionPaused(value => !value)}>{motionPaused ? 'Reprendre les animations' : 'Mettre les animations en pause'}</button>
        <div className="landing-dual-heading"><p className="landing-eyebrow">MEMSTACK · APPRENDRE ET RETENIR DANS LA DURÉE</p><h1 id="landing-title">Deux environnements.<br /><em>Le bon chemin pour toi.</em></h1><p>Le développement pour toi. L’IA au travail pour ton équipe.</p></div>
        <nav className="landing-mobile-choice" aria-label="Choisir son environnement"><button type="button" onClick={() => showEnvironment('landing-dev-title')}><Code2 size={18} aria-hidden="true" /><span>Développeurs<small>Apprendre la tech</small></span></button><button type="button" onClick={() => showEnvironment('landing-business-title')}><Users size={18} aria-hidden="true" /><span>Entreprises<small>Former à l’IA</small></span></button></nav>
        <div className="landing-environments">
          <article className="landing-environment landing-environment-dev" aria-labelledby="landing-dev-title">
            <img className="landing-environment-memo" src={`${import.meta.env.BASE_URL}memo/learning.webp`} width="74" height="68" alt="" />
            <div className="landing-environment-label"><Code2 size={22} aria-hidden="true" /><span>POUR LES DÉVELOPPEURS</span></div>
            <h2 id="landing-dev-title" tabIndex={-1}>Comprends la tech.<br />Garde les bases.</h2><p>Web, React, API, déploiement… Des leçons accessibles, des révisions espacées et des défis pour progresser en développement.</p>
            <LearningSignal labels={['Comprendre', 'Pratiquer', 'Retenir']} />
            <div className="landing-environment-bottom"><a className="landing-primary" href={start}>{connected ? 'Mon espace développeur' : 'Apprendre le développement'} <ArrowRight size={18} aria-hidden="true" /></a><span>Commence gratuitement · Premium en option</span></div>
          </article>
          <article className="landing-environment landing-environment-business" aria-labelledby="landing-business-title">
            <img className="landing-environment-memo" src={`${import.meta.env.BASE_URL}memo/journey-guide.webp`} width="74" height="68" alt="" />
            <div className="landing-environment-label"><Users size={22} aria-hidden="true" /><span>POUR LES ENTREPRISES</span></div>
            <h2 id="landing-business-title" tabIndex={-1}>Fais monter ton équipe<br />en compétences sur l’IA.</h2><p>Mieux utiliser les assistants, organiser les tâches répétitives et faire avancer les projets numériques : trois parcours pour apprendre en pratiquant, sans savoir coder.</p>
            <LearningSignal labels={['Découvrir', 'Pratiquer', 'Partager']} />
            <div className="landing-environment-bottom"><a className="landing-primary" href={appHref('/business')}>Découvrir l’offre Entreprise <ArrowRight size={18} aria-hidden="true" /></a><span>10 € TTC par membre actif et par mois</span></div>
          </article>
        </div>
        <p className="landing-environments-note">Un même compte, deux espaces distincts : tes leçons, tes cartes de révision et ta progression restent séparées.</p>
      </section>
      <section className="landing-shared-method" aria-label="La méthode commune aux deux environnements"><img src={`${import.meta.env.BASE_URL}memo/learning.webp`} alt="" width="86" height="78" /><div><strong>Une leçon pour comprendre. Un rappel pour retenir.</strong><p>Dans les deux environnements, Mémo accompagne tes petits pas. Les révisions entretiennent les acquis et les nouvelles leçons prolongent le chemin.</p></div><button className="landing-secondary" type="button" onClick={() => document.getElementById('memstack-method')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>La méthode ↓</button></section>
      <div className="landing-dev-heading"><p className="landing-eyebrow">ZOOM SUR L’ENVIRONNEMENT DÉVELOPPEUR</p><h2>Ton atelier pour apprendre le développement.</h2><p>Débute ou consolide tes bases, une notion à la fois.</p></div>
      <section className="landing-proof" aria-label="Le contenu de MemStack"><div><strong>30</strong><span>parcours reliés</span></div><div><strong>150</strong><span>petites leçons</span></div><div><strong>36</strong><span>défis avec Premium</span></div><p>Du fonctionnement du Web à React, aux API et au déploiement. Des explications pour apprendre, sans avoir vingt ans d’expérience.</p></section>
      <section className="landing-method" id="memstack-method" aria-labelledby="landing-method-title"><p className="landing-eyebrow">UNE HABITUDE, PAS UNE MONTAGNE DE COURS</p><h2 id="landing-method-title">Comprendre. Retrouver. Appliquer.</h2><div className="landing-method-grid">{[
        [BookOpen, '01', 'Une notion à la fois', 'Lis une leçon courte avec des exemples concrets. Avance dans un chemin qui relie les notions et te montre les bases utiles avant la suite.'],
        [RotateCcw, '02', 'Un rappel au bon moment', 'Essaie de retrouver la réponse avant de retourner la carte. Tes prochaines révisions s’adaptent à ce que tu as retrouvé ou oublié.'],
        [Zap, '03', 'Une situation à résoudre', 'Avec Premium, lis un dossier et choisis tes réponses. Une correction expliquée te permet de comprendre tes erreurs et les points à revoir.'],
      ].map(([Icon, number, title, description]) => { const StepIcon = Icon as typeof BookOpen; return <article key={String(number)}><div className="landing-step-top"><StepIcon size={26} aria-hidden="true" /><span>{String(number)}</span></div><h3>{String(title)}</h3><p>{String(description)}</p></article> })}</div></section>
      <section className="landing-direction"><div className="landing-route-art" aria-hidden="true"><span>Les bases</span><i /><span>Ton chemin</span><i /><span>De nouvelles connexions</span></div><div><p className="landing-eyebrow">TU SAIS OÙ ALLER ENSUITE</p><h2>Un fil conducteur.<br />La liberté d’explorer.</h2><p>Créer une interface, construire une API ou déployer une application : choisis un cap. Mémo te propose une prochaine action selon ta progression. Tes niveaux, tes badges et ta série quotidienne rendent tes efforts visibles.</p><a className="landing-secondary" href={start}>Trouver mon chemin <Route size={18} aria-hidden="true" /></a></div></section>
      <section className="landing-plans" aria-labelledby="landing-plans-title"><p className="landing-eyebrow">LES OFFRES DÉVELOPPEUR · COMMENCE À TON RYTHME</p><h2 id="landing-plans-title">Un petit rendez-vous chaque jour.</h2><div className="landing-plan-grid"><article><span className="landing-plan-label">Gratuit</span><h3>Construis ton habitude.</h3><p className="landing-price">0 €</p><ul><li>1 nouvelle leçon par jour</li><li>5 cartes dues à réviser par jour</li><li>Nouvelles cartes et relecture incluses</li><li>Niveaux, badges et série quotidienne</li></ul><a className="landing-primary" href={start}>{connected ? 'Retrouver mes parcours' : 'Créer mon compte'} <ArrowRight size={18} aria-hidden="true" /></a></article><article className="landing-premium-plan"><span className="landing-plan-label">Premium ✦</span><h3>Suis ton élan.</h3><p className="landing-price">9,90 € <small>TTC / an</small></p><p>Ou 1,50 € TTC par mois.</p><ul><li>Leçons sans plafond quotidien</li><li>Toutes tes cartes dues à réviser</li><li>36 défis et leurs corrections expliquées</li><li>La même progression, le même compagnon</li></ul><a className="landing-secondary" href={appHref(connected ? '/premium' : '/login?next=premium')}>Découvrir Premium <ArrowRight size={18} aria-hidden="true" /></a><p className="landing-note">Les cartes prévues pour plus tard gardent leur échéance.</p></article></div></section>
      <section className="landing-last"><img src={`${import.meta.env.BASE_URL}memo/learning.webp`} alt="Mémo et son livre" width="110" height="100" /><div><h2>Ta prochaine idée peut commencer ici.</h2><p>Quelques minutes, une notion, un petit pas de plus.</p></div><a className="landing-primary" href={connected ? appHref('/') : start}>{connected ? 'Retourner à mon atelier' : 'Essayer MemStack'} <ArrowRight size={18} aria-hidden="true" /></a></section>
    </main><footer className="landing-footer"><a href={appHref('/discover')}>Découvrir MemStack</a><span>Une idée à la fois. À ton rythme.</span><a href={appHref(connected ? '/' : '/login')}>{connected ? 'Mon atelier' : 'Connexion'}</a><LegalLinks /></footer>
  </div>
}

function LearningSignal({ labels }: { labels: string[] }) {
  return <div className="landing-learning-signal" aria-hidden="true"><div className="landing-signal-track"><i /><i /><i /><b /></div><div className="landing-signal-labels">{labels.map(label => <span key={label}>{label}</span>)}</div></div>
}
