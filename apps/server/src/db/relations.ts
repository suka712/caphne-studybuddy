import { relations } from 'drizzle-orm';
import { profiles, interests, profileInterests } from './schema.js';

export const profilesRelations = relations(profiles, ({ many }) => ({
  interests: many(profileInterests),
}));

export const interestsRelations = relations(interests, ({ many }) => ({
  profiles: many(profileInterests),
}));

export const profileInterestsRelations = relations(
  profileInterests,
  ({ one }) => ({
    profile: one(profiles, {
      fields: [profileInterests.profileId],
      references: [profiles.id],
    }),
    interest: one(interests, {
      fields: [profileInterests.interestId],
      references: [interests.id],
    }),
  }),
);
