import { pgTable, serial, text, timestamp, integer, boolean, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  googleId: text('google_id').unique(),
  githubId: text('github_id').unique(),
});

export type User = typeof users.$inferSelect

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  gender: text('gender').notNull(), // 'male' | 'female' | 'other'
  birthday: date('birthday'),
  year: text('year').notNull(), // 'year-1' | 'year-2' | ... | 'alumni' | 'other'
  major: text('major').notNull(),
  bio: text('bio').notNull().default(''),
  photoUrl: text('photo_url'),
  isPublic: boolean('is_public').notNull().default(false),
  goals: text('goals').array().notNull(), // ['study-buddy', 'project-teammate', ...]
  vibes: text('vibes').array().notNull(), // ['introvert', 'night-owl', ...]
  interests: text('interests').array().notNull(), // ['Programming', 'Web Dev', ...]
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const emailCollection = pgTable('email_collection', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  collectedAt: timestamp('collected_at', { withTimezone: true }).notNull().defaultNow(),
});

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  matchedUserId: integer('matched_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// export const matchInteractions = pgTable('match_interactions', {
//   id: serial('id').primaryKey(),
//   userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
//   matchedUserId: integer('matched_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
//   action: text('action').notNull(), // 'accepted' | 'rejected' | 'messaged' | 'unmatched'
//   createdAt: timestamp('created_at').defaultNow(),
// });

// export const matchQuota = pgTable('match_quota', {
//   id: serial('id').primaryKey(),
//   userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
//   matchesGivenToday: integer('matches_given_today').default(0),
//   lastResetAt: timestamp('last_reset_at').defaultNow(),
// });
