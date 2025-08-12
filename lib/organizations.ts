import { db } from '@/db';
import { organization, member, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

function generateId() {
  return crypto.randomUUID();
}

export async function createOrganization(name: string, userId: string) {
  const orgId = generateId();
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  // Create organization
  const [newOrg] = await db.insert(organization).values({
    id: orgId,
    name,
    slug,
  }).returning();

  // Add creator as owner
  await db.insert(member).values({
    id: generateId(),
    organizationId: orgId,
    userId,
    role: 'owner'
  });

  return newOrg;
}

export async function getUserOrganizations(userId: string) {
  const memberships = await db
    .select({
      organization,
      member,
    })
    .from(member)
    .leftJoin(organization, eq(organization.id, member.organizationId))
    .where(eq(member.userId, userId));

  return memberships.map(m => ({
    ...m.organization!,
    role: m.member.role
  }));
}

export async function getOrganizationMembers(organizationId: string) {
  const members = await db
    .select({
      member,
      user,
    })
    .from(member)
    .leftJoin(user, eq(user.id, member.userId))
    .where(eq(member.organizationId, organizationId));

  return members.map(m => ({
    ...m.user!,
    role: m.member.role,
    joinedAt: m.member.createdAt
  }));
}

export async function isOrganizationAdmin(userId: string, organizationId: string) {
  const membership = await db
    .select()
    .from(member)
    .where(and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ))
    .limit(1);

  return membership[0]?.role === 'admin' || membership[0]?.role === 'owner';
}