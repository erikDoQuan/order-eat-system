-- Remove pickup_time column from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS pickup_time; 