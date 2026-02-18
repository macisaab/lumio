import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useChildren } from '../../contexts/ChildContext'
import { DancingLogo, BounceIcon } from '../ui/MotionWrappers'

export default function AppLayout() {
  const { signOut } = useAuth()
  const { activeChild } = useChildren()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { to: '/home', label: 'Home', icon: '🏠' },
    { to: '/stories', label: 'Stories', icon: '📚' },
    { to: '/stickers', label: 'Stickers', icon: '⭐' },
    { to: '/dashboard', label: 'Parent', icon: '👤' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-uppi-cream">
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <NavLink to="/home" className="flex items-center gap-2">
          <DancingLogo>
            <img src="/uppi.svg" alt="Uppi" className="w-8 h-8" />
          </DancingLogo>
          <span className="font-bold text-xl text-uppi-dark">Uppi</span>
        </NavLink>
        <div className="flex items-center gap-3">
          {activeChild && (
            <span className="text-sm text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              {activeChild.name}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main id="main-content" className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 z-40">
        <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  isActive
                    ? 'text-uppi-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <BounceIcon className="text-xl">{icon}</BounceIcon>
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
