-- Migration: Đảm bảo enum order_type có đủ giá trị 'pickup' và 'delivery'
ALTER TYPE "public"."order_type" ADD VALUE IF NOT EXISTS 'pickup';
ALTER TYPE "public"."order_type" ADD VALUE IF NOT EXISTS 'delivery';
