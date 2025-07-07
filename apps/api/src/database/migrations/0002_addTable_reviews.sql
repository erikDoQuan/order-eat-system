
ALTER TYPE "public"."order_type" ADD VALUE IF NOT EXISTS 'pickup';
ALTER TYPE "public"."order_type" ADD VALUE IF NOT EXISTS 'delivery';
-- Tạo enum cho rating
CREATE TYPE "public"."review_rating" AS ENUM('good', 'average', 'bad');

CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"user_id" uuid,
	"dish_id" uuid,
	"rating" "review_rating" NOT NULL,
	"comment" text
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE set null ON UPDATE no action;