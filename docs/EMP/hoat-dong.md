Dựa trên các tài liệu Epic User Stories, Phân quyền (Phase 1 & 2) và Thiết kế Database, tôi xin mô tả chi tiết về **Giao diện & Logic Trang Nhật ký Hoạt động (My Activity)** dành cho nhân viên (EMP).

Đây là trang dashboard cá nhân giúp nhân viên tự theo dõi lịch sử làm việc của mình, hoạt động như một "dòng thời gian" (Timeline) sự kiện.

### 1. Tổng quan Giao diện (UI Layout)

Giao diện này thường được thiết kế dưới dạng **Timeline dọc**, nhóm theo **Ngày làm việc**.

*   **Bộ lọc đầu trang (Filters):**
    *   **Ngày tháng:** Chọn xem theo ngày cụ thể hoặc khoảng thời gian (Tuần này/Tháng này),.
    *   **Dự án:** Lọc hoạt động theo từng dự án (nếu EMP tham gia nhiều dự án cùng lúc).
*   **Danh sách sự kiện (Event Stream):**
    *   Mỗi dòng sự kiện hiển thị: **Thời gian** (Giờ:Phút) | **Loại hành động** (Icon) | **Mô tả ngắn** (Summary) | **Dự án liên quan**.
    *   Ví dụ hiển thị:
        *   *10:30 AM - [Icon Check] - Bạn đã hoàn thành subtask "Thiết kế API Login" (Dự án A).*
        *   *11:00 AM - [Icon Đồng hồ] - Ghi nhận 2h làm việc: "Code function authentication" (Dự án A).*
        *   *02:15 PM - [Icon Chat] - Bình luận tại task "Sửa lỗi UI": "Đã fix xong, nhờ PM check lại" (Dự án B).*

### 2. Logic Hiển thị & Dữ liệu (Backend Logic)

Logic của trang này dựa trên bảng `activity_events` và áp dụng các ràng buộc phân quyền nghiêm ngặt.

#### A. Nguồn dữ liệu
*   Hệ thống không truy vấn trực tiếp các bảng nghiệp vụ (như tasks, comments) để tổng hợp ra trang này (vì sẽ rất chậm).
*   Thay vào đó, hệ thống đọc từ bảng riêng là `activity_events`. Bảng này được ghi (insert) mỗi khi có sự kiện nghiệp vụ xảy ra.

#### B. Các loại sự kiện hiển thị (Event Types)
Dựa trên User Story US-EMP-04-02 và thiết kế DB, các hành động sau của EMP sẽ được ghi lại và hiển thị,:
1.  **SUBTASK_DONE:** Khi EMP tích chọn hoàn thành một đầu việc con.
2.  **LOG_TIME:** Khi EMP gửi form ghi nhận thời gian làm việc (kèm số phút trong `metadata`).
3.  **COMMENT:** Khi EMP thảo luận trên Task/Subtask/Báo cáo.
4.  **REPORT_SUBMITTED:** Khi EMP nộp báo cáo tuần/tháng.
5.  **TASK_UPDATE:** (Hạn chế) Chỉ khi EMP cập nhật các trường Custom Field được phân quyền (vì EMP không có quyền sửa các trường cốt lõi của Task chính).

#### C. Quy tắc Phân quyền (Privacy & Scope)
Hệ thống áp dụng chính sách "Chỉ mình tôi" cho trang này đối với vai trò EMP:
*   **Điều kiện lọc (Constraint):** Truy vấn luôn kèm điều kiện `actor_user_id = Current_User_ID`.
*   **Ý nghĩa:** EMP chỉ xem được lịch sử của chính mình. EMP **không thể** xem Activity của đồng nghiệp (khác với PM có thể xem activity của toàn bộ thành viên trong dự án, hoặc CEO xem toàn công ty).

### 3. Logic Tương tác & Liên kết

*   **Liên kết đối tượng (Entity Linking):**
    *   Mặc dù dữ liệu nằm ở bảng `activity_events`, nhưng các dòng sự kiện có lưu `entity_type` và `entity_id`.
    *   **Hành vi:** Khi EMP nhấp vào dòng "Bình luận tại task A", hệ thống sẽ điều hướng (navigate) sang **Màn hình Chi tiết Task A** để xem ngữ cảnh đầy đủ.
*   **Dữ liệu "chết" vs Dữ liệu "sống":**
    *   Activity Feed lưu lại snapshot tại thời điểm hành động. Ví dụ: Lúc 10h EMP log time "Code 2h".
    *   Tuy nhiên, nếu sau đó EMP vào sửa log time thành "3h", hệ thống thường sẽ sinh ra một sự kiện mới hoặc cập nhật bản ghi log time gốc, nhưng dòng activity cũ có thể vẫn giữ nguyên (tùy logic implement) để đảm bảo tính lịch sử trung thực.

### 4. Phân biệt với các Giao diện khác

Để tránh nhầm lẫn cho EMP, cần phân biệt rõ trang này với các chức năng tương tự:

| Tính năng | Trang Activity (Nhật ký hoạt động) | Trang Lịch sử Log Time | Trang Thông báo (Notifications) |
| :--- | :--- | :--- | :--- |
| **Mục đích** | Xem dòng thời gian tổng hợp mọi hành động ("Tôi đã làm gì?") | Kiểm soát công chấm, tính lương ("Tôi làm bao nhiêu giờ?") | Nhận tin từ người khác ("Ai đang gọi tôi?") |
| **Dữ liệu** | `activity_events` | `time_logs` | `notifications` |
| **Nội dung** | Comment, Done subtask, Log time, Submit report... | Chỉ hiển thị các bản ghi thời gian | Được tag, được giao việc, PM khóa kỳ... |
| **Thao tác** | Chỉ xem (Read-only) | Có thể Sửa/Xóa log time | Đánh dấu đã đọc |

### Tóm lại
Trang **Hoạt động (Activity)** là công cụ để EMP tự "nghiệm thu" ngày làm việc của mình. Nó trả lời câu hỏi: *"Hôm nay mình đã làm được những gì?"* một cách trực quan, giúp nhân viên dễ dàng viết báo cáo cuối ngày hoặc cuối tuần dựa trên các dữ liệu đã được hệ thống ghi lại tự động.