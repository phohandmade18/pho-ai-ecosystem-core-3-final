# PHỐ AI ECOSYSTEM CORE 4.0 — Sprint 1

Mục tiêu: tạo lớp dữ liệu vận hành thật nhưng KHÔNG phá CORE 3.0 hiện tại.

## File mới
- `supabase/schema-core4.sql`
- `netlify/functions/lib/core4-supabase.mjs`
- `netlify/functions/core4-health.mjs`
- `netlify/functions/core4-dashboard.mjs`
- `netlify/functions/core4-content.mjs`

## Environment variables cần có trên Netlify
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Khuyến nghị server-only cho giai đoạn vận hành:
- `SUPABASE_SERVICE_ROLE_KEY`

Không bao giờ đưa `SUPABASE_SERVICE_ROLE_KEY` vào `public/`, HTML hoặc JavaScript chạy trong trình duyệt.

## Test sau deploy
Mở:
- `/.netlify/functions/core4-health`
- `/.netlify/functions/core4-dashboard`
- `/.netlify/functions/core4-content`

`core4-health` nên trả `score: 100` sau khi database schema và các biến môi trường được cấu hình đúng.

## Nguyên tắc nâng cấp
Sprint 1 chỉ thêm lớp CORE 4.0, không xóa endpoint cũ và không thay giao diện CORE 3.0. Sau khi test ổn, Sprint 2 mới nối Facebook Engine và KPI vào lớp dữ liệu mới.
