Dựa trên các tài liệu đã cung cấp, câu trả lời là **ĐÚNG**. Theo thiết kế hiện tại, nhân viên (EMP) **không có quyền** tự cấu hình bật/tắt thông báo và **không có chức năng** đổi mật khẩu chủ động trong trang cài đặt (Settings).

Dưới đây là chi tiết cụ thể từ tài liệu:

### 1. Về Cấu hình Thông báo (Notification Settings)
Nhân viên (EMP) hoàn toàn phụ thuộc vào cấu hình chung của dự án do Quản lý (PM) thiết lập.

*   **EMP không có quyền:** Trong danh sách User Story của EMP (Epic EMP-05), nhân viên chỉ có quyền **nhận thông báo**, xem danh sách và đánh dấu đã đọc/chưa đọc. Bảng phân quyền (Permission Matrix) xác nhận EMP chỉ có quyền `NOTIFICATION.READ` và `NOTIFICATION.UPDATE` (để đánh dấu đã đọc).
*   **Quyền thuộc về PM:** Chỉ có Project Manager (MNG) mới có quyền cấu hình bật/tắt các loại thông báo thông qua User Story **US-MNG-07-03**: *"Là PM, tôi muốn cấu hình bật/tắt một số loại thông báo theo dự án..."*.
*   **Cơ chế áp dụng:** Tài liệu thiết kế Database ghi rõ tại bảng `project_notification_settings`: *"Thiết kế này là project-wide (áp dụng cho toàn bộ thành viên trong project)"*. Hiện tại chưa hỗ trợ cấu hình cá nhân (per-user preference) cho từng nhân viên.

### 2. Về Đổi mật khẩu (Change Password)
Nhân viên (EMP) không có chức năng "Đổi mật khẩu" trong giao diện người dùng (User Profile), mà chỉ có thể thay đổi mật khẩu thông qua quy trình "Quên mật khẩu".

*   **Không có chức năng đổi mật khẩu chủ động:** Trong Epic EMP-00 (Xác thực), chỉ tồn tại 3 User Stories: Đăng nhập, Đăng xuất và **Yêu cầu khôi phục mật khẩu**. Không có User Story nào mô tả việc EMP vào trang cá nhân để nhập mật khẩu cũ và đổi mật khẩu mới.
*   **Cách duy nhất để đổi:** EMP phải sử dụng tính năng **"Quên mật khẩu" (Forgot Password)** để nhận link reset qua email (US-EMP-00-03).
*   **Hỗ trợ từ Admin:** Ngoài ra, Org Admin có quyền **Reset mật khẩu** cho nhân viên nếu nhân viên không tự thao tác được (US-ORG-01-05).

**Tóm lại:** Vai trò EMP được thiết kế tập trung tối đa vào việc **thực thi task và báo cáo**, các quyền hạn về cấu hình hệ thống hoặc quản lý tài khoản cá nhân đã được lược bỏ hoặc chuyển giao cho cấp quản lý để đơn giản hóa quy trình vận hành.