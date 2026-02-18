import { useState } from 'react'
import { useChildren } from '../../contexts/ChildContext'
import { COLOR_OPTIONS } from '../../lib/colors'
import { useNavigate } from 'react-router-dom'

const INTEREST_SUGGESTIONS = [
  'Dogs',
  'Cats',
  'Dinosaurs',
  'Trains',
  'Space',
  'Unicorns',
  'Cars',
  'Butterflies',
  'Fish',
  'Bears',
  'Robots',
  'Fairies',
  'Pirates',
  'Superheroes',
  'Music',
  'Dancing',
  'Cooking',
  'Animals',
  'Nature',
  'Ocean',
]

interface Props {
  onComplete?: () => void
}

export default function ChildProfileForm({ onComplete }: Props) {
  const [name, setName] = useState('')
  const [age, setAge] = useState(2)
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[1])
  const [interests, setInterests] = useState<string[]>([])
  const [customInterest, setCustomInterest] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const { addChild } = useChildren()
  const navigate = useNavigate()

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest))
    } else if (interests.length < 5) {
      setInterests([...interests, interest])
    }
  }

  const addCustomInterest = () => {
    const trimmed = customInterest.trim()
    if (trimmed && interests.length < 5 && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed])
      setCustomInterest('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError("Please enter your child's name")
      return
    }

    setSaving(true)
    try {
      await addChild({
        name: name.trim(),
        age,
        favorite_color: selectedColor.label,
        favorite_color_hex: selectedColor.hex,
        interests,
      })
      if (onComplete) {
        onComplete()
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Child's Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What's your little one called?"
          className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-lumio-amber focus:border-transparent bg-amber-50/50 text-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Age: {age} {age === 1 ? 'year' : 'years'} old
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAge(a)}
              className={`flex-1 py-3 rounded-xl text-lg font-bold transition-all ${
                age === a
                  ? 'bg-lumio-amber text-white shadow-md scale-105'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Favorite Color
        </label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.label}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                selectedColor.label === color.label
                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-105'
                  : 'hover:scale-102'
              }`}
              style={{ backgroundColor: color.pastel }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-xs font-medium text-gray-600">
                {color.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Interests ({interests.length}/5)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Pick up to 5 things your child loves — they'll appear in stories!
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {INTEREST_SUGGESTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              disabled={interests.length >= 5 && !interests.includes(interest)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                interests.includes(interest)
                  ? 'bg-lumio-amber text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomInterest()
              }
            }}
            placeholder="Add your own..."
            className="flex-1 px-3 py-2 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-lumio-amber text-sm bg-amber-50/50"
          />
          <button
            type="button"
            onClick={addCustomInterest}
            disabled={interests.length >= 5}
            className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-200 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="w-full py-4 bg-lumio-amber text-white font-bold text-lg rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {saving ? 'Creating profile...' : "Let's start storytelling!"}
      </button>
    </form>
  )
}
