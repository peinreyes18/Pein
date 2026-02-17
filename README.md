# Italiano - Matuto ng Italyano mula sa Tagalog

A mobile-first web app for learning Italian from Tagalog (NOT English). Built for beginners with practical, everyday phrases.

## Features

- **8 Lessons** with 12-15 items each covering greetings, questions, food ordering, directions, shopping, time/dates, emergencies, and small talk
- **Flashcard Review** with Leitner spaced repetition system (5-box)
- **Quiz Mode** — Tagalog-to-Italian and Italian-to-Tagalog multiple choice
- **Italian TTS** — Audio pronunciation for every phrase using browser Speech Synthesis
- **Progress Tracking** — Streak counter, mastery stats, quiz history
- **Quick Phrasebook** — Searchable reference of essential phrases
- **Numbers 1-100** — Dedicated practice module
- **Settings** — Adjustable text size (3 levels), audio toggle, daily goal
- **Admin Page** — Password-protected content viewer with JSON export
- **PWA Ready** — Installable on mobile home screen

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- localStorage for data persistence
- Browser SpeechSynthesis API for Italian TTS

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install and Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 on your phone or browser.

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo on vercel.com
3. Deploy — no special config needed

Set the optional environment variable:
- `NEXT_PUBLIC_ADMIN_PASSWORD` — Password for the admin page (default: `italiano2024`)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard / Home
│   ├── layout.tsx            # Root layout with bottom nav
│   ├── mga-aralin/
│   │   ├── page.tsx          # Lessons list
│   │   └── [id]/page.tsx     # Lesson player (step-by-step cards)
│   ├── repaso/page.tsx       # Flashcard review (Leitner SRS)
│   ├── pagsusulit/page.tsx   # Quiz mode
│   ├── progreso/page.tsx     # Progress tracking
│   ├── parirala/page.tsx     # Quick phrasebook
│   ├── mga-numero/page.tsx   # Numbers 1-100 practice
│   ├── iba-pa/page.tsx       # "More" menu
│   ├── settings/page.tsx     # Settings (text size, audio)
│   └── admin/page.tsx        # Admin content viewer
├── components/
│   ├── AudioButton.tsx       # TTS play button
│   ├── BottomNav.tsx         # Bottom tab navigation
│   └── TextSizeWrapper.tsx   # Dynamic text size wrapper
├── data/
│   ├── lessons.ts            # All 8 lessons with full content
│   ├── phrasebook.ts         # Quick reference phrases
│   └── numbers.ts            # Numbers 0-100
└── lib/
    ├── types.ts              # TypeScript type definitions
    ├── storage.ts            # localStorage persistence + Leitner SRS
    └── tts.ts                # Text-to-speech helper
```

## How to Add/Edit Content

### Option 1: Edit the TypeScript files directly

1. Open `src/data/lessons.ts`
2. Add a new lesson object to the `lessons` array
3. Each lesson needs: `id`, `title`, `titleItalian`, `description`, `icon`, `order`, and `items[]`
4. Each item needs: `id`, `italian`, `tagalog`, `pronunciation`, `exampleItalian`, `exampleTagalog`
5. Optional: `commonMistake` (tip in Tagalog)
6. Restart dev server or redeploy

### Option 2: Use the Admin page

1. Go to `/admin` and enter the password
2. Click the download button to export current content as JSON
3. Edit the JSON
4. Copy the updated data back into the TypeScript files
5. Redeploy

### Item structure

```typescript
{
  id: 'unique-id',
  italian: 'Buongiorno',
  tagalog: 'Magandang umaga',
  pronunciation: 'bwon-JYOR-no',
  exampleItalian: 'Buongiorno a tutti!',
  exampleTagalog: 'Magandang umaga sa lahat!',
  commonMistake: 'Optional tip in Tagalog'
}
```

## Upgrading to a Database

The app currently uses localStorage + static TypeScript files. To upgrade:

1. Install Prisma + SQLite:
   ```bash
   npm install prisma @prisma/client
   npx prisma init --datasource-provider sqlite
   ```

2. Create schema based on the types in `src/lib/types.ts`

3. Replace `src/lib/storage.ts` with Prisma queries

4. Add API routes in `src/app/api/` for CRUD operations

5. Update the admin page to use the API instead of JSON export

## Design Decisions

- **Tagalog-first**: All UI labels, explanations, and tips are in Tagalog
- **Large touch targets**: Minimum 44px tap area for accessibility
- **High contrast**: Dark text on light backgrounds, large fonts
- **Simple navigation**: 4-tab bottom bar (Home, Lessons, Review, More)
- **Motivational**: Streak tracking, encouraging messages, progress visualization
- **Leitner SRS**: 5-box system for spaced repetition (review intervals: 0, 2, 4, 8, 16 days)
