/**
 * Frontend helper for generating per-page illustrations via DALL-E 3.
 */

export async function generatePageImage(
  paragraphText: string,
  childColor: string,
  storyTitle: string
): Promise<string> {
  const prompt = buildImagePrompt(paragraphText, childColor, storyTitle)

  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    throw new Error(`Image generation failed: ${res.status}`)
  }

  const data = await res.json()
  return data.url
}

function buildImagePrompt(
  paragraphText: string,
  childColor: string,
  storyTitle: string
): string {
  // Truncate paragraph text to keep the prompt reasonable
  const summary = paragraphText.length > 300
    ? paragraphText.slice(0, 297) + '...'
    : paragraphText

  return [
    `Children's book illustration, soft watercolor style, warm and friendly.`,
    `Scene: ${summary}`,
    `Style: gentle pastel colors, simple rounded shapes, age 1-4 appropriate, ${childColor} color accents.`,
    `IMPORTANT: absolutely no text, letters, words, numbers, labels, or writing of any kind anywhere in the image.`,
  ].join(' ')
}

/**
 * Generate images for all paragraphs in parallel.
 * Returns a map of paragraph index → image URL.
 * Individual failures are silently skipped (story still works without images).
 */
export async function generateAllPageImages(
  paragraphs: { text: string }[],
  childColor: string,
  storyTitle: string,
  onImageReady: (index: number, url: string) => void
): Promise<void> {
  const promises = paragraphs.map(async (p, i) => {
    try {
      const url = await generatePageImage(p.text, childColor, storyTitle)
      onImageReady(i, url)
    } catch (err) {
      console.warn(`Image generation failed for page ${i + 1}:`, err)
    }
  })

  await Promise.allSettled(promises)
}
