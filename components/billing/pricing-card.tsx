'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
// Updated for Polar.sh integration
interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  interval: string
  features: string[]
  popular?: boolean
  limits: {
    users: number
    projects: number
    storage: number
  }
}

interface PricingCardProps {
  plan: PricingPlan
  currentPlan?: string
  onSelectPlan: (planId: string) => void
  loading?: boolean
  organizationId?: string
}

export function PricingCard({ 
  plan, 
  currentPlan, 
  onSelectPlan, 
  loading = false
}: PricingCardProps) {
  const isCurrentPlan = currentPlan === plan.id
  const isPopular = plan.popular

  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground">/{plan.interval}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              <span className="font-medium">Users:</span>{' '}
              {plan.limits.users === -1 ? 'Unlimited' : plan.limits.users}
            </div>
            <div>
              <span className="font-medium">Projects:</span>{' '}
              {plan.limits.projects === -1 ? 'Unlimited' : plan.limits.projects}
            </div>
            <div>
              <span className="font-medium">Storage:</span>{' '}
              {plan.limits.storage === -1 ? 'Unlimited' : `${plan.limits.storage}GB`}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? 'outline' : isPopular ? 'default' : 'outline'}
          onClick={() => onSelectPlan(plan.id)}
          disabled={loading || isCurrentPlan}
        >
          {loading
            ? 'Loading...'
            : isCurrentPlan
            ? 'Current Plan'
            : `Subscribe to ${plan.name}`
          }
        </Button>
      </CardFooter>
    </Card>
  )
}