import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface PublicUserProfile {
  id: string;
  username: string | null;
  photoUrl: string | null;
}

export function isUserId(value: string) {
  return UUID_PATTERN.test(value);
}

export async function getPublicUserProfile(
  userId: string,
): Promise<PublicUserProfile | null> {
  if (!isUserId(userId)) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      photoUrl: users.photoUrl,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}
