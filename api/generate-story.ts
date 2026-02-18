import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { handleCors } from './_utils/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { systemPrompt, userPrompt } = req.body ?? {}

  if (typeof systemPrompt !== 'string' || typeof userPrompt !== 'string') {
    return res.status(400).json({ error: 'Missing systemPrompt or userPrompt' })
  }

  if (systemPrompt.length > 2000 || userPrompt.length > 5000) {
    return res.status(400).json({ error: 'Prompt too long' })
  }

  try {
    const anthropic = new Anthropic()

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

    let jsonStr = textContent.text.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const storyData = JSON.parse(jsonStr)
    return res.status(200).json(storyData)
  } catch (error) {
    console.error('Story generation error:', error)
    return res.status(500).json({ error: 'Failed to generate story' })
  }
}
