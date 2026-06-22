import { db } from "../../db/db.js";
import { matches, messages, users, profiles } from "../../db/schema.js";
import { and, count, eq, isNull, ne, notInArray, sql } from "drizzle-orm";
import { userIsOnline } from "../chat/socket.js";

export const generateMatch = async (userId: number) => {
  const existingMatches = await db
    .select({ matchedUserId: matches.matchedUserId })
    .from(matches)
    .where(eq(matches.userId, userId));

  const excludeIds = [userId, ...existingMatches.map((m) => m.matchedUserId)];

  const [candidate] = await db
    .select()
    .from(users)
    .where(notInArray(users.id, excludeIds))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!candidate) {
    return { match: null };
  }

  const [newMatch] = await db
    .insert(matches)
    .values({ userId, matchedUserId: candidate.id })
    .returning();

  return newMatch;
};

export const getAllMatches = async (userId: number) => {
  const unreadSq = db
    .select({
      matchId: messages.matchId,
      unreadCount: count(messages.id).as("unread_count"),
    })
    .from(messages)
    .where(and(ne(messages.senderId, userId), isNull(messages.readAt)))
    .groupBy(messages.matchId)
    .as("unread_sq");

  const selectFields = {
    matchId: matches.id,
    matchedUserId: users.id,
    displayName: profiles.displayName,
    major: profiles.major,
    year: profiles.year,
    photoUrl: profiles.photoUrl,
    matchedAt: matches.createdAt,
    lastActiveAt: users.lastActiveAt,
    unreadCount: sql<number>`coalesce(${unreadSq.unreadCount}, 0)`.as(
      "unread_count",
    ),
    lastMessageAt: matches.lastMessageAt,
  };

  const initiated = await db
    .select(selectFields)
    .from(matches)
    .innerJoin(users, eq(matches.matchedUserId, users.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(unreadSq, eq(unreadSq.matchId, matches.id))
    .where(eq(matches.userId, userId));

  const received = await db
    .select(selectFields)
    .from(matches)
    .innerJoin(users, eq(matches.userId, users.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(unreadSq, eq(unreadSq.matchId, matches.id))
    .where(eq(matches.matchedUserId, userId));

  const seen = new Set<number>();
  const userMatches = [...initiated, ...received]
    .sort((a, b) => {
      const aTime = a.lastMessageAt
        ? new Date(a.lastMessageAt).getTime()
        : new Date(a.matchedAt).getTime();
      const bTime = b.lastMessageAt
        ? new Date(b.lastMessageAt).getTime()
        : new Date(b.matchedAt).getTime();
      return bTime - aTime;
    })
    .filter((m) => {
      if (seen.has(m.matchId)) return false;
      seen.add(m.matchId);
      return true;
    })
    .map(({ matchedUserId, unreadCount, ...rest }) => ({
      ...rest,
      unreadCount: Number(unreadCount),
      isOnline: userIsOnline(matchedUserId),
    }));

  return { matches: userMatches };
};
