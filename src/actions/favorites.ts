"use server";

import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { favorites, products, sessions } from "@/db/schema";
import { getAccessSession } from "@/lib/auth";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type FavoriteMutationResult =
  | { success: true }
  | {
      success: false;
      error: "unauthorized" | "invalid_input" | "product_not_found";
    };

export async function setFavorite(
  productId: unknown,
  isFavorite: unknown,
): Promise<FavoriteMutationResult> {
  if (
    typeof productId !== "string" ||
    !UUID_PATTERN.test(productId) ||
    typeof isFavorite !== "boolean"
  ) {
    return { success: false, error: "invalid_input" };
  }

  const session = await getAccessSession();
  if (!session) {
    return { success: false, error: "unauthorized" };
  }

  const [activeSession] = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(
      and(
        eq(sessions.id, session.sessionId),
        eq(sessions.userId, session.userId),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!activeSession) {
    return { success: false, error: "unauthorized" };
  }

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    return { success: false, error: "product_not_found" };
  }

  if (isFavorite) {
    await db
      .insert(favorites)
      .values({ userId: session.userId, productId })
      .onConflictDoNothing({
        target: [favorites.userId, favorites.productId],
      });
  } else {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, session.userId),
          eq(favorites.productId, productId),
        ),
      );
  }

  return { success: true };
}
