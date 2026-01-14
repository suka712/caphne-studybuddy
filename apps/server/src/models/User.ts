import {
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { InferSelectModel, InferInsertModel } from "drizzle-orm";

/* ---------- USERS ---------- */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  email: text("email").notNull().unique(),

  // dùng cho local login (nullable để support google)
  password: text("password"),

  // tên hiển thị (Google: payload.name)
  name: text("name").notNull(),

  avatar: text("avatar"),

  // local | google
  provider: text("provider").notNull().default("local"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

/* ---------- TYPES ---------- */
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
