import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { getNextCandidate, recordSwipeAndMatch, createMatch } from "./swipes.services.js";
import { matches, User } from "../../db/schema.js";
import { db } from "../../db/db.js";
import { and, count, eq, gte } from "drizzle-orm";
import { matchConfig } from "../../config/matchConfig.js";

export const swipesRouter = Router();

const hasReachedDailyQuota = async (userId: number) => {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [matchesToday] = await db
    .select({ count: count() })
    .from(matches)
    .where(and(eq(matches.userId, userId), gte(matches.createdAt, startOfDay)));

  return matchesToday.count >= matchConfig.matchesPerDay;
};

swipesRouter.get("/next", requireAuth, async (req, res) => {
  const user = req.user as User;

  try {
    if (await hasReachedDailyQuota(user.id)) {
      return res.json({ profile: null });
    }

    const candidate = await getNextCandidate(user.id);
    res.json({ profile: candidate ?? null });
  } catch (e) {
    console.log(`Error getting next swipe candidate: ${e}`);
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
    await recordSwipeAndMatch(user.id, targetUserId, decision);

    if (decision === "pass") {
      return res.json({ decision: "pass" });
    }

    if (await hasReachedDailyQuota(user.id)) {
      return res.json({
        decision: "like",
        matched: false,
        reason: "quota_exceeded",
      });
    }

    const match = await createMatch(user.id, targetUserId);
    res.json({ decision: "like", matched: true, match });
  } catch (e) {
    console.log(`Error recording swipe: ${e}`);
    res.status(500).json({ error: "Something went wrong" });
  }
});
