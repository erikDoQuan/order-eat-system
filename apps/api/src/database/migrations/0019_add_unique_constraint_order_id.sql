-- Migration: Add unique constraint for orderId in reviews table
-- Generated at: 2024-12-19
 
-- Thêm unique constraint để đảm bảo 1 order chỉ có 1 review
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_unique" UNIQUE ("order_id"); 