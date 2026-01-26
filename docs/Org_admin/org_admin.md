Dựa trên tài liệu bạn cung cấp, dưới đây là bảng liệt kê chi tiết 100% về giao diện, chức năng, logic và quyền hạn của vai trò **Org Admin (Quản trị Tổ chức)**.

Theo tài liệu, Org Admin là người làm chủ không gian làm việc (workspace) của khách hàng, chịu trách nhiệm về cấu hình hệ thống và quản lý con người,.

### 1. Tổng quan vai trò & Phạm vi
*   **Mã vai trò (Role Code):** `ORG` hoặc `ORG_ADMIN`,.
*   **Đối tượng định danh:** `org_memberships` với vai trò là `ORG_ADMIN`.
*   **Phạm vi hoạt động (Scope):** `Tenant Level` (Trong nội bộ tổ chức của họ, bị cô lập bởi `org_id`).

---

### 2. Danh sách Chức năng (Functional Requirements)
Các chức năng được nhóm theo các Epic trong tài liệu BA:

#### A. Xác thực & Truy cập (Authentication)
*   **Đăng nhập (Login):** Truy cập vào hệ thống quản trị.
*   **Đăng xuất (Logout):** Kết thúc phiên làm việc.
*   **Quên mật khẩu:** Khôi phục tài khoản khi cần thiết.

#### B. Quản lý vòng đời nhân sự (Employee Lifecycle)
Đây là chức năng cốt lõi của Org Admin:
1.  **Tạo tài khoản thủ công:** Tạo trực tiếp tài khoản cho nhân viên để họ có thông tin đăng nhập ngay,.
2.  **Mời thành viên (Invite):** Gửi link mời gia nhập qua email để nhân viên tự đăng ký,.
    *   *Logic:* Mã mời có thời hạn (TTL) và có thể vô hiệu hóa/làm mới (Refresh) nếu bị lộ,.
3.  **Vô hiệu hóa (Deactivate):** Ngăn chặn nhân viên truy cập khi nghỉ việc nhưng vẫn giữ lại dữ liệu lịch sử,.
4.  **Kích hoạt lại (Reactivate):** Cho phép nhân viên quay lại làm việc (sau thai sản, nghỉ tạm thời),.
5.  **Reset mật khẩu nhân viên:** Hỗ trợ đặt lại mật khẩu cho nhân viên trong công ty khi họ quên,.

#### C. Quản lý phân quyền nội bộ (Internal RBAC)
1.  **Gán Role:** Phân quyền chức vụ (PM, EMP, CEO) cho nhân viên,.
2.  **Thay đổi Role:** Cập nhật quyền hạn khi nhân sự thăng chức hoặc thuyên chuyển,.
3.  **Tùy chỉnh quyền (Custom Permissions):** Tùy chỉnh quyền hạn chi tiết của một Role cụ thể (nếu hệ thống cho phép) để phù hợp vận hành,.

#### D. Cấu hình Workspace (Organization Settings)
1.  **Cập nhật thông tin công ty:** Thay đổi Logo, tên hiển thị, múi giờ làm việc,.
2.  **Thiết lập quy trình Khóa Log Time:** Cấu hình chu kỳ khóa tự động (ví dụ: khóa sổ vào tối Chủ Nhật),.
3.  **Quản lý danh mục (Lookups):** Thiết lập, thêm/sửa/xóa các danh mục dùng chung như: Nhóm kỹ năng, Loại dự án (Game, Web, App), Trạng thái Task, Độ ưu tiên,,.
4.  **Định nghĩa Custom Fields:** Tạo các trường dữ liệu tùy chỉnh cho Task/Subtask trong tổ chức.

#### E. Quản trị Thùng rác (Recycle Bin Management)
Org Admin có quyền cao nhất với dữ liệu đã xóa của tổ chức:
1.  **Xem danh sách nhân sự đã xóa/vô hiệu hóa:** Quản lý danh sách cựu thành viên,.
2.  **Khôi phục tài khoản:** Khôi phục nhân sự từ thùng rác để giữ nguyên dữ liệu cũ.
3.  **Quản lý dự án đã xóa:** Xem và khôi phục các dự án đã bị xóa (do PM xóa nhầm hoặc cần dùng lại),.

---

