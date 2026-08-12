// lib/services/telegram.ts
import TelegramBot from 'node-telegram-bot-api'
import { prisma } from '../prisma'

export class TelegramService {
  private bot: TelegramBot
  private chatId: string

  constructor(botToken: string, chatId: string) {
    this.bot = new TelegramBot(botToken, { polling: false })
    this.chatId = chatId
  }

  async sendReviewSynthesis(
    synthesis: {
      originalContent: string
      synthesizedContent: string
      sentiment: string
      keyPoints: string[]
      productTitle: string
      rating: number
    }
  ): Promise<string | null> {
    try {
      const message = this.formatMessage(synthesis)

      const result = await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      })

      return result.message_id.toString()
    } catch (error) {
      console.error('Error sending Telegram message:', error)
      throw error
    }
  }

  private formatMessage(synthesis: {
    originalContent: string
    synthesizedContent: string
    sentiment: string
    keyPoints: string[]
    productTitle: string
    rating: number
  }): string {
    const sentimentEmoji = {
      positive: '😊',
      negative: '😞',
      neutral: '😐',
    }

    const emoji = sentimentEmoji[synthesis.sentiment as keyof typeof sentimentEmoji] || '😊'

    const keyPointsList = synthesis.keyPoints
      .map(point => `• ${point}`)
      .join('\n')

    return `${emoji} <b>New Product Review - ${synthesis.productTitle}</b>

⭐ Rating: ${'★'.repeat(synthesis.rating)}${'☆'.repeat(5 - synthesis.rating)}

📝 <b>Summary:</b>
${synthesis.synthesizedContent}

🔑 <b>Key Points:</b>
${keyPointsList}

💬 <b>Original Review:</b>
<code>${synthesis.originalContent}</code>

Sentiment: <b>${synthesis.sentiment.toUpperCase()}</b>`
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await this.bot.deleteMessage(this.chatId, messageId)
    } catch (error) {
      console.error('Error deleting Telegram message:', error)
    }
  }
}

export async function getTelegramService(
  shopStoreId: string
): Promise<TelegramService | null> {
  const integration = await prisma.integration.findFirst({
    where: {
      shopStoreId,
      type: 'telegram',
      isActive: true,
    },
  })

  if (!integration) {
    return null
  }

  const config = integration.config as {
    botToken: string
    chatId: string
  }

  return new TelegramService(config.botToken, config.chatId)
}
