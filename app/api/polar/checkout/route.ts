import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN as string,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
});