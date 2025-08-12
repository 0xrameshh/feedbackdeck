# SaaS Starter Template

## Overview

A minimal, production-ready SaaS starter template using Next.js, Better Auth, Shadcn/UI, Drizzle ORM, and Polar.sh billing.

## Features

- 🔐 **Authentication** - Better Auth with Google OAuth + email/password
- 🏢 **Organizations** - Simple multi-tenant organization management  
- 💳 **Billing** - Polar.sh integration for subscriptions and payments
- 📧 **Email** - Resend integration for transactional emails
- 🎨 **UI** - Beautiful Shadcn/UI components with Tailwind CSS
- 🗄️ **Database** - PostgreSQL with Drizzle ORM

## Getting Started

1. Clone this repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env.local` and fill in your environment variables
4. Run database migrations: `pnpm drizzle-kit migrate`
5. Start development server: `pnpm dev`

## Environment Variables

```env
# Database
DATABASE_URL=your_postgres_url

# Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email
RESEND_API_KEY=your_resend_api_key

# Billing
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Authentication:** Better Auth
- **Database:** PostgreSQL with Drizzle ORM
- **Billing:** Polar.sh
- **Styling:** Tailwind CSS + Shadcn/UI
- **Email:** Resend
- **TypeScript:** Full type safety

## License

MIT