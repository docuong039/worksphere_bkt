Dựa trên 5 nguồn tài liệu BA và thiết kế hệ thống, dưới đây là chi tiết **100% logic chức năng** cho hai giao diện cốt lõi của System Admin: **Giao diện Quản lý Tổ chức (Platform Organization Management)** và **Giao diện Duyệt/Tạo Tổ chức (Organization Approval/Creation)**.

---

### 1. Giao diện: Hệ thống Quản lý Tổ chức (Platform Organization Management)
**Mục đích:** Đây là màn hình "Control Panel" nơi System Admin giám sát, can thiệp và quản lý vòng đời của tất cả các Tenant (Khách hàng) đang hoạt động trên hệ thống SaaS.

#### A. Logic Hiển thị & Dashboard (View Logic)
1.  **Dashboard Tổng quan (BI):**
    *   Hiển thị **Tổng số Tổ chức (Organizations)** hiện có trên hệ thống.
    *   Hiển thị **Tổng số User Active** trên toàn bộ nền tảng (cộng dồn từ tất cả các Org).
    *   Dữ liệu được tổng hợp từ bảng `organizations` và `users` với quyền truy cập toàn cục (Global Scope).
2.  **Danh sách Tổ chức (Grid View):**
    *   Liệt kê các trường thông tin: Tên tổ chức (`name`), Mã định danh (`code`), Trạng thái (`status`), Gói dịch vụ (Quota), Ngày tạo (`created_at`).
    *   **Logic lọc dữ liệu (Filter):** System Admin có quyền xem danh sách **bỏ qua bộ lọc `org_id`** (Cross-tenant view), khác với user thường chỉ thấy Org của mình,.

#### B. Logic Quản lý Trạng thái (Status Management)
1.  **Đình chỉ Tổ chức (Suspend):**
    *   **Hành động:** Admin chuyển trạng thái của Org sang `SUSPENDED`,.
    *   **Logic Backend:** Update cột `status` trong bảng `organizations` thành 'SUSPENDED'.
    *   **Hệ quả:** Ngăn chặn tất cả user thuộc Org đó đăng nhập hoặc truy cập tài nguyên.
2.  **Kích hoạt lại (Activate):**
    *   **Hành động:** Admin khôi phục trạng thái từ `SUSPENDED` sang `ACTIVE`.
    *   **Mục đích:** Xử lý các trường hợp khách hàng chậm thanh toán hoặc vi phạm chính sách đã được giải quyết.

#### C. Logic Cấu hình Giới hạn (Quota Management)
1.  **Thiết lập Quota (Resource Limits):**
    *   Admin có thể cấu hình các thông số sau cho từng Org cụ thể tại bảng `org_quotas`,:
        *   `max_users`: Số lượng user tối đa (Default: 50).
        *   `max_storage_mb`: Dung lượng lưu trữ tối đa (Default: 1024 MB).
        *   `max_projects`: Số lượng dự án tối đa (Default: 50).
    *   **Ràng buộc (Constraint):** Các giá trị nhập vào phải `>= 0`.
2.  **Thời hạn gói (Effective Dating):**
    *   Cấu hình ngày hiệu lực (`effective_from`) và ngày hết hạn (`effective_to`) cho gói dịch vụ của Org.

#### D. Logic Hỗ trợ & Truy cập Sâu (Support & Access)
1.  **Đăng nhập dưới quyền (Impersonate):**
    *   **Chức năng:** Admin đăng nhập vào Org của khách hàng với tư cách một User cụ thể để debug/hỗ trợ.
    *   **Logic Bảo mật (Bắt buộc):**
        *   Hệ thống phải tạo một bản ghi trong bảng `impersonation_sessions` bao gồm: `actor_user_id` (Admin), `subject_user_id` (User bị giả danh), và `reason` (Lý do bắt buộc nhập).
        *   Audit Log phải ghi lại `original_actor_id` là System Admin để đảm bảo tính minh bạch (Accountability).
    *   **Rủi ro SoD:** Hệ thống cảnh báo nếu Admin cố tình Impersonate để xem/sửa Audit Log của chính mình.

