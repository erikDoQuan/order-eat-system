CREATE TYPE "public"."payment_method" AS ENUM('cash', 'zalopay');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'success', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "user_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"trans_time" timestamp with time zone NOT NULL,
	"transaction_code" varchar(64),
	"description" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;