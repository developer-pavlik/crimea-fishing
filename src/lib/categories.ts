import "server-only";
import { unstable_cache } from "next/cache";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

const REVALIDATE_SECONDS = 60 * 60;
const CATEGORIES_TAG = "categories";

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export const getMenuCategories = unstable_cache(
  async (): Promise<MenuCategory[]> => {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      })
      .from(categories)
      .where(and(isNull(categories.parentId), isNotNull(categories.slug)))
      .orderBy(categories.name);

    return rows.filter((row): row is MenuCategory => row.slug !== null);
  },
  ["menu-categories"],
  { revalidate: REVALIDATE_SECONDS, tags: [CATEGORIES_TAG] },
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    const [row] = await db
      .select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    return row ?? null;
  },
  ["category-by-slug"],
  { revalidate: REVALIDATE_SECONDS, tags: [CATEGORIES_TAG] },
);
