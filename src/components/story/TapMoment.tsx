import { motion } from 'framer-motion'
import type { TapMoment as TapMomentType } from '../../types'

interface Props {
  tapMoment: TapMomentType
  onTap: () => void
}

export default function TapMoment({ tapMoment, onTap }: Props) {
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

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="flex flex-col items-center mt-8"
    >
      <p className="text-sm text-amber-600 mb-3 font-medium">
        {tapMoment.prompt}
      </p>
      <motion.button
        onClick={handleTap}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="w-24 h-24 bg-lumio-warm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow border-4 border-lumio-yellow active:bg-amber-200"
      >
        <span className="text-5xl">{tapMoment.emoji}</span>
      </motion.button>
      <p className="text-xs text-gray-400 mt-2">Tap me!</p>
    </motion.div>
  )
}
