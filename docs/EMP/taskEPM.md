Dưới đây là phân tích chuyên sâu về **Nhóm Giao diện Quản lý Công việc (Work Execution)** dành cho vai trò Nhân viên (EMP), bao gồm chi tiết về thiết kế giao diện, chức năng và các logic nghiệp vụ ràng buộc dựa trên 5 tài liệu bạn đã cung cấp.

### 1. Màn hình Danh sách Công việc (My Assigned Tasks)

Đây là điểm khởi đầu (entry point) để EMP biết mình cần làm gì trong ngày.

*   **Chức năng chính:**
    *   **Hiển thị danh sách:** Liệt kê các Task mà EMP được chỉ định (assign) hoặc thuộc dự án mà EMP là thành viên,.
    *   **Tìm kiếm & Lọc (Filter):** Cho phép EMP lọc công việc theo Trạng thái (To Do, In Progress...), Độ ưu tiên (High, Medium...), Tên task, và các trường tùy chỉnh (Custom Fields).

*   **Logic Dữ liệu & Hiển thị:**
    *   **Dữ liệu nguồn:** Truy vấn từ bảng `tasks` kết hợp với bảng `task_assignees` với điều kiện `task_assignees.user_id = Current_User_ID`,.
    *   **Thông tin hiển thị:** Tiêu đề task, Dự án, Hạn chót (Due Date), Độ ưu tiên, Trạng thái hiện tại.
    *   **Phân trang/Sắp xếp:** Hỗ trợ sắp xếp theo hạn chót hoặc độ ưu tiên để xử lý việc gấp trước.

### 2. Màn hình Chi tiết Task (Task Detail View)

Đây là giao diện quan trọng nhất, nơi EMP thực hiện công việc cụ thể. Màn hình này được chia thành 4 khu vực chức năng chính:

#### A. Khu vực Thông tin Task (Task Information)
*   **Giao diện:**
    *   Hiển thị Tiêu đề, Mô tả (Rich Text), Hạn chót, Độ ưu tiên.
    *   Hiển thị các Custom Fields (ví dụ: Link Design, Mã JIRA).
*   **Logic Phân quyền (Quan trọng):**
    *   **Quyền xem (Read):** EMP xem được toàn bộ thông tin của Task được giao,.
    *   **Quyền sửa (Edit):**
        *   EMP **không được sửa** các trường cốt lõi: Tiêu đề, Độ ưu tiên, Hạn chót, Trạng thái Task chính.
        *   EMP **được phép sửa** các trường cụ thể (Custom Fields) nếu PM/MNG đã phân quyền cho họ thông qua bảng `project_field_user_permissions` (Policy code: `POL-TASK-FIELD-01`),,.
    *   **Cơ chế khóa:** Nếu `row_version` thay đổi (có người khác vừa sửa), hệ thống sẽ chặn cập nhật để tránh xung đột dữ liệu (Optimistic Locking),.

#### B. Khu vực Quản lý Subtask (Đầu việc con)
Đây là nơi EMP có quyền hạn cao nhất để tự quản lý kế hoạch chi tiết của mình.

*   **Giao diện:**
    *   Danh sách các subtask nằm trong Task chính.
    *   Nút "Thêm subtask", các icon Sửa/Xóa/Kéo thả sắp xếp bên cạnh mỗi subtask.
    *   Checkbox hoặc Dropdown để đổi trạng thái Subtask (Todo -> Done).
*   **Chức năng & Logic:**
    *   **Tạo mới:** EMP được tạo subtask mới, nhập tiêu đề, ngày bắt đầu/kết thúc,.
    *   **Quyền sở hữu (Ownership):** Hệ thống áp dụng ABAC Rule `owner_user_id = ME`. EMP chỉ được sửa, xóa hoặc sắp xếp các subtask **do chính mình tạo ra**,,.
    *   **Cập nhật tiến độ:** EMP có quyền chuyển trạng thái Subtask sang "Done" để báo cáo hoàn thành phần việc nhỏ,.
    *   **Ràng buộc thời gian:** Ngày kết thúc của Subtask không được vượt quá Due Date của Task chính (Logic App Layer).
    *   **Ràng buộc khóa kỳ:** Nếu dự án đang bị khóa (`is_locked = TRUE`), các nút Tạo/Sửa/Xóa subtask sẽ bị vô hiệu hóa (Disabled).

