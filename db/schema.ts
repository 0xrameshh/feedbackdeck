import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp, json, integer } from "drizzle-orm/pg-core";

export const systemRole = pgEnum("system_role", ["user", "admin"]);

export const user = pgTable("user", {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
    image: text('image'),
    systemRole: systemRole('system_role').default("user").notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const session = pgTable("session", {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date())
});

export const organization = pgTable("organization", {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    // Billing fields (Polar.sh)
    polarCustomerId: text('polar_customer_id'),
    subscriptionStatus: text('subscription_status'),
    currentPlan: text('current_plan'),
    subscriptionId: text('subscription_id')
});

export const role = pgEnum("role", ["member", "admin", "owner"]);
export const feedbackCategory = pgEnum("feedback_category", ["general", "bug", "feature", "praise"]);
export const feedbackStatus = pgEnum("feedback_status", ["unread", "read", "responded", "archived"]);

export const member = pgTable("member", {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    role: role('role').default("member").notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

export const webhookEvent = pgTable("webhook_event", {
    id: text('id').primaryKey(),
    polarEventId: text('polar_event_id').unique().notNull(),
    eventType: text('event_type').notNull(),
    processed: boolean('processed').default(false),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

// Feedback system tables
export const project = pgTable("project", {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    domain: text('domain').notNull(),
    widgetSettings: json('widget_settings').$type<{
        triggerText?: string;
        position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
        primaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
    }>().default({}),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const feedback = pgTable("feedback", {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    category: feedbackCategory('category').notNull(),
    rating: integer('rating'), // 1-5 star rating (optional)
    userEmail: text('user_email'),
    pageUrl: text('page_url').notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    status: feedbackStatus('status').default('unread'),
    metadata: json('metadata').$type<{
        browserInfo?: string;
        screenResolution?: string;
        device?: string;
        referrer?: string;
    }>().default({}),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

export const feedbackResponse = pgTable("feedback_response", {
    id: text('id').primaryKey(),
    feedbackId: text('feedback_id').notNull().references(() => feedback.id, { onDelete: 'cascade' }),
    adminId: text('admin_id').notNull().references(() => user.id),
    message: text('message').notNull(),
    sentAt: timestamp('sent_at').$defaultFn(() => new Date()).notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

// Relations
export const organizationRelations = relations(organization, ({ many }) => ({
    members: many(member),
    projects: many(project)
}));

export const memberRelations = relations(member, ({ one }) => ({
    organization: one(organization, {
        fields: [member.organizationId],
        references: [organization.id]
    }),
    user: one(user, {
        fields: [member.userId],
        references: [user.id]
    })
}));

export const projectRelations = relations(project, ({ one, many }) => ({
    organization: one(organization, {
        fields: [project.organizationId],
        references: [organization.id]
    }),
    user: one(user, {
        fields: [project.userId],
        references: [user.id]
    }),
    feedback: many(feedback)
}));

export const feedbackRelations = relations(feedback, ({ one, many }) => ({
    project: one(project, {
        fields: [feedback.projectId],
        references: [project.id]
    }),
    responses: many(feedbackResponse)
}));

export const feedbackResponseRelations = relations(feedbackResponse, ({ one }) => ({
    feedback: one(feedback, {
        fields: [feedbackResponse.feedbackId],
        references: [feedback.id]
    }),
    admin: one(user, {
        fields: [feedbackResponse.adminId],
        references: [user.id]
    })
}));

// Type exports
export type User = typeof user.$inferSelect;
export type Organization = typeof organization.$inferSelect;
export type Member = typeof member.$inferSelect;
export type Role = (typeof role.enumValues)[number];
export type SystemRole = (typeof systemRole.enumValues)[number];
export type Project = typeof project.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type FeedbackResponse = typeof feedbackResponse.$inferSelect;
export type FeedbackCategory = (typeof feedbackCategory.enumValues)[number];
export type FeedbackStatus = (typeof feedbackStatus.enumValues)[number];

export const schema = { 
    user, 
    session, 
    account, 
    verification, 
    organization, 
    member, 
    webhookEvent,
    project,
    feedback,
    feedbackResponse,
    organizationRelations, 
    memberRelations,
    projectRelations,
    feedbackRelations,
    feedbackResponseRelations
};