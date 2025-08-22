export default {
  titleTemplate: '%s | FeedbackStar',
  defaultTitle: 'FeedbackStar - Turn Feedback Into Growth',
  description: 'Beautiful, lightweight feedback widget that fits any website. Collect insights, engage users, and drive product decisions with real data.',
  canonical: 'https://feedbackstar.com',
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
    cardType: 'summary_large_image',
    site: '@feedbackstar',
    handle: '@feedbackstar',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'theme-color',
      content: '#2563eb',
    },
    {
      name: 'keywords',
      content: 'feedback widget, user feedback, customer feedback, website feedback, feedback collection, analytics dashboard, user insights, product feedback, feedback management, SaaS feedback tool',
    },
    {
      name: 'author',
      content: 'FeedbackStar Team',
    },
    {
      name: 'robots',
      content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    },
    {
      property: 'fb:app_id',
      content: 'your_facebook_app_id',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '600x600',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
  ],
};