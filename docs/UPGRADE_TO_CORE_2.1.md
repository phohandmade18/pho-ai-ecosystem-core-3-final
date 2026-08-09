# NÂNG CẤP CORE 2.0 → 2.1

## Mục tiêu
Sửa lỗi `Supabase 401: Invalid API key` khi dùng khóa mới:
- `sb_publishable_...`
- `sb_secret_...`

## Cách nâng cấp trên GitHub Web
1. Giải nén gói Core 2.1.
2. Mở repository `pho-ai-ecosystem`.
3. Chọn `Add file` → `Upload files`.
4. Kéo toàn bộ nội dung Core 2.1 vào repository.
5. Commit:
   `Upgrade PHỐ AI ECOSYSTEM CORE 2.1 – Supabase Keys Fix`
6. Chờ Netlify tự deploy.
7. Nếu Production còn giữ cache cũ, xóa dữ liệu trang hoặc mở cửa sổ ẩn danh.

## Biến môi trường
Khuyến nghị thêm:
- `SUPABASE_PUBLISHABLE_KEY` = khóa bắt đầu `sb_publishable_`
- `SUPABASE_SECRET_KEY` = khóa bắt đầu `sb_secret_`

Có thể giữ nguyên tên cũ:
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Core 2.1 đọc được cả hai bộ tên.

## Kiểm tra
Mở:
`https://pho-ai-ecosystem.netlify.app/.netlify/functions/supabase-diagnostic`

Kết quả đúng có:
`"ok": true`

Sau đó quay lại:
`Kết nối kênh` → `Kiểm tra Facebook`.
