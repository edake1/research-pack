import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import prisma from '@/lib/prisma'

// POST /api/ai/generate-pack - AI generates a complete research pack
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, userId } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Verify user exists
    const user = await prisma.user.findFirst()
    const creatorId = userId || user?.id

    if (!creatorId) {
      return NextResponse.json({ error: 'No user available' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const prompt = `You are an expert researcher. Create a comprehensive research pack about "${topic}".

Generate:
1. A compelling title (not too long)
2. A detailed description (2-3 sentences)
3. 5-7 relevant sources with:
   - Realistic URLs (use actual popular domains like arxiv.org, youtube.com, medium.com, github.com, nature.com, etc.)
   - Type (article, video, paper, book, or podcast)
   - Brief notes explaining why each source is valuable
   - Relevance rating (1-5)
4. 4-5 key takeaways

Respond in this exact JSON format:
{
  "title": "string",
  "description": "string",
  "topic": "string",
  "tags": "comma, separated, tags",
  "sources": [
    {
      "url": "https://...",
      "title": "string",
      "type": "article|video|paper|book|podcast",
      "notes": "string",
      "relevanceRating": 1-5
    }
  ],
  "takeaways": [
    { "content": "string" }
  ]
}

Only respond with valid JSON, no other text.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a knowledgeable research assistant that creates comprehensive, well-structured research packs in JSON format. You always provide real, high-quality sources that would genuinely be useful for the topic.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content || '{}'

    // Parse the JSON response
    let packData
    try {
      packData = JSON.parse(content)
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        packData = JSON.parse(jsonMatch[0])
      } else {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
      }
    }

    // Create the pack in the database
    const pack = await prisma.researchPack.create({
      data: {
        title: packData.title || `Research: ${topic}`,
        description: packData.description || `AI-generated research pack about ${topic}`,
        topic: packData.topic || topic,
        tags: packData.tags || topic,
        creatorId,
        sources: {
          create: (packData.sources || []).map((s: {
            url: string
            title: string
            type: string
            notes?: string
            relevanceRating?: number
          }) => ({
            url: s.url,
            title: s.title,
            type: s.type || 'article',
            notes: s.notes,
            relevanceRating: s.relevanceRating,
          }))
        },
        takeaways: {
          create: (packData.takeaways || []).map((t: { content: string }, index: number) => ({
            content: t.content,
            order: index,
          }))
        }
      },
      include: {
        creator: true,
        sources: true,
        takeaways: true,
      }
    })

    return NextResponse.json(pack, { status: 201 })
  } catch (error) {
    console.error('Error generating pack:', error)
    return NextResponse.json({ error: 'Failed to generate pack' }, { status: 500 })
  }
}