#### E. Logic Thùng rác Hệ thống (System Recycle Bin)
1.  **Xem danh sách đã xóa:**
    *   Liệt kê các Organization có `deleted_at IS NOT NULL`.
    *   Dữ liệu lấy từ bảng `recycle_bin_items` với `entity_type = 'ORGANIZATION'`.
2.  **Khôi phục (Restore):**
    *   Admin khôi phục Org cùng toàn bộ dữ liệu (User, Project...) bằng cách set `deleted_at = NULL`,.
3.  **Xóa vĩnh viễn (Destroy/Hard Delete):**
    *   Thực hiện xóa vật lý bản ghi khỏi Database để giải phóng tài nguyên hoặc tuân thủ pháp lý.

---

### 2. Giao diện: Trang Duyệt & Tạo Đơn Đăng Ký Tổ chức (Approval & Creation)
**Mục đích:** Kiểm soát "đầu vào" của hệ thống, xử lý các yêu cầu tạo mới Tenant từ khách hàng hoặc sale.

#### A. Logic Phê duyệt Đơn đăng ký (Approval Workflow)
1.  **Xem danh sách chờ (Pending List):**
    *   Lọc các bản ghi trong bảng `organizations` có `status = 'PENDING'`.
2.  **Phê duyệt (Approve):**
    *   **Hành động:** Admin nhấn nút "Approve".
    *   **Logic:**
        *   Cập nhật `status` từ `PENDING` sang `ACTIVE`.
        *   Kích hoạt không gian làm việc cho khách hàng.
    *   **Quyền hạn:** Yêu cầu Permission `PLATFORM_ORG.APPROVE`.
    *   **Kiểm soát rủi ro (SoD):** Hệ thống cảnh báo nếu người Tạo đơn và người Duyệt đơn là cùng một tài khoản (tự biên tự diễn).

#### B. Logic Tạo mới Thủ công (Manual Creation)
1.  **Khởi tạo Tổ chức:**
    *   Admin điền form tạo mới gồm: `name`, `code` (Slug duy nhất toàn hệ thống), `timezone` (Mặc định: Asia/Ho_Chi_Minh).
    *   Permission: `PLATFORM_ORG.CREATE`.
2.  **Thiết lập Quota ban đầu:**
    *   Ngay khi tạo, hệ thống tự động gán Quota mặc định hoặc Admin tùy chỉnh ngay tại form tạo mới.

#### C. Logic Bàn giao Tài khoản (Handover)
1.  **Tạo Org Admin đầu tiên:**
    *   Sau khi Org được tạo/duyệt, System Admin tạo tài khoản User đầu tiên cho khách hàng.
    *   **Logic:**
        *   Tạo User mới trong bảng `users` (nếu chưa có).
        *   Tạo liên kết trong `org_memberships` với Org vừa tạo.
        *   Gán Role `ORG_ADMIN` cho User này trong bảng `user_roles`,.
    *   Đây là bước "trao chìa khóa" để khách hàng tự quản lý hệ thống của họ về sau.

### Tóm tắt Quyền hạn & Tài nguyên (RBAC Mapping)
Để thực hiện các chức năng trên, System Admin cần sở hữu bộ quyền (Permission) sau trong bảng `role_permissions`:

| Hành động Logic | Permission Code | Resource (Bảng DB) |
| :--- | :--- | :--- |
| Tạo/Duyệt Org | `PLATFORM_ORG.CREATE`, `PLATFORM_ORG.APPROVE` | `organizations` |
| Sửa trạng thái/Quota | `PLATFORM_ORG.UPDATE` | `organizations`, `org_quotas` |
| Xóa/Khôi phục Org | `PLATFORM_ORG.DESTROY`, `PLATFORM_ORG.RESTORE` | `organizations` (deleted_at) |
| Tạo Org Admin | `ORG_USER.CREATE` | `users`, `org_memberships` |
| Đăng nhập hỗ trợ | `SESSION.IMPERSONATE` | `impersonation_sessions` |
| Xem Log hệ thống | `SYS_AUDIT.READ` | `audit_logs` |