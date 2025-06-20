CREATE TYPE "public"."category_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."dish_size" AS ENUM('small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "public"."dish_status" AS ENUM('available', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"name" varchar(100) NOT NULL,
	"description" text,
	"status" "category_status" DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"name" varchar(100) NOT NULL,
	"description" text,
	"base_price" numeric(10, 2) NOT NULL,
	"image_url" text,
	"status" "dish_status" DEFAULT 'available',
	"type_name" varchar(100),
	"size" "dish_size",
	"category_id" uuid
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"name" varchar(255) NOT NULL,
	"unique_name" varchar(255) NOT NULL,
	"caption" varchar(255),
	"ext" varchar(5) NOT NULL,
	"size" bigint NOT NULL,
	"mime" varchar(50) NOT NULL,
	"is_temp" boolean DEFAULT true NOT NULL,
	"status" varchar(50) DEFAULT 'published' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone_number" varchar,
	"address" varchar,
	"password" varchar NOT NULL,
	"last_login" timestamp with time zone,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"avatar" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"token" text NOT NULL,
	"created_by_ip" text NOT NULL,
	"revoked_by_ip" text,
	"revoked_at" timestamp with time zone,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"replaced_by_token" text
);
--> statement-breakpoint
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;