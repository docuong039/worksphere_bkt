# Đề xuất Bổ sung Schema & Cấu trúc Onboarding Hệ thống

Tài liệu này ghi nhận các đề xuất thay đổi Database Schema và các giao diện bổ sung để hoàn thiện luồng nghiệp vụ **Đăng ký - Phê duyệt Tổ chức** (SaaS Onboarding), đảm bảo hệ thống vận hành thực tế chuẩn xác.

---

## 1. Đề xuất Bổ sung Database Schema

### Thực trạng hiện tại
Hệ thống quản lý trạng thái tổ chức qua cột `status` trong bảng `organizations`. Tuy nhiên, khi một khách hàng mới đăng ký qua trang Web công khai, chúng ta thiếu nơi lưu trữ thông tin "tạm thời" trước khi họ chính thức trở thành một Tenant trong hệ thống.

### Nội dung đề xuất: Thêm bảng `org_applications`

| Field | Type | Mục đích |
| :--- | :--- | :--- |
| **id** | UUID (PK) | Định danh đơn đăng ký. |
| **org_name** | String | Tên công ty/tổ chức đăng ký. |
| **org_slug** | String | Mã định danh mong muốn (VD: acme-corp). |
| **industry** | String | Ngành nghề kinh doanh (Dùng để phân loại/thống kê). |
| **employee_count**| Integer| Quy mô nhân sự (Dùng để tư vấn gói quota phù hợp). |
| **admin_name** | String | Họ tên người đại diện đăng ký. |
| **admin_email** | String | Email liên hệ chính (Dùng để gửi thông báo/tạo User). |
| **admin_password**| String | Mật khẩu khởi tạo (Lưu hash tạm thời). |
| **plan_requested**| String | Gói dịch vụ yêu cầu (FREE/BASIC/PRO/ENTERPRISE). |
| **status** | Enum | Trạng thái đơn: `PENDING`, `APPROVED`, `REJECTED`. |
| **reject_reason** | Text | Lý do từ chối (nếu có). |
| **processed_at** | DateTime | Thời điểm SysAdmin xử lý đơn. |
| **processed_by** | UUID | ID của SysAdmin đã xử lý đơn. |

**Mục đích:** 
1. Làm căn cứ cho SysAdmin ra quyết định Duyệt/Từ chối dựa trên hồ sơ khách hàng.
2. Tránh làm "rác" bảng `organizations` chính thức bởi các đơn đăng ký ảo hoặc không đủ điều kiện.

---

## 2. Các Giao diện Frontend Bổ sung (Ngoài tài liệu BA ban đầu)

Để đảm bảo luồng nghiệp vụ khép kín (End-to-end), mình đã tạo thêm các giao diện sau đây mặc dù không được liệt kê cụ thể trong danh sách User Stories ban đầu, nhưng là bắt buộc để hệ thống chạy được:

### 2.1. Trang Đăng ký Tổ chức Công khai (`/register-org`)
*   **Mục đích:** Đây là "cửa ngõ" đầu tiên của mô hình SaaS. Cho phép User vãng lai điền thông tin doanh nghiệp và tạo request phê duyệt.
*   **Chức năng:** Form đa bước (Multi-step), validate slug/email, gửi dữ liệu về API đăng ký.

### 2.2. Liên kết Onboarding tại trang Đăng nhập (`/login`)
*   **Thay đổi:** Thêm phần "Chưa có không gian làm việc? Đăng ký ngay" ở cuối Card đăng nhập.
*   **Mục đích:** Điều hướng người dùng mới chưa có tài khoản/tổ chức.

### 2.3. Cập nhật Sidebar Navigation cho System Admin
*   **Thay đổi:** Bổ sung mục **"Duyệt đơn đăng ký"** (biểu tượng CheckCircle2).
*   **Mục đích:** Cung cấp lối tắt nhanh nhất để SysAdmin thực hiện nhiệm vụ hàng ngày (phê duyệt khách hàng mới).

---

## 3. Ảnh hưởng tới các Trang hiện tại

| Trang | Ảnh hưởng/Thay đổi |
| :--- | :--- |
| **Org Approvals Page** | Chuyển từ việc hiển thị bảng `organizations` sang hiển thị dữ liệu từ bảng `org_applications`. Khi nhấn "Approve", hệ thống sẽ tự động chuyển dữ liệu sang bảng `organizations` và `users`. |
| **Admin Dashboard**| Thêm widget thông báo "Có X đơn đăng ký mới đang chờ" để nhắc nhở SysAdmin. |

---

**Ghi chú:** Các đề xuất này giúp hệ thống đạt mức "Production Ready" (Sẵn sàng vận hành thực tế) thay vì chỉ dừng lại ở mức bản thảo ý tưởng. Các giao diện FE đã được thiết kế theo phong cách hiện đại, premium để "wow" người dùng ngay từ bước đăng ký đầu tiên.
