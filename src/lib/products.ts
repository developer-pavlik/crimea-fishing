import "server-only";

import { and, desc, eq, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { favorites, products } from "@/db/schema";
import type { ProductPage } from "@/types/product-catalog";

const PRODUCTS_PER_PAGE = 20;
const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface ProductCursor {
    createdAt: string;
    id: string;
}

export type ProductCategory = "free" | "new" | "used";

export function isProductCategory(value: string): value is ProductCategory {
    return value === "free" || value === "new" || value === "used";
}

const CURSOR_TIMESTAMP_PATTERN =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

export class InvalidProductCursorError extends Error {
    constructor() {
        super("Некорректный курсор списка товаров.");
        this.name = "InvalidProductCursorError";
    }
}

function encodeCursor(cursor: ProductCursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function isProductCursor(value: unknown): value is ProductCursor {
    if (
        typeof value !== "object" ||
        value === null ||
        !("id" in value) ||
        typeof value.id !== "string" ||
        !UUID_PATTERN.test(value.id) ||
        !("createdAt" in value) ||
        typeof value.createdAt !== "string" ||
        !CURSOR_TIMESTAMP_PATTERN.test(value.createdAt) ||
        !Number.isFinite(Date.parse(value.createdAt))
    ) {
        return false;
    }

    return true;
}

function decodeCursor(value: string): ProductCursor {
    if (value.length > 256) {
        throw new InvalidProductCursorError();
    }

    try {
        const parsed: unknown = JSON.parse(
            Buffer.from(value, "base64url").toString("utf8"),
        );

        if (!isProductCursor(parsed)) {
            throw new InvalidProductCursorError();
        }

        return {
            id: parsed.id,
            createdAt: parsed.createdAt,
        };
    } catch (error) {
        if (error instanceof InvalidProductCursorError) {
            throw error;
        }

        throw new InvalidProductCursorError();
    }
}

export async function getProductPage(
    cursorValue: string | null,
    userId?: string,
    category?: ProductCategory,
): Promise<ProductPage> {
    const cursor = cursorValue === null ? null : decodeCursor(cursorValue);
    const normalizedCreatedAt = sql<Date>`coalesce(
        ${products.createdAt},
        '1970-01-01 00:00:00+00'::timestamptz
    )`;
    const cursorDate = cursor
        ? sql<Date>`(${cursor.createdAt})::timestamptz`
        : null;
    const cursorCondition =
        cursor && cursorDate
            ? or(
                  lt(normalizedCreatedAt, cursorDate),
                  and(
                      eq(normalizedCreatedAt, cursorDate),
                      lt(products.id, cursor.id),
                  ),
              )
            : undefined;
    const favoriteExpression = userId
        ? sql<boolean>`exists (
              select 1
              from ${favorites}
              where ${favorites.userId} = ${userId}
                and ${favorites.productId} = ${products.id}
          )`
        : sql<boolean>`false`;
    const categoryCondition =
        category === "free"
            ? eq(products.price, 0)
            : category
              ? eq(products.condition, category)
              : undefined;
    const whereCondition = cursorCondition
        ? categoryCondition
            ? and(cursorCondition, categoryCondition)
            : cursorCondition
        : categoryCondition;

    const rows = await db
        .select({
            id: products.id,
            title: products.title,
            price: products.price,
            imagesUrl: products.imagesUrl,
            cursorCreatedAt: sql<string>`to_char(
                ${normalizedCreatedAt} at time zone 'UTC',
                'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
            )`,
            isFavorite: favoriteExpression,
        })
        .from(products)
        .where(whereCondition)
        .orderBy(desc(normalizedCreatedAt), desc(products.id))
        .limit(PRODUCTS_PER_PAGE + 1);

    const hasMore = rows.length > PRODUCTS_PER_PAGE;
    const pageRows = rows.slice(0, PRODUCTS_PER_PAGE);
    const lastRow = pageRows.at(-1);

    return {
        items: pageRows.map(({ id, title, price, imagesUrl, isFavorite }) => ({
            id,
            title,
            price,
            imagesUrl,
            isFavorite,
        })),
        hasMore,
        nextCursor:
            hasMore && lastRow
                ? encodeCursor({
                      id: lastRow.id,
                      createdAt: lastRow.cursorCreatedAt,
                  })
                : null,
    };
}
