import type { Child, StoryGenerationResponse, StoryParagraph } from '../types'

const SYSTEM_PROMPT = `You are a children's story writer creating short, joyful stories for children aged 1–4. Write in simple, repetitive language with plenty of sounds and expressive words. Naturally weave in the child's favorite color when describing objects, clothes, or scenery. Always personalize the story using the child's name and interests. Structure output as JSON only. Do not include any text outside the JSON object.`

export function buildStoryPrompt(child: Child, prompt: string): string {
  return `Child name: ${child.name}, Age: ${child.age}, Favorite color: ${child.favorite_color}, Interests: ${child.interests.join(', ')}. Story idea: ${prompt}. Return JSON: { "title": "string", "paragraphs": [{"text": "string", "tap_moment": null | {"prompt": "string", "emoji": "string", "sound": "string"}}] }. Max 6 paragraphs. Include exactly 3 tap moments across the paragraphs. End paragraph must include earning a sticker.`
}

export function buildRedirectPrompt(
  readParagraphs: StoryParagraph[],
  redirectCommand: string,
  remainingCount: number
): string {
  const storyText = readParagraphs.map((p) => p.text).join('\n\n')
  return `The story so far: ${storyText}. The parent wants to change what happens next: "${redirectCommand}". Continue the story from here with ${remainingCount} more paragraphs. Keep the same child, name, and tone. Return JSON: { "paragraphs": [{"text": "string", "tap_moment": null | {"prompt": "string", "emoji": "string", "sound": "string"}}] }. Last paragraph must include earning a sticker.`
}

export function buildSurprisePrompt(child: Child): string {
  const interest =
    child.interests[Math.floor(Math.random() * child.interests.length)] ||
    'adventure'
  const ideas = [
    `A magical ${interest} adventure in a ${child.favorite_color} forest`,
    `${child.name} discovers a friendly ${interest} who needs help`,
    `A ${child.favorite_color} balloon carries ${child.name} to a land of ${interest}`,
    `${child.name} and the dancing ${interest} have a party`,
    `A tiny ${interest} moves into ${child.name}'s backyard`,
  ]
  return ideas[Math.floor(Math.random() * ideas.length)]
}

export async function generateStory(
  child: Child,
  prompt: string
): Promise<StoryGenerationResponse> {
  const userPrompt = buildStoryPrompt(child, prompt)

  const response = await fetch('/api/generate-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate story')
  }

  const data = await response.json()
  return data as StoryGenerationResponse
}

export async function redirectStory(
  readParagraphs: StoryParagraph[],
  redirectCommand: string,
  remainingCount: number
): Promise<{ paragraphs: StoryParagraph[] }> {
  const userPrompt = buildRedirectPrompt(
    readParagraphs,
    redirectCommand,
    remainingCount
  )

  const response = await fetch('/api/generate-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to redirect story')
  }

  const data = await response.json()
  return data as { paragraphs: StoryParagraph[] }
}
