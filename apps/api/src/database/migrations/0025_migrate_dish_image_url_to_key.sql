-- Migration: Chuyển đổi image_url từ URL sang chỉ lưu key file (uniqueName)
-- Giữ nguyên nếu đã là key, chỉ thay đổi nếu là URL

UPDATE dishes
SET image_url = regexp_replace(image_url, '^.*/', '')
WHERE image_url IS NOT NULL AND image_url != '' AND image_url LIKE '%/%'; 