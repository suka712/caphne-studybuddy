import { db } from "../../db/db.js";
import { profiles } from "../../db/schema.js";
import { eq, desc, and, ne, or, lt, arrayOverlaps, count } from "drizzle-orm";

export type DiscoverFilters = {
  major?: string;
  year?: string;
  interests?: string[];
};

export const getPublicProfiles = async (
  userId: number,
  cursor?: { updatedAt: Date; id: number },
  limit: number = 10,
  filters?: DiscoverFilters,
) => {
  const publicProfiles = await db
    .select()
    .from(profiles)
    .where(and(
      eq(profiles.isPublic, true),
      ne(profiles.userId, userId),
      filters?.major ? eq(profiles.major, filters.major) : undefined,
      filters?.year ? eq(profiles.year, filters.year) : undefined,
      filters?.interests && filters.interests.length > 0
        ? arrayOverlaps(profiles.interests, filters.interests)
        : undefined,
      cursor ? or(
        lt(profiles.updatedAt, cursor.updatedAt),
        and(eq(profiles.updatedAt, cursor.updatedAt), lt(profiles.id, cursor.id))
      )
        : undefined
    ))
    .orderBy(desc(profiles.updatedAt))
    .limit(limit);

  return publicProfiles;
};

export const countPublicProfiles = async (userId: number) => {
  const [row] = await db
    .select({ count: count() })
    .from(profiles)
    .where(and(eq(profiles.isPublic, true), ne(profiles.userId, userId)));

  return row?.count ?? 0;
};
