CREATE TYPE "product_condition" AS ENUM('new', 'used');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('user', 'moderator', 'admin', 'superadmin');--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar(255) NOT NULL,
	"price" bigint NOT NULL,
	"condition" "product_condition" DEFAULT 'new'::"product_condition" NOT NULL,
	"images_url" text[] DEFAULT '{}'::text[] NOT NULL,
	"description" text,
	"specifications" jsonb DEFAULT '{}' NOT NULL,
	"seller" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"refresh_token_hash" varchar(64) NOT NULL,
	"ip_address" varchar(45),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"telegram_id" bigint CONSTRAINT "users_telegram_id_key" UNIQUE,
	"photo_url" text,
	"username" varchar(32) CONSTRAINT "users_username_key" UNIQUE,
	"role" "user_role" DEFAULT 'user'::"user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "fk_product_seller" FOREIGN KEY ("seller") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "fk_session_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;