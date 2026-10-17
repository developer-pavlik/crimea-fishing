"use server";

import { and, eq, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products, sessions } from "@/db/schema";
import { getAccessSession } from "@/lib/auth";
import type { ProductCondition } from "@/types/product-form";

const MAX_IMAGES = 20;
const MAX_DESCRIPTION_LENGTH = 10_000;
const MAX_SPECIFICATIONS = 100;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ProductMutationData {
  title: unknown;
  price: unknown;
  condition: unknown;
  description: unknown;
  imagesUrl: unknown;
  specifications: unknown;
}

type ProductMutationResult =
  | { success: true; id: string }
  | {
      success: false;
      error: "unauthorized" | "invalid_input" | "not_found" | "server_error";
    };

function normalizeData(data: ProductMutationData) {
  if (!data || typeof data !== "object") return null;

  const title = typeof data.title === "string" ? data.title.trim() : "";
  const price = data.price;
  const condition = data.condition;
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const imagesUrl = data.imagesUrl;
  const specifications = data.specifications;

  if (
    title.length === 0 ||
    title.length > 255 ||
    !Number.isSafeInteger(price) ||
    (price as number) < 0 ||
    (condition !== "new" && condition !== "used") ||
    description.length === 0 ||
    description.length > MAX_DESCRIPTION_LENGTH ||
    !Array.isArray(imagesUrl) ||
    imagesUrl.length > MAX_IMAGES ||
    imagesUrl.some((url) => typeof url !== "string" || url.length === 0 || url.length > 2048)
  ) {
    return null;
  }

  if (!Array.isArray(specifications) || specifications.length > MAX_SPECIFICATIONS) {
    return null;
  }

  const normalizedSpecifications: Record<string, string> = {};
  for (const item of specifications) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.name !== "string" ||
      typeof item.value !== "string"
    ) {
      return null;
    }

    const name = item.name.trim();
    const value = item.value.trim();
    if (name.length === 0 && value.length === 0) continue;
    if (name.length === 0 || value.length === 0 || name.length > 255 || value.length > 2000) {
      return null;
    }
    normalizedSpecifications[name] = value;
  }

  return {
    title,
    price: price as number,
    condition: condition as ProductCondition,
    description,
    imagesUrl: imagesUrl as string[],
    specifications: normalizedSpecifications,
  };
}

async function getAuthorizedSession() {
  const session = await getAccessSession();
  if (!session) return null;

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

  return activeSession ? session : null;
}

export async function createProduct(data: ProductMutationData): Promise<ProductMutationResult> {
  const normalized = normalizeData(data);
  if (!normalized) return { success: false, error: "invalid_input" };

  const session = await getAuthorizedSession();
  if (!session) return { success: false, error: "unauthorized" };

  try {
    const [product] = await db
      .insert(products)
      .values({ ...normalized, seller: session.userId })
      .returning({ id: products.id });

    if (!product) return { success: false, error: "server_error" };
    revalidatePath("/");
    revalidatePath("/products/new");
    revalidatePath(`/product/${product.id}`);
    return { success: true, id: product.id };
  } catch (error) {
    console.error("Failed to create product", error);
    return { success: false, error: "server_error" };
  }
}

export async function updateProduct(
  productId: unknown,
  data: ProductMutationData,
): Promise<ProductMutationResult> {
  if (typeof productId !== "string" || !UUID_PATTERN.test(productId)) {
    return { success: false, error: "invalid_input" };
  }

  const normalized = normalizeData(data);
  if (!normalized) return { success: false, error: "invalid_input" };

  const session = await getAuthorizedSession();
  if (!session) return { success: false, error: "unauthorized" };

  try {
    const [product] = await db
      .update(products)
      .set({ ...normalized, updatedAt: new Date() })
      .where(and(eq(products.id, productId), eq(products.seller, session.userId)))
      .returning({ id: products.id });

    if (!product) return { success: false, error: "not_found" };
    revalidatePath("/");
    revalidatePath(`/product/${product.id}`);
    revalidatePath(`/product/${product.id}/edit`);
    return { success: true, id: product.id };
  } catch (error) {
    console.error("Failed to update product", error);
    return { success: false, error: "server_error" };
  }
}
