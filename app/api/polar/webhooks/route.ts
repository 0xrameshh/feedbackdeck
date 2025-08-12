import { Webhooks } from "@polar-sh/nextjs";
import { db } from "@/db";
import { organization, webhookEvent } from "@/db/schema";
import { eq } from "drizzle-orm";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET as string,
  onPayload: async (payload) => {
    console.log('Received webhook:', payload.type);
    
    // Log webhook event
    try {
      await db.insert(webhookEvent).values({
        id: crypto.randomUUID(),
        polarEventId: `webhook_${Date.now()}`,
        eventType: payload.type,
        processed: false
      });
    } catch (error) {
      console.error('Failed to log webhook event:', error);
    }
    
    // Handle different event types
    switch (payload.type) {
      case 'order.paid':
        await handleOrderPaid(payload.data);
        break;
      case 'customer.state_changed':
        await handleCustomerStateChanged(payload.data);
        break;
      case 'subscription.created':
        await handleSubscriptionCreated(payload.data);
        break;
      case 'subscription.canceled':
        await handleSubscriptionCanceled(payload.data);
        break;
      default:
        console.log('Unhandled webhook event:', payload.type);
    }
  }
});

async function handleOrderPaid(data: Record<string, unknown>) {
  console.log('Order paid:', data);
  
  try {
    // Update organization subscription status if this is a subscription payment
    if (data.subscription_id && data.customer_id) {
      await db
        .update(organization)
        .set({
          subscriptionStatus: 'active',
          subscriptionId: data.subscription_id as string
        })
        .where(eq(organization.polarCustomerId, data.customer_id as string));
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

async function handleCustomerStateChanged(data: Record<string, unknown>) {
  console.log('Customer state changed:', data);
  
  try {
    // Update customer information in organization table
    if (data.id) {
      await db
        .update(organization)
        .set({
          // Update relevant customer fields based on the payload
        })
        .where(eq(organization.polarCustomerId, data.id as string));
    }
  } catch (error) {
    console.error('Error handling customer state change:', error);
  }
}

async function handleSubscriptionCreated(data: Record<string, unknown>) {
  console.log('Subscription created:', data);
  
  try {
    // Update organization with new subscription
    if (data.customer_id) {
      await db
        .update(organization)
        .set({
          subscriptionStatus: (data.status as string) || 'active',
          subscriptionId: data.id as string,
          currentPlan: ((data.price as Record<string, unknown>)?.product as Record<string, unknown>)?.name as string
        })
        .where(eq(organization.polarCustomerId, data.customer_id as string));
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionCanceled(data: Record<string, unknown>) {
  console.log('Subscription canceled:', data);
  
  try {
    // Update organization subscription status
    if (data.customer_id) {
      await db
        .update(organization)
        .set({
          subscriptionStatus: 'canceled'
        })
        .where(eq(organization.polarCustomerId, data.customer_id as string));
    }
  } catch (error) {
    console.error('Error handling subscription canceled:', error);
  }
}

