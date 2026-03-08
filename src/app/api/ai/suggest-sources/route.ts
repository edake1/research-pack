import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/suggest-sources - AI suggests sources for a topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const prompt = `You are a research assistant. For the topic "${topic}", suggest 5 high-quality sources that would be valuable for someone researching this topic.

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

Only respond with the JSON array, no other text.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful research assistant that provides source suggestions in JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content || '[]'

    // Parse the JSON response
    let sources
    try {
      sources = JSON.parse(content)
    } catch {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
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
