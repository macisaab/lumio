import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { handleCors } from './_utils/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body ?? {}

  if (typeof prompt !== 'string' || prompt.length === 0) {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  if (prompt.length > 4000) {
    return res.status(400).json({ error: 'Prompt too long' })
  }

  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  try {
    const openai = new OpenAI({ apiKey: openaiKey })

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      throw new Error('No image URL in response')
    }

    // Upload to Supabase Storage for permanent URL
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      try {
        const imageResponse = await fetch(imageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        const fileName = `stories/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`

        const uploadResponse = await fetch(
          `${supabaseUrl}/storage/v1/object/story-images/${fileName}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'image/png',
            },
            body: Buffer.from(imageBuffer),
          }
        )

        if (uploadResponse.ok) {
          const permanentUrl = `${supabaseUrl}/storage/v1/object/public/story-images/${fileName}`
          return res.status(200).json({ url: permanentUrl })
        }
      } catch (uploadError) {
        console.error('Supabase upload failed, returning DALL-E URL:', uploadError)
      }
    }

    // Fallback: return DALL-E temporary URL
    return res.status(200).json({ url: imageUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    return res.status(500).json({ error: 'Failed to generate image' })
  }
}
