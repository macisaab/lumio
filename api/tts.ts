import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from './_utils/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text } = req.body ?? {}

  if (typeof text !== 'string' || text.length === 0) {
    return res.status(400).json({ error: 'Missing text' })
  }

  if (text.length > 5000) {
    return res.status(400).json({ error: 'Text too long' })
  }

  const elevenLabsKey = process.env.ELEVENLABS_API_KEY
  if (!elevenLabsKey) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured' })
  }

  try {
    const ttsResponse = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!ttsResponse.ok) {
      throw new Error(`ElevenLabs API error: ${ttsResponse.status}`)
    }

    const audioBuffer = await ttsResponse.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    return res.status(200).send(Buffer.from(audioBuffer))
  } catch (error) {
    console.error('TTS error:', error)
    return res.status(500).json({ error: 'Failed to generate speech' })
  }
}
