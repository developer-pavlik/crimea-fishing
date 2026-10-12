CREATE TABLE "favorites" (
	"user_id" uuid,
	"product_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "favorites_pkey" PRIMARY KEY("user_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "fk_favorite_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "fk_favorite_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;