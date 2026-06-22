import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { verifyToken } from "../features/auth/jwt.service.js";
import { db } from "../db/db.js";
import { users, type User } from "../db/schema.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = user;
  next();
};
