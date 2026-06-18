-- =============================================
-- CHẠY FILE NÀY TRONG SUPABASE SQL EDITOR
-- =============================================

-- 1. Bảng nhân viên
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('KTV','TVV')),
  note text default '',
  active boolean default true,
  created_at timestamptz default now()
);

-- 2. Bảng báo cáo
create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id),
  staff_name text not null,
  type text not null check (type in ('KTV','TVV')),
  ngay date not null,
  ca text not null,
  dt bigint default 0,

  -- Tour (KTV)
  tyc int default 0,
  tkm int default 0,
  tkc int default 0,
  ttour int default 0,

  -- Tăng ca
  tc int default 0,

  -- Video MKT (KTV)
  vn int default 0,
  vd int default 0,

  -- Feedback (KTV)
  fg int default 0,
  fv int default 0,

  -- Upsell (KTV)
  up int default 0,

  -- Complain (KTV) - lưu dạng JSON array
  complains jsonb default '[]',

  -- TVV
  chot int default 0,
  lydo text default '',

  note text default '',
  created_at timestamptz default now()
);

-- 3. Cho phép đọc/ghi không cần đăng nhập (RLS tắt để đơn giản)
alter table staff enable row level security;
alter table records enable row level security;

create policy "allow_all_staff" on staff for all using (true) with check (true);
create policy "allow_all_records" on records for all using (true) with check (true);
