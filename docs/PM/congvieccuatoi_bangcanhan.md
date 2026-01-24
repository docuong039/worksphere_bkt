Chào bạn, với tư cách là **PM (Project Manager)**, việc bạn muốn tách biệt rõ ràng hai luồng công việc này là rất hợp lý. Trong thiết kế hệ thống, hai trang này phục vụ hai mục đích quản trị hoàn toàn khác nhau: một bên là **trách nhiệm với tổ chức** (Assigned), một bên là **quản trị hiệu suất cá nhân** (Personal).

Dựa trên tài liệu thiết kế (User Stories và Database), tôi sẽ liệt kê chi tiết giao diện và logic cho hai trang này dành riêng cho vai trò PM của bạn.

---

### GIAO DIỆN 1: CÔNG VIỆC ĐƯỢC GIAO (MY ASSIGNED TASKS)
**Bản chất:** Đây là dashboard tổng hợp tất cả đầu việc mà bạn chịu trách nhiệm thực thi trong các dự án.

#### 1. Giao diện (UI/UX)
*   **Dạng hiển thị:** Danh sách (List View) hoặc Lịch (Calendar View).
*   **Các cột thông tin:** Tên Task, Tên Dự án (quan trọng để biết việc này thuộc về đâu), Trạng thái (Status), Độ ưu tiên (Priority), Hạn chót (Due Date).
*   **Bộ lọc (Filters):** Lọc theo Dự án, Trạng thái (VD: Chỉ xem cái chưa xong), Độ ưu tiên.

#### 2. Nguồn dữ liệu & Logic hiển thị
*   **Nguồn dữ liệu:** Hệ thống truy vấn từ bảng `tasks` kết hợp với bảng `task_assignees`.
*   **Điều kiện lọc:**
    *   `task_assignees.user_id = ID CỦA BẠN` (Lọc các task bạn được gán).
    *   Kể cả bạn là PM của dự án A, nếu bạn không tự assign mình vào task X của dự án A, task X đó sẽ **không** hiện ở đây (nó chỉ hiện ở trang Quản lý dự án).

#### 3. Chức năng & Quyền hạn (Của PM tại giao diện này)
Tại giao diện này, bạn vừa là người làm (Doer) vừa là quản lý (Manager), nên logic quyền hạn sẽ kết hợp:

*   **Tương tác (Collaboration):**
    *   **Log Time:** Bạn chấm công cho chính mình. Hệ thống sẽ ghi vào `time_logs` và tự động tính vào chi phí của dự án tương ứng,.
    *   **Comment & Mention:** Thảo luận, tag thành viên khác vào để giục tiến độ hoặc hỏi thông tin.
*   **Quyền hạn đặc biệt của PM (Context-based Permission):**
    *   Nếu task này thuộc dự án bạn làm PM: Bạn có quyền **Chốt Done** (Hoàn thành) ngay tại đây.
    *   Nếu task này thuộc dự án bạn chỉ là Member (được mời sang hỗ trợ): Bạn chỉ có thể update tiến độ, không được chốt Done task chính (trừ khi là Subtask).

---

### GIAO DIỆN 2: CÔNG VIỆC CÁ NHÂN (PERSONAL TASKS)
**Bản chất:** Đây là "bảng nháp" hoặc "sổ tay chiến lược" riêng tư của PM. Dữ liệu tại đây tách biệt hoàn toàn khỏi hệ thống báo cáo công ty.

#### 1. Giao diện (UI/UX)
*   **Dạng hiển thị:** **Kanban Board** (Cột: To Do, In Progress, Done).
*   **Thao tác:** Kéo thả (Drag & Drop) thẻ công việc giữa các cột.
*   **Chi tiết thẻ:** Tiêu đề, Ghi chú mô tả (Rich text), Độ ưu tiên, Màu sắc thẻ.

#### 2. Nguồn dữ liệu & Logic hiển thị
*   **Nguồn dữ liệu:** Lấy từ bảng riêng biệt `personal_tasks`.
*   **Không có Project ID:** Các task này không liên kết với bất kỳ dự án nào, do đó không hiện lên Gantt chart hay báo cáo chi phí chung,.

#### 3. Chức năng & Logic nghiệp vụ (PM Focus)
*   **Tạo nhanh (Quick Create):** PM dùng để ghi chú nhanh các ý tưởng, các việc cần làm như "Chuẩn bị slide họp CEO", "Review lương nhân sự".
*   **Quyền riêng tư tuyệt đối (Strict Isolation):**
    *   Logic bảo mật: `WHERE user_id = CURRENT_USER`.
    *   **CEO/Admin cũng không thấy:** Ngay cả CEO hay System Admin cũng không có quyền xem dữ liệu này trên giao diện (trừ khi can thiệp database),. Điều này giúp PM an tâm quản lý các công việc nhạy cảm.
*   **Không Log Time:** Vì không thuộc dự án, bạn không thể chấm công (log time) cho các task này để tính lương.

---

### TÓM TẮT SỰ KHÁC BIỆT DÀNH RIÊNG CHO PM

| Tiêu chí | Trang "Việc được giao" | Trang "Việc cá nhân" |
| :--- | :--- | :--- |
| **Mục đích PM** | Thực thi các đầu việc cam kết với công ty/khách hàng. | Quản lý lịch trình riêng, ghi chú chiến lược, việc vặt. |
| **Dữ liệu** | Bảng `tasks` (Dữ liệu chung) | Bảng `personal_tasks` (Dữ liệu riêng) |
| **Ai thấy?** | PM dự án, CEO, Đồng nghiệp cùng dự án. | **Chỉ mình bạn.** |
| **Tính công** | **Có** (Tính vào chi phí dự án). | **Không.** |
| **Hiển thị** | Danh sách (List) / Calendar. | Kanban Board. |

Việc tách 2 giao diện này giúp bạn không bị "loãng" sự tập trung: Khi cần làm việc dự án thì vào trang **Việc được giao**, khi cần sắp xếp tư duy chiến lược thì vào trang **Việc cá nhân**.