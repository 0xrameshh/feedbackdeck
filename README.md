# Feedbackstar

A minimal, production-ready SaaS starter built with the modern Next.js stack. Includes auth, billing, email, and multi-tenant organizations out of the box.

**Live demo:** https://feedbackstar.vercel.app

## Stack

- **Framework** - Next.js 15 (App Router)
- **Auth** - Better Auth (Google OAuth + email/password)
- **Database** - PostgreSQL + Drizzle ORM + Supabase
- **Billing** - Polar.sh (subscriptions + payments)
- **Email** - Resend + React Email
- **UI** - shadcn/ui + Tailwind CSS v4 + Radix UI
- **Analytics** - Vercel Analytics

## Features

- Google OAuth + email/password login
- Multi-tenant organization management
- Subscription billing with Polar.sh webhooks
- Transactional emails via Resend
- Dark/light mode
- Type-safe throughout with Zod + TypeScript

## Getting Started

```bash
git clone https://github.com/rameshvoodi/feedbackstar
cd feedbackstar
pnpm install
cp .env.example .env.local
pnpm drizzle-kit migrate
pnpm dev
```

## Environment Variables

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=
RESEND_API_KEY=
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
```

## License

MIT
