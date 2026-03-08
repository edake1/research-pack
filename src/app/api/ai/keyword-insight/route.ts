import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

// POST /api/ai/keyword-insight - Generate AI glossary insight for a keyword
export async function POST(request: NextRequest) {
  try {
    const { keyword, context } = await request.json()

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system:
        'You are a concise research encyclopedia. Respond ONLY with valid JSON, no markdown fences or extra text.',
      prompt: `Give a brief, insightful glossary entry for the research keyword "${keyword}"${context ? ` in the context of "${context}"` : ''}.

Return JSON with this exact shape:
{
  "definition": "A clear 1-2 sentence definition",
  "significance": "Why this matters in research (1 sentence)",
  "relatedTerms": ["term1", "term2", "term3"],
  "funFact": "An interesting or surprising fact about this topic (1 sentence)"
}

Keep it concise, informative, and accessible. No jargon overload.`,
    })

    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    const insight = JSON.parse(cleaned)

    return NextResponse.json(insight)
  } catch (error) {
    console.error('Error generating keyword insight:', error)
    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    )
  }
}
