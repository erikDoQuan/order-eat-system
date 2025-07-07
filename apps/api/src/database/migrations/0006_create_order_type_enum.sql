-- Migration: Tạo enum order_type cho bảng orders nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_type') THEN
        CREATE TYPE "public"."order_type" AS ENUM('pickup', 'delivery');
    END IF;
END$$;
