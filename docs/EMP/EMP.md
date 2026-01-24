

Dưới đây là bản **Đặc tả Kỹ thuật Chuẩn (Spec)** cho vai trò EMP được tổng hợp lại từ toàn bộ nguồn dữ liệu của bạn. Bạn hãy copy nguyên văn đoạn dưới đây để giao việc:

---

### ĐẶC TẢ KỸ THUẬT: VAI TRÒ NHÂN VIÊN (EMPLOYEE - EMP)

#### 1. Nguyên tắc Phân quyền Cốt lõi (Core Principles)
*   **Quyền hạn:** EMP có quyền hạn giới hạn, tập trung vào thực thi. Chỉ có quyền chỉnh sửa/xóa đối với dữ liệu do **chính mình tạo ra** (Ownership),.
*   **Cô lập dữ liệu (Isolation):**
    *   Dữ liệu chung: Luôn bị lọc theo `org_id`.
    *   Dữ liệu cá nhân: Task cá nhân (`personal_tasks`) phải được cô lập tuyệt đối, ngay cả Admin/CEO cũng không được xem,.

#### 2. Bảng Ma trận Quyền hạn (Permission Matrix)
Các hành động (Action) cụ thể mà EMP được phép gọi API:

| Đối tượng (Resource) | Hành động (Action) | Ghi chú kỹ thuật & Ràng buộc (Constraints) | Nguồn |
| :--- | :--- | :--- | :--- |
| **TASK** | `READ` | Xem task được gán (`task_assignees`) hoặc thuộc dự án của mình. |, |
| **TASK** | `UPDATE` | **Hạn chế:** Chỉ sửa được các trường (Field) mà PM cấp quyền trong bảng `project_field_user_permissions`. Không được sửa Title/Deadline/Status của Task chính. |, |
| **SUBTASK** | `CREATE`, `UPDATE`, `DELETE` | Toàn quyền với Subtask do **mình tạo** (`created_by = ME`). Được phép chuyển trạng thái (`status_code`). |, |
| **TIME_LOG** | `LOG_TIME` | Ghi nhận thời gian. **Ràng buộc:** Task/Subtask phải ở trạng thái `DONE`. |, |
| **TIME_LOG** | `UPDATE`, `DELETE` | Chỉ sửa log của mình (`owner_user_id = ME`) VÀ trong kỳ chưa bị khóa (`is_locked = FALSE`). |, |
| **REPORT** | `CREATE`, `SUBMIT` | Tạo và gửi báo cáo tuần/tháng. |, |
| **REPORT** | `READ`, `EXPORT` | Xem và xuất file lịch sử báo cáo của chính mình. | |
| **COMMENT** | `CREATE`, `READ` | Thảo luận trên Task/Subtask mình được thấy. |, |
| **ASSET** | `CREATE`, `DOWNLOAD` | Upload/Download tài liệu đính kèm. |, |
| **MY_TASK** | `ALL` (CRUD) | Toàn quyền với Task cá nhân (Private Kanban). |, |
| **NOTIFICATION**| `READ`, `UPDATE` | Xem và đánh dấu đã đọc (`is_read = TRUE`). |, |

#### 3. Các Logic Nghiệp vụ Bắt buộc (Business Logic Constraints)
Dev Backend bắt buộc phải `Validate` các điều kiện sau trước khi ghi dữ liệu:

**A. Logic Log Time (Quan trọng nhất):**
1.  **Trạng thái:** Chỉ được Log Time khi Task (hoặc Subtask) có trạng thái là `DONE`,.
2.  **Quy tắc ưu tiên Subtask:**
    *   Nếu Task chính **CÓ** Subtask: Bắt buộc phải log vào từng Subtask (`subtask_id` không được NULL).
    *   Nếu Task chính **KHÔNG** Subtask: Mới được log vào Task chính,.
3.  **Khóa kỳ (Locking):** Hệ thống chặn tuyệt đối (Block) hành động Thêm/Sửa/Xóa Log time nếu ngày làm việc (`work_date`) nằm trong khoảng thời gian đã bị PM khóa (`work_period_locks.is_locked = TRUE`),.

**B. Logic Sở hữu & Sửa xóa:**
1.  **Subtask:** EMP có thể tự chuyển trạng thái Subtask (To Do -> Done) nhưng **không** được chuyển trạng thái Task chính (Chỉ PM được làm),.
2.  **Xung đột dữ liệu:** Nếu 2 người cùng sửa một Task/Subtask, sử dụng `row_version` để chặn người lưu sau (Optimistic Locking),.

**C. Thông báo & Báo cáo:**
1.  EMP nhận thông báo khi: Được assign Task, Task chuyển trạng thái Done, hoặc có Comment mới, PM khóa kỳ.
2.  Báo cáo gửi đi (`reports`) không được sửa/xóa sau khi đã được duyệt (`APPROVED`).

#### 4. Checklist Giao diện (UI Requirements)
Front-end cần xử lý các trạng thái hiển thị sau:
*   **Nút "Log Time":** Phải bị Ẩn (Hidden) hoặc Vô hiệu hóa (Disabled) nếu Task chưa `DONE`.
*   **Form chi tiết Task:** Các trường thông tin (Title, Priority) phải ở chế độ `Read-only`. Chỉ các trường được cấp quyền (Custom Fields) mới hiển thị Input để sửa,.
*   **Nút Sửa/Xóa Subtask:** Chỉ hiển thị ở các dòng Subtask do chính user đó tạo ra.

---
*Tổng hợp dựa trên tài liệu User Story, Phân quyền Phase 1-2 và Database Design.*