"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, BarChart3, Mail, Zap, Globe, Shield, Star, ArrowRight } from "lucide-react";
import { HeaderNav } from "@/components/header-nav";
import { FeedbackWidget } from "@/components/feedback-widget";

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <HeaderNav />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-8 text-sm px-4 py-2 bg-primary/10 text-primary border" variant="secondary">
            <Star className="w-4 h-4 mr-2" />
            Collect feedback effortlessly
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-foreground">
            Turn Feedback Into{" "}
            <span className="text-primary">Growth</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Beautiful, lightweight feedback widget that fits any website.
            Collect insights, engage users, and drive product decisions with real data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 shadow-sm">
              Talk to Sales
              <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 text-sm px-4 py-2 bg-secondary text-secondary-foreground border" variant="secondary">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Everything you need to collect feedback
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple to set up, powerful to use. Get started in minutes, not hours.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Beautiful Widget</h3>
              <p className="text-muted-foreground leading-relaxed">
                Lightweight, customizable feedback widget that perfectly matches your brand. Works seamlessly on any website without affecting performance.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Deep insights into user sentiment with powerful analytics dashboard. Track trends, categorize feedback, and monitor response rates over time.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Email Responses</h3>
              <p className="text-muted-foreground leading-relaxed">
                Respond to users directly via email. Build stronger relationships and show customers you genuinely care about their feedback and suggestions.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sub-500ms load times with minimal footprint. Your website performance stays perfect while collecting valuable user feedback.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Privacy First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Fully GDPR compliant with user-controlled data sharing. No tracking scripts, no unwanted cookies, just pure feedback collection.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Works Everywhere</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compatible with any website or framework. React, Vue, WordPress, Shopify, or plain HTML - just add one simple line of code.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20"></div>
        <div className="max-w-4xl mx-auto text-center px-6 relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Start collecting feedback
            <br />
            in under <span className="text-primary-foreground/80">2 minutes</span>
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto">
            Start collecting valuable user feedback and make data-driven product decisions that drive real growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 py-6 bg-background text-foreground hover:bg-background/90 shadow-lg hover:shadow-xl transition-all">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all">
              Talk to Sales
              <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <span className="text-2xl font-bold">FeedbackStar</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Beautiful, lightweight feedback widget that helps you collect user insights and improve your product with real data-driven decisions.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground mb-4 md:mb-0">
              &copy; 2024 FeedbackStar. All rights reserved.
            </p>
            <div className="text-muted-foreground">
              Built for indie hackers
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback Widget */}
      <FeedbackWidget />
    </>
  );
}