# Cài PHỐ AI ECOSYSTEM CORE 2.3 lên GitHub và Netlify mới

## A. Tạo GitHub mới

1. GitHub → **New repository**.
2. Đặt tên: `pho-ai-ecosystem-core-2-3`.
3. Chọn **Private** hoặc **Public**.
4. Không tạo README tự động.
5. Giải nén gói này và tải toàn bộ file bên trong lên repository.
6. Commit: `Deploy PHỐ AI ECOSYSTEM CORE 2.3`.

## B. Tạo Netlify mới

1. Netlify → **Add new project**.
2. Chọn **Import an existing project**.
3. Chọn GitHub và repository mới.
4. Giữ cấu hình từ `netlify.toml`.
5. Bấm **Deploy**.

Sau deploy lần đầu, sao chép tên miền Netlify mới, ví dụ:

`https://your-new-site.netlify.app`

## C. Environment Variables

Vào **Project configuration → Environment variables** và tạo:

- `APP_BASE_URL`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_REDIRECT_URI`
- `FACEBOOK_GRAPH_VERSION` = `v23.0`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_PUBLISHABLE_KEY` hoặc `SUPABASE_ANON_KEY`
- `TOKEN_ENCRYPTION_KEY`
- `OPENAI_API_KEY` (không bắt buộc)
- `OPENAI_MODEL` = `gpt-4.1-mini`

`FACEBOOK_REDIRECT_URI` phải là:

`https://YOUR-NEW-SITE.netlify.app/.netlify/functions/facebook-auth-callback`

Sau khi tạo biến, chọn **Deploys → Trigger deploy → Clear cache and deploy site**.

## D. Supabase

1. Supabase → SQL Editor.
2. Mở file `supabase/schema-production.sql`.
3. Chạy toàn bộ SQL.
4. Lấy URL và server secret key trong Project Settings → API.
5. Dán vào Netlify, không đưa vào GitHub.

## E. Meta Developers

Trong ứng dụng Meta:

1. **App Domains**: `YOUR-NEW-SITE.netlify.app`
2. **Valid OAuth Redirect URIs** thêm đúng:
   `https://YOUR-NEW-SITE.netlify.app/.netlify/functions/facebook-auth-callback`
3. Privacy Policy URL:
   `https://YOUR-NEW-SITE.netlify.app/privacy.html`
4. Terms URL:
   `https://YOUR-NEW-SITE.netlify.app/terms.html`
5. Data deletion URL:
   `https://YOUR-NEW-SITE.netlify.app/data-deletion.html`

Không mở callback trực tiếp để thử. Hãy bấm **Kết nối Facebook** trong ứng dụng.

## F. Kiểm tra

Mở:

`https://YOUR-NEW-SITE.netlify.app/.netlify/functions/system-health`

Facebook, Supabase, mã hóa và APP_BASE_URL cần báo `ok`. OpenAI và YouTube có thể để `missing` nếu chưa dùng.

## G. Lưu ý khi đổi tên miền

Mỗi lần đổi site Netlify phải cập nhật đồng thời:

- `APP_BASE_URL`
- `FACEBOOK_REDIRECT_URI`
- Meta Valid OAuth Redirect URIs
- Meta App Domains
- URL chính sách quyền riêng tư, điều khoản và xóa dữ liệu
