import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getPublicProfiles } from "./browse.services.js";

export const browseRouter = Router();

browseRouter.get("/", requireAuth, async (req, res) => {
  const { updatedAt, id } = req.query;
  const cursor =
    updatedAt && id
      ? { updatedAt: new Date(updatedAt as string), id: Number(id) }
      : undefined;
  const user = req.user!;

  const profiles = await getPublicProfiles(user.id, cursor, 10);
  const nextCursor =
    profiles.length > 0
      ? {
          updatedAt: profiles[profiles.length - 1].updatedAt,
          id: profiles[profiles.length - 1].id,
        }
      : null;

  res.status(200).json({ profiles, nextCursor });
});
