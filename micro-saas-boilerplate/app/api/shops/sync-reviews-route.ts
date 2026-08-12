// app/api/shops/[storeId]/sync-reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth_config'
import { getShopifyService } from '@/lib/services/shopify_service'
import { synthesizeReviewsForStore } from '@/lib/services/synthesis_service'
import { getTelegramService } from '@/lib/services/telegram_service'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const session = await getServerSession(authOptions) as any

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const shopStore = await prisma.shopStore.findUnique({
      where: { id: params.storeId },
    })

    if (!shopStore || shopStore.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Step 1: Sync reviews from Shopify
    const shopifyService = await getShopifyService(session.user.id, params.storeId)
    const syncedCount = await shopifyService.syncReviews(params.storeId)

    // Step 2: Synthesize reviews
    const { processed, errors } = await synthesizeReviewsForStore(params.storeId)

    // Step 3: Send to Telegram
    const telegramService = await getTelegramService(params.storeId)
    let sentToTelegram = 0

    if (telegramService) {
      const synthesizedReviews = await prisma.synthesizedReview.findMany({
        where: {
          shopStoreId: params.storeId,
          sentToTelegram: false,
        },
      })

      for (const synthesis of synthesizedReviews) {
        try {
          const review = await prisma.review.findUnique({
            where: { id: synthesis.reviewId },
          })

          if (!review) continue

          const messageId = await telegramService.sendReviewSynthesis({
            originalContent: synthesis.originalContent,
            synthesizedContent: synthesis.synthesizedContent,
            sentiment: synthesis.sentiment as 'positive' | 'negative' | 'neutral',
            keyPoints: JSON.parse(synthesis.keyPoints),
            productTitle: review.productTitle,
            rating: review.rating,
          })

          if (messageId) {
            await prisma.synthesizedReview.update({
              where: { id: synthesis.id },
              data: {
                sentToTelegram: true,
                telegramMessageId: messageId,
              },
            })
            sentToTelegram++
          }
        } catch (error) {
          console.error('Error sending to Telegram:', error)
        }
      }
    }

    return NextResponse.json({
      message: 'Sync completed successfully',
      stats: {
        syncedCount,
        synthesized: processed,
        synthesisErrors: errors,
        sentToTelegram,
      },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    )
  }
}
