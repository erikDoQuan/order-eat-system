-- ALTER TABLE "dish_options" ALTER COLUMN "name" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "dishes" ADD COLUMN "pickup_time" varchar(20);