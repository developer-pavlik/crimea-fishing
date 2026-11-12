import "server-only";

import { and, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { favorites, products } from "@/db/schema";
import {
    CURSOR_TIMESTAMP_PATTERN,
    InvalidProductCursorError,
    PRODUCTS_PER_PAGE,
    UUID_PATTERN,
} from "@/lib/products";
import type { SearchFilters } from "@/lib/search-filters";
import type { ProductPage } from "@/types/product-catalog";

export const SEARCH_QUERY_MAX_LENGTH = 100;
export const SEARCH_SUGGESTIONS_LIMIT = 8;

export class SearchQueryError extends Error {
    constructor(readonly cause: unknown) {
        super("Не удалось выполнить поисковый запрос.");
        this.name = "SearchQueryError";
    }
}

export function normalizeSearchQuery(value: string | string[] | null | undefined) {
    const raw = Array.isArray(value) ? value[0] : value;

    return (raw ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, SEARCH_QUERY_MAX_LENGTH)
        .trim();
}

function escapeLike(value: string) {
    return value.replace(/[\%_]/g, "\$&");
}

// Условие должно совпадать с выражениями индексов products_search_fts_idx / products_title_trgm_idx.
// Общее для счётчика и будущей выдачи, чтобы результаты не расходились.
export function buildProductSearchCondition(query: string): SQL {
    const lowered = query.toLowerCase();

    return sql`(
        to_tsvector('russian', ${products.title} || ' ' || coalesce(${products.description}, ''))
            @@ websearch_to_tsquery('russian', ${query})
        OR lower(${products.title}) LIKE ${`%${escapeLike(lowered)}%`}
        OR ${lowered} <% lower(${products.title})
    )`;
}

export function buildProductFiltersCondition(
    filters: SearchFilters,
): SQL | undefined {
    return and(
        filters.onlyFree ? eq(products.price, 0) : undefined,
        filters.priceFrom !== null
            ? gte(products.price, filters.priceFrom)
            : undefined,
        filters.priceTo !== null ? lte(products.price, filters.priceTo) : undefined,
        filters.condition !== "any"
            ? eq(products.condition, filters.condition)
            : undefined,
        filters.onlyWithPhoto
            ? sql`cardinality(${products.imagesUrl}) > 0`
            : undefined,
    );
}

export async function countSearchProducts(
    query: string,
    filters: SearchFilters,
) {
    try {
        const [row] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(products)
            .where(
                and(
                    buildProductSearchCondition(query),
                    buildProductFiltersCondition(filters),
                ),
            );

        return row?.count ?? 0;
    } catch (error) {
        throw new SearchQueryError(error);
    }
}

export type SearchSort = "relevance" | "price_asc" | "price_desc";

export function parseSearchSort(
    value: string | string[] | null | undefined,
): SearchSort {
    const raw = Array.isArray(value) ? value[0] : value;

    return raw === "price_asc" || raw === "price_desc" ? raw : "relevance";
}

interface SearchCursor {
    sort: SearchSort;
    id: string;
    price?: number;
    rank?: string;
    createdAt?: string;
}

const RANK_PATTERN = /^\d{1,10}(\.\d{1,6})?$/;

function encodeSearchCursor(cursor: SearchCursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeSearchCursor(value: string, sort: SearchSort): SearchCursor {
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

    if (sort === "relevance") {
        if (
            !("rank" in parsed) ||
            typeof parsed.rank !== "string" ||
            !RANK_PATTERN.test(parsed.rank) ||
            !("createdAt" in parsed) ||
            typeof parsed.createdAt !== "string" ||
            !CURSOR_TIMESTAMP_PATTERN.test(parsed.createdAt) ||
            !Number.isFinite(Date.parse(parsed.createdAt))
        ) {
            throw new InvalidProductCursorError();
        }

        return { sort, id, rank: parsed.rank, createdAt: parsed.createdAt };
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

interface SearchPageOptions {
    query: string;
    sort: SearchSort;
    filters: SearchFilters;
    cursor: string | null;
    viewerId?: string;
}

export async function getSearchProductPage({
    query,
    sort,
    filters,
    cursor: cursorValue,
    viewerId,
}: SearchPageOptions): Promise<ProductPage> {
    const cursor =
        cursorValue === null ? null : decodeSearchCursor(cursorValue, sort);
    const lowered = query.toLowerCase();
    const normalizedCreatedAt = sql<Date>`coalesce(
        ${products.createdAt},
        '1970-01-01 00:00:00+00'::timestamptz
    )`;
    const rank = sql<string>`round((
        ts_rank(
            to_tsvector('russian', ${products.title} || ' ' || coalesce(${products.description}, '')),
            websearch_to_tsquery('russian', ${query})
        ) + word_similarity(${lowered}, lower(${products.title}))
    )::numeric, 6)`;
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

    if (sort === "relevance") {
        orderBy = [
            sql`${rank} desc`,
            sql`${normalizedCreatedAt} desc`,
            sql`${products.id} desc`,
        ];
        if (cursor) {
            const cursorRank = sql`(${cursor.rank})::numeric`;
            const cursorDate = sql`(${cursor.createdAt})::timestamptz`;
            cursorCondition = sql`(
                ${rank} < ${cursorRank}
                OR (${rank} = ${cursorRank} AND ${normalizedCreatedAt} < ${cursorDate})
                OR (${rank} = ${cursorRank} AND ${normalizedCreatedAt} = ${cursorDate}
                    AND ${products.id} < ${cursor.id})
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
                rank: sql<string>`${rank}::text`,
                cursorCreatedAt: sql<string>`to_char(
                    ${normalizedCreatedAt} at time zone 'UTC',
                    'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
                )`,
                isFavorite: favoriteExpression,
            })
            .from(products)
            .where(
                and(
                    buildProductSearchCondition(query),
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
                    ? encodeSearchCursor(
                          sort === "relevance"
                              ? {
                                    sort,
                                    id: lastRow.id,
                                    rank: lastRow.rank,
                                    createdAt: lastRow.cursorCreatedAt,
                                }
                              : { sort, id: lastRow.id, price: lastRow.price },
                      )
                    : null,
        };
    } catch (error) {
        throw new SearchQueryError(error);
    }
}

export async function getInitialSearchProductPage(
    options: Omit<SearchPageOptions, "cursor">,
): Promise<{ ok: true; page: ProductPage } | { ok: false }> {
    try {
        return {
            ok: true,
            page: await getSearchProductPage({ ...options, cursor: null }),
        };
    } catch (error) {
        if (!(error instanceof SearchQueryError)) {
            throw error;
        }

        console.error("Failed to load initial search page", error.cause);
        return { ok: false };
    }
}

export async function getSearchSuggestions(
    query: string,
    limit = SEARCH_SUGGESTIONS_LIMIT,
) {
    const lowered = query.toLowerCase();
    const prefix = `${escapeLike(lowered)}%`;
    const contains = `%${escapeLike(lowered)}%`;

    try {
        const result = await db.execute<{ title: string }>(sql`
            SELECT title FROM (
                SELECT DISTINCT ON (lower(${products.title}))
                    ${products.title} AS title,
                    (lower(${products.title}) LIKE ${prefix}) AS is_prefix,
                    word_similarity(${lowered}, lower(${products.title})) AS score
                FROM ${products}
                WHERE lower(${products.title}) LIKE ${contains}
                    OR ${lowered} <% lower(${products.title})
                ORDER BY lower(${products.title})
            ) t
            ORDER BY is_prefix DESC, score DESC, title ASC
            LIMIT ${limit}
        `);

        return result.rows.map((row) => row.title);
    } catch (error) {
        throw new SearchQueryError(error);
    }
}
