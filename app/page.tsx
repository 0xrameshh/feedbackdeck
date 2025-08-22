"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, BarChart3, Mail, Zap, Globe, Shield, Star, ArrowRight } from "lucide-react";
import { HeaderNav } from "@/components/header-nav";
import { FeedbackWidget } from "@/components/feedback-widget";
import { NextSeo } from 'next-seo';
import { OrganizationJsonLd, WebPageJsonLd, SoftwareAppJsonLd } from 'next-seo';

export default function Home() {
  return (
    <>
      <NextSeo
        title="Home"
        description="Beautiful, lightweight feedback widget that fits any website. Collect insights, engage users, and drive product decisions with real data."
        canonical="https://feedbackstar.com"
        openGraph={{
          url: 'https://feedbackstar.com',
          title: 'FeedbackStar - Turn Feedback Into Growth',
          description: 'Beautiful, lightweight feedback widget that fits any website. Collect insights, engage users, and drive product decisions with real data.',
        }}
      />
      
      {/* Structured Data */}
      <OrganizationJsonLd
        type="Organization"
        id="https://feedbackstar.com/#organization"
        name="FeedbackStar"
        legalName="FeedbackStar LLC"
        url="https://feedbackstar.com"
        logo="https://feedbackstar.com/logo.svg"
        description="FeedbackStar provides beautiful, lightweight feedback widgets for websites to collect user insights and drive product decisions."
        contactPoint={[
          {
            telephone: '+1-555-FEEDBACK',
            contactType: 'customer service',
            email: 'support@feedbackstar.com',
            areaServed: 'US',
            availableLanguage: ['English']
          }
        ]}
        sameAs={[
          'https://twitter.com/feedbackstar',
          'https://github.com/feedbackstar',
          'https://linkedin.com/company/feedbackstar'
        ]}
      />
      
      <SoftwareAppJsonLd
        name="FeedbackStar"
        price="0"
        priceCurrency="USD"
        aggregateRating={{ ratingValue: '4.9', reviewCount: '150' }}
        operatingSystem="Web"
        applicationCategory="BusinessApplication"
        keywords="feedback, analytics, customer insights, user feedback"
        description="Beautiful feedback widget for collecting user insights and improving products"
        url="https://feedbackstar.com"
        author={{
          '@type': 'Organization',
          name: 'FeedbackStar Team'
        }}
      />
      
      <WebPageJsonLd
        description="Turn feedback into growth with FeedbackStar's beautiful, lightweight feedback widget"
        id="https://feedbackstar.com/#webpage"
        lastReviewed={new Date().toISOString()}
        reviewedBy={{
          type: 'Organization',
          name: 'FeedbackStar Team'
        }}
      />

      {/* Navigation */}
      <HeaderNav />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <Badge className="mb-6 text-sm px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-0 shadow-lg" variant="secondary">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            Collect feedback effortlessly
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Turn Feedback
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Into Growth
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
            Beautiful, lightweight feedback widget that fits any website. 
            <br className="hidden md:block" />
            Collect insights, engage users, and drive product decisions with real data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 px-4 py-2" variant="outline">Features</Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Everything you need to collect feedback
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Simple to set up, powerful to use. Get started in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 bg-white dark:bg-gray-900 shadow-lg">
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Beautiful Widget</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Lightweight, customizable feedback widget that perfectly matches your brand. 
                Works seamlessly on any website without affecting performance.
              </p>
            </Card>

            <Card className="group p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 bg-white dark:bg-gray-900 shadow-lg">
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Smart Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Deep insights into user sentiment with powerful analytics dashboard. 
                Track trends, categorize feedback, and monitor response rates over time.
              </p>
            </Card>

            <Card className="group p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 bg-white dark:bg-gray-900 shadow-lg">
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Email Responses</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Respond to users directly via email. Build stronger relationships and show 
                customers you genuinely care about their feedback and suggestions.
              </p>
            </Card>

            <Card className="group p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 bg-white dark:bg-gray-900 shadow-lg">
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Sub-500ms load times with minimal footprint. Your website performance 
                stays perfect while collecting valuable user feedback.
              </p>
            </Card>

            <Card className="group p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 bg-white dark:bg-gray-900 shadow-lg">
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Privacy First</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Fully GDPR compliant with user-controlled data sharing. 
                No tracking scripts, no unwanted cookies, just pure feedback collection.
              </p>
            </Card>

            <Card className="group p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 bg-white dark:bg-gray-900 shadow-lg">
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Works Everywhere</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Compatible with any website or framework. React, Vue, WordPress, Shopify, 
                or plain HTML - just add one simple line of code.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
          <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30" variant="outline">
            Ready to get started?
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Start collecting feedback
            <br />
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              in under 2 minutes
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Start collecting valuable user feedback and make data-driven product decisions 
            that drive real growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-10 py-7 bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" className="text-lg px-10 py-7 bg-white/20 text-white hover:bg-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/40">
              Talk to Sales
              <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 dark:bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <span className="text-2xl font-bold">FeedbackStar</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Beautiful, lightweight feedback widget that helps you collect user insights 
                and improve your product with real data-driven decisions.
              </p>
            </div>
            
            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 FeedbackStar. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Built with ❤️ for indie hackers</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Live Demo Widget */}
      <FeedbackWidget 
        projectId="demo-homepage"
        customColor="#2563eb"
      />
    </>
  );
}
