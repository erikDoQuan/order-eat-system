-- Migration: Add returnCode field to orders table
-- Generated at: 2024-07-26 13:45:00

ALTER TABLE "orders" ADD COLUMN "return_code" varchar(10); 