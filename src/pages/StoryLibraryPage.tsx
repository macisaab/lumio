import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useChildren } from '../contexts/ChildContext'
import { useStories } from '../contexts/StoryContext'
import { getColorConfig } from '../lib/colors'
import type { Story, StoryFilter, StorySortBy } from '../types'

const FILTER_TABS: { key: StoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'completed', label: 'Completed' },
]

const SORT_OPTIONS: { key: StorySortBy; label: string }[] = [
  { key: 'recent', label: 'Newest' },
  { key: 'last_read', label: 'Last read' },
  { key: 'most_viewed', label: 'Most read' },
  { key: 'title', label: 'A-Z' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeTime(dateStr: string | null) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateStr)
}

interface StoryCardProps {
  story: Story
  colorHex: string
  colorPastel: string
  onToggleFavorite: () => void
  onReplay: () => void
}

function StoryCard({ story, colorHex, colorPastel, onToggleFavorite, onReplay }: StoryCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="flex">
        {/* Color spine */}
        <div
          className="w-2 flex-shrink-0"
          style={{ backgroundColor: colorHex }}
        />

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {story.title}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(story.created_at)}
                {story.completed_at && (
                  <span
                    className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: colorPastel, color: colorHex }}
                  >
                    Completed
                  </span>
                )}
              </p>
            </div>

            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              className="p-1.5 -mt-1 -mr-1 rounded-lg hover:bg-amber-50 transition-colors"
              aria-label={story.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span className="text-xl">
                {story.is_favorite ? '❤️' : '🤍'}
              </span>
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{story.paragraphs.length} pages</span>
            <span className="text-gray-200">|</span>
            <span>
              {story.view_count} {story.view_count === 1 ? 'read' : 'reads'}
            </span>
            {story.last_viewed_at && (
              <>
                <span className="text-gray-200">|</span>
                <span>Last: {formatRelativeTime(story.last_viewed_at)}</span>
              </>
            )}
          </div>

          {/* Redirect tags */}
          {story.redirect_history && story.redirect_history.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {story.redirect_history.map((r, i) => (
                <span
                  key={i}
                  className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full"
                >
                  "{r.command}"
                </span>
              ))}
            </div>
          )}

          {/* Replay button */}
          <button
            onClick={onReplay}
            className="mt-3 w-full py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: colorPastel, color: colorHex }}
          >
            Read again
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function StoryLibraryPage() {
  const { activeChild } = useChildren()
  const {
    stories,
    filteredStories,
    favoriteCount,
    loading,
    filter,
    sortBy,
    setFilter,
    setSortBy,
    fetchStories,
    toggleFavorite,
    recordView,
  } = useStories()
  const navigate = useNavigate()
  const [showSortMenu, setShowSortMenu] = useState(false)

  useEffect(() => {
    if (activeChild) {
      fetchStories(activeChild.id)
    }
  }, [activeChild, fetchStories])

  const handleReplay = (story: Story) => {
    recordView(story.id)
    navigate(`/?replay=${story.id}`)
  }

  if (!activeChild) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center text-gray-400">
        Select a child to view their stories
      </div>
    )
  }

  const color = getColorConfig(activeChild.favorite_color)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-lumio-amber/30 border-t-lumio-amber rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {activeChild.name}'s Book List
          </h1>
          <p className="text-sm text-gray-500">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            {favoriteCount > 0 && (
              <span> · {favoriteCount} favorite{favoriteCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Sort
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSortBy(opt.key)
                      setShowSortMenu(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      sortBy === opt.key
                        ? 'text-lumio-amber font-medium bg-amber-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === tab.key
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            style={
              filter === tab.key
                ? { backgroundColor: color.hex }
                : undefined
            }
          >
            {tab.label}
            {tab.key === 'favorites' && favoriteCount > 0 && (
              <span className="ml-1 text-xs opacity-80">({favoriteCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Story list */}
      {stories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-gray-500 font-medium">No stories yet!</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Create your first story and it'll appear here
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-lumio-amber text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-md"
          >
            Create a story
          </button>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">
            {filter === 'favorites' ? '🤍' : '📋'}
          </div>
          <p className="text-gray-500">
            {filter === 'favorites'
              ? 'No favorites yet — tap the heart on any story!'
              : 'No completed stories in this view'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                colorHex={color.hex}
                colorPastel={color.pastel}
                onToggleFavorite={() => toggleFavorite(story.id)}
                onReplay={() => handleReplay(story)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Summary stats at bottom */}
      {stories.length > 0 && (
        <div
          className="rounded-2xl p-4 text-center text-sm"
          style={{ backgroundColor: color.bg }}
        >
          <div className="flex justify-around">
            <div>
              <div className="text-lg font-bold text-gray-800">
                {stories.filter((s) => s.completed_at).length}
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">
                {stories.reduce((sum, s) => sum + s.view_count, 0)}
              </div>
              <div className="text-xs text-gray-500">Total reads</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">
                {favoriteCount}
              </div>
              <div className="text-xs text-gray-500">Favorites</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
