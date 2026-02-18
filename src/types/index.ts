export interface User {
  id: string
  email: string
  created_at: string
  subscription_status: 'free' | 'starter' | 'family'
  subscription_tier: string | null
}

export interface Child {
  id: string
  user_id: string
  name: string
  age: number
  favorite_color: string
  favorite_color_hex: string
  interests: string[]
  created_at: string
}

export interface TapMoment {
  prompt: string
  emoji: string
  sound: string
}

export interface StoryParagraph {
  text: string
  tap_moment: TapMoment | null
  image_url?: string
}

export interface Story {
  id: string
  child_id: string
  title: string
  paragraphs: StoryParagraph[]
  tap_moments: TapMoment[]
  audio_url: string | null
  redirect_history: RedirectEntry[]
  is_favorite: boolean
  view_count: number
  last_viewed_at: string | null
  created_at: string
  completed_at: string | null
}

export type StoryFilter = 'all' | 'favorites' | 'completed'
export type StorySortBy = 'recent' | 'most_viewed' | 'last_read' | 'title'

export interface RedirectEntry {
  paragraph_index: number
  command: string
  timestamp: string
}

export interface Prize {
  id: string
  child_id: string
  story_id: string
  sticker_type: string
  sticker_emoji: string
  earned_at: string
}

export interface Milestone {
  id: string
  child_id: string
  milestone_type: string
  earned_at: string
}

export interface StoryGenerationResponse {
  title: string
  paragraphs: StoryParagraph[]
}
