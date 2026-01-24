Dựa trên 5 tài liệu hệ thống (User Stories, Phân quyền và Thiết kế Database), dưới đây là mô tả chi tiết **100%** về giao diện, chức năng và logic nghiệp vụ của **Trang Nhật Ký Hoạt Động (Activity Feed)** dành riêng cho vai trò **Project Manager (PM/MNG)**.

Đây là công cụ giám sát vận hành hàng ngày, giúp PM trả lời câu hỏi: *"Hôm nay team của mình đã làm những gì?"* mà không cần đi hỏi từng người.

---

### 1. Phạm vi dữ liệu & Quyền hạn (Scope & Permission)

Khác với nhân viên (chỉ thấy của mình) hay CEO (thấy toàn công ty), PM có phạm vi truy cập đặc thù:

*   **Quyền hạn (RBAC):** PM có quyền `ACTIVITY.READ`.
*   **Phạm vi hiển thị (Data Scope):**
    *   PM xem được hoạt động của **chính mình**.
    *   PM xem được hoạt động của **toàn bộ nhân viên (EMP)** nhưng **chỉ giới hạn trong các dự án mà mình quản lý** (`project_id = Managed Project`),.
    *   *Logic loại trừ:* Nếu nhân viên A vừa làm việc cho Dự án X (do bạn quản lý) vừa làm cho Dự án Y (do người khác quản lý), tại trang này bạn chỉ thấy các dòng log liên quan đến Dự án X.

---

### 2. Giao diện & Chức năng chi tiết

Giao diện được thiết kế dạng dòng thời gian (Timeline) từ mới nhất đến cũ nhất.

#### A. Thanh Công cụ & Bộ lọc (Filter Bar)
PM sử dụng bộ lọc để thu hẹp phạm vi tìm kiếm,:
1.  **Lọc theo Dự án:** Chọn một hoặc nhiều dự án đang quản lý (Mặc định hiển thị tất cả dự án thuộc quyền).
2.  **Lọc theo Nhân sự (Actor):** Chọn xem hoạt động của một nhân viên cụ thể (để review hiệu suất cá nhân).
3.  **Lọc theo Loại sự kiện (Event Type):**
    *   `TASK_DONE` / `SUBTASK_DONE`: Hoàn thành công việc.
    *   `LOG_TIME`: Ghi nhận thời gian làm việc.
    *   `COMMENT`: Thảo luận/Báo lỗi.
    *   `FILE_UPLOAD`: Tải tài liệu lên.

#### B. Danh sách Hoạt động (Activity Stream)
Dữ liệu hiển thị được gom nhóm theo **Ngày** (`activity_date`). Mỗi dòng hoạt động bao gồm các thành phần sau:

1.  **Avatar & Tên:** Hình ảnh và tên người thực hiện hành động (`actor_user_id`).
2.  **Thời gian:** Giờ phút cụ thể diễn ra sự kiện (VD: 14:30).
3.  **Nội dung tóm tắt (Summary):**
    *   Cấu trúc: `[Tên người]` + `[Hành động]` + `[Tên đối tượng]` + `[Tại dự án]`.
    *   *Ví dụ:* "Nguyễn Văn A đã **hoàn thành** task **Thiết kế Database** tại dự án **CRM System**".
4.  **Metadata (Chi tiết bổ sung):**
    *   Nếu là **Log Time**: Hiển thị số phút (VD: "đã log **4h** vào task...").
    *   Nếu là **Comment**: Hiển thị trích đoạn nội dung comment (Snippet).
    *   Nếu là **Task**: Hiển thị trạng thái cũ -> mới.
5.  **Liên kết (Hyperlink):** Click vào tên Task/Dự án để nhảy sang trang chi tiết tương ứng.

---

### 3. Logic Nghiệp vụ & Database (Backend Logic)

#### A. Nguồn dữ liệu
*   Trang này truy vấn trực tiếp từ bảng `activity_events`.
*   Bảng này tách biệt với `audit_logs`. `activity_events` phục vụ hiển thị nghiệp vụ (Business Log), còn `audit_logs` phục vụ tra soát an ninh hệ thống (System Log).

#### B. Quy tắc ghi nhận sự kiện (Event Trigger)
Hệ thống tự động sinh ra bản ghi Activity khi PM hoặc EMP thực hiện các hành động sau:

1.  **Task/Subtask:** Chuyển trạng thái sang DONE/COMPLETED.
2.  **Time Log:** Tạo mới hoặc cập nhật bản ghi giờ làm việc.
3.  **Comment:** Gửi bình luận mới vào Task/Subtask/Report.
4.  **Resource:** Upload file tài liệu mới.

#### C. Hiệu năng & Lưu trữ
*   **Index:** Truy vấn của PM được tối ưu bằng index `(org_id, project_id, activity_date)` để đảm bảo tốc độ tải nhanh ngay cả khi dữ liệu lớn,.
*   **Retention (Lưu trữ):** Dữ liệu Activity thường được giữ lâu dài để PM đối soát lịch sử (khác với Notification có thể xóa sau 90 ngày).

### 4. Giá trị mang lại cho PM
Trang Activity giúp PM giải quyết các bài toán thực tế:
1.  **Micro-management thụ động:** Không cần hỏi "Em làm xong chưa?", chỉ cần nhìn Activity thấy "Nguyễn Văn A đã hoàn thành Subtask" là biết.
2.  **Phát hiện bất thường:** Thấy nhân viên log time vào lúc 2h sáng hoặc log time quá nhiều vào một task đơn giản.
3.  **Review cuối ngày:** Dùng bộ lọc để xem tổng thể tiến độ ngày hôm nay của cả dự án.

Tóm lại, đây là "camera giám sát" phiên bản dữ liệu của PM đối với dự án.