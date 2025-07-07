
DO $$ BEGIN
    CREATE TYPE order_type AS ENUM ('pickup', 'delivery');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS type order_type DEFAULT 'delivery';


ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(255);
