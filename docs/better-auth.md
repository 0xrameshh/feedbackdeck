# Better Auth Documentation

## Overview
Better Auth is a framework-agnostic authentication and authorization library for TypeScript. It provides comprehensive authentication features with a plugin ecosystem for advanced functionalities like 2FA, multi-tenancy, and SSO.

## Installation

```bash
pnpm add better-auth
```

## Basic Setup

### Environment Variables
Add these required environment variables to your `.env` file:

```bash
BETTER_AUTH_SECRET="your-better-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

### Server Configuration (`lib/auth.ts`)
```typescript
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

export const auth = betterAuth({
  database: new Database("database.db"),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }
  }
});

// TypeScript type inference
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
```

### Client Configuration (`lib/auth-client.ts`)
```typescript
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  // Configuration options
});
```

## Authentication Methods

### Email and Password
```typescript
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  // other configurations...
});
```

### Social Providers
```typescript
export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  }
});
```

## Session Management

### Custom Session Plugin
```typescript
import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    customSession(async ({ user, session }) => {
      const roles = findUserRoles(session.session.userId);
      
      return {
        roles,
        user: {
          ...user,
          newField: "newField"
        },
      };
    })
  ]
});
```

### Session Management Methods
```typescript
// Revoke all other sessions (except current)
await authClient.revokeOtherSessions();

// Revoke all sessions
await authClient.revokeSessions();
```

### Client-Side Session Setup
```typescript
import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

const authClient = createAuthClient({
  plugins: [
    customSessionClient
  ]
});
```

## Next.js Integration

### Authentication Handler (API Route)
```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";

export const { GET, POST } = auth.handler;
```

### Server Components
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function ServerComponent() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      Welcome, {session.user.name}!
    </div>
  );
}
```

### Server Actions
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const someAuthenticatedAction = async () => {
  "use server";
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    throw new Error("Not authenticated");
  }
  
  // Perform authenticated action
};
```

### Middleware
```typescript
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

## Plugins and Extensions

### Admin Plugin
```typescript
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    admin({
      impersonationSessionDuration: 60 * 60 * 24, // 1 day
    })
  ]
});
```

#### Client-side Admin
```typescript
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    adminClient()
  ]
});

// Admin operations
await authClient.admin.impersonateUser({ userId: "user_id" });
```

### Generic OAuth Plugin
```typescript
import { genericOAuth } from "better-auth/plugins";
import { genericOAuthClient } from "better-auth/client/plugins";

// Server
export const auth = betterAuth({
  plugins: [
    genericOAuth({
      // OAuth configuration
    })
  ]
});

// Client
export const authClient = createAuthClient({
  plugins: [
    genericOAuthClient({
      // OAuth client configuration
    })
  ]
});
```

### Magic Link Plugin
Basic setup for magic link authentication (refer to plugin docs for detailed configuration).

## Custom Plugins

### Creating a Custom Plugin
```typescript
import { createAuthMiddleware, BetterAuthPlugin } from "better-auth/plugins";
import { sessionMiddleware } from "better-auth/api";

const myPlugin = (): BetterAuthPlugin => {
  return {
    id: "my-plugin",
    endpoints: {
      getHelloWorld: createAuthEndpoint("/my-plugin/hello-world", {
        method: "GET",
        use: [sessionMiddleware], 
      }, async (ctx) => {
        const session = ctx.context.session;
        return ctx.json({
          message: "Hello World"
        });
      })
    }
  };
};
```

### Custom Middleware
```typescript
const authMiddleware = createAuthMiddleware(async (ctx) => {
  const session = await getSessionFromCtx(ctx);
  
  return {
    context: ctx
  };
});
```

## Database Integration

### With Drizzle ORM
```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // "pg" | "mysql" | "sqlite"
  }),
});
```

### Database Schema Requirements
Better Auth requires specific database tables. It can automatically create them or you can define them manually in your schema.

## Authorization and Access Control

### Role-Based Access Control
```typescript
// Define roles in your session
const auth = betterAuth({
  plugins: [
    customSession(async ({ user, session }) => {
      const userRoles = await getUserRoles(user.id);
      
      return {
        roles: userRoles,
        user: {
          ...user,
          roles: userRoles
        }
      };
    })
  ]
});
```

### Authorization Rules Example
```typescript
const authorizationRules = {
  "sessions": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.userId"
    ],
    "allow": {
      "view": "isOwner",
      "create": "false",
      "delete": "false",
      "update": "false"
    }
  },
  "profiles": {
    "bind": [
      "isOwner", 
      "auth.id != null && auth.id == data.id"
    ],
    "allow": {
      "view": "true"
    }
  }
};
```

## Integration with Other Frameworks

### Fastify Integration
```typescript
import Fastify from 'fastify';
import { auth } from './auth';

const server = Fastify();

server.route({
  method: ['GET', 'POST'],
  url: '/auth/*',
  handler: async (request, reply) => {
    return auth.handler(request.raw, reply.raw);
  }
});
```

### Elysia Integration
```typescript
import { Elysia } from "elysia";
import { auth } from "./auth";

const app = new Elysia()
  .all("/api/auth/*", ({ request }) => auth.handler(request))
  .listen(3000);
```

## Security Features

### Session Token Access
```typescript
// Access session token name for custom cookie handling
const cookieName = ctx.context.authCookies.sessionToken.name;
```

### Hooks and Lifecycle Events
Better Auth provides various hooks for customizing authentication flows:

```typescript
export const auth = betterAuth({
  hooks: {
    after: {
      signIn: async (user, session) => {
        // Custom logic after sign in
      }
    }
  }
});
```

## TypeScript Support

### Type Inference
```typescript
// Server types
type Session = typeof auth.$Infer.Session;
type User = typeof auth.$Infer.User;

// Client types (automatically inferred from server)
import type { auth } from "@/lib/auth";
```

### NestJS Integration
```typescript
import { Controller, Get } from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UserController {
  @Get('me')
  async getProfile(@Session() session: UserSession) {
    return session;
  }
}
```

## Best Practices

### 1. Environment Configuration
- Always use environment variables for secrets
- Use different configurations for development/production
- Keep API keys and secrets secure

### 2. Session Management
- Implement proper session cleanup
- Use appropriate session durations
- Handle session expiration gracefully

### 3. Security
- Validate all authentication requests
- Implement rate limiting
- Use HTTPS in production
- Regularly rotate secrets

### 4. Database
- Use connection pooling for database connections
- Implement proper indexing on user-related tables
- Regular backup of authentication data

### 5. Error Handling
- Provide meaningful error messages
- Log authentication events
- Handle network failures gracefully

## Migration and Deployment

### Environment Setup
1. Set up environment variables in production
2. Configure database connections
3. Set up OAuth providers
4. Configure CORS and security headers

### Monitoring
- Monitor authentication success/failure rates
- Track session creation and cleanup
- Alert on unusual authentication patterns

This documentation provides a comprehensive guide to using Better Auth in your SaaS application. The framework's flexibility allows for extensive customization while providing secure defaults out of the box.