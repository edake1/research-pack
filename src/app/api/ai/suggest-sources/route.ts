import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { requireAuth } from '@/lib/auth-utils'

// POST /api/ai/suggest-sources - AI suggests sources for a topic
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult.error) return authResult.error

    const body = await request.json()
    const { topic } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: 'You are a helpful research assistant that provides source suggestions in JSON format.',
      prompt: `You are a research assistant. For the topic "${topic}", suggest 5 high-quality sources that would be valuable for someone researching this topic.

For each source, provide:
- A realistic title
- A type (article, video, paper, book, or podcast)
- A brief description of why it's useful
- A realistic URL (use placeholder URLs like "https://example.com/article-slug" if you don't know the exact URL)

Respond in JSON format as an array:
[
  {
    "title": "Source Title",
    "type": "article",
    "description": "Why this source is useful",
    "url": "https://example.com/source"
  }
]

Only respond with the JSON array, no other text.`,
      temperature: 0.7,
    })

    // Parse the JSON response
    let sources
    try {
      sources = JSON.parse(text)
    } catch {
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        sources = JSON.parse(jsonMatch[0])
      } else {
        sources = []
      }
    }

    return NextResponse.json({ sources })
  } catch (error) {
    console.error('Error suggesting sources:', error)
    return NextResponse.json({ error: 'Failed to suggest sources' }, { status: 500 })
  }
}
