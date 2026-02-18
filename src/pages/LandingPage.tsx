import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TiltCard } from '../components/ui/MotionWrappers'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
}

const FEATURES = [
  {
    emoji: '✨',
    title: 'Personalized',
    description: 'Every story stars your child and their favorite things — unique adventures every time.',
  },
  {
    emoji: '👆',
    title: 'Interactive',
    description: 'Tap-to-interact moments keep little ones engaged with cause-and-effect magic.',
  },
  {
    emoji: '🛡️',
    title: 'Safe & age-appropriate',
    description: 'AI-crafted stories designed for ages 1-4, with gentle themes and positive messages.',
  },
]

const STEPS = [
  {
    number: '1',
    emoji: '💬',
    title: 'Type a story idea',
    description: 'Describe anything — "a bunny who finds a rainbow" or "a robot who learns to dance."',
  },
  {
    number: '2',
    emoji: '🪄',
    title: 'AI creates your story',
    description: 'In seconds, get a personalized illustrated story with interactive moments built in.',
  },
  {
    number: '3',
    emoji: '📖',
    title: 'Your child explores',
    description: 'Swipe through pages, tap characters, and earn stickers for every story completed!',
  },
]

const TESTIMONIALS = [
  {
    quote: 'My 3-year-old asks for "one more Uppi story" every single night. Best bedtime tool ever!',
    name: 'Parent of Leo, age 3',
    avatar: '👩',
  },
  {
    quote: 'I love that every story is different and includes things my daughter actually cares about.',
    name: 'Parent of Maya, age 2',
    avatar: '👨',
  },
  {
    quote: 'The interactive tap moments are genius — my son stays focused the whole way through.',
    name: 'Parent of Eli, age 4',
    avatar: '👩‍🦱',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-uppi-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/uppi.svg" alt="Uppi" className="w-8 h-8" />
            <span className="font-bold text-xl text-uppi-dark">Uppi</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-purple-700 hover:text-purple-900 font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm px-4 py-2 bg-uppi-primary text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        <motion.div {...fadeUp}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-uppi-dark leading-tight mb-4">
            Where every story begins{' '}
            <span className="text-uppi-primary">with wonder</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AI-powered personalized stories for your little one. Type an idea,
            and watch it come to life with illustrations, interactive moments,
            and a sprinkle of magic.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-uppi-primary text-white font-bold text-lg rounded-xl hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Create your first story — free
          </Link>
        </motion.div>

        {/* Hero illustration placeholder */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 max-w-lg mx-auto"
        >
          <div className="rounded-3xl bg-gradient-to-br from-uppi-primary/20 via-uppi-glow/20 to-uppi-secondary/20 p-8 md:p-12 shadow-inner">
            <div className="text-6xl md:text-8xl mb-4">📖✨</div>
            <p className="text-purple-600 font-medium text-sm">
              Stories as unique as your child
            </p>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16" aria-labelledby="features-heading">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2
            {...fadeUp}
            id="features-heading"
            className="text-3xl font-bold text-uppi-dark text-center mb-12"
          >
            Stories as unique as your child
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <TiltCard className="bg-uppi-cream rounded-2xl p-6 h-full border border-purple-100">
                  <div className="text-4xl mb-4">{feature.emoji}</div>
                  <h3 className="text-lg font-bold text-uppi-dark mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4" aria-labelledby="how-heading">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            {...fadeUp}
            id="how-heading"
            className="text-3xl font-bold text-uppi-dark text-center mb-12"
          >
            How Uppi works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-uppi-primary text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step.number}
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-uppi-secondary/15 to-uppi-glow/15 p-6 mb-4 shadow-inner">
                  <div className="text-5xl">{step.emoji}</div>
                </div>
                <h3 className="text-lg font-bold text-uppi-dark mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collect & celebrate */}
      <section className="bg-white py-16 px-4" aria-labelledby="collect-heading">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2
              id="collect-heading"
              className="text-3xl font-bold text-uppi-dark mb-4"
            >
              Collect stickers, celebrate milestones
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Every completed story earns a sticker. Watch your child's collection
              grow as they explore new adventures and hit exciting milestones!
            </p>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-gradient-to-br from-uppi-sparkle/20 via-uppi-glow/15 to-uppi-primary/15 p-8 shadow-inner"
          >
            <div className="flex justify-center gap-4 text-5xl mb-4">
              <span>🌟</span>
              <span>🦋</span>
              <span>🦄</span>
              <span>🌈</span>
              <span>🚀</span>
            </div>
            <p className="text-purple-600 font-medium text-sm">
              20 unique stickers to collect + milestone badges at 5, 10, 25, and 50 stories
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4" aria-labelledby="testimonials-heading">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            {...fadeUp}
            id="testimonials-heading"
            className="text-3xl font-bold text-uppi-dark text-center mb-12"
          >
            Loved by families
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm"
              >
                <div className="text-3xl mb-3">{t.avatar}</div>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-4">
                  "{t.quote}"
                </p>
                <p className="text-xs text-gray-400 font-medium">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-uppi-cream to-uppi-shimmer">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-bold text-uppi-dark mb-4">
            Ready to spark wonder?
          </h2>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            Join families creating magical, personalized story moments every day.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-uppi-primary text-white font-bold text-lg rounded-xl hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get started — it's free
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/uppi.svg" alt="Uppi" className="w-6 h-6" />
            <span className="font-bold text-uppi-dark">Uppi.ai</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
