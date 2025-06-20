CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"payment_method" varchar(50),
	"paid_at" timestamp with time zone,
	"amount" numeric(10, 2),
	"status" varchar(50) DEFAULT 'unpaid'
);
