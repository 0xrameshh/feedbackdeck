import { db } from "@/db";
import * as schema from "@/db/schema";

import { sendEmail } from "@/lib/email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { Polar } from "@polar-sh/sdk";


// Export Polar client for use in API routes
export const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN as string,
    server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
});

export const auth = betterAuth({
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
        updateAge: 60 * 60 * 24, // Update session every day
        cookieCache: {
            enabled: true,
            maxAge: 60 * 15 // Cache for 15 minutes
        }
    },
    cookies: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Better for cross-origin scenarios
        httpOnly: true,
    },
    advanced: {
        cookiePrefix: "hark",
        database: {
            generateId: () => crypto.randomUUID(),
        },
    },
    emailVerification: process.env.RESEND_API_KEY ? {
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Verify your email",
                html: `<h1>Welcome ${user.name}!</h1><p>Click <a href="${url}">here</a> to verify your email.</p>`,
            });
        },
        sendOnSignUp: true,
    } : undefined,
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: process.env.RESEND_API_KEY ? async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                html: `<h1>Hi ${user.name}</h1><p>Click <a href="${url}">here</a> to reset your password.</p>`,
            });
        } : undefined,
        requireEmailVerification: false
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    plugins: [nextCookies()]
});

export const GET = auth.handler;
export const POST = auth.handler;
export const { getSession } = auth.api;
