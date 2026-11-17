ALTER TABLE "products" ADD COLUMN "delivery_methods" jsonb DEFAULT '{"pickup":true,"carrier":false}' NOT NULL;
