# ResearchPack

> **Make research reusable, not repetitive.**

A platform where research is packaged, shared, forked, and credited. Think GitHub, but for knowledge work.

## The Problem

Every person researching a topic goes through the same stages — search, filter, consume, synthesize, conclude. This happens millions of times for the same topics. That's massive duplicated effort.

## The Solution

Someone packages their research journey — sources, notes, dead-ends, conclusions — and others **inherit** that work instead of starting from scratch. Fork it, improve it, credit the original.

## Features

- **Research Packs** — Create curated collections of sources, notes, and key takeaways
- **Fork & Improve** — Build on someone else's research with full attribution
- **AI-Assisted Creation** — AI suggests sources and can generate starter packs for any topic
- **Thanks System** — Credit researchers whose work helped you
- **User Profiles** — Showcase your research contributions and track your impact
- **Video Embeds** — YouTube/Vimeo sources play inline
- **Dark/Light Mode** — With multiple accent color themes

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS 4 + shadcn/ui
- **Database** — Prisma ORM (SQLite for dev, Postgres for production)
- **AI** — OpenAI via Vercel AI SDK
- **Auth** — Auth.js (NextAuth v5)
- **Animations** — Framer Motion
- **Deployment** — Vercel

## Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/ResearchPack.git
cd ResearchPack

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Fill in your keys in .env

# Set up the database
bunx prisma db push

# Seed with sample data
bun run db:seed

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home — search, featured packs, categories
│   ├── packs/
│   │   ├── [id]/          # Pack detail page
│   │   ├── new/           # Create new pack
│   │   └── ai-generate/   # AI pack generation
│   ├── users/
│   │   └── [id]/          # User profile
│   └── api/               # API routes
│       ├── packs/         # CRUD + fork + thanks
│       ├── users/         # User profiles
│       └── ai/            # AI endpoints
├── components/            # React components
│   ├── ui/                # shadcn/ui primitives
│   ├── Header.tsx         # App header + search
│   ├── PackCard.tsx       # Pack preview card
│   ├── PackForm.tsx       # Pack create/edit form
│   ├── SourceItem.tsx     # Source display component
│   └── VideoPlayer.tsx    # YouTube/Vimeo embed player
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   └── utils.ts           # Utilities
└── hooks/                 # Custom React hooks
```

## Environment Variables

See [.env.example](.env.example) for all required variables.

## Roadmap

- [x] Core CRUD — create, view, search, delete packs
- [x] Fork system with attribution
- [x] Thanks/credit system
- [x] AI source suggestions
- [x] AI full pack generation
- [x] User profiles with stats
- [x] Video embed player
- [x] Theme system (dark/light + accent colors)
- [ ] Authentication (Auth.js + OAuth)
- [ ] PostgreSQL migration (Neon)
- [ ] Vercel AI SDK integration
- [ ] Comments & discussions
- [ ] Bookmarks / saved packs
- [ ] Pack export (PDF, Markdown)
- [ ] Full-text search
- [ ] Pack collections
- [ ] Notifications

## License

MIT
