import { useState } from 'react'
import { useChildren } from '../../contexts/ChildContext'
import { buildSurprisePrompt } from '../../lib/claude'

const PLACEHOLDER_SUGGESTIONS = [
  'A bunny who gets lost in the garden',
  'A friendly dragon who loves to bake cookies',
  'A little boat that sails across the bathtub ocean',
  'A teddy bear who goes on a nighttime adventure',
  'A magic paintbrush that brings drawings to life',
  'Two best friends who build a blanket fort castle',
]

interface Props {
  onSubmit: (prompt: string) => void
  loading?: boolean
}

export default function StoryPromptInput({ onSubmit, loading }: Props) {
  const [prompt, setPrompt] = useState('')
  const { activeChild } = useChildren()
  const [placeholder] = useState(
    () =>
      PLACEHOLDER_SUGGESTIONS[
        Math.floor(Math.random() * PLACEHOLDER_SUGGESTIONS.length)
      ]
  )

  const handleSurprise = () => {
    if (!activeChild) return
    const surprise = buildSurprisePrompt(activeChild)
    setPrompt(surprise)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !loading) {
      onSubmit(prompt.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-4 rounded-2xl border-2 border-amber-200 focus:outline-none focus:ring-2 focus:ring-lumio-amber focus:border-transparent bg-white text-lg resize-none placeholder:text-amber-300"
          disabled={loading}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSurprise}
          disabled={loading || !activeChild}
          className="flex-1 py-3 bg-amber-50 text-amber-700 font-semibold rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-50 border-2 border-amber-200"
        >
          Surprise me!
        </button>
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="flex-2 py-3 bg-lumio-amber text-white font-bold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 shadow-md px-8"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating story...
            </span>
          ) : (
            'Create story'
          )}
        </button>
      </div>
    </form>
  )
}
