import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getPublicProfiles } from "./discover.services.js";

export const discoverRouter = Router();

const LIMIT = 10;

discoverRouter.get("/", requireAuth, async (req, res) => {
  const { updatedAt, id } = req.query;
  const cursor =
    updatedAt && id
      ? { updatedAt: new Date(updatedAt as string), id: Number(id) }
      : undefined;
  const user = req.user!;

  const rows = await getPublicProfiles(user.id, cursor, LIMIT + 1);
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
