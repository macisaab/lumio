import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StoryParagraph, StoryGenerationResponse, Child } from '../../types'
import { redirectStory } from '../../lib/claude'
import { getPastelBg } from '../../lib/colors'
import TapMoment from './TapMoment'
import StoryRedirect from './StoryRedirect'

interface Props {
  story: StoryGenerationResponse
  child: Child
  onComplete: () => void
}

export default function StoryPlayback({ story, child, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paragraphs, setParagraphs] = useState<StoryParagraph[]>(
    story.paragraphs
  )
  const [showTapMoment, setShowTapMoment] = useState(false)
  const [tapCompleted, setTapCompleted] = useState(false)
  const [showRedirect, setShowRedirect] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const bgColor = getPastelBg(child.favorite_color)

  const currentParagraph = paragraphs[currentIndex]
  const isLastParagraph = currentIndex === paragraphs.length - 1
  const hasTapMoment = currentParagraph?.tap_moment != null

  useEffect(() => {
    if (hasTapMoment && !tapCompleted) {
      const timer = setTimeout(() => setShowTapMoment(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, hasTapMoment, tapCompleted])

  const goToNext = useCallback(() => {
    if (isLastParagraph) {
      onComplete()
    } else {
      setCurrentIndex((i) => i + 1)
      setShowTapMoment(false)
      setTapCompleted(false)
    }
  }, [isLastParagraph, onComplete])

  const handleTap = () => {
    setTapCompleted(true)
    setShowTapMoment(false)
  }

  const handleRedirect = async (command: string) => {
    setRedirecting(true)
    try {
      const readParagraphs = paragraphs.slice(0, currentIndex + 1)
      const remainingCount = paragraphs.length - currentIndex - 1
      const result = await redirectStory(
        readParagraphs,
        command,
        remainingCount
      )
      const newParagraphs = [
        ...readParagraphs,
        ...result.paragraphs,
      ]
      setParagraphs(newParagraphs)
      setShowRedirect(false)
      goToNext()
    } catch {
      console.error('Failed to redirect story')
    } finally {
      setRedirecting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
              {currentIndex === 0 && (
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                  {story.title}
                </h2>
              )}

              <p className="text-xl leading-relaxed text-gray-700 text-center">
                {currentParagraph?.text}
              </p>

              <AnimatePresence>
                {showTapMoment && currentParagraph?.tap_moment && (
                  <TapMoment
                    tapMoment={currentParagraph.tap_moment}
                    onTap={handleTap}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-8 gap-2">
              {paragraphs.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentIndex
                      ? 'bg-lumio-amber scale-125'
                      : i < currentIndex
                        ? 'bg-amber-300'
                        : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-4 flex justify-between items-center">
        <button
          onClick={() => setShowRedirect(true)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-3 py-2"
        >
          Change the story
        </button>

        {(!hasTapMoment || tapCompleted) && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={goToNext}
            className="px-8 py-3 bg-white/80 text-lumio-dark font-semibold rounded-full hover:bg-white transition-colors shadow-md"
          >
            {isLastParagraph ? 'Finish!' : 'Next'}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showRedirect && (
          <StoryRedirect
            onSubmit={handleRedirect}
            onClose={() => setShowRedirect(false)}
            loading={redirecting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
