CREATE TABLE "dish_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"dish_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"base_price" numeric(10, 2) NOT NULL,
	"image_url" text,
	"status" "dish_status" DEFAULT 'available',
	"size" "dish_size",
	"type_name" varchar(100),
	"category_id" uuid
);
--> statement-breakpoint
ALTER TABLE "dish_snapshots" ADD CONSTRAINT "dish_snapshots_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_snapshots" ADD CONSTRAINT "dish_snapshots_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_snapshots" ADD CONSTRAINT "dish_snapshots_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_snapshots" ADD CONSTRAINT "dish_snapshots_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;