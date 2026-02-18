import { useEffect } from 'react'
import { useChildren } from '../contexts/ChildContext'
import { useStories } from '../contexts/StoryContext'
import { getColorConfig } from '../lib/colors'

export default function StoryLibraryPage() {
  const { activeChild } = useChildren()
  const { stories, loading, fetchStories } = useStories()

  useEffect(() => {
    if (activeChild) {
      fetchStories(activeChild.id)
    }
  }, [activeChild, fetchStories])

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
      <h1 className="text-xl font-bold text-gray-800">
        {activeChild.name}'s Stories
      </h1>

      {stories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📖</div>
          <p className="text-gray-500">No stories yet!</p>
          <p className="text-sm text-gray-400 mt-1">
            Go home to create your first story
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-2xl p-4 shadow-sm border-l-4"
              style={{ borderColor: color.hex }}
            >
              <h3 className="font-semibold text-gray-800">{story.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {story.paragraphs.length} paragraphs
                {story.completed_at && ' • Completed'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(story.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
