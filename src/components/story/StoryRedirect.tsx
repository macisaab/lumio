import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onSubmit: (command: string) => void
  onClose: () => void
  loading: boolean
}

export default function StoryRedirect({ onSubmit, onClose, loading }: Props) {
  const [command, setCommand] = useState('')

  const suggestions = [
    'Make it funnier',
    'Add a dragon',
    'Give it a happy ending now',
    'Make them go to space',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim()) {
      onSubmit(command.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
        <h3 className="font-bold text-lg text-gray-800 mb-1">
          Change the story
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          What should happen next?
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setCommand(s)}
              className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm hover:bg-amber-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type what should happen..."
            className="flex-1 px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-lumio-amber bg-amber-50/50"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !command.trim()}
            className="px-6 py-3 bg-lumio-amber text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            ) : (
              'Go'
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}
