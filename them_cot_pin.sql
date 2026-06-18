-- CHẠY 1 LẦN TRONG SUPABASE → SQL EDITOR (cho database đã có sẵn)
-- Thêm cột mã PIN cho bảng nhân viên
alter table staff add column if not exists pin text default '';
