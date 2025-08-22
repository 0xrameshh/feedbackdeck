import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";


export const metadata: Metadata = {
  title: "FeedbackStar - Turn Feedback Into Growth",
  description: "Beautiful, lightweight feedback widget that fits any website. Collect insights, engage users, and drive product decisions with real data.",
  keywords: "feedback widget, user feedback, customer feedback, website feedback, feedback collection, analytics dashboard, user insights, product feedback, feedback management, SaaS feedback tool",
  authors: [{ name: "FeedbackStar Team" }],
  creator: "FeedbackStar",
  publisher: "FeedbackStar",
  icons: {
    icon: [
      { url: '/logo.png', sizes: '600x600', type: 'image/png' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/logo.png',
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '600x600',
      type: 'image/png',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://feedbackstar.com',
    siteName: 'FeedbackStar',
    title: 'FeedbackStar - Turn Feedback Into Growth',
    description: 'Beautiful, lightweight feedback widget that fits any website. Collect insights, engage users, and drive product decisions with real data.',
    images: [
      {
        url: 'https://feedbackstar.com/og-image.jpg',
        width: 600,
        height: 600,
        alt: 'FeedbackStar - Feedback Collection Widget',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@feedbackstar',
    creator: '@feedbackstar',
    title: 'FeedbackStar - Turn Feedback Into Growth',
    description: 'Beautiful, lightweight feedback widget that fits any website. Collect insights, engage users, and drive product decisions with real data.',
    images: ['https://feedbackstar.com/og-image.jpg'],
  },
  verification: {
    google: 'your-google-site-verification',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={GeistSans.className}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
