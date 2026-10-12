import {
  bigint,
  foreignKey,
  jsonb,
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

export const productCondition = pgEnum("product_condition", ["new", "used"]);

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
  (table) => [
    unique("users_username_key").on(table.username),
    unique("users_telegram_id_key").on(table.telegramId),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    price: bigint("price", { mode: "number" }).notNull(),
    condition: productCondition("condition").default("new").notNull(),
    imagesUrl: text("images_url").array().default([]).notNull(),
    description: text("description"),
    specifications: jsonb("specifications").default({}).notNull(),
    seller: uuid("seller").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "fk_product_seller",
      columns: [table.seller],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    refreshTokenHash: varchar("refresh_token_hash", { length: 64 }).notNull(),
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
