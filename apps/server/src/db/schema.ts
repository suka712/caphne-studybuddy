import { pgTable, serial, text, timestamp, integer, boolean, date } from 'drizzle-orm/pg-core';

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

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  gender: text('gender').notNull(), // 'male' | 'female' | 'other'
  birthday: date('birthday'),
  year: text('year').notNull(), // 'year-1' | 'year-2' | ... | 'alumni' | 'other'
  major: text('major').notNull(),
  bio: text('bio'),
  photoUrl: text('photo_url'),
  isPublic: boolean('is_public').default(false),
  goals: text('goals').array(), // ['study-buddy', 'project-teammate', ...]
  vibes: text('vibes').array(), // ['introvert', 'night-owl', ...]
  interests: text('interests').array(), // ['Programming', 'Web Dev', ...]
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert

export const emailCollection = pgTable('email_collection', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  collectedAt: timestamp('collected_at').defaultNow(),
});
