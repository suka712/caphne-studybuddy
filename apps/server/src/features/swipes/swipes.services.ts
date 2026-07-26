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
import { redis } from "../../db/redis.js";

const todayDateString = () => new Date().toISOString().slice(0, 10);

const batchCacheKey = (userId: number) =>
  `swipe-batch:${userId}:${todayDateString()}`;

// TTL until midnight, so the cache expires exactly when a new batch is due.
const secondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
};

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
    .where(notInArray(profiles.userId, excludedProfiles),)
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
  const cacheKey = batchCacheKey(userId);

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as typeof dailyBatches.$inferSelect;

  const [existing] = await db
    .select()
    .from(dailyBatches)
    .where(
      and(
        eq(dailyBatches.userId, userId),
        eq(dailyBatches.batchDate, todayDateString()),
      ),
    );

  const batch = existing ?? (await generateTodaysBatch(userId));

  await redis.set(cacheKey, JSON.stringify(batch), {
    EX: secondsUntilMidnight(),
  });

  return batch;
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
