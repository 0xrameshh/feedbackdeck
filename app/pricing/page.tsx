"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Check, Star, ArrowRight } from "lucide-react";
import { HeaderNav } from "@/components/header-nav";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "month",
    description: "Perfect for small websites and side projects",
    features: [
      "Up to 100 feedback submissions/month",
      "Basic analytics dashboard",
      "Email notifications",
      "Customizable widget",
      "Email support"
    ],
    popular: false,
    cta: "Start Free Trial",
    polarProductId: "starter-plan" // You'll need to replace with actual Polar product ID
  },
  {
    name: "Professional", 
    price: "$29",
    period: "month",
    description: "For growing businesses and teams",
    features: [
      "Up to 1,000 feedback submissions/month",
      "Advanced analytics & insights",
      "Priority email support",
      "Team collaboration",
      "Custom branding",
      "Export data (CSV/PDF)",
      "API access"
    ],
    popular: true,
    cta: "Start Free Trial",
    polarProductId: "professional-plan" // You'll need to replace with actual Polar product ID
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "month", 
    description: "For large teams and high-traffic websites",
    features: [
      "Unlimited feedback submissions",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "SSO integration",
      "Custom analytics",
      "Priority support",
      "White-label solution"
    ],
    popular: false,
    cta: "Contact Sales",
    polarProductId: "enterprise-plan" // You'll need to replace with actual Polar product ID
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const handleCheckout = async (productId: string) => {
    try {
      // Redirect to Polar checkout
      window.location.href = `/api/polar/checkout?product_id=${productId}`;
    } catch (error) {
      console.error('Error initiating checkout:', error);
    }
  };

  return (
    <>
      <HeaderNav />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 px-4 py-2" variant="outline">
              Simple Pricing
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Choose your plan
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Start free and upgrade as you grow. All plans include a 14-day free trial.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm ${!isYearly ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isYearly ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
                Yearly
              </span>
              <Badge variant="secondary" className="text-xs">
                Save 20%
              </Badge>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.name}
                  className={`relative p-8 ${
                    plan.popular 
                      ? 'border-blue-200 dark:border-blue-800 shadow-xl scale-105' 
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {isYearly ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}` : plan.price}
                      </span>
                      <span className="text-gray-500">/{isYearly ? 'year' : plan.period}</span>
                    </div>
                    {isYearly && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Save ${Math.round(parseInt(plan.price.slice(1)) * 2.4)} per year
                      </p>
                    )}
                  </div>
                  
                  <CardContent className="p-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      onClick={() => handleCheckout(plan.polarProductId)}
                      className={`w-full text-lg py-6 ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                      } group`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Everything you need to know about FeedbackStar pricing.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Can I change plans later?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Is there a free trial?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  All plans include a 14-day free trial. No credit card required to start.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">What happens if I exceed my limits?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We&apos;ll notify you when you&apos;re close to your limit. You can upgrade anytime to avoid service interruption.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Can I cancel anytime?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Yes, you can cancel your subscription at any time. You&apos;ll keep access until the end of your billing period.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join hundreds of websites collecting valuable feedback with FeedbackStar.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}