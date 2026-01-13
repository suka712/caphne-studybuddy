import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

/* ---------- USERS ---------- */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

/* ---------- EMAIL COLLECTION ---------- */
export const emailCollection = pgTable('email_collection', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  collectedAt: timestamp('collected_at').defaultNow(),
});
