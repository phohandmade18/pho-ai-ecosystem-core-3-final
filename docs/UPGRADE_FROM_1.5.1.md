# NÂNG CẤP REPOSITORY HIỆN TẠI LÊN CORE 2.0

1. Tải và giải nén gói Core 2.0.
2. Trong repository GitHub `pho-ai-ecosystem`, xóa hoặc ghi đè các thư mục/file cũ:
   - public
   - netlify
   - supabase
   - docs
   - package.json
   - netlify.toml
   - README.md
3. Upload toàn bộ nội dung Core 2.0.
4. Commit: `Upgrade PHỐ AI ECOSYSTEM to Core 2.0`.
5. Netlify sẽ tự deploy từ GitHub.
6. Tạo Supabase và chạy `supabase/schema-production.sql`.
7. Nhập Environment Variables theo `.env.example`.
8. Redeploy.
9. Mở tab Kiểm tra hệ thống trong ứng dụng.
10. Khi Supabase, mã hóa và APP_BASE_URL đã xanh, tiếp tục kết nối YouTube và Facebook.

Không đưa `.env.example` có giá trị khóa thật lên GitHub.
