import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

/* ---------- USERS ---------- */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  googleId: text('google_id').unique(),
  githubId: text('github_id').unique(),
});

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

/* ---------- EMAIL COLLECTION ---------- */
export const emailCollection = pgTable('email_collection', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  collectedAt: timestamp('collected_at').defaultNow(),
});
