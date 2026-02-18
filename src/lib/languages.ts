export interface Language {
  code: string
  label: string
  flag: string
  speechLang: string
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English',    flag: 'GB', speechLang: 'en-US' },
  { code: 'es', label: 'Espanol',    flag: 'ES', speechLang: 'es-ES' },
  { code: 'fr', label: 'Francais',   flag: 'FR', speechLang: 'fr-FR' },
  { code: 'de', label: 'Deutsch',    flag: 'DE', speechLang: 'de-DE' },
  { code: 'pt', label: 'Portugues',  flag: 'PT', speechLang: 'pt-PT' },
  { code: 'it', label: 'Italiano',   flag: 'IT', speechLang: 'it-IT' },
  { code: 'zh', label: 'Chinese',    flag: 'CN', speechLang: 'zh-CN' },
  { code: 'ja', label: 'Japanese',   flag: 'JP', speechLang: 'ja-JP' },
  { code: 'ar', label: 'Arabic',     flag: 'SA', speechLang: 'ar-SA' },
  { code: 'hi', label: 'Hindi',      flag: 'IN', speechLang: 'hi-IN' },
]

export const DEFAULT_LANGUAGE = LANGUAGES[0]

export function getLanguage(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? DEFAULT_LANGUAGE
}
