CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_search_fts_idx"
ON "products" USING gin (
    to_tsvector('russian', "title" || ' ' || coalesce("description", ''))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_title_trgm_idx"
ON "products" USING gin (lower("title") gin_trgm_ops);
