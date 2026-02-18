import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ChildProfileForm from '../components/children/ChildProfileForm'

const ONBOARDING_STEPS = [
  {
    emoji: '✨',
    title: "Welcome to Lumio!",
    description:
      "Every child's imagination, illuminated. Create personalized stories your little one will love.",
  },
  {
    emoji: '🎙️',
    title: 'You speak, we create',
    description:
      "Type a story idea — like 'a bunny who gets lost in the garden' — and Lumio brings it to life with narration and interactive moments.",
  },
  {
    emoji: '👆',
    title: 'Tap to interact',
    description:
      'Your child taps animated characters during the story. Cause-and-effect magic that keeps them engaged and learning.',
  },
  {
    emoji: '⭐',
    title: 'Collect stickers',
    description:
      "Every story earns a sticker! Watch your child's collection grow as they explore new adventures.",
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()

  const isLastStep = step === ONBOARDING_STEPS.length - 1

  if (showProfile) {
    return (
      <div className="min-h-screen bg-lumio-cream px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-lumio-dark">
              Tell us about your child
            </h1>
            <p className="text-amber-700 mt-1">
              We'll personalize every story for them
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
            <ChildProfileForm onComplete={() => navigate('/')} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lumio-cream flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-md"
        >
          <div className="text-7xl mb-6">{ONBOARDING_STEPS[step].emoji}</div>
          <h1 className="text-2xl font-bold text-lumio-dark mb-3">
            {ONBOARDING_STEPS[step].title}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            {ONBOARDING_STEPS[step].description}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 mt-10 mb-8">
        {ONBOARDING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === step ? 'bg-lumio-amber scale-125' : 'bg-amber-200'
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => {
          if (isLastStep) {
            setShowProfile(true)
          } else {
            setStep(step + 1)
          }
        }}
        className="px-10 py-3 bg-lumio-amber text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-md text-lg"
      >
        {isLastStep ? "Let's get started!" : 'Next'}
      </button>

      {!isLastStep && (
        <button
          onClick={() => setShowProfile(true)}
          className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip
        </button>
      )}
    </div>
  )
}
