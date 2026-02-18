import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useChildren } from '../../contexts/ChildContext'

export default function AppLayout() {
  const { signOut } = useAuth()
  const { activeChild } = useChildren()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/stories', label: 'Stories', icon: '📚' },
    { to: '/stickers', label: 'Stickers', icon: '⭐' },
    { to: '/dashboard', label: 'Parent', icon: '👤' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-lumio-cream">
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <NavLink to="/" className="flex items-center gap-2">
          <img src="/lumio.svg" alt="Lumio" className="w-8 h-8" />
          <span className="font-bold text-xl text-lumio-dark">Lumio</span>
        </NavLink>
        <div className="flex items-center gap-3">
          {activeChild && (
            <span className="text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
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

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-amber-100 z-40">
        <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  isActive
                    ? 'text-lumio-amber'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
