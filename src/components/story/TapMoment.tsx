import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { TapMoment as TapMomentType } from '../../types'

interface Props {
  tapMoment: TapMomentType
  onTap: () => void
  highlighted?: boolean
}

export default function TapMoment({ tapMoment, onTap, highlighted }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const playSound = () => {
    try {
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(523, ctx.currentTime)
      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2)

      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    } catch {
      // Audio not available
    }
  }

  const handleTap = () => {
    playSound()
    onTap()
  }

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="flex flex-col items-center mt-8"
      role="group"
      aria-label="Interactive moment"
    >
      <p className="text-sm text-amber-600 mb-3 font-medium" id="tap-moment-label">
        {tapMoment.prompt}
      </p>
      <motion.button
        ref={buttonRef}
        onClick={handleTap}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            handleTap()
          }
        }}
        whileTap={{ scale: 0.9 }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }
        }
        className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-shadow
          bg-lumio-warm border-4 border-lumio-yellow
          hover:shadow-xl active:bg-amber-200
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lumio-amber focus-visible:ring-offset-2
          ${highlighted ? 'ring-4 ring-lumio-amber ring-offset-2 animate-pulse' : ''}`}
        aria-labelledby="tap-moment-label"
        aria-roledescription="interactive story element"
        autoFocus
      >
        <span className="text-6xl" aria-hidden="true">
          {tapMoment.emoji}
        </span>
      </motion.button>
      <p className="text-xs text-gray-400 mt-2" aria-hidden="true">
        Tap me!
      </p>
    </motion.div>
  )
}
