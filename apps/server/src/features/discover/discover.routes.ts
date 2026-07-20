import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getPublicProfiles, countPublicProfiles } from "./discover.services.js";

export const discoverRouter = Router();

const LIMIT = 10;

// Internal for profile display
discoverRouter.get("/count", requireAuth, async (req, res) => {
  const user = req.user!;

  try {
    const publicProfiles = await countPublicProfiles(user.id);
    res.json({ publicProfiles });
  } catch (e) {
    console.log(`Error getting public profile count: ${e}`);
    res.status(500).json({ error: "Something went wrong" });
  }
});

discoverRouter.get("/", requireAuth, async (req, res) => {
  const { updatedAt, id, major, year, interests } = req.query;
  const cursor =
    updatedAt && id
      ? { updatedAt: new Date(updatedAt as string), id: Number(id) }
      : undefined;
  const user = req.user!;

  const filters = {
    major: typeof major === "string" ? major : undefined,
    year: typeof year === "string" ? year : undefined,
    interests: Array.isArray(interests)
      ? (interests as string[])
      : typeof interests === "string"
        ? [interests]
        : undefined,
  };

  const rows = await getPublicProfiles(user.id, cursor, LIMIT + 1, filters);
  const hasMore = rows.length > LIMIT;
  const profiles = hasMore ? rows.slice(0, LIMIT) : rows;
  const nextCursor = hasMore
    ? {
        updatedAt: profiles[profiles.length - 1].updatedAt,
        id: profiles[profiles.length - 1].id,
      }
    : null;

  res.status(200).json({ profiles, nextCursor });
});
