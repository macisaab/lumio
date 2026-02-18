import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ChildProvider } from './contexts/ChildContext'
import { StoryProvider } from './contexts/StoryContext'
import AppLayout from './components/layout/AppLayout'
import AnimatedBackground from './components/layout/AnimatedBackground'
import LoginForm from './components/auth/LoginForm'
import SignUpForm from './components/auth/SignUpForm'
import OnboardingPage from './pages/OnboardingPage'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import StoryLibraryPage from './pages/StoryLibraryPage'
import StickerBookPage from './pages/StickerBookPage'
import DashboardPage from './pages/DashboardPage'
import ChildProfilePage from './pages/ChildProfilePage'
import SettingsPage from './pages/SettingsPage'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-uppi-cream">
        <div className="text-center">
          <img src="/uppi.svg" alt="Uppi" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-purple-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-uppi-cream">
        <div className="w-8 h-8 border-3 border-uppi-primary/30 border-t-uppi-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

function LandingRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-uppi-cream">
        <div className="w-8 h-8 border-3 border-uppi-primary/30 border-t-uppi-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingRoute>
            <LandingPage />
          </LandingRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUpForm />
          </PublicRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <ChildProvider>
              <StoryProvider>
                <AppLayout />
              </StoryProvider>
            </ChildProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/stories" element={<StoryLibraryPage />} />
        <Route path="/stickers" element={<StickerBookPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/children/new" element={<ChildProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-uppi-primary focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <AnimatedBackground />
        <div className="relative" style={{ zIndex: 1 }}>
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
