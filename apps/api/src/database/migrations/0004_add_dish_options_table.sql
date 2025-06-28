ALTER TYPE "public"."dish_status" ADD VALUE 'coming_soon';--> statement-breakpoint
CREATE TABLE "dish_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"dish_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"price" numeric(10, 2) DEFAULT '0.00',
	"description" text,
	"is_required" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "dish_options" ADD CONSTRAINT "dish_options_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE cascade ON UPDATE no action;