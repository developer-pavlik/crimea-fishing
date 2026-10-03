import {
  bigint,
  foreignKey,
  pgEnum,
  pgTable,
  timestamp,
  text,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "user",
  "moderator",
  "admin",
  "superadmin",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    telegramId: bigint("telegram_id", { mode: "bigint" }),
    photoUrl: text("photo_url"),
    username: varchar("username", { length: 32 }),
    role: userRole("role").default("user").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
  },
  (table) => [unique("users_username_key").on(table.username)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    refreshToken: varchar("refresh_token", { length: 512 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "fk_session_user",
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
  ],
);
