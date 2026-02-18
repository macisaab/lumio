import { useAuth } from '../contexts/AuthContext'
import { useChildren } from '../contexts/ChildContext'
import { getColorConfig } from '../lib/colors'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { children: childProfiles, deleteChild } = useChildren()
  const navigate = useNavigate()

  const handleDeleteChild = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${name}'s profile? This will remove all their stories and stickers.`
      )
    ) {
      await deleteChild(id)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-800 mt-2">Settings</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 divide-y divide-amber-50">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Account
          </h2>
          <p className="text-gray-700 mt-1">{user?.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-100">
        <div className="p-4 border-b border-amber-50">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Child Profiles
          </h2>
        </div>
        {childProfiles.map((child) => {
          const color = getColorConfig(child.favorite_color)
          return (
            <div
              key={child.id}
              className="p-4 flex items-center justify-between border-b border-amber-50 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: color.hex }}
                >
                  {child.name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{child.name}</p>
                  <p className="text-xs text-gray-500">
                    Age {child.age} • {child.favorite_color}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteChild(child.id, child.name)}
                className="text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          )
        })}
      </div>

      <button
        onClick={handleSignOut}
        className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
