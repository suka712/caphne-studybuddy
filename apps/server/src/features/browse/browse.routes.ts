import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getRandomPublicProfiles } from "./browse.services.js";

export const browseRouter = Router();

browseRouter.get("/", requireAuth, async (_req, res) => {
  const profiles = await getRandomPublicProfiles();
  res.status(200).json(profiles);
});
