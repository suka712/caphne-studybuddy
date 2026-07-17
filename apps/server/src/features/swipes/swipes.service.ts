import { db } from "../../db/db.js";
import { swipes, profiles, matches, SwipeDecision } from "../../db/schema.js";
import { eq, or, notInArray, sql } from "drizzle-orm";

export const getNextCandidate = async (userId: number) => {
  const existingSwipes = await db
    .select({ targetUserId: swipes.targetUserId })
    .from(swipes)
    .where(eq(swipes.userId, userId));

  const existingMatches = await db
    .select({ userId: matches.userId, matchedUserId: matches.matchedUserId })
    .from(matches)
    .where(or(eq(matches.userId, userId), eq(matches.matchedUserId, userId)));

  const excludedProfiles = [
    ...existingSwipes.map((s) => s.targetUserId),
    ...existingMatches.map((m) =>
      m.userId === userId ? m.matchedUserId : m.userId,
    ),
    userId,
  ];

  const [candidate] = await db
    .select()
    .from(profiles)
    .where(notInArray(profiles.userId, excludedProfiles))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  return candidate;
};

export const recordSwipeAndMatch = async (
  userId: number,
  targetUserId: number,
  decision: SwipeDecision,
) => {
  await db.insert(swipes).values({ userId, targetUserId, decision });
};

export const createMatch = async (userId: number, targetUserId: number) => {
  const [match] = await db
    .insert(matches)
    .values({ userId, matchedUserId: targetUserId })
    .returning();

  return match;
};
