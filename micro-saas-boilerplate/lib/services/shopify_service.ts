// lib/services/shopify.ts
import axios from 'axios'
import { prisma } from '../prisma'

interface ShopifyReview {
  id: string
  body: string
  rating: number
  title: string
  author: string
  email?: string
  created_at: string
  product_id: string
  product_title: string
}

export class ShopifyService {
  private shopName: string
  private accessToken: string
  private apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2024-01'

  constructor(shopName: string, accessToken: string) {
    this.shopName = shopName
    this.accessToken = accessToken
  }

  private getApiUrl(path: string): string {
    return `https://${this.shopName}.myshopify.com/admin/api/${this.apiVersion}${path}`
  }

  private getHeaders() {
    return {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
    }
  }

  async fetchReviews(limit = 50): Promise<ShopifyReview[]> {
    try {
      // Using graphql endpoint to get product reviews
      const query = `{
        productReviews(first: ${limit}) {
          edges {
            node {
              id
              title
              body
              rating
              author {
                name
                email
              }
              createdAt
              product {
                id
                title
              }
            }
          }
        }
      }`

      const response = await axios.post(
        this.getApiUrl('/graphql.json'),
        { query },
        { headers: this.getHeaders() }
      )

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message)
      }

      return response.data.data.productReviews.edges.map((edge: any) => ({
        id: edge.node.id,
        body: edge.node.body,
        rating: edge.node.rating,
        title: edge.node.title,
        author: edge.node.author.name,
        email: edge.node.author.email,
        created_at: edge.node.createdAt,
        product_id: edge.node.product.id,
        product_title: edge.node.product.title,
      }))
    } catch (error) {
      console.error('Error fetching Shopify reviews:', error)
      throw error
    }
  }

  async syncReviews(shopStoreId: string): Promise<number> {
    try {
      const reviews = await this.fetchReviews(100)
      let syncedCount = 0

      for (const review of reviews) {
        const existingReview = await prisma.review.findUnique({
          where: { shopifyReviewId: review.id },
        })

        if (!existingReview) {
          await prisma.review.create({
            data: {
              shopStoreId,
              productId: review.product_id,
              productTitle: review.product_title,
              customerName: review.author,
              customerEmail: review.email,
              rating: review.rating,
              content: `${review.title}\n${review.body}`,
              shopifyReviewId: review.id,
              synced: false,
            },
          })
          syncedCount++
        }
      }

      return syncedCount
    } catch (error) {
      console.error('Error syncing reviews:', error)
      throw error
    }
  }
}

export async function getShopifyService(userId: string, shopStoreId: string) {
  const shopStore = await prisma.shopStore.findUnique({
    where: { id: shopStoreId },
  })

  if (!shopStore || shopStore.userId !== userId) {
    throw new Error('Shop store not found or unauthorized')
  }

  return new ShopifyService(shopStore.shopName, shopStore.accessToken)
}
