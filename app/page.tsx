import { ModeSwitcher } from "@/components/mode-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, BarChart3, Mail, Zap, Globe, Shield } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <header className="absolute top-0 w-full flex justify-between items-center p-6 z-10">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">FeedbackStar</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeSwitcher />
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Badge className="mb-4" variant="secondary">
          ⭐ Collect feedback effortlessly
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Turn Feedback Into
          <br />
          Growth
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
          A beautiful, lightweight widget that collects user feedback from any website. 
          Get insights, respond to users, and improve your product with data-driven decisions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Collecting Feedback
              <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            View Demo
            <Globe className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Demo Widget */}
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 mb-4">Add one line of code to your website:</div>
            <div className="bg-gray-900 dark:bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {`<script defer data-project-id="your-id" 
  src="https://feedbackstar.com/js/script.js"></script>`}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to collect feedback</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Simple to set up, powerful to use. Get started in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Beautiful Widget</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Lightweight, customizable feedback widget that matches your brand. 
                Works on any website without slowing it down.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Smart Analytics</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Understand user sentiment with detailed analytics. Track trends, 
                categories, and response rates over time.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Email Responses</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Reply directly to users via email. Build relationships and show 
                you care about their feedback.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold">Lightning Fast</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Sub-500ms load times. Your website speed will not be affected by our widget.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold">Privacy First</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                GDPR compliant. Users control what data they share. No tracking, no cookies.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold">Works Everywhere</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Any website, any framework. React, Vue, WordPress, Shopify - just add one line of code.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to start collecting feedback?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of websites already using FeedbackStar to improve their user experience.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Get Started Free
              <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span className="font-bold">FeedbackStar</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
