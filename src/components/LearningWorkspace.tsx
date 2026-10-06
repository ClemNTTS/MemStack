import { appHref, currentRoute, usesHashRoutes } from '../navigation/browser'
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import TodaySession from './TodaySession'
import Dashboard from './Dashboard'
import CoursesPage from './CoursesPage'
import LibraryPage from './LibraryPage'
import ProfilePage from './ProfilePage'
import LessonReplay from './LessonReplay'
import AccountBar from './AccountBar'
import { useProgress } from '../progress/ProgressProvider'
import { LearningPreferenceProvider, useLearningPreference } from '../progress/learningPreference'
import { catalogCards, catalogCourses, catalogLessons } from '../data/catalog'
import '../catalog.css'
import '../navigation.css'

function LearningWorkspace() {
  const account = useProgress()
  return <LearningPreferenceProvider><Pages key={`${account.user?.uid}-${account.revision}`} /></LearningPreferenceProvider>
}

function Pages() {
  const [route, setRoute] = useState(currentRoute)
  const [navigation, setNavigation] = useState(0)
  const path = route.split('?')[0].replace(/\/+$/, '') || '/'
  const start = new URLSearchParams(route.includes('?') ? route.slice(route.indexOf('?') + 1) : '').get('start')
  const initialAction = start === 'lesson' || start === 'cards' ? start : undefined
  const { activeCourseId } = useLearningPreference()
  const course = catalogCourses.find((item) => item.id === activeCourseId) ?? catalogCourses[0]
  const lesson = catalogLessons.find((item) => path === `/lessons/${item.id}`)
  const courseId = path.startsWith('/courses/') ? path.slice('/courses/'.length) : undefined
  const immersive = Boolean(lesson) || path === '/today' || path === '/reviews'
  const previousRoute = useRef(route)
  useEffect(() => {
    const title = lesson?.title ?? (path === '/courses' ? 'Parcours' : courseId ? catalogCourses.find(course => course.id === courseId)?.title : path === '/library' ? 'Bibliothèque' : path === '/profile' ? 'Ma progression' : path === '/reviews' ? 'Révisions' : path === '/' || path === '/today' ? 'Aujourd’hui' : 'Page introuvable')
    document.title = `${title ?? 'Page introuvable'} · MemStack`
    if (previousRoute.current !== route) {
      document.querySelector('.account-menu')?.removeAttribute('open')
      document.getElementById('main-content')?.focus({ preventScroll: true })
      previousRoute.current = route
    }
  }, [route, path, lesson, courseId])
  useEffect(() => {
    const update = () => { setRoute(currentRoute()); setNavigation(value => value + 1); window.scrollTo(0, 0) }
    window.addEventListener('popstate', update)
    window.addEventListener('hashchange', update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener('hashchange', update)
    }
  }, [])
  function navigate(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as Element).closest('a')
    if (!link || link.target || link.hasAttribute('download')) return
    const url = new URL(link.href)
    if (url.origin !== window.location.origin) return
    if (usesHashRoutes ? url.pathname !== window.location.pathname || !url.hash.startsWith('#/') : Boolean(url.hash)) return
    const nextRoute = usesHashRoutes ? url.hash.slice(1) : `${url.pathname}${url.search}`
    event.preventDefault()
    if (nextRoute === route) return
    window.history.pushState(null, '', appHref(nextRoute))
    setRoute(nextRoute)
    setNavigation(value => value + 1)
    window.scrollTo(0, 0)
  }
  const links = [
    { href: '/', label: 'Aujourd’hui', current: path === '/' || path === '/today' },
    { href: '/courses', label: 'Parcours', current: path.startsWith('/courses') },
    { href: '/reviews', label: 'Révisions', current: path === '/reviews' },
    { href: '/library', label: 'Bibliothèque', current: path === '/library' || Boolean(lesson) },
  ]
  let page
  if (path === '/') page = <Dashboard />
  else if (path === '/courses' || courseId !== undefined) page = <CoursesPage key={courseId ?? 'all'} courseId={courseId} />
  else if (path === '/library') page = <LibraryPage />
  else if (path === '/profile') page = <ProfilePage />
  else if (lesson) page = <LessonReplay key={lesson.id} lesson={lesson} />
  else if (path === '/today' || path === '/reviews') page = <main className="app-shell"><TodaySession key={`${course.id}-${path}-${navigation}`} course={course} lessons={catalogLessons} cards={catalogCards} mode={path === '/reviews' ? 'reviews' : 'today'} initialAction={initialAction} onSessionRoute={setRoute} /></main>
  else page = <main className="dashboard"><p className="lesson-category">Page introuvable</p><h1>Ce chemin reste à tracer.</h1><a className="dashboard-cta" href={appHref('/')}>Retour à l’atelier</a></main>
  return <div className="learning-app" data-immersive={immersive} onClick={navigate}>
    <a className="skip-link" href="#main-content">Aller au contenu</a>
    <header className="site-header">
      <a className="brand" href={appHref('/')} aria-label="MemStack, accueil">memstack<span> / l’atelier</span></a>
      <nav aria-label="Navigation principale">{links.map((link) => <a key={link.href} href={appHref(link.href)} aria-current={link.current ? 'page' : undefined}>{link.label}</a>)}</nav>
      <AccountBar />
    </header>
    <div id="main-content" className="page-content" tabIndex={-1} key={`${path}-${navigation}`}>{page}</div>
  </div>
}

export default LearningWorkspace
