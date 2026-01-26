Dựa trên tài liệu đã cung cấp, dưới đây là danh sách **100% đầy đủ** các giao diện và chức năng logic của vai trò **System Admin (Quản trị Hệ thống)**. Đây là vai trò có quyền lực cao nhất ("God Mode"), quản lý toàn bộ nền tảng SaaS Multi-tenant.

### 1. Nhóm Chức năng: Xác thực & Truy cập (Authentication)
**Mục tiêu:** Đảm bảo an ninh cao nhất cho tài khoản quản trị toàn cục.

| Giao diện (UI) | Chức năng Logic (Backend/Business Logic) | Nguồn |
| :--- | :--- | :--- |
| **Màn hình Đăng nhập Admin** | **Đăng nhập (Login):** Xác thực với quyền bảo mật cao để truy cập hệ thống quản trị SaaS. |, |
| **Nút Đăng xuất (Logout)** | **Đăng xuất an toàn:** Ngắt ngay lập tức các phiên làm việc đặc quyền để bảo mật. | |
| **Màn hình Quên mật khẩu** | **Reset Password (Self-service):** Gửi email xác thực để admin tự khôi phục mật khẩu. | |

---

### 2. Nhóm Chức năng: Quản trị Tổ chức & Khách hàng (Platform & Tenant Management)
**Mục tiêu:** Quản lý vòng đời của các khách hàng (Organization) sử dụng phần mềm.

| Giao diện (UI) | Chức năng Logic (Backend/Business Logic) | Nguồn |
| :--- | :--- | :--- |
| **Form Tạo mới / Duyệt Tổ chức** | **Tạo/Phê duyệt Organization (CREATE/APPROVE):** Khởi tạo không gian làm việc cho khách hàng mới. Kích hoạt Org từ trạng thái *Pending* sang *Active*. |,, |
| **Danh sách Tổ chức (List View)** | **Quản lý trạng thái (Suspend/Activate):** Có quyền **đình chỉ (Suspend)** một tổ chức (do vi phạm/chậm thanh toán) hoặc kích hoạt lại. |, |
| **Form Cấu hình Gói (Quota)** | **Thiết lập giới hạn tài nguyên (Update Quota):** Cấu hình số lượng user tối đa (`max_users`), dung lượng lưu trữ (`max_storage_mb`), số dự án tối đa (`max_projects`) cho từng Org. Dữ liệu lưu tại bảng `org_quotas`. |,, |
| **Form Tạo User Quản trị** | **Khởi tạo Org Admin:** Tạo tài khoản quản trị viên đầu tiên cho khách hàng để bàn giao hệ thống. |, |
| **Danh sách Roles hệ thống** | **Định nghĩa Master Roles:** Tạo và chỉnh sửa danh sách Role và Permission mặc định (Role Template) cho toàn hệ thống (Scope: PLATFORM), làm khung chuẩn cho các Org. |,, |

---

### 3. Nhóm Chức năng: Hỗ trợ & Bảo mật (Support & Security)
**Mục tiêu:** Hỗ trợ kỹ thuật khẩn cấp và xử lý sự cố cho người dùng cuối.

| Giao diện (UI) | Chức năng Logic (Backend/Business Logic) | Nguồn |
| :--- | :--- | :--- |
| **Công cụ Reset Password User** | **Reset mật khẩu khẩn cấp:** Có quyền thay đổi mật khẩu cho **bất kỳ User nào** trong hệ thống (khi có yêu cầu hỗ trợ đặc biệt). |, |
| **Nút "Đăng nhập dưới quyền"** | **Impersonate (Giả danh):** Đăng nhập vào Org của khách hàng dưới danh nghĩa một User cụ thể để debug/hỗ trợ. <br> **Logic bắt buộc:** Phải ghi log lý do vào bảng `impersonation_sessions` và hệ thống audit log ghi lại `original_actor_id` là System Admin. |,,, |
| **Audit Log Viewer (Toàn cục)** | **Xem Audit Log hệ thống:** Truy xuất lịch sử thao tác của toàn bộ hệ thống (cross-tenant) để biết ai đã can thiệp vào dữ liệu nào, vào lúc nào. |,, |

---

### 4. Nhóm Chức năng: Giám sát & Thùng rác (Monitoring & Recycle Bin)
**Mục tiêu:** Theo dõi sức khỏe hệ thống và quản lý dữ liệu bị xóa.

| Giao diện (UI) | Chức năng Logic (Backend/Business Logic) | Nguồn |
| :--- | :--- | :--- |
| **Dashboard Tổng quan (System)** | **Thống kê toàn cục (BI):** Xem tổng số lượng Org, tổng số User active trên toàn hệ thống để đánh giá sự phát triển sản phẩm. |, |
| **Thùng rác Hệ thống (List)** | **Xem danh sách Org đã xóa:** Liệt kê các Organization đã bị xóa mềm (`deleted_at` is not null). |, |
| **Nút Khôi phục (Restore)** | **Khôi phục Organization:** Khôi phục lại Org cùng toàn bộ dữ liệu đi kèm (User, Project, Task...) từ thùng rác. |, |
| **Nút Xóa vĩnh viễn (Destroy)** | **Xóa cứng (Hard Delete):** Xóa vĩnh viễn Organization và giải phóng tài nguyên hệ thống (Dọn dẹp `recycle_bin_items`). |, |

---

### 5. Logic Kỹ thuật Đặc quyền (System Admin Specific Logic)
Những logic này chạy ngầm dưới hệ thống, phân biệt System Admin với các user khác:

1.  **Bypass Tenant Isolation (Vượt qua cô lập dữ liệu):**
    *   Khác với User thường luôn bị chặn bởi filter `WHERE org_id = current_org`, System Admin có một filter đặc biệt để bỏ qua điều kiện này khi cần xem dữ liệu toàn cục hoặc hỗ trợ,.
    *   Role System Admin có `org_id IS NULL` và `scope_type = PLATFORM` trong cơ sở dữ liệu,,.

2.  **Audit Trail Chặt chẽ cho Impersonation:**
    *   Khi sử dụng chức năng "Đăng nhập dưới quyền" (Impersonate), hệ thống ghi nhận `actor_user_id` là người bị giả danh, nhưng trường `original_actor_id` trong log phải lưu ID của System Admin để đảm bảo tính minh bạch và trách nhiệm giải trình (Accountability),.

3.  **Quyền "God Mode" (Quyền tối thượng):**
    *   System Admin nắm giữ các quyền hạn đặc biệt mà không Role nào khác có: `PLATFORM_ORG.CREATE`, `PLATFORM_ORG.APPROVE`, `SYS_AUDIT.READ`, `SESSION.IMPERSONATE`.

### Tóm tắt tài nguyên (Resource) System Admin quản lý:
Theo thiết kế Database và Resource Catalog:
*   **PLATFORM_ORG**: Tổ chức (System View).
*   **SYS_AUDIT**: Nhật ký hệ thống.
*   **ORG_USER**: Tài khoản người dùng (toàn cục).
*   **ROLE_PERM**: Master Roles.
*   **SESSION**: Phiên làm việc (bao gồm Impersonate).

**Kết luận:** System Admin sở hữu **15 User Stories** riêng biệt và nắm giữ các quyền kiểm soát sinh sát đối với các Organization (Tạo/Duyệt/Khóa/Xóa) cũng như quyền truy cập dữ liệu mức thấp nhất (Audit/Impersonate).   