# 🚀 HƯỚNG DẪN DEPLOY – BÁO CÁO NGÀY SPA (Netlify)

Thực hiện theo thứ tự: Supabase → GitHub → Netlify

---

## BƯỚC 1 — Tạo database trên Supabase (5 phút)

1. Vào https://supabase.com → "Start your project" → đăng ký bằng Google
2. Nhấn "New project" → đặt tên (vd: spa-report) → chọn mật khẩu database → Create
3. Đợi ~1 phút để tạo xong
4. Vào menu bên trái → **SQL Editor** → nhấn "New query"
5. Copy toàn bộ nội dung file `supabase_setup.sql` → dán vào → nhấn **Run**
6. Vào menu **Settings** → **API**:
   - Copy "Project URL"  → đây là SUPABASE_URL
   - Copy "anon / public" key → đây là SUPABASE_ANON_KEY
   - Lưu lại 2 giá trị này

---

## BƯỚC 2 — Đưa code lên GitHub (5 phút)

1. Vào https://github.com → đăng ký tài khoản (nếu chưa có)
2. Nhấn **New repository** → đặt tên "spa-report" → Create repository
3. Tải GitHub Desktop: https://desktop.github.com
4. Mở GitHub Desktop → Sign in → File → Clone repository → chọn repo vừa tạo
5. Copy toàn bộ thư mục `spa-report` vào thư mục vừa clone
6. Trong GitHub Desktop: thấy các file mới → nhấn **Commit to main** → **Push origin**

---

## BƯỚC 3 — Deploy lên Netlify (3 phút)

1. Vào https://netlify.com → đăng ký bằng tài khoản GitHub
2. Nhấn **Add new site → Import an existing project** → chọn GitHub
3. Chọn repo "spa-report" → Import
4. Cấu hình build (thường tự điền sẵn):
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Mở phần **Environment variables** → thêm 3 biến:

   | Key | Value |
   |-----|-------|
   | NEXT_PUBLIC_SUPABASE_URL | (URL từ bước 1) |
   | NEXT_PUBLIC_SUPABASE_ANON_KEY | (Key từ bước 1) |
   | NEXT_PUBLIC_ADMIN_PIN | (Mã PIN admin của bạn, vd: 9999) |

6. Nhấn **Deploy site** → đợi ~2 phút
7. Netlify sẽ cho link dạng: `https://spa-report-xxxx.netlify.app`

---

## BƯỚC 4 — Sử dụng

### Nhân viên:
- Mở link Netlify trên điện thoại (Chrome/Safari)
- Chọn tên → điền báo cáo → Lưu → Chụp phiếu → Gửi Zalo

### Admin (bạn):
- Vào link + `/admin` (vd: `https://spa-report-xxxx.netlify.app/admin`)
- Nhập mã PIN → xem báo cáo, thêm/xoá nhân viên, xuất CSV

### Thêm nhân viên mới:
- Vào trang Admin → tab "Nhân viên" → điền tên + vai trò → Thêm
- Nhân viên tự động xuất hiện ở trang chủ ngay lập tức

---

## LƯU Ý

- Link Netlify dùng được trên mọi điện thoại, không cần cài app
- Dữ liệu lưu trên Supabase cloud, không mất khi xoá cache
- Supabase miễn phí cho đến 50.000 rows (~3 năm với 50 nhân viên/ngày)
- Netlify miễn phí không giới hạn thời gian
- Nếu cần tên miền riêng (vd: baocao.tenspacuaban.com) có thể thêm sau trong Netlify → Domain settings

---

## CẦN HỖ TRỢ?

Nếu bị lỗi ở bước nào, chụp màn hình lỗi và hỏi lại để được hướng dẫn tiếp.
