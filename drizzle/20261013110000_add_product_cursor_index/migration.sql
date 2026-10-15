CREATE INDEX "products_created_at_id_idx"
ON "products" (
    coalesce("created_at", '1970-01-01 00:00:00+00'::timestamptz) DESC,
    "id" DESC
);
