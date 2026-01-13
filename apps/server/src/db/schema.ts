import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ---------- PROFILES ---------- */
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  bio: text('bio'),
  major: text('major'),
  createdAt: timestamp('created_at').defaultNow(),
});

/* ---------- INTERESTS ---------- */
export const interests = pgTable('interests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

/* ---------- PROFILE_INTERESTS ---------- */
export const profileInterests = pgTable('profile_interests', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id')
    .references(() => profiles.id)
    .notNull(),
  interestId: integer('interest_id')
    .references(() => interests.id)
    .notNull(),
});

/* ---------- RELATIONS ---------- */
export const profilesRelations = relations(profiles, ({ many }) => ({
  interests: many(profileInterests),
}));

export const interestsRelations = relations(interests, ({ many }) => ({
  profiles: many(profileInterests),
}));
