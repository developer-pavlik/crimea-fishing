import "server-only";

import { cache } from "react";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, sessions, users } from "@/db/schema";
import { getAccessSession } from "@/lib/auth";

export interface UserMetrics {
  total: number;
  newWeekly: number;
  activeSellers: number;
  team: number;
}

const METRICS_ROLES = ["admin", "superadmin"];

/** Проверяет access-токен, живую DB-сессию и роль (из БД) админа/суперадмина. */
async function hasMetricsAccess() {
  const claims = await getAccessSession();

  if (!claims) {
    return false;
  }

  const [row] = await db
    .select({ role: users.role })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.id, claims.sessionId),
        eq(sessions.userId, claims.userId),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return !!row && METRICS_ROLES.includes(row.role);
}

/**
 * Возвращает счётчики пользователей или null, если доступа нет / произошла ошибка.
 * Кэшируется только в рамках одного запроса.
 */
export const getUserMetrics = cache(async (): Promise<UserMetrics | null> => {
  try {
    if (!(await hasMetricsAccess())) {
      return null;
    }

    const [row] = await db
      .select({
        total: sql<string>`count(*)`,
        newWeekly: sql<string>`count(*) filter (where ${users.createdAt} >= now() - interval '7 days')`,
        team: sql<string>`count(*) filter (where ${users.role} in ('moderator', 'admin', 'superadmin'))`,
        activeSellers: sql<string>`(select count(distinct ${products.seller}) from ${products})`,
      })
      .from(users);

    return {
      total: Number(row.total),
      newWeekly: Number(row.newWeekly),
      team: Number(row.team),
      activeSellers: Number(row.activeSellers),
    };
  } catch (error) {
    console.error("Failed to load user metrics", error);
    return null;
  }
});
