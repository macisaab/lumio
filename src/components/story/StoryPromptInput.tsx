import { useState, useRef, useEffect } from 'react'
import { LANGUAGES, DEFAULT_LANGUAGE, type Language } from '../../lib/languages'
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

// Type augmentation for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

interface Props {
  onSubmit: (prompt: string, language: Language) => void
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
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognition()
      recognition.lang = language.speechLang
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (e: SpeechRecognitionEvent) => {
        const transcript = e.results[0][0].transcript
        setPrompt((prev) => (prev ? prev + ' ' + transcript : transcript))
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSurprise = () => {
    if (!activeChild) return
    const surprise = buildSurprisePrompt(activeChild)
    setPrompt(surprise)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !loading) {
      onSubmit(prompt.trim(), language)
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
          className="w-full px-4 py-4 pr-14 pb-14 rounded-2xl border-2 border-amber-200 focus:outline-none focus:ring-2 focus:ring-lumio-amber focus:border-transparent bg-white text-lg resize-none placeholder:text-amber-300"
          disabled={loading}
        />
        {/* Language selector */}
        <div className="absolute left-3 bottom-3">
          <button
            type="button"
            onClick={() => setShowLangMenu((v) => !v)}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold transition-colors disabled:opacity-50 border border-amber-200"
            title="Choose story language"
          >
            <span>{language.flag}</span>
            <span>{language.label}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showLangMenu && (
            <div className="absolute bottom-9 left-0 bg-white border border-amber-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[140px]">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => { setLanguage(lang); setShowLangMenu(false) }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-amber-50 transition-colors ${lang.code === language.code ? 'bg-amber-100 font-semibold text-amber-800' : 'text-gray-700'}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={loading}
            title={isListening ? 'Stop listening' : 'Speak your story idea'}
            className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-red-100 text-red-500 animate-pulse'
                : 'bg-amber-50 text-amber-500 hover:bg-amber-100'
            } disabled:opacity-50`}
          >
            {isListening ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1.5 14.93A7.001 7.001 0 0 1 5 9H3a9 9 0 0 0 8 8.94V21H9v2h6v-2h-2v-3.07A9 9 0 0 0 21 9h-2a7 7 0 0 1-5.5 6.93z"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {isListening && (
        <p className="text-sm text-red-500 font-medium text-center animate-pulse">
          Listening... speak your story idea
        </p>
      )}

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
