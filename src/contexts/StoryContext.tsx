import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { Story } from '../types'

interface StoryContextType {
  stories: Story[]
  currentStory: Story | null
  loading: boolean
  setCurrentStory: (story: Story | null) => void
  fetchStories: (childId: string) => Promise<void>
  saveStory: (story: Omit<Story, 'id' | 'created_at'>) => Promise<Story>
  completeStory: (storyId: string) => Promise<void>
}

const StoryContext = createContext<StoryContextType | undefined>(undefined)

export function StoryProvider({ children }: { children: ReactNode }) {
  const [stories, setStories] = useState<Story[]>([])
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(false)

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
    storyData: Omit<Story, 'id' | 'created_at'>
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
  }

  return (
    <StoryContext.Provider
      value={{
        stories,
        currentStory,
        loading,
        setCurrentStory,
        fetchStories,
        saveStory,
        completeStory,
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
