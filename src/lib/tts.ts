export async function generateSpeech(text: string): Promise<ArrayBuffer> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate speech')
  }

  return response.arrayBuffer()
}

export function createAudioFromBuffer(buffer: ArrayBuffer): HTMLAudioElement {
  const blob = new Blob([buffer], { type: 'audio/mpeg' })
  const url = URL.createObjectURL(blob)
  const audio = new Audio()
  audio.src = url
  return audio
}
