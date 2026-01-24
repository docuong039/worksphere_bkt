Dựa trên tài liệu về **Epic EMP-07** và thiết kế Database, tôi xin trình bày chi tiết về giao diện **Bảng Công việc Cá nhân (Personal Task Board)**.

Đây là một tính năng đặc biệt, hoạt động như một ứng dụng "To-Do List" riêng tư được nhúng bên trong hệ thống doanh nghiệp, tách biệt hoàn toàn khỏi các dự án chính thức.

### 1. Tổng quan Giao diện (Visual Layout)

Giao diện này được thiết kế dưới dạng **Kanban Board** đơn giản để tối ưu hóa trải nghiệm kéo-thả (Drag & Drop).

*   **Bố cục 3 cột mặc định:**
    1.  **Cần làm (To Do):** Nơi chứa các ý tưởng, việc vặt mới tạo.
    2.  **Đang làm (In Progress):** Các việc đang xử lý.
    3.  **Hoàn thành (Done):** Các việc đã xong.
*   **Thẻ công việc (Task Card):** Mỗi thẻ trên bảng hiển thị gọn gàng các thông tin:
    *   Tiêu đề công việc.
    *   Nhãn độ ưu tiên (High/Medium/Low) có màu sắc tương ứng.
    *   Hạn chót (Due Date) nếu có.

### 2. Chức năng Chi tiết

#### A. Tạo mới & Quản lý (CRUD)
*   **Tạo nhanh:** EMP có thể tạo task cá nhân ngay trên cột "To Do". Form nhập liệu được tối giản hóa so với Task dự án:
    *   *Chỉ cần nhập:* Tiêu đề, Mô tả, Hạn chót, Độ ưu tiên.
    *   *Không có:* Người được giao (mặc định là chính mình), Dự án (không thuộc dự án nào), Log time (không chấm công cho việc riêng).
*   **Sắp xếp:** EMP có thể kéo thả để thay đổi thứ tự ưu tiên của các thẻ trong cùng một cột (cập nhật trường `sort_order` trong database),.

#### B. Thao tác Kéo - Thả (Status Change)
*   **Hành động:** Kéo một thẻ từ cột "To Do" sang "In Progress".
*   **Logic:** Hệ thống tự động cập nhật `status_code` trong bảng `personal_tasks` ngay lập tức mà không cần reload trang.

#### C. Tính riêng tư tuyệt đối (Strict Isolation)
Đây là điểm khác biệt lớn nhất của giao diện này so với phần còn lại của hệ thống.
*   **Quy tắc hiển thị:** Dữ liệu tại đây áp dụng chính sách **POL-MYTASK-01**.
    *   Chỉ hiển thị dữ liệu khi `user_id = Current_User`.
    *   **PM, CEO hay thậm chí Admin cũng không thể xem** giao diện này của nhân viên thông qua UI quản trị thông thường.
*   **Mục đích:** Giúp nhân viên an tâm ghi chú các việc riêng (VD: "Đi khám sức khỏe", "Học thêm tiếng Anh") hoặc các bản nháp công việc chưa muốn công khai.

### 3. Logic Hệ thống & Dữ liệu (Backend Design)

Để giao diện này hoạt động mượt mà và bảo mật, hệ thống sử dụng thiết kế dữ liệu riêng biệt:

*   **Bảng lưu trữ:** Sử dụng bảng `personal_tasks`, tách biệt hoàn toàn với bảng `tasks` của dự án.
*   **Cấu trúc bảng:**
    *   `user_id`: Khóa ngoại trỏ về người tạo (Owner).
    *   `org_id`: Vẫn lưu ID công ty để đảm bảo dữ liệu nằm trong Tenant (SaaS Isolation), nhưng bị ẩn đi ở lớp hiển thị.
    *   `status_code`: Mặc định là 'TODO', 'IN_PROGRESS', 'DONE'.
*   **Không hỗ trợ Log Time:** Tài liệu Database không thiết kế liên kết giữa `time_logs` và `personal_tasks`. Điều này có nghĩa là EMP **không thể chấm công/tính lương** dựa trên các task cá nhân này,.

### 4. So sánh với Giao diện "My Assigned Tasks"

Để tránh nhầm lẫn cho EMP, bạn cần phân biệt rõ hai giao diện này:

| Đặc điểm | Bảng Cá nhân (Personal Tasks) | Task được giao (My Assigned Tasks) |
| :--- | :--- | :--- |
| **Mục đích** | Quản lý việc riêng, nháp, nhắc nhở | Thực thi công việc dự án, chấm công |
| **Quyền xem** | **Chỉ mình tôi (Private)** | Công khai trong dự án (Public) |
| **Dữ liệu** | Bảng `personal_tasks` | Bảng `tasks` |
| **Log Time** | ❌ Không hỗ trợ | ✅ Bắt buộc (khi Done) |
| **Quản lý** | Tự tạo, tự xóa | PM giao, PM quản lý |
| **Giao diện** | Kanban Board | List View hoặc Kanban dự án |

### Tóm lại
Giao diện **Bảng cá nhân** là một "góc riêng" của EMP. Nó đơn giản, nhanh gọn, hỗ trợ kéo thả Kanban và đảm bảo tính riêng tư tuyệt đối, giúp nhân viên không cần dùng thêm giấy note hay phần mềm Todo bên ngoài.