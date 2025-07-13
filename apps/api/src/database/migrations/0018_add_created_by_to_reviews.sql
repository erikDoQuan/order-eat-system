-- Migration: Add created_by column to reviews table
-- Generated at: 2024-12-19

ALTER TABLE "reviews" ADD COLUMN "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL; 