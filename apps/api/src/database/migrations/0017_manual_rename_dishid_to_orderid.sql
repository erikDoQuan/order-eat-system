-- Xóa foreign key cũ nếu tồn tại
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_dish_id_dishes_id_fk";

-- Đổi tên cột dish_id thành order_id nếu tồn tại
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='dish_id') THEN
        ALTER TABLE "reviews" RENAME COLUMN "dish_id" TO "order_id";
    END IF;
END$$;

-- Thêm foreign key mới đến orders.id nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints WHERE table_name='reviews' AND constraint_name='reviews_order_id_orders_id_fk'
    ) THEN
        ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL;
    END IF;
END$$; 