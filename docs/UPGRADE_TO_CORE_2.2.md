# PHỐ AI ECOSYSTEM CORE 2.2 — SYSTEM HEALTH CENTER

## Tính năng mới
- Một màn hình tự kiểm tra:
  - Supabase
  - OpenAI
  - Facebook / Meta
  - YouTube / Google
  - TOKEN_ENCRYPTION_KEY
  - APP_BASE_URL
- Hiển thị trạng thái xanh, vàng, đỏ cùng hướng xử lý.
- Tự chuẩn hóa giá trị biến môi trường bị dán nhầm:
  - khoảng trắng
  - dấu ngoặc kép
  - dạng `SUPABASE_SECRET_KEY=sb_secret_...`
- Không làm lộ khóa bí mật trong kết quả kiểm tra.

## Nâng cấp
1. Giải nén gói.
2. Upload toàn bộ nội dung vào repository `pho-ai-ecosystem`.
3. Commit:
   `Upgrade PHỐ AI ECOSYSTEM CORE 2.2 – System Health Center`
4. Chờ Netlify Published.
5. Mở bằng cửa sổ ẩn danh hoặc xóa cache.
6. Vào tab `Kiểm tra hệ thống` → `Kiểm tra lại`.

## Kết quả mong đợi
Supabase phải hiện:
`Hoạt động — Kết nối thành công · new_secret`

Meta sẽ hiện `Chưa cấu hình` cho đến khi thêm:
- META_APP_ID
- META_APP_SECRET
- META_REDIRECT_URI
