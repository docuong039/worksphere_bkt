Dựa trên các tài liệu về User Stories (Epic CEO-07), Phân quyền (RBAC Phase 2) và Thiết kế Database (Phase 1), dưới đây là liệt kê chi tiết **100% giao diện, chức năng và logic** của **Phân hệ Quản lý Công việc Cá nhân (Personal Tasks)** dành riêng cho vai trò **CEO**.

Phân hệ này được thiết kế như một **"Không gian chiến lược riêng tư"**, tách biệt hoàn toàn với các dự án chung của công ty.

---

### 1. Giao diện & Chức năng (Interface & Features)

Giao diện này phục vụ nhu cầu ghi chú nhanh các ý tưởng chiến lược hoặc các đầu việc nhạy cảm mà CEO không muốn công khai cho toàn bộ nhân viên.

#### A. Kanban Board Cá nhân (Personal Kanban)
*   **Hiển thị trực quan:** Giao diện hiển thị các thẻ công việc (Cards) trên bảng Kanban với 3 cột trạng thái mặc định: **To Do** (Cần làm) -> **In Progress** (Đang làm) -> **Done** (Hoàn thành).
*   **Thao tác Kéo - Thả (Drag & Drop):** CEO có thể dùng chuột kéo thả task giữa các cột để cập nhật tiến độ nhanh chóng.
*   **Sắp xếp ưu tiên:** Trong cùng một cột, CEO có thể kéo task lên trên cùng để đánh dấu việc quan trọng cần xử lý trước.

#### B. Quản lý Task Chi tiết (CRUD Operations)
*   **Tạo Task nhanh:** Nút "Tạo việc riêng" cho phép nhập nhanh Tiêu đề và Hạn chót (Due Date). Task này **không** thuộc về bất kỳ dự án nào (Project ID = NULL).
*   **Nội dung task:** Hỗ trợ nhập Mô tả chi tiết (Description), gắn Độ ưu tiên (Priority: High, Medium, Low).
*   **Riêng tư tuyệt đối:** Không có chức năng "Assign" (Giao việc) cho người khác trong giao diện này, vì đây là không gian cá nhân.

---

### 2. Logic Nghiệp vụ & Bảo mật (Business Logic & Security)

Đây là phần quan trọng nhất để đảm bảo tính riêng tư cho lãnh đạo, tuân thủ nguyên tắc **"Strict Isolation" (Cách ly tuyệt đối)**.

#### A. Chính sách Phân quyền (RBAC Policy)
*   **Quyền hạn (Permissions):** Vai trò CEO sở hữu quyền **`MY_TASK.ALL`** (Toàn quyền Tạo, Xem, Sửa, Xóa đối với tài nguyên Task cá nhân).
*   **Chính sách (Policy):** Hệ thống áp dụng Policy mã **`POL-MYTASK-01`**. Chính sách này quy định rằng dữ liệu trong bảng `personal_tasks` chỉ được truy cập khi `user_id` của người đăng nhập trùng khớp hoàn toàn với `user_id` sở hữu task,.

#### B. Logic Cách ly Dữ liệu (Isolation Logic)
*   **Ngăn chặn truy cập chéo:**
    *   **System Admin/Org Admin:** Dù có quyền quản trị hệ thống, họ **không** thể nhìn thấy task cá nhân của CEO trên giao diện người dùng. Logic Backend sẽ chặn mọi query không khớp `user_id`,.
    *   **Nhân viên khác:** Tuyệt đối không thấy.
*   **Phạm vi Tổ chức (Tenant Scope):** Task cá nhân vẫn gắn liền với `org_id` để đảm bảo dữ liệu thuộc về không gian công ty, nhưng được bảo vệ bởi lớp định danh cá nhân.

---

### 3. Thiết kế Dữ liệu Nền tảng (Database Schema)

Dữ liệu của phân hệ này được lưu trữ tách biệt hoàn toàn khỏi bảng `tasks` (của dự án) để tránh nhầm lẫn và rò rỉ thông tin.

**Bảng dữ liệu:** `personal_tasks`,.

| Trường thông tin (Column) | Ý nghĩa & Logic lưu trữ |
| :--- | :--- |
| **`id`** | Định danh duy nhất của task cá nhân (UUID). |
| **`user_id`** | **Khóa chính logic:** Xác định CEO nào sở hữu task này. Đây là trường quan trọng nhất để thực thi Policy `POL-MYTASK-01`. |
| **`org_id`** | Định danh tổ chức (để cô lập dữ liệu Multi-tenant). |
| **`title`** | Tiêu đề công việc chiến lược. |
| **`description`** | Ghi chú chi tiết. |
| **`status_code`** | Trạng thái Kanban (`TODO`, `IN_PROGRESS`, `DONE`). |
| **`priority_code`** | Độ ưu tiên (`URGENT`, `HIGH`, `MEDIUM`, `LOW`). |
| **`sort_order`** | Số nguyên (`int`) dùng để lưu vị trí sắp xếp trên bảng Kanban. |

**Lưu ý quan trọng:**
Bảng này **không có** trường `project_id` (vì không thuộc dự án) và **không có** bảng `task_assignees` đi kèm (vì không giao cho ai khác).

---

### Tóm tắt sự khác biệt: Task Dự án vs. Task Cá nhân của CEO

| Đặc điểm | Task Dự án (Project Tasks) | Task Cá nhân (Personal Tasks) |
| :--- | :--- | :--- |
| **Mục đích** | Quản lý công việc chung, phối hợp team. | Ghi chú riêng tư, chiến lược cá nhân. |
| **Ai thấy?** | PM, thành viên dự án, CEO (giám sát). | **Chỉ duy nhất CEO (Chính chủ).** |
| **Lưu trữ** | Bảng `tasks`. | Bảng `personal_tasks`. |
| **Quyền của CEO** | `PROJECT.READ` (Chỉ xem). | `MY_TASK.ALL` (Toàn quyền). |
| **Chức năng** | Có Log time, Comment, Attach file. | Đơn giản hóa: Chỉ có Status, Priority, Note. |

Đây là thiết kế đảm bảo CEO có một công cụ làm việc cá nhân hiệu quả ngay trên nền tảng quản trị chung mà không lo ngại về việc lộ lọt thông tin nhạy cảm.