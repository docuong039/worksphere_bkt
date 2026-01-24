Dựa trên tài liệu **Epic EMP-06**, **Phân quyền Phase 1 & 2**, và **Thiết kế Database**, tôi xin trình bày chi tiết về **Giao diện & Logic Thùng rác Cá nhân (Personal Recycle Bin)** dành cho nhân viên (EMP).

Đây là "lưới an toàn" giúp nhân viên khôi phục lại các dữ liệu lỡ tay xóa nhầm, hoạt động dựa trên cơ chế **Soft Delete** của hệ thống.

### 1. Tổng quan Giao diện (UI Layout)

Giao diện Thùng rác của EMP được thiết kế dạng bảng danh sách đơn giản, tập trung vào khả năng tìm kiếm và khôi phục.

*   **Các cột hiển thị:**
    1.  **Loại dữ liệu (Type):** Icon hoặc Text phân biệt (Subtask, Time Log, Comment, Document).
    2.  **Tên/Nội dung (Item Name):** Tiêu đề subtask, ghi chú log time, hoặc đoạn đầu của comment đã xóa.
    3.  **Nơi chứa (Original Location):** Tên Task hoặc Dự án mà dữ liệu này từng thuộc về.
    4.  **Thời gian xóa (Deleted At):** Ngày giờ thực hiện hành động xóa.
    5.  **Hành động (Actions):** Chỉ có một nút duy nhất là **Khôi phục (Restore)** (Icon mũi tên quay lại).

*   **Bộ lọc (Filters):**
    *   Lọc theo Loại (Chỉ xem Subtask, Chỉ xem Log time...).
    *   Lọc theo Khoảng thời gian xóa.

### 2. Logic Hiển thị & Phạm vi Dữ liệu (Backend Logic)

Khác với PM hay Admin có thể nhìn thấy dữ liệu xóa của người khác, Thùng rác của EMP áp dụng chính sách bảo mật riêng tư và quyền sở hữu chặt chẽ.

#### A. Nguồn dữ liệu
*   Hệ thống không quét (scan) toàn bộ các bảng nghiệp vụ.
*   Thay vào đó, giao diện này truy vấn trực tiếp từ bảng trung tâm **`recycle_bin_items`**,. Bảng này lưu metadata của tất cả các đối tượng đã bị đánh dấu `deleted_at`.

#### B. Quy tắc "Của ai người nấy thấy" (Ownership Policy)
*   Hệ thống áp dụng bộ lọc bắt buộc: `deleted_by = Current_User_ID`.
*   **Ý nghĩa:** EMP chỉ nhìn thấy những gì **chính mình đã xóa**.
    *   Nếu PM xóa một Subtask của EMP -> Item đó nằm trong Thùng rác dự án của PM (EMP không thấy).
    *   Nếu EMP tự xóa Subtask của mình -> Item đó nằm ở đây.

#### C. Các loại dữ liệu hỗ trợ
Dựa trên quyền hạn của EMP, các mục sau sẽ xuất hiện trong thùng rác:
1.  **Subtask:** Các đầu việc con đã xóa.
2.  **Time Log:** Các bản ghi thời gian làm việc đã xóa.
3.  **Comment:** Các bình luận thảo luận đã xóa.
4.  **Document/Attachment:** Các file đính kèm đã xóa.
5.  **Personal Task:** Các task cá nhân (từ bảng Kanban riêng) đã xóa.

### 3. Logic Chức năng Khôi phục (Restore)

Khi EMP nhấn nút "Restore", hệ thống thực hiện một chuỗi kiểm tra nghiêm ngặt để đảm bảo tính toàn vẹn dữ liệu.

#### Bước 1: Kiểm tra Khóa kỳ (Temporal Constraint)
Đây là quy tắc quan trọng nhất.
*   **Logic:** Hệ thống kiểm tra xem đối tượng cần khôi phục có thuộc về một dự án hoặc thời gian đã bị PM khóa hay không (`work_period_locks`).
*   **Tình huống:**
    *   EMP xóa log time ngày hôm qua -> **Được** khôi phục (vì kỳ chưa khóa).
    *   EMP xóa log time tháng trước, nay muốn khôi phục lại -> **Từ chối** (Nút Restore bị mờ hoặc báo lỗi: *"Kỳ làm việc này đã bị khóa"*),.

#### Bước 2: Kiểm tra đối tượng cha (Parent Integrity)
*   **Logic:** Dữ liệu con chỉ tồn tại được nếu cha còn sống.
*   **Tình huống:** EMP muốn khôi phục một **Subtask**, nhưng **Task cha** chứa nó đã bị PM xóa vĩnh viễn hoặc xóa mềm trước đó.
*   **Xử lý:** Hệ thống báo lỗi hoặc yêu cầu liên hệ PM để khôi phục Task cha trước.

#### Bước 3: Thực thi Khôi phục
*   Nếu qua được các bước kiểm tra, hệ thống sẽ:
    1.  Set `deleted_at = NULL` và `deleted_by = NULL` trong bảng dữ liệu gốc (VD: `subtasks`, `time_logs`).
    2.  Xóa dòng tương ứng trong bảng `recycle_bin_items`.
    3.  Dữ liệu xuất hiện trở lại trên giao diện làm việc chính.

### 4. Điểm giới hạn của EMP (Permissions)

Trong giao diện này, quyền của EMP hạn chế hơn nhiều so với PM/Admin:

1.  **Không có nút "Xóa vĩnh viễn" (No Destroy):**
    *   EMP chỉ có quyền `READ` và `RESTORE`.
    *   EMP **không thể** thực hiện "Empty Trash" hay xóa vĩnh viễn bất kỳ item nào. Việc dọn dẹp dữ liệu rác thuộc quyền của PM hoặc cơ chế tự động của hệ thống (Retention Policy).
2.  **Không thấy Task chính:**
    *   Vì EMP không có quyền xóa Task chính (chỉ PM được xóa), nên Thùng rác của EMP sẽ không bao giờ chứa Task chính (trừ Task cá nhân `personal_tasks`).

### Tóm tắt Luồng Người dùng (User Flow)

1.  **Sự kiện:** EMP lỡ tay xóa một Subtask quan trọng.
2.  **Truy cập:** EMP vào Menu -> chọn "Thùng rác" (Recycle Bin).
3.  **Tìm kiếm:** Thấy Subtask vừa xóa nằm ở đầu danh sách.
4.  **Hành động:** Nhấn icon **Restore**.
5.  **Hệ thống:**
    *   Check: *Dự án chưa bị khóa?* -> OK.
    *   Check: *Task cha còn tồn tại?* -> OK.
    *   Action: Khôi phục dữ liệu.
6.  **Kết quả:** Subtask biến mất khỏi Thùng rác và xuất hiện lại trong màn hình Chi tiết Task.