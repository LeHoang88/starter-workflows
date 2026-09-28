// lib/stripe.ts
import Stripe from 'stripe'
import { prisma } from './prisma'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter',
    price: 29,
    reviewsPerMonth: 500,
  },
  pro: {
    name: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
    price: 79,
    reviewsPerMonth: 2000,
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    price: 199,
    reviewsPerMonth: 10000,
  },
}

export async function createStripeCustomer(userId: string, email: string) {
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  })

  return await prisma.subscription.create({
    data: {
      userId,
      stripeCustomerId: customer.id,
      stripePriceId: '',
      status: 'inactive',
    },
  })
}

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  let subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    subscription = await createStripeCustomer(userId, user.email)
  }

  const session = await stripe.checkout.sessions.create({
    customer: subscription.stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
}

export async function handleStripeWebhook(
  event: Stripe.Event
) {
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId

      if (userId) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id || '',
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId

      if (userId) {
        await prisma.subscription.update({
          where: { userId },
          data: { status: 'canceled' },
        })
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const subscription = await prisma.subscription.findUnique({
        where: { stripeCustomerId: customerId },
      })

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'active' },
        })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const subscription = await prisma.subscription.findUnique({
        where: { stripeCustomerId: customerId },
      })

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'past_due' },
        })
      }
      break
    }
  }
}