#### C. Khu vực Tài liệu (Attachments)
*   **Giao diện:**
    *   Danh sách file đính kèm với Task/Subtask.
    *   Nút Upload file, Preview file.
*   **Logic:**
    *   EMP được phép upload file minh chứng kết quả hoặc tài liệu liên quan vào Task/Subtask.
    *   Dữ liệu được lưu trong bảng `task_attachments` hoặc `subtask_attachments` và liên kết với bảng `documents`,.

#### D. Khu vực Thảo luận (Collaboration/Threads)
*   **Giao diện:**
    *   Khung chat/comment nằm ở cuối hoặc bên phải màn hình chi tiết Task.
    *   Hiển thị comment theo luồng (Thread): Comment chính và các Reply thụt đầu dòng,.
    *   Trình soạn thảo hỗ trợ Rich Text (đậm, nghiêng, link) và tính năng Tag tên.
*   **Chức năng:**
    *   **Bình luận:** EMP viết comment để trao đổi, báo cáo khó khăn.
    *   **Tagging (@Mention):** Gõ "@" để hiện danh sách người liên quan trong dự án. Khi tag, hệ thống ghi nhận vào bảng `task_comment_mentions` và bắn thông báo cho người được tag,.
    *   **Quyền hạn:** EMP xem được comment của cả PM và đồng nghiệp khác trên Task đó.

### 3. Các Logic Hệ thống Ẩn (Backend Logic)

Để giao diện hoạt động đúng chuẩn thiết kế, hệ thống phải thực thi các quy tắc ngầm sau:

1.  **Isolation (Cô lập dữ liệu):** Mọi truy vấn hiển thị Task/Subtask đều phải lọc theo `org_id` của công ty và kiểm tra xem User có thuộc Project đó không (`project_members`),.
2.  **Trạng thái Task Chính:**
    *   Giao diện EMP sẽ **không hiển thị** nút "Complete Task" (Hoàn thành Task chính) vì quyền này thuộc về PM.
    *   Tuy nhiên, nếu Task chính đã được PM chuyển sang `DONE`, giao diện sẽ hiển thị nút **Log Time** (Ghi nhận thời gian) để EMP chấm công.
3.  **Kiểm soát xóa (Soft Delete):** Khi EMP xóa một Subtask, nó không mất vĩnh viễn mà được đánh dấu `deleted_at` và đưa vào "Thùng rác cá nhân" (Personal Recycle Bin). EMP có thể vào đó để khôi phục nếu lỡ tay,.

### Tóm tắt Ma trận Quyền hạn trên Giao diện này

| Đối tượng | Hành động | Quyền của EMP | Điều kiện ràng buộc (Constraint) |
| :--- | :--- | :--- | :--- |
| **Task** | Xem (Read) | ✅ Có | Được assign hoặc là member dự án |
| **Task** | Sửa (Update) | ⚠️ Hạn chế | Chỉ sửa các Custom Field được phân quyền |
| **Task** | Đổi trạng thái | ❌ Không | Chỉ PM mới được đổi Task Status |
| **Subtask** | Tạo (Create) | ✅ Có | Task cha phải tồn tại |
| **Subtask** | Sửa/Xóa | ✅ Có | Chỉ sửa/xóa subtask do mình tạo (`created_by=Me`) |
| **Subtask** | Đổi trạng thái | ✅ Có | Tự chuyển trạng thái subtask của mình |
| **Comment** | Tạo/Trả lời | ✅ Có | |
| **File** | Upload/Tải | ✅ Có | |

Cách thiết kế này đảm bảo EMP có đủ không gian để quản lý chi tiết công việc của mình (thông qua Subtask) nhưng vẫn giữ được kỷ luật và kế hoạch chung do PM kiểm soát (thông qua Task chính).