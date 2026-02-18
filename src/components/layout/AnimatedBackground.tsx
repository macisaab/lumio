import { useEffect, useState } from 'react'

interface FloatingShape {
  id: number
  type: 'star' | 'circle' | 'diamond' | 'dot'
  size: number
  left: string
  top: string
  duration: number
  delay: number
  animation: 'float-drift' | 'float-bob' | 'float-sway' | 'sparkle-pulse'
  color: string
  opacity: number
}

const SHAPES: FloatingShape[] = [
  { id: 1, type: 'star', size: 20, left: '8%', top: '12%', duration: 22, delay: 0, animation: 'float-drift', color: '#FFD700', opacity: 0.12 },
  { id: 2, type: 'circle', size: 14, left: '85%', top: '8%', duration: 28, delay: 3, animation: 'float-bob', color: '#C084FC', opacity: 0.1 },
  { id: 3, type: 'diamond', size: 12, left: '45%', top: '75%', duration: 25, delay: 1, animation: 'float-sway', color: '#F0ABFC', opacity: 0.1 },
  { id: 4, type: 'dot', size: 8, left: '20%', top: '55%', duration: 30, delay: 5, animation: 'sparkle-pulse', color: '#FFD700', opacity: 0.15 },
  { id: 5, type: 'star', size: 16, left: '72%', top: '35%', duration: 24, delay: 2, animation: 'float-drift', color: '#8B5CF6', opacity: 0.08 },
  { id: 6, type: 'circle', size: 10, left: '55%', top: '15%', duration: 32, delay: 7, animation: 'float-bob', color: '#FFD700', opacity: 0.12 },
  { id: 7, type: 'diamond', size: 14, left: '15%', top: '85%', duration: 26, delay: 4, animation: 'sparkle-pulse', color: '#C084FC', opacity: 0.1 },
  { id: 8, type: 'dot', size: 6, left: '90%', top: '60%', duration: 20, delay: 6, animation: 'float-sway', color: '#F0ABFC', opacity: 0.12 },
  { id: 9, type: 'star', size: 18, left: '35%', top: '40%', duration: 35, delay: 8, animation: 'float-drift', color: '#FFD700', opacity: 0.08 },
  { id: 10, type: 'circle', size: 12, left: '65%', top: '90%', duration: 27, delay: 3, animation: 'sparkle-pulse', color: '#8B5CF6', opacity: 0.1 },
  { id: 11, type: 'dot', size: 8, left: '5%', top: '35%', duration: 23, delay: 9, animation: 'float-bob', color: '#FFD700', opacity: 0.15 },
  { id: 12, type: 'diamond', size: 10, left: '78%', top: '70%', duration: 29, delay: 1, animation: 'float-drift', color: '#C084FC', opacity: 0.08 },
]

function ShapeSVG({ type, size, color }: { type: FloatingShape['type']; size: number; color: string }) {
  switch (type) {
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
        </svg>
      )
    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill={color} />
        </svg>
      )
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2l10 10-10 10L2 12z" />
        </svg>
      )
    case 'dot':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="6" fill={color} />
        </svg>
      )
  }
}

export default function AnimatedBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {SHAPES.map((shape) => (
        <div
          key={shape.id}
          className="absolute"
          style={{
            left: shape.left,
            top: shape.top,
            opacity: shape.opacity,
            animation: prefersReducedMotion
              ? 'none'
              : `${shape.animation} ${shape.duration}s ease-in-out infinite`,
            animationDelay: prefersReducedMotion ? '0s' : `${shape.delay}s`,
            willChange: prefersReducedMotion ? 'auto' : 'transform',
          }}
        >
          <ShapeSVG type={shape.type} size={shape.size} color={shape.color} />
        </div>
      ))}
    </div>
  )
}
