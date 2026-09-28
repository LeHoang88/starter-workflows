// app/pricing/page.tsx
'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { PLANS } from '@/lib/stripe'

export default function PricingPage() {
  const { data: session } = useSession()

  async function handleCheckout(priceId: string) {
    if (!session) {
      window.location.href = '/auth/signin'
      return
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      alert('Failed to start checkout')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600">
            Choose the perfect plan for your e-commerce business
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {Object.entries(PLANS).map(([key, plan]) => (
            <PricingCard
              key={key}
              plan={plan}
              featured={key === 'pro'}
              onCheckout={() => handleCheckout(plan.priceId)}
            />
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all new users get a 14-day free trial of the Pro plan. No credit card required.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit and debit cards through Stripe. We also support PayPal.',
              },
              {
                q: 'Do you offer custom plans?',
                a: 'Yes, we offer custom enterprise plans for large businesses. Contact our sales team for details.',
              },
            ].map((faq, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface PricingCardProps {
  plan: { name: string; price: number; reviewsPerMonth: number }
  featured?: boolean
  onCheckout: () => void
}

function PricingCard({ plan, featured, onCheckout }: PricingCardProps) {
  return (
    <div
      className={`rounded-lg border-2 p-8 transition ${
        featured
          ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
          : 'border-slate-200 bg-white'
      }`}
    >
      {featured && (
        <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
          Most Popular
        </div>
      )}

      <h3 className={`text-2xl font-bold mb-2 ${featured ? 'text-blue-900' : 'text-slate-900'}`}>
        {plan.name}
      </h3>

      <div className="mb-6">
        <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
        <span className="text-slate-600 ml-2">/month</span>
      </div>

      <p className="text-slate-600 mb-6">
        Up to {plan.reviewsPerMonth.toLocaleString()} reviews per month
      </p>

      <button
        onClick={onCheckout}
        className={`w-full py-3 rounded-lg font-semibold transition mb-6 ${
          featured
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
        }`}
      >
        Get Started
      </button>

      <ul className="space-y-3 text-sm">
        <FeatureItem text="Shopify integration" />
        <FeatureItem text="AI review synthesis" />
        <FeatureItem text="Telegram notifications" />
        <FeatureItem text="Analytics dashboard" />
        {(plan.name === 'Pro' || plan.name === 'Enterprise') && (
          <>
            <FeatureItem text="Multiple integrations" />
            <FeatureItem text="Priority support" />
          </>
        )}
        {plan.name === 'Enterprise' && (
          <>
            <FeatureItem text="Custom workflows" />
            <FeatureItem text="Dedicated account manager" />
          </>
        )}
      </ul>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center text-slate-700">
      <span className="text-green-600 mr-3">✓</span>
      {text}
    </li>
  )
}
