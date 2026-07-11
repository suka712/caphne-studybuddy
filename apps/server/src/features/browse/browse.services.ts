import { db } from "../../db/db.js";
import { profiles } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const getRandomPublicProfiles = async () => {
  const publicProfiles = await db.
    select()
    .from(profiles)
    .where(eq(profiles.isPublic, true))
    .orderBy(sql`RANDOM()`)
    .limit(5);

  if (!publicProfiles) {
    return null;
  }
  
  return publicProfiles;
};