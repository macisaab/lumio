import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createServer } from 'http'

const anthropic = new Anthropic()
const openai = new OpenAI()

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`)

  if (url.pathname === '/api/generate-story' && req.method === 'POST') {
    try {
      const body = await readBody(req)
      const { systemPrompt, userPrompt } = JSON.parse(body)

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      })

      const textContent = message.content.find((c) => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude')
      }

      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = textContent.text.trim()
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim()
      }

      const storyData = JSON.parse(jsonStr)

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(storyData))
    } catch (error) {
      console.error('Story generation error:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to generate story' }))
    }
    return
  }

  if (url.pathname === '/api/generate-image' && req.method === 'POST') {
    try {
      const body = await readBody(req)
      const { prompt } = JSON.parse(body)

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

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ url: imageUrl }))
    } catch (error) {
      console.error('Image generation error:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to generate image' }))
    }
    return
  }

  if (url.pathname === '/api/tts' && req.method === 'POST') {
    try {
      const body = await readBody(req)
      const { text } = JSON.parse(body)

      const elevenLabsKey = process.env.ELEVENLABS_API_KEY
      if (!elevenLabsKey) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'ElevenLabs API key not configured' }))
        return
      }

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
      res.writeHead(200, { 'Content-Type': 'audio/mpeg' })
      res.end(Buffer.from(audioBuffer))
    } catch (error) {
      console.error('TTS error:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to generate speech' }))
    }
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

function readBody(req: import('http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Uppi API server running on port ${PORT}`)
})
