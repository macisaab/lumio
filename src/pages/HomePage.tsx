import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useChildren } from '../contexts/ChildContext'
import { useStories } from '../contexts/StoryContext'
import { generateStory } from '../lib/claude'
import { generateAllPageImages } from '../lib/images'
import { getColorConfig } from '../lib/colors'
import ChildSelector from '../components/children/ChildSelector'
import StoryPromptInput from '../components/story/StoryPromptInput'
import StoryPlayback from '../components/story/StoryPlayback'
import CelebrationScreen from '../components/prizes/CelebrationScreen'
import type { StoryGenerationResponse } from '../types'
import { supabase } from '../lib/supabase'

const STICKER_EMOJIS = [
  '🌟', '🦋', '🐸', '🌈', '🎨', '🚀', '🦄', '🐻', '🌺', '🎵',
  '🐬', '🦊', '🌙', '🎪', '🐝', '🌻', '🎈', '🐢', '🦉', '🍄',
]

type Phase = 'input' | 'playing' | 'celebration'

export default function HomePage() {
  const { activeChild, children } = useChildren()
  const { stories, saveStory, completeStory, fetchStories, recordView } = useStories()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [phase, setPhase] = useState<Phase>('input')
  const [generating, setGenerating] = useState(false)
  const [currentStory, setCurrentStory] = useState<StoryGenerationResponse | null>(null)
  const [savedStoryId, setSavedStoryId] = useState<string | null>(null)
  const [isReplay, setIsReplay] = useState(false)
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({})
  const imageGenRef = useRef(false)
  const [error, setError] = useState('')

  // Handle replay from library via ?replay=storyId
  useEffect(() => {
    const replayId = searchParams.get('replay')
    if (!replayId || !activeChild || stories.length === 0) return

    const story = stories.find((s) => s.id === replayId)
    if (!story) return

    // Clear the query param so refreshes don't re-trigger
    setSearchParams({}, { replace: true })

    setCurrentStory({
      title: story.title,
      paragraphs: story.paragraphs,
    })
    setSavedStoryId(story.id)
    setIsReplay(true)
    setPhase('playing')
  }, [searchParams, stories, activeChild, setSearchParams])

  // Fetch stories for replay support
  useEffect(() => {
    if (activeChild) {
      fetchStories(activeChild.id)
    }
  }, [activeChild, fetchStories])

  const handleGenerateStory = useCallback(
    async (prompt: string) => {
      if (!activeChild) return
      setError('')
      setGenerating(true)

      try {
        const story = await generateStory(activeChild, prompt)
        setCurrentStory(story)
        setImageUrls({})

        const saved = await saveStory({
          child_id: activeChild.id,
          title: story.title,
          paragraphs: story.paragraphs,
          tap_moments: story.paragraphs
            .filter((p) => p.tap_moment)
            .map((p) => p.tap_moment!),
          audio_url: null,
          redirect_history: [],
          completed_at: null,
        })
        setSavedStoryId(saved.id)
        setIsReplay(false)

        // Record the first view
        await recordView(saved.id)

        setPhase('playing')

        // Fire off parallel image generation in the background
        imageGenRef.current = true
        generateAllPageImages(
          story.paragraphs,
          activeChild.favorite_color,
          story.title,
          (index, url) => {
            if (!imageGenRef.current) return
            setImageUrls((prev) => ({ ...prev, [index]: url }))
            // Update the saved story with the image URL
            supabase
              .from('stories')
              .select('paragraphs')
              .eq('id', saved.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  const paragraphs = [...data.paragraphs]
                  paragraphs[index] = { ...paragraphs[index], image_url: url }
                  supabase
                    .from('stories')
                    .update({ paragraphs })
                    .eq('id', saved.id)
                    .then(() => {})
                }
              })
          }
        )
      } catch {
        setError('Failed to generate story. Please try again.')
      } finally {
        setGenerating(false)
      }
    },
    [activeChild, saveStory, recordView]
  )

  const handleStoryComplete = useCallback(async () => {
    if (!savedStoryId || !activeChild) return

    // For replays, just record the view — don't re-complete or re-award
    if (isReplay) {
      setPhase('input')
      setCurrentStory(null)
      setSavedStoryId(null)
      setIsReplay(false)
      return
    }

    await completeStory(savedStoryId)

    const stickerEmoji =
      STICKER_EMOJIS[Math.floor(Math.random() * STICKER_EMOJIS.length)]

    await supabase.from('prizes').insert({
      child_id: activeChild.id,
      story_id: savedStoryId,
      sticker_type: currentStory?.title || 'Story',
      sticker_emoji: stickerEmoji,
    })

    // Check milestones
    const { count } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('child_id', activeChild.id)
      .not('completed_at', 'is', null)

    const milestoneThresholds = [5, 10, 25, 50]
    for (const threshold of milestoneThresholds) {
      if (count && count >= threshold) {
        const { data: existing } = await supabase
          .from('milestones')
          .select('id')
          .eq('child_id', activeChild.id)
          .eq('milestone_type', `${threshold}_stories`)
          .single()

        if (!existing) {
          await supabase.from('milestones').insert({
            child_id: activeChild.id,
            milestone_type: `${threshold}_stories`,
          })
        }
      }
    }

    setPhase('celebration')
  }, [savedStoryId, activeChild, completeStory, currentStory, isReplay])

  const handleContinue = () => {
    imageGenRef.current = false
    setPhase('input')
    setCurrentStory(null)
    setSavedStoryId(null)
    setIsReplay(false)
    setImageUrls({})
    if (activeChild) {
      fetchStories(activeChild.id)
    }
  }

  if (phase === 'playing' && currentStory && activeChild) {
    return (
      <StoryPlayback
        story={currentStory}
        child={activeChild}
        onComplete={handleStoryComplete}
        imageUrls={imageUrls}
      />
    )
  }

  if (phase === 'celebration' && currentStory && activeChild) {
    const stickerEmoji =
      STICKER_EMOJIS[Math.floor(Math.random() * STICKER_EMOJIS.length)]
    return (
      <CelebrationScreen
        stickerEmoji={stickerEmoji}
        storyTitle={currentStory.title}
        childName={activeChild.name}
        onContinue={handleContinue}
      />
    )
  }

  if (children.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h1 className="text-2xl font-bold text-lumio-dark mb-2">
          Welcome to Lumio!
        </h1>
        <p className="text-gray-600 mb-6">
          Let's set up your first child profile to start creating magical
          stories.
        </p>
        <button
          onClick={() => navigate('/children/new')}
          className="px-8 py-3 bg-lumio-amber text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-md"
        >
          Add your child
        </button>
      </div>
    )
  }

  const color = activeChild ? getColorConfig(activeChild.favorite_color) : null

  // Recent favorites for quick access
  const recentFavorites = stories
    .filter((s) => s.is_favorite)
    .slice(0, 3)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <ChildSelector />

      {activeChild && (
        <>
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: color?.pastel }}
          >
            <h1 className="text-2xl font-bold text-gray-800">
              Hi, {activeChild.name}!
            </h1>
            <p className="text-gray-600 mt-1">What story shall we tell today?</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <StoryPromptInput
            onSubmit={handleGenerateStory}
            loading={generating}
          />

          {/* Quick favorites section */}
          {recentFavorites.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-500">
                  Favorite stories
                </h2>
                <button
                  onClick={() => navigate('/stories')}
                  className="text-xs text-lumio-amber hover:underline"
                >
                  See all
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {recentFavorites.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => {
                      recordView(story.id)
                      setCurrentStory({
                        title: story.title,
                        paragraphs: story.paragraphs,
                      })
                      setSavedStoryId(story.id)
                      setIsReplay(true)
                      setPhase('playing')
                    }}
                    className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm border border-amber-100 text-left max-w-[180px] hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs">❤️</span>
                      <span className="text-xs text-gray-400">
                        {story.view_count} reads
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {story.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeChild.interests.length > 0 && (
            <div className="text-center">
              <p className="text-xs text-gray-400">
                {activeChild.name} loves:{' '}
                {activeChild.interests.join(', ')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
