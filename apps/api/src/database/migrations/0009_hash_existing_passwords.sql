-- Migration để hash tất cả password chưa được hash
-- Chạy script này để đảm bảo tất cả password đều được hash

-- Lưu ý: Migration này cần được chạy thủ công vì không thể hash password trong SQL
-- Cần chạy script Node.js riêng để hash password

-- Tạo bảng tạm để lưu user cần hash password
CREATE TEMP TABLE users_to_hash AS 
SELECT id, email, password 
FROM users 
WHERE password NOT LIKE '$argon2id$%' 
  AND password NOT LIKE '$2a$%' 
  AND password NOT LIKE '$2b$%' 
  AND password NOT LIKE '$2y$%';

-- Hiển thị danh sách user cần hash password
SELECT * FROM users_to_hash; 