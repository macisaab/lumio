import { motion, useReducedMotion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface WrapperProps {
  children: ReactNode
  className?: string
}

export function WiggleButton({
  children,
  className,
  ...props
}: WrapperProps & Omit<HTMLMotionProps<'button'>, 'children'>) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.button
      whileHover={
        shouldReduce
          ? undefined
          : { rotate: [-1, 1.5, -1.5, 1, 0], transition: { duration: 0.4 } }
      }
      whileTap={shouldReduce ? undefined : { scale: 0.95 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function BounceIcon({
  children,
  className,
  ...props
}: WrapperProps & Omit<HTMLMotionProps<'span'>, 'children'>) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.span
      whileTap={
        shouldReduce
          ? undefined
          : { y: [0, -6, 0], transition: { duration: 0.3 } }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.span>
  )
}

export function TiltCard({
  children,
  className,
  ...props
}: WrapperProps & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      whileHover={
        shouldReduce
          ? undefined
          : { rotate: 1, scale: 1.02, transition: { duration: 0.2 } }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function DancingLogo({
  children,
  className,
  ...props
}: WrapperProps & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      animate={
        shouldReduce
          ? undefined
          : { rotate: [0, -3, 3, -2, 0] }
      }
      transition={
        shouldReduce
          ? undefined
          : { duration: 2, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }
      }
      whileHover={
        shouldReduce
          ? undefined
          : { scale: 1.1, rotate: [0, -5, 5, -3, 0], transition: { duration: 0.5 } }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
