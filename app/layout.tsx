import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Analytics } from "@vercel/analytics/next";


const siteUrl = "https://feedbackstar.vercel.app";

export const metadata: Metadata = {
  title: "FeedbackStar - Turn Feedback Into Growth",
  description: "Beautiful, lightweight feedback widget that fits any website. Collect insights, engage users, and drive product decisions with real data.",
  keywords: "feedback widget, user feedback, customer feedback, website feedback, feedback collection, analytics dashboard, product feedback",
  authors: [{ name: "Ramesh Kumar", url: "https://github.com/0xrameshh" }],
  creator: "Ramesh Kumar",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '192x192',
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
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "FeedbackStar",
    title: "FeedbackStar - Turn Feedback Into Growth",
    description: "Beautiful, lightweight feedback widget that fits any website. Collect insights, engage users, and drive product decisions with real data.",
    images: [
      {
        url: "/og-image.jpg",
        width: 600,
        height: 600,
        alt: "FeedbackStar - Feedback Collection Widget",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FeedbackStar - Turn Feedback Into Growth",
    description: "Beautiful, lightweight feedback widget that fits any website. Collect insights, engage users, and drive product decisions with real data.",
    images: ["/og-image.jpg"],
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
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
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
        <Analytics />
      </body>
    </html>
  );
}
