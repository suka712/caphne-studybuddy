import { createClient } from "redis";
import { env } from "../config/env.js";

export const redis = createClient({ url: env.redisUrl });

redis.on("error", (err) => console.error("Redis error:", err));

await redis.connect();
