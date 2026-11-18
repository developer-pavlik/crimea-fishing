import "server-only";

import { and, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { favorites, products } from "@/db/schema";
import {
    CURSOR_TIMESTAMP_PATTERN,
    InvalidProductCursorError,
    PRODUCTS_PER_PAGE,
    UUID_PATTERN,
} from "@/lib/products";
import { buildProductFiltersCondition } from "@/lib/search";
import type { SearchFilters } from "@/lib/search-filters";
import type { ProductPage } from "@/types/product-catalog";

export type CatalogSort = "date" | "price_asc" | "price_desc";

export const DEFAULT_CATALOG_SORT: CatalogSort = "date";

export function parseCatalogSort(
    value: string | string[] | null | undefined,
): CatalogSort {
    const raw = Array.isArray(value) ? value[0] : value;

    return raw === "price_asc" || raw === "price_desc" ? raw : "date";
}

export class CatalogQueryError extends Error {
    constructor(readonly cause: unknown) {
        super("Не удалось выполнить запрос каталога.");
        this.name = "CatalogQueryError";
    }
}

interface CatalogCursor {
    sort: CatalogSort;
    id: string;
    price?: number;
    createdAt?: string;
}

function encodeCursor(cursor: CatalogCursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeCursor(value: string, sort: CatalogSort): CatalogCursor {
    if (value.length > 256) {
        throw new InvalidProductCursorError();
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    } catch {
        throw new InvalidProductCursorError();
    }

    if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("sort" in parsed) ||
        parsed.sort !== sort ||
        !("id" in parsed) ||
        typeof parsed.id !== "string" ||
        !UUID_PATTERN.test(parsed.id)
    ) {
        throw new InvalidProductCursorError();
    }

    const { id } = parsed;

    if (sort === "date") {
        if (
            !("createdAt" in parsed) ||
            typeof parsed.createdAt !== "string" ||
            !CURSOR_TIMESTAMP_PATTERN.test(parsed.createdAt) ||
            !Number.isFinite(Date.parse(parsed.createdAt))
        ) {
            throw new InvalidProductCursorError();
        }

        return { sort, id, createdAt: parsed.createdAt };
    }

    if (
        !("price" in parsed) ||
        typeof parsed.price !== "number" ||
        !Number.isSafeInteger(parsed.price) ||
        parsed.price < 0
    ) {
        throw new InvalidProductCursorError();
    }

    return { sort, id, price: parsed.price };
}

interface CatalogPageOptions {
    categoryId: string;
    sort: CatalogSort;
    filters: SearchFilters;
    cursor: string | null;
    viewerId?: string;
}

export async function getCatalogProductPage({
    categoryId,
    sort,
    filters,
    cursor: cursorValue,
    viewerId,
}: CatalogPageOptions): Promise<ProductPage> {
    const cursor =
        cursorValue === null ? null : decodeCursor(cursorValue, sort);
    const normalizedCreatedAt = sql<Date>`coalesce(
        ${products.createdAt},
        '1970-01-01 00:00:00+00'::timestamptz
    )`;
    const favoriteExpression = viewerId
        ? sql<boolean>`exists (
              select 1
              from ${favorites}
              where ${favorites.userId} = ${viewerId}
                and ${favorites.productId} = ${products.id}
          )`
        : sql<boolean>`false`;

    let cursorCondition: SQL | undefined;
    let orderBy: SQL[];

    if (sort === "date") {
        orderBy = [
            sql`${normalizedCreatedAt} desc`,
            sql`${products.id} desc`,
        ];
        if (cursor?.createdAt) {
            const cursorDate = sql`(${cursor.createdAt})::timestamptz`;
            cursorCondition = sql`(
                ${normalizedCreatedAt} < ${cursorDate}
                OR (${normalizedCreatedAt} = ${cursorDate} AND ${products.id} < ${cursor.id})
            )`;
        }
    } else {
        const ascending = sort === "price_asc";
        orderBy = [
            ascending ? sql`${products.price} asc` : sql`${products.price} desc`,
            sql`${products.id} desc`,
        ];
        if (cursor && cursor.price !== undefined) {
            cursorCondition = sql`(
                ${ascending ? sql`${products.price} > ${cursor.price}` : sql`${products.price} < ${cursor.price}`}
                OR (${products.price} = ${cursor.price} AND ${products.id} < ${cursor.id})
            )`;
        }
    }

    try {
        const rows = await db
            .select({
                id: products.id,
                title: products.title,
                price: products.price,
                condition: products.condition,
                imagesUrl: products.imagesUrl,
                cursorCreatedAt: sql<string>`to_char(
                    ${normalizedCreatedAt} at time zone 'UTC',
                    'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
                )`,
                isFavorite: favoriteExpression,
            })
            .from(products)
            .where(
                and(
                    eq(products.categoryId, categoryId),
                    buildProductFiltersCondition(filters),
                    cursorCondition,
                ),
            )
            .orderBy(...orderBy)
            .limit(PRODUCTS_PER_PAGE + 1);

        const hasMore = rows.length > PRODUCTS_PER_PAGE;
        const pageRows = rows.slice(0, PRODUCTS_PER_PAGE);
        const lastRow = pageRows.at(-1);

        return {
            items: pageRows.map(
                ({ id, title, price, condition, imagesUrl, isFavorite }) => ({
                    id,
                    title,
                    price,
                    condition,
                    imagesUrl,
                    isFavorite,
                }),
            ),
            hasMore,
            nextCursor:
                hasMore && lastRow
                    ? encodeCursor(
                          sort === "date"
                              ? {
                                    sort,
                                    id: lastRow.id,
                                    createdAt: lastRow.cursorCreatedAt,
                                }
                              : { sort, id: lastRow.id, price: lastRow.price },
                      )
                    : null,
        };
    } catch (error) {
        throw new CatalogQueryError(error);
    }
}

export async function getInitialCatalogProductPage(
    options: Omit<CatalogPageOptions, "cursor">,
): Promise<{ ok: true; page: ProductPage } | { ok: false }> {
    try {
        return {
            ok: true,
            page: await getCatalogProductPage({ ...options, cursor: null }),
        };
    } catch (error) {
        if (!(error instanceof CatalogQueryError)) {
            throw error;
        }

        console.error("Failed to load initial catalog page", error.cause);
        return { ok: false };
    }
}
