import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StoryParagraph, StoryGenerationResponse, Child } from '../../types'
import { redirectStory } from '../../lib/claude'
import { getPastelBg, getColorConfig } from '../../lib/colors'
import TapMoment from './TapMoment'
import StoryRedirect from './StoryRedirect'

interface Props {
  story: StoryGenerationResponse
  child: Child
  onComplete: () => void
}

// Minimum drag distance (px) to register as a swipe
const SWIPE_THRESHOLD = 50

export default function StoryPlayback({ story, child, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paragraphs, setParagraphs] = useState<StoryParagraph[]>(story.paragraphs)
  const [showTapMoment, setShowTapMoment] = useState(false)
  const [tapCompleted, setTapCompleted] = useState(false)
  const [showRedirect, setShowRedirect] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right'>('left')

  // Switch-access auto-scan
  const [autoScanEnabled, setAutoScanEnabled] = useState(false)
  const autoScanTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const [autoScanHighlight, setAutoScanHighlight] = useState<'page' | 'tap' | 'next'>('next')

  // Pointer tracking for swipe
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const bgColor = getPastelBg(child.favorite_color)
  const color = getColorConfig(child.favorite_color)

  const currentParagraph = paragraphs[currentIndex]
  const isFirstParagraph = currentIndex === 0
  const isLastParagraph = currentIndex === paragraphs.length - 1
  const hasTapMoment = currentParagraph?.tap_moment != null
  const canAdvance = !hasTapMoment || tapCompleted

  // Show tap moment after a short delay
  useEffect(() => {
    if (hasTapMoment && !tapCompleted) {
      const timer = setTimeout(() => setShowTapMoment(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, hasTapMoment, tapCompleted])

  const goToNext = useCallback(() => {
    if (!canAdvance) return
    if (isLastParagraph) {
      onComplete()
    } else {
      setSwipeDirection('left')
      setCurrentIndex((i) => i + 1)
      setShowTapMoment(false)
      setTapCompleted(false)
    }
  }, [isLastParagraph, onComplete, canAdvance])

  const goToPrev = useCallback(() => {
    if (isFirstParagraph) return
    setSwipeDirection('right')
    setCurrentIndex((i) => i - 1)
    setShowTapMoment(false)
    setTapCompleted(false)
  }, [isFirstParagraph])

  const goToPage = useCallback(
    (index: number) => {
      if (index < 0 || index >= paragraphs.length || index === currentIndex) return
      setSwipeDirection(index > currentIndex ? 'left' : 'right')
      setCurrentIndex(index)
      setShowTapMoment(false)
      setTapCompleted(false)
    },
    [paragraphs.length, currentIndex]
  )

  const handleTap = () => {
    setTapCompleted(true)
    setShowTapMoment(false)
  }

  // --- Pointer (touch + mouse) swipe handling ---
  const onPointerDown = (e: ReactPointerEvent) => {
    // Ignore if interacting with buttons/inputs inside
    if ((e.target as HTMLElement).closest('button, input, textarea')) return
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!pointerStart.current) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    pointerStart.current = null

    // Only register horizontal swipes (not vertical scrolls)
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return

    if (dx < 0 && canAdvance) {
      // Swipe left → next page
      goToNext()
    } else if (dx > 0) {
      // Swipe right → previous page
      goToPrev()
    }
  }

  // --- Keyboard navigation ---
  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent | globalThis.KeyboardEvent) => {
      if (showRedirect) return

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault()
          if (showTapMoment && !tapCompleted) {
            handleTap()
          } else if (canAdvance) {
            goToNext()
          }
          break
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault()
          goToPrev()
          break
        case 'Home':
          e.preventDefault()
          goToPage(0)
          break
        case 'End':
          e.preventDefault()
          goToPage(paragraphs.length - 1)
          break
        case 'Escape':
          e.preventDefault()
          if (autoScanEnabled) {
            setAutoScanEnabled(false)
          }
          break
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showRedirect, showTapMoment, tapCompleted, canAdvance, goToNext, goToPrev, goToPage, paragraphs.length, autoScanEnabled]
  )

  // Global keyboard listener
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => onKeyDown(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onKeyDown])

  // Focus container on mount for keyboard access
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  // --- Switch-access auto-scan ---
  useEffect(() => {
    if (!autoScanEnabled) {
      if (autoScanTimer.current) clearInterval(autoScanTimer.current)
      return
    }

    const targets: typeof autoScanHighlight[] =
      showTapMoment && !tapCompleted ? ['tap', 'page'] : ['next', 'page']

    let i = 0
    setAutoScanHighlight(targets[0])

    autoScanTimer.current = setInterval(() => {
      i = (i + 1) % targets.length
      setAutoScanHighlight(targets[i])
    }, 2000)

    return () => {
      if (autoScanTimer.current) clearInterval(autoScanTimer.current)
    }
  }, [autoScanEnabled, showTapMoment, tapCompleted])

  const onSwitchActivate = () => {
    if (!autoScanEnabled) return
    if (autoScanHighlight === 'tap' && showTapMoment && !tapCompleted) {
      handleTap()
    } else if (autoScanHighlight === 'next') {
      if (canAdvance) goToNext()
    }
  }

  // --- Redirect ---
  const handleRedirect = async (command: string) => {
    setRedirecting(true)
    try {
      const readParagraphs = paragraphs.slice(0, currentIndex + 1)
      const remainingCount = paragraphs.length - currentIndex - 1
      const result = await redirectStory(readParagraphs, command, remainingCount)
      setParagraphs([...readParagraphs, ...result.paragraphs])
      setShowRedirect(false)
      goToNext()
    } catch {
      console.error('Failed to redirect story')
    } finally {
      setRedirecting(false)
    }
  }

  // Animation variants for page turns
  const pageVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'left' ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'left' ? -300 : 300,
      opacity: 0,
    }),
  }

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col select-none"
      style={{ backgroundColor: bgColor }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onClick={autoScanEnabled ? onSwitchActivate : undefined}
      tabIndex={0}
      role="region"
      aria-roledescription="storybook"
      aria-label={`${story.title} — page ${currentIndex + 1} of ${paragraphs.length}`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 z-10">
        <p className="text-xs font-medium text-gray-400" aria-hidden="true">
          {currentIndex + 1} / {paragraphs.length}
        </p>

        {/* Accessibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setAutoScanEnabled(!autoScanEnabled)
          }}
          className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
            autoScanEnabled
              ? 'bg-lumio-amber text-white'
              : 'bg-white/60 text-gray-500 hover:bg-white'
          }`}
          aria-label={
            autoScanEnabled ? 'Disable switch access mode' : 'Enable switch access mode'
          }
          aria-pressed={autoScanEnabled}
        >
          {autoScanEnabled ? 'Switch: ON' : 'Switch access'}
        </button>
      </div>

      {/* Story page area */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-5 py-4 overflow-hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait" custom={swipeDirection}>
          <motion.div
            key={currentIndex}
            custom={swipeDirection}
            variants={prefersReducedMotion ? undefined : pageVariants}
            initial={prefersReducedMotion ? { opacity: 0 } : 'enter'}
            animate={prefersReducedMotion ? { opacity: 1 } : 'center'}
            exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35, ease: 'easeInOut' }}
            className="max-w-lg w-full"
            role="article"
            aria-label={`Page ${currentIndex + 1}`}
          >
            <div
              className="bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-lg min-h-[280px] flex flex-col justify-center"
              style={{ borderTop: `4px solid ${color.hex}` }}
            >
              {currentIndex === 0 && (
                <h2
                  className="text-2xl font-bold text-center mb-6 text-gray-800"
                  role="heading"
                  aria-level={1}
                >
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
                    highlighted={autoScanEnabled && autoScanHighlight === 'tap'}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint — only on first page, fades after 3s */}
        {currentIndex === 0 && <SwipeHint />}
      </div>

      {/* Page dots — tappable for direct navigation */}
      <div
        className="flex justify-center gap-2 py-2"
        role="tablist"
        aria-label="Story pages"
      >
        {paragraphs.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              goToPage(i)
            }}
            className={`rounded-full transition-all ${
              i === currentIndex
                ? 'w-6 h-3 scale-110'
                : 'w-3 h-3'
            }`}
            style={{
              backgroundColor:
                i === currentIndex
                  ? color.hex
                  : i < currentIndex
                    ? color.pastel
                    : 'rgba(255,255,255,0.4)',
            }}
            role="tab"
            aria-selected={i === currentIndex}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>

      {/* Navigation controls */}
      <div className="px-4 pb-5 pt-1 flex items-center justify-between gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowRedirect(true)
          }}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-3 py-2"
          aria-label="Change the story direction"
        >
          Change the story
        </button>

        <div className="flex items-center gap-2">
          {/* Back button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrev()
            }}
            disabled={isFirstParagraph}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isFirstParagraph
                ? 'opacity-0 pointer-events-none'
                : 'bg-white/60 text-gray-500 hover:bg-white active:scale-95'
            } ${autoScanEnabled && autoScanHighlight === 'page' ? 'ring-4 ring-lumio-amber' : ''}`}
            aria-label="Previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Forward / Finish button */}
          {canAdvance && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className={`h-12 px-6 rounded-full font-semibold transition-all active:scale-95 shadow-md ${
                autoScanEnabled && autoScanHighlight === 'next'
                  ? 'ring-4 ring-lumio-amber ring-offset-2'
                  : ''
              }`}
              style={{ backgroundColor: color.hex, color: 'white' }}
              aria-label={isLastParagraph ? 'Finish story' : 'Next page'}
            >
              {isLastParagraph ? 'Finish!' : 'Next'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Screen reader instructions (visually hidden) */}
      <div className="sr-only" aria-live="assertive">
        {showTapMoment && currentParagraph?.tap_moment && (
          <p>
            Interactive moment: {currentParagraph.tap_moment.prompt}.
            Press Space or Enter to interact.
          </p>
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

/** A one-time swipe hint that fades after a few seconds */
function SwipeHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 1 }}
      className="text-xs text-gray-400 mt-4 text-center"
      aria-hidden="true"
    >
      Swipe left or tap Next to turn the page
    </motion.p>
  )
}
