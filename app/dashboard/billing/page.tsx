"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, Calendar, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface BillingInfo {
  currentPlan: string | null;
  subscriptionStatus: string | null;
  subscriptionId: string | null;
  polarCustomerId: string | null;
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      const response = await fetch('/api/dashboard/billing');
      if (response.ok) {
        const data = await response.json();
        setBilling(data);
      }
    } catch (error) {
      console.error('Error fetching billing info:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = () => {
    window.open('/api/polar/portal', '_blank');
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'canceled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Canceled</Badge>;
      case 'incomplete':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Incomplete</Badge>;
      default:
        return <Badge variant="secondary">Free Plan</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-8">
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Billing & Subscription</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          Manage your subscription and billing information
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Your current subscription details
                </CardDescription>
              </div>
              {getStatusBadge(billing?.subscriptionStatus)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</p>
                  <p className="text-lg font-semibold">
                    {billing?.currentPlan || 'Free Plan'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-lg font-semibold capitalize">
                    {billing?.subscriptionStatus || 'Free'}
                  </p>
                </div>
              </div>

              {billing?.subscriptionId && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Subscription ID: {billing.subscriptionId}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {billing?.polarCustomerId ? (
                  <Button onClick={openCustomerPortal} className="w-full sm:w-auto">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                ) : (
                  <Link href="/pricing">
                    <Button className="w-full sm:w-auto">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </Link>
                )}
                
                <Link href="/pricing">
                  <Button variant="outline" className="w-full sm:w-auto">
                    View All Plans
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Usage This Month
            </CardTitle>
            <CardDescription>
              Track your current usage against plan limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Feedback Submissions</span>
                <span className="text-sm text-gray-500">Coming soon</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">API Requests</span>
                <span className="text-sm text-gray-500">Coming soon</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Team Members</span>
                <span className="text-sm text-gray-500">Coming soon</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View your past invoices and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Billing history will appear here once you have an active subscription.
              </p>
              {billing?.polarCustomerId && (
                <Button onClick={openCustomerPortal} variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Billing History
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}