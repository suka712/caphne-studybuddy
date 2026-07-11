import { db } from "../../db/db.js";
import { profiles } from "../../db/schema.js";
import { eq, desc, and, ne, or, lt } from "drizzle-orm";

export const getPublicProfiles = async (
  userId: number,
  cursor?: { updatedAt: Date; id: number },
  limit: number = 10,
) => {
  const publicProfiles = await db
    .select()
    .from(profiles)
    .where(and(
      eq(profiles.isPublic, true),
      ne(profiles.userId, userId),
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
