import "server-only";

import { sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

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

export async function countSearchProducts(query: string) {
    try {
        const [row] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(products)
            .where(buildProductSearchCondition(query));

        return row?.count ?? 0;
    } catch (error) {
        throw new SearchQueryError(error);
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
