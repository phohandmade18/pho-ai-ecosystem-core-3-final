# THỨ TỰ CẤU HÌNH DỮ LIỆU THẬT

## 1. Supabase
- Tạo project.
- Chạy `supabase/schema-production.sql`.
- Lấy Project URL và Secret key.
- Chỉ đặt Secret key ở Netlify Environment Variables.

## 2. Netlify Variables
Nhập các biến trong `.env.example`.
`TOKEN_ENCRYPTION_KEY` là chuỗi bí mật dài và không nên thay sau khi lưu OAuth token.

## 3. YouTube
- Bật YouTube Data API v3 và YouTube Analytics API.
- Tạo OAuth Web Client.
- Redirect URI: `https://pho-ai-ecosystem.netlify.app/oauth/youtube/callback`.
- Thêm email sở hữu kênh vào Test users khi ứng dụng còn ở Testing.

## 4. Facebook
- Tạo Meta App.
- Cấu hình OAuth redirect.
- Quyền khởi đầu: `pages_show_list`, `pages_read_engagement`.
- App Development mode chỉ dùng với tài khoản có vai trò trong app.

## 5. OpenAI
- Đặt API key trong Netlify.
- Budget Guard mặc định 5 USD/tháng.
- Model mặc định `gpt-4.1-mini`.

## 6. Lịch tự động
- 08:00 và 21:00 Việt Nam: đồng bộ KPI.
- 22:15 Việt Nam: tạo Brief.
- Cron của Netlify sử dụng UTC.
