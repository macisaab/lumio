import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface Props {
  stickerEmoji: string
  storyTitle: string
  childName: string
  onContinue: () => void
}

export default function CelebrationScreen({
  stickerEmoji,
  storyTitle,
  childName,
  onContinue,
}: Props) {
  const hasConfetti = useRef(false)

  useEffect(() => {
    if (hasConfetti.current) return
    hasConfetti.current = true

    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#FBBF24', '#F59E0B', '#FDE68A', '#F97316', '#EC4899'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#FBBF24', '#F59E0B', '#FDE68A', '#F97316', '#EC4899'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-lumio-warm to-lumio-cream px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.3, damping: 10 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-8xl mb-6"
        >
          {stickerEmoji}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold text-lumio-dark mb-2"
        >
          Great listening, {childName}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg text-amber-700 mb-2"
        >
          You earned a new sticker!
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-sm text-gray-500 mb-8"
        >
          from "{storyTitle}"
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="space-y-3"
        >
          <button
            onClick={onContinue}
            className="w-full max-w-xs mx-auto block py-4 bg-lumio-amber text-white font-bold text-lg rounded-xl hover:bg-amber-600 transition-colors shadow-md"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