### 3. Quyền hạn (Permissions) & Logic RBAC
Theo thiết kế Phase 2 (RBAC Policy), Org Admin sở hữu các quyền sau:

| Tài nguyên (Resource) | Hành động (Action) | Mô tả chi tiết |
| :--- | :--- | :--- |
| **ORG_USER** | `CREATE` | Tạo mới nhân viên vào tổ chức. |
| **ORG_USER** | `INVITE` | Gửi lời mời tham gia tổ chức. |
| **ORG_USER** | `UPDATE` | Cập nhật thông tin/trạng thái nhân viên (Active/Deactivate/Reset Pass). |
| **ORG_USER** | `READ` | Xem danh sách và hồ sơ nhân viên. |
| **ROLE_PERM** | `UPDATE` | Gán và sửa đổi vai trò (Role) của thành viên. |
| **TENANT_ORG** | `UPDATE` | Sửa thông tin cấu hình tổ chức (Tên, múi giờ, setting). |
| **LOOKUP** | `ALL` | Toàn quyền với các bảng danh mục (Status, Priority, Type). |
| **RECYCLE_BIN** | `ALL` | Toàn quyền xem và khôi phục dữ liệu trong thùng rác cấp Org. |

---

### 4. Logic & Quy tắc nghiệp vụ (Business Rules)
1.  **Tenant Isolation (Cách ly):** Mọi hành động của Org Admin chỉ có tác dụng trong `org_id` của họ. Không thể xem hoặc tác động sang Org khác,.
2.  **Invite Code:** Mã mời (Join Code) phải có thời gian hết hạn (expires_at) và có thể bị thu hồi (revoked) bởi Org Admin,.
3.  **Constraint Role:**
    *   Org Admin có thể gán User làm Org Admin khác hoặc làm CEO, PM.
    *   Org Admin **không thể** tự tạo ra Org mới (quyền này thuộc System Admin).
4.  **Khôi phục dữ liệu:** Khi khôi phục nhân viên từ thùng rác hoặc trạng thái Deactive, dữ liệu lịch sử (Log time cũ) phải được bảo toàn.
5.  **Log Time View:** Org Admin có quyền xem Log Time của toàn bộ nhân viên trong Org (tương tự quyền CEO).

---

### 5. Giao diện (UI/UX Concept)
Dựa trên các chức năng, Org Admin sẽ cần các màn hình giao diện sau:

1.  **Màn hình Quản lý Thành viên (Member Management):**
    *   Danh sách nhân viên (Grid view): Hiển thị Avatar, Tên, Email, Role, Trạng thái (Active/Inactive).
    *   Nút hành động: "Thêm mới" (Form), "Mời thành viên" (Nhập email/Copy link), "Vô hiệu hóa", "Reset Password".
    *   Bộ lọc: Lọc theo Role, theo Trạng thái.
2.  **Màn hình Phân quyền (Roles & Permissions):**
    *   Ma trận phân quyền hoặc danh sách Role.
    *   Giao diện gán Role cho User (Dropdown chọn Role trong profile User).
3.  **Màn hình Cấu hình Tổ chức (Org Settings):**
    *   Form thông tin chung: Upload Logo, Tên công ty, Chọn Timezone.
    *   Cấu hình Policy: Toggle bật/tắt khóa Log time, chọn ngày khóa.
    *   Quản lý Danh mục (Master Data): Tab quản lý Status, Priority, Task Type (CRUD list).
4.  **Màn hình Thùng rác (Recycle Bin):**
    *   Danh sách tab: Người dùng đã xóa, Dự án đã xóa.
    *   Nút hành động: "Khôi phục" (Restore), "Xóa vĩnh viễn" (Destroy).

### 6. Dữ liệu liên quan (Database Mapping)
Các bảng dữ liệu chính mà Org Admin tương tác trực tiếp:
*   `organizations`: Cấu hình thông tin tổ chức.
*   `org_memberships`: Quản lý trạng thái thành viên (Active/Deactive).
*   `org_invites`: Quản lý lời mời.
*   `users`: Tạo và quản lý thông tin identity.
*   `roles`, `user_roles`: Quản lý phân quyền.
*   `work_period_locks`: Cấu hình khóa kỳ.
*   `task_statuses`, `task_priorities`: Quản lý danh mục.