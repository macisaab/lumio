import { useChildren } from '../../contexts/ChildContext'
import { getColorConfig } from '../../lib/colors'
import { Link } from 'react-router-dom'

export default function ChildSelector() {
  const { children, activeChild, setActiveChild } = useChildren()

  if (children.length === 0) return null

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {children.map((child) => {
        const color = getColorConfig(child.favorite_color)
        const isActive = activeChild?.id === child.id

        return (
          <button
            key={child.id}
            onClick={() => setActiveChild(child)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              isActive
                ? 'shadow-md scale-105 text-white font-semibold'
                : 'bg-white/70 text-gray-600 hover:bg-white'
            }`}
            style={
              isActive
                ? { backgroundColor: color.hex }
                : { borderColor: color.pastel, borderWidth: '2px' }
            }
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : color.pastel,
                color: isActive ? 'white' : color.hex,
              }}
            >
              {child.name[0]}
            </div>
            <span>{child.name}</span>
          </button>
        )
      })}
      <Link
        to="/children/new"
        className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/50 text-gray-400 hover:bg-white hover:text-gray-600 transition-all whitespace-nowrap border-2 border-dashed border-gray-200"
      >
        <span className="text-lg">+</span>
        <span className="text-sm">Add child</span>
      </Link>
    </div>
  )
}
