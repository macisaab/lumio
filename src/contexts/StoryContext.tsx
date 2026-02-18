import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { Story, StoryFilter, StorySortBy } from '../types'

interface StoryContextType {
  stories: Story[]
  currentStory: Story | null
  loading: boolean
  filter: StoryFilter
  sortBy: StorySortBy
  setFilter: (filter: StoryFilter) => void
  setSortBy: (sort: StorySortBy) => void
  filteredStories: Story[]
  favoriteCount: number
  setCurrentStory: (story: Story | null) => void
  fetchStories: (childId: string) => Promise<void>
  saveStory: (story: Omit<Story, 'id' | 'created_at' | 'is_favorite' | 'view_count' | 'last_viewed_at'>) => Promise<Story>
  completeStory: (storyId: string) => Promise<void>
  toggleFavorite: (storyId: string) => Promise<void>
  recordView: (storyId: string) => Promise<void>
}

const StoryContext = createContext<StoryContextType | undefined>(undefined)

function applyFilterAndSort(stories: Story[], filter: StoryFilter, sortBy: StorySortBy): Story[] {
  let filtered = [...stories]

  if (filter === 'favorites') {
    filtered = filtered.filter((s) => s.is_favorite)
  } else if (filter === 'completed') {
    filtered = filtered.filter((s) => s.completed_at != null)
  }

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'most_viewed':
        return b.view_count - a.view_count
      case 'last_read':
        if (!a.last_viewed_at && !b.last_viewed_at) return 0
        if (!a.last_viewed_at) return 1
        if (!b.last_viewed_at) return -1
        return new Date(b.last_viewed_at).getTime() - new Date(a.last_viewed_at).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return filtered
}

export function StoryProvider({ children }: { children: ReactNode }) {
  const [stories, setStories] = useState<Story[]>([])
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<StoryFilter>('all')
  const [sortBy, setSortBy] = useState<StorySortBy>('recent')

  const filteredStories = applyFilterAndSort(stories, filter, sortBy)
  const favoriteCount = stories.filter((s) => s.is_favorite).length

  const fetchStories = useCallback(async (childId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching stories:', error)
    } else {
      setStories(data || [])
    }
    setLoading(false)
  }, [])

  const saveStory = async (
    storyData: Omit<Story, 'id' | 'created_at' | 'is_favorite' | 'view_count' | 'last_viewed_at'>
  ): Promise<Story> => {
    const { data, error } = await supabase
      .from('stories')
      .insert(storyData)
      .select()
      .single()

    if (error) throw error
    setCurrentStory(data)
    return data
  }

  const completeStory = async (storyId: string) => {
    const { error } = await supabase
      .from('stories')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', storyId)

    if (error) throw error
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId ? { ...s, completed_at: new Date().toISOString() } : s
      )
    )
  }

  const toggleFavorite = async (storyId: string) => {
    const story = stories.find((s) => s.id === storyId)
    if (!story) return

    const newValue = !story.is_favorite
    const { error } = await supabase
      .from('stories')
      .update({ is_favorite: newValue })
      .eq('id', storyId)

    if (error) {
      console.error('Error toggling favorite:', error)
      return
    }

    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId ? { ...s, is_favorite: newValue } : s
      )
    )
  }

  const recordView = async (storyId: string) => {
    const story = stories.find((s) => s.id === storyId)
    if (!story) return

    const now = new Date().toISOString()
    const newCount = story.view_count + 1

    const { error } = await supabase
      .from('stories')
      .update({ view_count: newCount, last_viewed_at: now })
      .eq('id', storyId)

    if (error) {
      console.error('Error recording view:', error)
      return
    }

    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, view_count: newCount, last_viewed_at: now }
          : s
      )
    )
  }

  return (
    <StoryContext.Provider
      value={{
        stories,
        currentStory,
        loading,
        filter,
        sortBy,
        setFilter,
        setSortBy,
        filteredStories,
        favoriteCount,
        setCurrentStory,
        fetchStories,
        saveStory,
        completeStory,
        toggleFavorite,
        recordView,
      }}
    >
      {children}
    </StoryContext.Provider>
  )
}

export function useStories() {
  const context = useContext(StoryContext)
  if (context === undefined) {
    throw new Error('useStories must be used within a StoryProvider')
  }
  return context
}
