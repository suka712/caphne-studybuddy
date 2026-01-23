import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { db } from "../../db/db.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import type { User } from "../../db/schema.js";
import { Type } from "typebox";
import { typeboxMiddleware } from "../../middleware/typebox.js";

const profileRouter = Router();

const updateProfileSchema = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 72 }),
});

profileRouter.put(
  "/",
  typeboxMiddleware(updateProfileSchema),
  requireAuth,
  async (req, res) => {
    try {
      const authUser = req.user as User;
      const { username } = req.body;

      const updatedUser = await db
        .update(users)
        .set({ username })
        .where(eq(users.id, authUser.id))
        .returning();

      if (!updatedUser.length) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, createdAt, googleId, githubId, ...safeUser } =
        updatedUser[0];
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Profile updated error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  },
);

export { profileRouter };
