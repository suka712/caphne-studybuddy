import { Router } from "express";
import { getAllMatches } from "./matches.services.js";
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
