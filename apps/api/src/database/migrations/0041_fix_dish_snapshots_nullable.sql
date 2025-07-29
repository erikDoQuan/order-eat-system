-- Fix dish_snapshots table to allow NULL for created_by and updated_by
ALTER TABLE "dish_snapshots" ALTER COLUMN "created_by" DROP NOT NULL;
ALTER TABLE "dish_snapshots" ALTER COLUMN "updated_by" DROP NOT NULL; 