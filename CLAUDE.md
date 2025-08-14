# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FeedbackStar is a SaaS feedback collection tool for indie hackers and small teams. Users embed a JavaScript widget on their websites to collect feedback with ratings and manage responses through a dashboard. This is built as part of a SaaS template project focused on rapid client delivery.

## Tech Stack

- **Frontend/Backend:** Next.js 15 with App Router + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Better Auth with Google OAuth + email/password
- **Billing:** Polar.sh (replacing Stripe in env.example)
- **UI:** Shadcn/UI components with Tailwind CSS v4
- **Email:** Resend for transactional emails
- **Package Manager:** pnpm (always use pnpm, never npm/yarn)

## Development Commands

```bash
# Development
pnpm dev                    # Start development server with turbopack
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
npx tsc --noEmit           # TypeScript type checking (run before builds)

# Database Operations
pnpm drizzle-kit generate   # Generate migrations from schema changes
pnpm drizzle-kit migrate    # Run pending migrations
pnpm drizzle-kit studio     # Open Drizzle Studio for database inspection
```

## Architecture Overview

### Authentication System
- Uses Better Auth with session-based authentication
- Multi-provider support (Google OAuth + email/password)
- Organization plugin enabled for multi-tenant support
- Database adapter configured with Drizzle ORM
- Middleware protects `/dashboard` routes (`middleware.ts`)

### Database Schema (`db/schema.ts`)
Core entities with proper relations:
- **Users:** Authentication, system roles (user/admin)
- **Organizations:** Multi-tenant structure with Polar billing integration
- **Members:** User-organization relationships with roles (member/admin/owner)
- **Sessions/Accounts:** Better Auth managed authentication tables
- **Webhook Events:** Polar.sh webhook processing

### API Routes Structure
- `/api/auth/[...all]` - Better Auth handler
- `/api/organizations` - Organization CRUD operations  
- `/api/polar/*` - Billing integration (checkout, portal, webhooks)
- `/api/accept-invitation/[id]` - Organization invitation handling

### UI Components
- `/components/ui/*` - Shadcn/UI base components
- `/components/forms/*` - Authentication and organization forms
- `/components/billing/*` - Polar.sh billing components
- `/components/blocks/*` - Marketing page components (FAQ, testimonials)

## Development Guidelines

### Code Organization
- Keep files under 200 lines maximum
- Use absolute imports with `@/` prefix
- Follow existing patterns for similar functionality
- Maintain clean folder structure

### Database Operations  
- Always use Drizzle ORM, never raw SQL queries
- Generate migrations after schema changes
- Use the relations system for complex queries
- Reference official Drizzle docs when unsure

### Authentication Flow
- Sessions automatically include `activeOrganizationId` 
- Use `getSession()` from `@/lib/auth` for server-side auth checks
- Organization permissions handled through Better Auth roles system

### Billing Integration
- Polar.sh client configured in `lib/auth.ts`
- Webhook events tracked in `webhook_event` table
- Organization billing fields: `polarCustomerId`, `subscriptionStatus`, `currentPlan`

## Environment Variables

Copy `env.example` to `.env.local` and configure:
- Database connection (PostgreSQL)
- Better Auth secrets and URLs  
- Google OAuth credentials
- Resend API key for emails
- Polar.sh access token and webhook secret

## Important Notes

- This codebase uses Polar.sh for billing (not Stripe as shown in env.example)
- Always run `npx tsc --noEmit` and `pnpm build` before committing significant changes
- Use pnpm for all package management operations
- The project targets rapid delivery (2-week client turnaround) over complex features
- also dont auto commit, I will do it.
- dont run pnpm build