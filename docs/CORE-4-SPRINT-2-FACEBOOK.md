# CORE 4.0 — Sprint 2 Facebook Engine

Sprint 2 mở rộng Facebook đang có trong CORE 3.0 thay vì viết OAuth mới từ đầu.

Repo hiện tại đã có:
- `facebook-auth-start.mjs`
- `facebook-auth-callback.mjs`
- token Facebook Page được lưu mã hóa trong `oauth_connections`
- `sync-provider.mjs` đồng bộ follower/fan cơ bản

Sprint 2 thêm:
- `facebook_pages`
- `facebook_posts`
- KPI Facebook vào `kpi_daily`
- `core4-facebook-status`
- `core4-facebook-sync`
- `core4-facebook-dashboard`

## Cực kỳ quan trọng: Supabase server key
Các bảng CORE 4 bật RLS và không cấp quyền ghi cho browser.
Để Sprint 2 ghi dữ liệu, Netlify phải có MỘT trong:
- `SUPABASE_SECRET_KEY` (khuyến nghị nếu project Supabase mới cung cấp secret key)
- hoặc `SUPABASE_SERVICE_ROLE_KEY`

Không đưa khóa này vào `public/`, GitHub, ảnh chụp, hoặc JavaScript trình duyệt.

## Meta permissions
Kết nối hiện tại yêu cầu:
- `pages_show_list`
- `pages_read_engagement`

Đọc bài Page thường cần quyền bổ sung phù hợp, ví dụ `pages_read_user_content`.
Một số Insights cần quyền/phê duyệt bổ sung. Vì vậy function sync dùng chế độ graceful fallback:
- Page follower/fan vẫn đồng bộ được nếu token hiện tại cho phép.
- Nếu đọc posts bị Meta từ chối, response trả `posts.ok=false` và warning; không làm hỏng toàn bộ đồng bộ.

File `OPTIONAL-facebook-auth-start-with-extra-scopes.mjs` chỉ dùng SAU KHI quyền bổ sung đã được Meta cấp/duyệt.

## Test
1. `/.netlify/functions/core4-facebook-status`
2. POST `/.netlify/functions/core4-facebook-sync`
3. `/.netlify/functions/core4-facebook-dashboard`
