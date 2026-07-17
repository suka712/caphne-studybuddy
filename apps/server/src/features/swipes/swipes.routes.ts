import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  getRemainingCandidates,
  isInTodaysBatch,
  recordSwipe,
  createMatch,
} from "./swipes.services.js";
import { User } from "../../db/schema.js";

export const swipesRouter = Router();

swipesRouter.get("/", requireAuth, async (req, res) => {
  const user = req.user as User;

  try {
    const profiles = await getRemainingCandidates(user.id);
    res.json({ profiles });
  } catch (e) {
    console.log(`Error getting swipe batch: ${e}`);
    res.status(500).json({ error: "Something went wrong" });
  }
});

swipesRouter.post("/", requireAuth, async (req, res) => {
  const user = req.user as User;
  const { targetUserId, decision } = req.body;

  if (
    typeof targetUserId !== "number" ||
    (decision !== "like" && decision !== "pass")
  ) {
    return res.status(400).json({ error: "Invalid swipe payload" });
  }

  try {
    if (!(await isInTodaysBatch(user.id, targetUserId))) {
      return res.status(400).json({
        error: "This profile isn't in your batch for today.",
      });
    }

    await recordSwipe(user.id, targetUserId, decision);

    if (decision === "pass") {
      return res.json({ decision: "pass" });
    }

    const match = await createMatch(user.id, targetUserId);
    res.json({ decision: "like", matched: true, match });
  } catch (e) {
    console.log(`Error recording swipe: ${e}`);
    res.status(500).json({ error: "Something went wrong" });
  }
});
