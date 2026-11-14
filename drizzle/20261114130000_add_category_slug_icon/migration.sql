ALTER TABLE "categories" ADD COLUMN "slug" varchar(255);--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_key" UNIQUE("slug");