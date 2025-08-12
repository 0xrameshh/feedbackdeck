import { polarClient } from "@/lib/auth";
import { db } from "@/db";
import { organization } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Create a Polar customer for an organization
 * This is called when an organization is created to ensure billing is set up
 */
export async function createPolarCustomer(organizationId: string, organizationName: string, userEmail: string) {
  try {
    // Create customer in Polar
    const customer = await polarClient.customers.create({
      name: organizationName,
      email: userEmail
    });

    // Update organization with Polar customer ID
    await db
      .update(organization)
      .set({
        polarCustomerId: customer.id
      })
      .where(eq(organization.id, organizationId));

    console.log(`Created Polar customer ${customer.id} for organization ${organizationName}`);
    return customer.id;
    
  } catch (error) {
    console.error('Failed to create Polar customer:', error);
    // Don't throw - we don't want to break organization creation if Polar fails
    return null;
  }
}

/**
 * Get or create Polar customer for an organization
 * Used when accessing billing features to ensure customer exists
 */
export async function ensurePolarCustomer(organizationId: string) {
  try {
    // Check if organization already has a Polar customer ID
    const org = await db
      .select()
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

    if (!org[0]) {
      throw new Error('Organization not found');
    }

    // If already has customer ID, return it
    if (org[0].polarCustomerId) {
      return org[0].polarCustomerId;
    }

    // Create new customer if none exists
    const customerId = await createPolarCustomer(
      organizationId, 
      org[0].name, 
      'noreply@example.com' // Fallback email - ideally get from owner
    );

    return customerId;
    
  } catch (error) {
    console.error('Failed to ensure Polar customer:', error);
    throw error;
  }
}