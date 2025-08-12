# Polar.sh Integration Guide

## Overview
Polar.sh is an open-source Merchant of Record providing modern billing solutions for developers and designers. It offers excellent integration with Better Auth and is ideal for SaaS applications.

## Key Features
- **Better Auth Integration**: Native plugin support for seamless authentication + billing
- **Multiple Payment Types**: One-time purchases and subscriptions
- **Customer Portal**: Self-service customer management
- **Usage-based Billing**: Track and bill for consumption
- **Webhooks**: Real-time event notifications
- **Developer-friendly**: Built specifically for developers

## Next.js Integration

### Installation
```bash
pnpm install @polar-sh/nextjs @polar-sh/better-auth @polar-sh/sdk zod
```

### Environment Variables
```bash
POLAR_ACCESS_TOKEN="polar_pat_..."
POLAR_WEBHOOK_SECRET="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Better Auth Configuration
```typescript
import { betterAuth } from "better-auth";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: 'sandbox' // or 'production'
});

export const auth = betterAuth({
    // ... Better Auth config
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "123-456-789",
                            slug: "pro"
                        }
                    ],
                    successUrl: "/success?checkout_id={CHECKOUT_ID}",
                    authenticatedUsersOnly: true
                }),
                portal(),
                usage(),
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SECRET,
                    onOrderPaid: (payload) => {
                        // Handle successful payment
                    },
                    onCustomerStateChanged: (payload) => {
                        // Handle customer changes
                    }
                })
            ],
        })
    ]
});
```

### API Routes

#### Checkout Route
```typescript
// app/api/checkout/route.ts
import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: process.env.NEXT_PUBLIC_APP_URL + "/success?checkout_id={CHECKOUT_ID}",
  server: "sandbox"
});
```

#### Customer Portal Route
```typescript
// app/api/portal/route.ts
import { CustomerPortal } from "@polar-sh/nextjs";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  getCustomerId: (req) => {
    // Return Polar customer ID from your auth system
    return "";
  },
  server: "sandbox"
});
```

#### Webhooks Route
```typescript
// app/api/webhooks/polar/route.ts
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  onOrderPaid: async (order) => {
    // Update user subscription status
  },
  onCustomerStateChanged: async (customer) => {
    // Update customer data
  }
});
```

### Client Usage
```typescript
import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";

export const authClient = createAuthClient({
  plugins: [polarClient()]
});

// In components
const { data: orders } = await authClient.customer.orders.list();
```

## Migration from Stripe

### 1. Remove Stripe Dependencies
- Remove `stripe` package
- Remove Stripe-related environment variables
- Remove Stripe webhook handlers

### 2. Update Database Schema
- Replace Stripe-specific fields with Polar equivalents
- Update subscription/payment tracking

### 3. Update Components
- Replace Stripe checkout with Polar checkout
- Update billing portal links
- Update subscription status checks

## Benefits over Stripe
- **Developer-focused**: Built specifically for developers
- **Better Auth Integration**: Native plugin support
- **Open Source**: Transparent and community-driven
- **Simpler Setup**: Less configuration required
- **India Support**: Works in regions where Stripe doesn't