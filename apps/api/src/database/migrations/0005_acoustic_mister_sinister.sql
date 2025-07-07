CREATE TYPE "public"."order_type" AS ENUM('pickup', 'delivery');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "type" "order_type" DEFAULT 'delivery';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address" varchar(255);