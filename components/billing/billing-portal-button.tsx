'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'

interface BillingPortalButtonProps {
  organizationId: string
  className?: string
}

export function BillingPortalButton({ className }: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleManageBilling = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/polar/portal', {
        method: 'GET'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to open customer portal')
      }

      // Polar portal returns a redirect response
      window.location.href = response.url

    } catch (error) {
      console.error('Error opening billing portal:', error)
      // You might want to show a toast notification here
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleManageBilling}
      disabled={loading}
      className={className}
      variant="outline"
    >
      <CreditCard className="h-4 w-4 mr-2" />
      {loading ? 'Loading...' : 'Manage Billing'}
    </Button>
  )
}