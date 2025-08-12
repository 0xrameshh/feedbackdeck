'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'
import { Organization } from '@/db/schema'

// Simple subscription interface for display
interface Subscription {
  id: string;
  status: string;
  planId?: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: Date;
}
// Simplified plan lookup for Polar integration
const getPlanById = (id: string) => {
  const plans = {
    basic: { name: 'Basic', price: 29 },
    pro: { name: 'Pro', price: 79 },
    enterprise: { name: 'Enterprise', price: 199 }
  }
  return plans[id as keyof typeof plans] || { name: 'Unknown', price: 0 }
}

interface SubscriptionStatusProps {
  organization: Organization
  subscription?: Subscription | null
}

export function SubscriptionStatus({ organization, subscription }: SubscriptionStatusProps) {
  const plan = organization.currentPlan ? getPlanById(organization.currentPlan) : null
  
  const getStatusInfo = (status?: string | null) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color: 'bg-green-500',
          icon: CheckCircle,
          variant: 'default' as const
        }
      case 'trialing':
        return {
          label: 'Trial',
          color: 'bg-blue-500',
          icon: Calendar,
          variant: 'secondary' as const
        }
      case 'past_due':
        return {
          label: 'Past Due',
          color: 'bg-yellow-500',
          icon: AlertTriangle,
          variant: 'destructive' as const
        }
      case 'canceled':
        return {
          label: 'Canceled',
          color: 'bg-gray-500',
          icon: AlertTriangle,
          variant: 'outline' as const
        }
      default:
        return {
          label: 'No Subscription',
          color: 'bg-gray-500',
          icon: CreditCard,
          variant: 'outline' as const
        }
    }
  }

  const statusInfo = getStatusInfo(organization.subscriptionStatus)
  const StatusIcon = statusInfo.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5" />
          Subscription Status
        </CardTitle>
        <CardDescription>
          Current billing status and plan information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
        </div>

        {plan && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Plan</span>
            <span className="text-sm">{plan.name}</span>
          </div>
        )}

        {subscription?.currentPeriodEnd && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {subscription.cancelAtPeriodEnd ? 'Ends' : 'Renews'}
            </span>
            <span className="text-sm">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        )}

        {subscription?.trialEnd && new Date(subscription.trialEnd) > new Date() && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trial Ends</span>
            <span className="text-sm">
              {new Date(subscription.trialEnd).toLocaleDateString()}
            </span>
          </div>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Your subscription will be canceled at the end of the current billing period.
            </p>
          </div>
        )}

        {organization.subscriptionStatus === 'past_due' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              Your payment is past due. Please update your payment method to continue using the service.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}