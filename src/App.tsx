import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ChildProvider } from './contexts/ChildContext'
import { StoryProvider } from './contexts/StoryContext'
import AppLayout from './components/layout/AppLayout'
import LoginForm from './components/auth/LoginForm'
import SignUpForm from './components/auth/SignUpForm'
import OnboardingPage from './pages/OnboardingPage'
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
      <div className="min-h-screen flex items-center justify-center bg-lumio-cream">
        <div className="text-center">
          <img src="/lumio.svg" alt="Lumio" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-amber-700">Loading...</p>
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
      <div className="min-h-screen flex items-center justify-center bg-lumio-cream">
        <div className="w-8 h-8 border-3 border-lumio-amber/30 border-t-lumio-amber rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
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
        <Route path="/" element={<HomePage />} />
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
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
