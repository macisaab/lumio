# Uppi

**Where every story begins with wonder.**

Uppi is a web-based application that lets parents speak a story idea and instantly receive a short, personalized, interactive story for their child — narrated by AI voice, with tap-to-interact moments, and a digital prize system to reward engagement.

## Features

- **Personalized Stories** — Claude AI generates stories using your child's name, age, interests, and favorite color
- **Interactive Tap Moments** — Children tap animated characters during the story for cause-and-effect engagement
- **Mid-Story Redirects** — Parents can change the story direction mid-playback ("add a dragon!", "make it funnier")
- **Sticker Book** — Every completed story earns a sticker, with milestone badges at 5, 10, 25, and 50 stories
- **AI Narration** — ElevenLabs text-to-speech provides warm, expressive narration
- **Multiple Child Profiles** — Support for multiple children with personalized themes per child

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion + canvas-confetti
- **Backend/DB:** Supabase (Auth, PostgreSQL, Row Level Security)
- **AI Stories:** Anthropic Claude API
- **AI Voice:** ElevenLabs TTS API
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- Anthropic API key
- ElevenLabs API key (optional, for narration)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/macisaab/uppi.git
   cd uppi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Add your API keys to `.env`

5. Run the Supabase migration:
   ```bash
   # Using Supabase CLI
   supabase db push
   # Or run supabase/migrations/001_initial_schema.sql manually
   ```

6. Start the development server:
   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: API server (for Claude + TTS)
   npm run server
   ```

7. Open http://localhost:5173

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login, signup forms
│   ├── children/      # Child profile form, selector
│   ├── layout/        # App layout, animated background
│   ├── prizes/        # Celebration screen, sticker book
│   ├── story/         # Story playback, tap moments, redirect
│   └── ui/            # Motion wrappers (wiggle, bounce, tilt)
├── contexts/          # React context providers (Auth, Child, Story)
├── lib/               # API clients (Supabase, Claude, TTS, colors)
├── pages/             # Route pages (Landing, Home, Library, etc.)
└── types/             # TypeScript type definitions
server/                # API server for Claude + ElevenLabs proxy
supabase/migrations/   # Database schema
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `ANTHROPIC_API_KEY` | Claude API key (server-side) |
| `ELEVENLABS_API_KEY` | ElevenLabs API key (server-side) |

## License

MIT — free for personal and commercial use.
