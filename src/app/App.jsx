import { useState } from 'react'
import { RouterProvider, useRouter, matchRoute } from './router'
import { REProvider, useRE } from '../context/REContext'
import { Header } from '../components/layout/Header'
import { MobileNav } from '../components/layout/MobileNav'
import { Footer } from '../components/layout/Footer'
import { ToastViewport } from '../components/ui/Toast'
import { OnboardingDialog } from '../pages/OnboardingDialog'
import { HomePage } from '../pages/HomePage'
import { ExplorePage } from '../pages/ExplorePage'
import { ProjectPage } from '../pages/ProjectPage'
import { RevivalDeskPage } from '../pages/RevivalDeskPage'
import { SubmitProjectPage } from '../pages/SubmitProjectPage'
import { NotFoundPage } from '../pages/NotFoundPage'

function CurrentRoute() {
  const { pathname } = useRouter()
  const route = matchRoute(pathname)

  switch (route.name) {
    case 'home':
      return <HomePage />
    case 'explore':
      return <ExplorePage />
    case 'project':
      return <ProjectPage slug={route.params.slug} />
    case 'desk':
      return <RevivalDeskPage />
    case 'submit':
      return <SubmitProjectPage />
    default:
      return <NotFoundPage />
  }
}

function Shell() {
  const { pathname } = useRouter()
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header navOpen={navOpen} onToggleNav={setNavOpen} />
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
      <main id="main" className="app-main" tabIndex={-1}>
        {/* keying on the path remounts the view for a clean entrance */}
        <CurrentRoute key={pathname} />
      </main>
      <Footer />
      <ToastViewport />
    </div>
  )
}

function App() {
  const { prefs } = useRE()

  return (
    <RouterProvider>
      <Shell />
      {/* shown once, never blocking, and never again until reset */}
      {!prefs.onboarded && <OnboardingDialog />}
    </RouterProvider>
  )
}

export default function AppWithProviders() {
  return (
    <REProvider>
      <App />
    </REProvider>
  )
}
