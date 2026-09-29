import { rateLimit } from "express-rate-limit";

const limiter = (windowMinutes: number, limit: number) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });

// Applied to every route; per-IP (in-memory, single instance).
export const globalLimiter = limiter(1, 120);
// Unauthenticated / abusable endpoints.
export const authLimiter = limiter(15, 30);
export const emailCollectionLimiter = limiter(60, 10);
// Write endpoints.
export const swipeLimiter = limiter(1, 30);

// Per-socket sliding window for chat messages.
export const createSocketLimiter = (limit: number, windowMs: number) => {
  let hits: number[] = [];
  return () => {
    const now = Date.now();
    hits = hits.filter((t) => now - t < windowMs);
    if (hits.length >= limit) return false;
    hits.push(now);
    return true;
  };
};
