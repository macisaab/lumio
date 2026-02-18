import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { TapMoment as TapMomentType } from '../../types'

interface Props {
  tapMoment: TapMomentType
  highlighted?: boolean
}

type Reaction = 'bounce' | 'spin' | 'confetti' | 'wiggle'
const REACTIONS: Reaction[] = ['bounce', 'spin', 'confetti', 'wiggle']

const REACTION_VARIANTS = {
  idle: { scale: 1, rotate: 0 },
  bounce: {
    scale: [1, 1.5, 0.85, 1.2, 1],
    rotate: [0, -8, 8, -4, 0],
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
  spin: {
    rotate: [0, 360],
    scale: [1, 1.15, 1],
    transition: { duration: 0.55, ease: 'easeInOut' },
  },
  confetti: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.4 },
  },
  wiggle: {
    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
    scale: [1, 1.1, 1],
    transition: { duration: 0.7, ease: 'easeInOut' },
  },
}

function playSound(tapCount: number) {
  try {
    const ctx = new AudioContext()
    const sequences: number[][] = [
      [523, 659, 784, 1047],
      [784, 659, 523, 392],
      [523, 659, 784, 659, 1047],
      [392, 523, 659, 784, 523, 659],
    ]
    const seq = sequences[tapCount % sequences.length]
    seq.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25)
      osc.start(ctx.currentTime + i * 0.1)
      osc.stop(ctx.currentTime + i * 0.1 + 0.25)
    })
  } catch {
    // Audio not available
  }
}

export default function TapMoment({ tapMoment, highlighted }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [tapCount, setTapCount] = useState(0)
  const [reaction, setReaction] = useState<Reaction | null>(null)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; char: string }[]>([])
  const particleId = useRef(0)

  const fireConfetti = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { x, y },
      colors: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#FFA500'],
      scalar: 0.9,
      zIndex: 9999,
    })
  }, [])

  const spawnParticles = useCallback(() => {
    const chars = ['*', '+', 'o', '~', '^']
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: particleId.current++,
      x: Math.random() * 120 - 60,
      y: Math.random() * -80 - 20,
      char: chars[i % chars.length],
    }))
    setParticles((prev) => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((n) => n.id === p.id)))
    }, 900)
  }, [])

  const handleTap = () => {
    const newCount = tapCount + 1
    setTapCount(newCount)
    const r = REACTIONS[(newCount - 1) % REACTIONS.length]
    setReaction(null)
    requestAnimationFrame(() => requestAnimationFrame(() => setReaction(r)))
    playSound(newCount - 1)
    spawnParticles()
    if (r === 'confetti') fireConfetti()
  }

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const tapLabel =
    tapCount === 0 ? 'Tap me!' : tapCount < 3 ? 'Again!' : 'Keep going!'

  return (
    <div className="flex flex-col items-center mt-8" role="group" aria-label="Interactive moment">
      <p className="text-sm text-amber-600 mb-3 font-medium" id="tap-moment-label">
        {tapMoment.prompt}
      </p>

      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              animate={{ opacity: 0, y: p.y, x: p.x, scale: 1.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute text-2xl font-bold text-lumio-amber pointer-events-none select-none"
              aria-hidden="true"
            >
              {p.char}
            </motion.span>
          ))}
        </AnimatePresence>

        <motion.button
          ref={buttonRef}
          onClick={handleTap}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleTap() }
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : reaction
              ? REACTION_VARIANTS[reaction]
              : {
                  scale: [1, 1.06, 1],
                  rotate: [0, -3, 3, 0],
                  transition: { duration: 1.8, repeat: Infinity, repeatType: 'reverse' },
                }
          }
          className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg
            bg-lumio-warm border-4 border-lumio-yellow
            hover:shadow-xl active:bg-amber-200 cursor-pointer
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lumio-amber focus-visible:ring-offset-2
            ${highlighted ? 'ring-4 ring-lumio-amber ring-offset-2 animate-pulse' : ''}`}
          aria-labelledby="tap-moment-label"
          aria-roledescription="interactive story element"
        >
          <span className="text-6xl" aria-hidden="true">{tapMoment.emoji}</span>
        </motion.button>
      </div>

      <p className="text-xs text-amber-500 font-medium mt-2" aria-hidden="true">
        {tapLabel}
      </p>
    </div>
  )
}
