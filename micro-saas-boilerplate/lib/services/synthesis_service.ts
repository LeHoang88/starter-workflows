// lib/services/synthesis.ts
import axios from 'axios'
import { prisma } from '../prisma'

interface SynthesisResult {
  synthesizedContent: string
  sentiment: 'positive' | 'negative' | 'neutral'
  keyPoints: string[]
}

export class SynthesisService {
  private apiKey: string
  private apiUrl = 'https://api.anthropic.com/v1/messages'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async synthesizeReview(reviewContent: string, productTitle: string): Promise<SynthesisResult> {
    try {
      const prompt = `You are an expert at summarizing customer product reviews.

Product: ${productTitle}

Review Text:
${reviewContent}

Please provide:
1. A concise 2-3 sentence synthesis of the review
2. Sentiment analysis (positive, negative, or neutral)
3. 3-4 key points from the review

Respond in JSON format:
{
  "synthesis": "...",
  "sentiment": "positive|negative|neutral",
  "keyPoints": ["point1", "point2", "point3"]
}`

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      )

      const content = response.data.content[0].text
      const parsed = JSON.parse(content)

      return {
        synthesizedContent: parsed.synthesis,
        sentiment: parsed.sentiment,
        keyPoints: parsed.keyPoints,
      }
    } catch (error) {
      console.error('Error synthesizing review:', error)
      throw error
    }
  }
}

export async function synthesizeReviewsForStore(shopStoreId: string) {
  const unsyncedReviews = await prisma.review.findMany({
    where: {
      shopStoreId,
      synced: false,
    },
    take: 10, // Process 10 at a time
  })

  if (unsyncedReviews.length === 0) {
    return { processed: 0, errors: 0 }
  }

  const synthesisService = new SynthesisService(process.env.CLAUDE_API_KEY || '')
  let processed = 0
  let errors = 0

  for (const review of unsyncedReviews) {
    try {
      const result = await synthesisService.synthesizeReview(
        review.content,
        review.productTitle
      )

      await prisma.synthesizedReview.create({
        data: {
          shopStoreId,
          reviewId: review.id,
          originalContent: review.content,
          synthesizedContent: result.synthesizedContent,
          sentiment: result.sentiment,
          keyPoints: JSON.stringify(result.keyPoints),
        },
      })

      await prisma.review.update({
        where: { id: review.id },
        data: { synced: true },
      })

      processed++
    } catch (error) {
      console.error(`Error synthesizing review ${review.id}:`, error)
      errors++
    }
  }

  return { processed, errors }
}
