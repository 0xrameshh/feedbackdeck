'use client'

import { useState } from 'react'
import { PricingCard } from './pricing-card'
// Simplified pricing plans for Polar integration
const PRICING_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for small teams',
    price: 29,
    interval: 'month',
    features: ['Up to 10 users', '10GB storage', 'Basic support'],
    limits: { users: 10, projects: 5, storage: 10 }
  },
  pro: {
    id: 'pro', 
    name: 'Pro',
    description: 'Best for growing businesses',
    price: 79,
    interval: 'month',
    popular: true,
    features: ['Up to 50 users', '100GB storage', 'Priority support'],
    limits: { users: 50, projects: 25, storage: 100 }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise', 
    description: 'For large organizations',
    price: 199,
    interval: 'month',
    features: ['Unlimited users', 'Unlimited storage', '24/7 support'],
    limits: { users: -1, projects: -1, storage: -1 }
  }
}
import { Organization } from '@/db/schema'

interface PricingPageProps {
  organization?: Organization
  currentPlan?: string
}

export function PricingPage({ organization, currentPlan }: PricingPageProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    if (!organization?.id) {
      // Redirect to login or show error
      window.location.href = '/login'
      return
    }

    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS]
    if (!plan) {
      console.error('Plan not found')
      return
    }

    try {
      setLoading(planId)

      // Redirect to Polar checkout with plan information
      window.location.href = `/api/polar/checkout?products=${plan.id}&organizationId=${organization.id}`

    } catch (error) {
      console.error('Error redirecting to checkout:', error)
      // You might want to show a toast notification here
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Select the perfect plan for your team&apos;s needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Object.values(PRICING_PLANS).map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
            loading={loading === plan.id}
            organizationId={organization?.id}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          All plans include a 14-day free trial. No credit card required.
        </p>
        <p className="text-sm text-muted-foreground">
          Need a custom solution?{' '}
          <a 
            href="mailto:hello@yourcompany.com" 
            className="text-primary hover:underline"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}