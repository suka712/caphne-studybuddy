import { Router } from "express";
import { getAllMatches, findOrCreatePublicMatch } from "./matches.services.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { User } from "../../db/schema.js";

export const matchesRouter = Router();

matchesRouter.get("/", requireAuth, async (req, res) => {
  const user = req.user as User;

  try {
    const result = await getAllMatches(user.id);
    res.json(result);
  } catch (e) {
    console.log(`Error getting all matches: ${e}`);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start a chat with a profile found through Discover.
matchesRouter.post("/:targetUserId", requireAuth, async (req, res) => {
  const user = req.user as User;
  const targetUserId = Number(req.params.targetUserId);

  if (isNaN(targetUserId) || targetUserId === user.id) {
    res.status(400).json({ error: "Invalid target user" });
    return;
  }

  try {
    const match = await findOrCreatePublicMatch(user.id, targetUserId);
    if (!match) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json({ match });
  } catch (e) {
    console.log(`Error starting chat: ${e}`);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Internal for profile display
matchesRouter.get("/count", requireAuth, async (req, res) => {
  const user = req.user as User;

  try {
    const result = await getAllMatches(user.id);
    res.json({ matchCount: result.matches.length });
  } catch (e) {
    console.log(`Error getting match count: ${e}`);
    res.status(500).json({ error: "Something went wrong" });
  }
});
