import { db } from "../../db/db.js";
import {
  swipes,
  profiles,
  matches,
  dailyBatches,
  SwipeDecision,
} from "../../db/schema.js";
import { and, eq, inArray, notInArray, or, sql } from "drizzle-orm";
import { matchConfig } from "../../config/matchConfig.js";

const todayDateString = () => new Date().toISOString().slice(0, 10);

const generateTodaysBatch = async (userId: number) => {
  const existingMatches = await db
    .select({ userId: matches.userId, matchedUserId: matches.matchedUserId })
    .from(matches)
    .where(or(eq(matches.userId, userId), eq(matches.matchedUserId, userId)));

  const existingSwipes = await db
    .select({ targetUserId: swipes.targetUserId })
    .from(swipes)
    .where(eq(swipes.userId, userId));

  const excludedProfiles = [
    ...existingSwipes.map((s) => s.targetUserId),
    ...existingMatches.map((m) =>
      m.userId === userId ? m.matchedUserId : m.userId,
    ),
    userId,
  ];

  const candidates = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(
      and(
        eq(profiles.isPublic, true),
        notInArray(profiles.userId, excludedProfiles),
      ),
    )
    .orderBy(sql`RANDOM()`)
    .limit(matchConfig.swipesPerDay);

  const [batch] = await db
    .insert(dailyBatches)
    .values({
      userId,
      batchDate: todayDateString(),
      candidateUserIds: candidates.map((c) => c.userId),
    })
    .onConflictDoNothing()
    .returning();

  if (batch) return batch;

  // Race condition guard
  const [existing] = await db
    .select()
    .from(dailyBatches)
    .where(
      and(
        eq(dailyBatches.userId, userId),
        eq(dailyBatches.batchDate, todayDateString()),
      ),
    );

  return existing!;
};

export const getOrCreateTodaysBatch = async (userId: number) => {
  const [existing] = await db
    .select()
    .from(dailyBatches)
    .where(
      and(
        eq(dailyBatches.userId, userId),
        eq(dailyBatches.batchDate, todayDateString()),
      ),
    );

  if (existing) return existing;

  return generateTodaysBatch(userId);
};

export const isInTodaysBatch = async (userId: number, targetUserId: number) => {
  const batch = await getOrCreateTodaysBatch(userId);
  return batch.candidateUserIds.includes(targetUserId);
};

export const getRemainingCandidates = async (userId: number) => {
  const batch = await getOrCreateTodaysBatch(userId);

  const existingSwipes = await db
    .select({ targetUserId: swipes.targetUserId })
    .from(swipes)
    .where(eq(swipes.userId, userId));

  const swipedIds = new Set(existingSwipes.map((s) => s.targetUserId));
  const remainingIds = batch.candidateUserIds.filter(
    (id) => !swipedIds.has(id),
  );

  if (remainingIds.length === 0) return [];

  const candidates = await db
    .select()
    .from(profiles)
    .where(inArray(profiles.userId, remainingIds));

  // Preserve the batch's original order rather than whatever order the DB returns.
  const byId = new Map(candidates.map((c) => [c.userId, c]));
  return remainingIds.map((id) => byId.get(id)!).filter(Boolean);
};

export const recordSwipe = async (
  userId: number,
  targetUserId: number,
  decision: SwipeDecision,
) => {
  await db
    .insert(swipes)
    .values({ userId, targetUserId, decision })
    .onConflictDoNothing();
};

export const createMatch = async (userId: number, targetUserId: number) => {
  const [match] = await db
    .insert(matches)
    .values({ userId, matchedUserId: targetUserId })
    .returning();

  return match;
};
