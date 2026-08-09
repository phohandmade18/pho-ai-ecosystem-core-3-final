# Release notes — CORE 2.3.2

- Chuẩn hóa Facebook OAuth sang `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_REDIRECT_URI`.
- Giữ tương thích biến `META_*` cũ nhưng không yêu cầu tạo chúng.
- Làm sạch khoảng trắng, dấu ngoặc và chuỗi `KEY=value` khi đọc cấu hình.
- Callback lỗi quay về giao diện với `oauth_error` thay vì trang JSON trắng.
- Lưu tất cả Fanpage được tài khoản quản lý.
- System Health hiển thị phiên bản 2.3.2 và kiểm tra đúng bộ biến Facebook mới.
- Thêm `.env.example`, `.gitignore` và hướng dẫn triển khai GitHub/Netlify mới.
