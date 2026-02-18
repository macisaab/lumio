import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_ORIGINS = [
  process.env.ALLOWED_ORIGIN || 'https://lumio.app',
]

const PREVIEW_PATTERN = /^https:\/\/lumio-.*\.vercel\.app$/

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.includes(origin)) return true
  if (PREVIEW_PATTERN.test(origin)) return true
  return false
}

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin as string | undefined

  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin!)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}
