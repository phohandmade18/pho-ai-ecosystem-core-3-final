# PHỐ AI ECOSYSTEM CORE 2.3

Bản đóng gói sạch để đưa lên **GitHub mới** và **Netlify mới**.

## Thành phần

- Giao diện PWA trong `public/`
- Netlify Functions trong `netlify/functions/`
- Facebook OAuth dùng bộ biến `FACEBOOK_*`
- YouTube OAuth
- Supabase lưu kết nối, KPI, nhật ký và OAuth state
- System Health Center
- OpenAI Strategy Engine và Budget Guard

## Cài nhanh

1. Tạo repository GitHub mới và tải toàn bộ nội dung thư mục này lên.
2. Trong Netlify chọn **Add new project → Import an existing project**.
3. Chọn repository mới.
4. Netlify tự đọc `netlify.toml`:
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
5. Tạo các biến môi trường theo `.env.example`.
6. Chạy SQL `supabase/schema-production.sql` trong Supabase SQL Editor.
7. Deploy lại Netlify.
8. Mở `/.netlify/functions/system-health` để kiểm tra.

Hướng dẫn chi tiết: `docs/NEW_GITHUB_NETLIFY_SETUP.md`.

## Bảo mật

Không đưa App Secret, Supabase Secret Key, OpenAI API Key hoặc TOKEN_ENCRYPTION_KEY vào GitHub. Chỉ lưu chúng trong Netlify Environment Variables.
