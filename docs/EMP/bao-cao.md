    Dựa trên bộ tài liệu chi tiết (User Story, RBAC Phase 1 & 2, Database Design Phase 1 & 2), dưới đây là mô tả toàn diện về **chức năng và logic nghiệp vụ** của trang Báo cáo (Reporting) dành cho vai trò **Nhân viên (EMP)**.

Trang báo cáo của EMP được thiết kế theo tư duy **"Một luồng duy nhất" (Single Flow)** để đơn giản hóa việc nộp kết quả định kỳ và nhận phản hồi từ cấp trên.

### 1. Logic Nghiệp vụ Cốt lõi (Core Business Logic)

Các quy tắc này được kiểm soát bởi Backend và Database để đảm bảo tính toàn vẹn của dữ liệu báo cáo:

*   **Quy tắc "Một kỳ - Một báo cáo":**
    *   Hệ thống áp dụng ràng buộc dữ liệu (Unique Constraint) để đảm bảo mỗi nhân viên chỉ tạo được **duy nhất 01 báo cáo** cho một khoảng thời gian cụ thể (Ví dụ: Tuần 42, Tháng 10).
    *   Ngăn chặn việc spam hoặc tạo trùng lặp dữ liệu.
*   **Luồng trạng thái (Workflow States):**
    Báo cáo sẽ chuyển dịch qua 3 trạng thái:
    1.  **DRAFT (Nháp):** Khi EMP mới tạo hoặc nhấn "Lưu nháp". Chỉ EMP nhìn thấy.
    2.  **SUBMITTED (Đã gửi):** Khi EMP nhấn nút "Gửi". Lúc này CEO/Manager mới nhìn thấy để đánh giá.
    3.  **APPROVED (Đã duyệt):** Trạng thái này do CEO/Manager thực hiện. Sau khi duyệt, báo cáo coi như "đóng băng", EMP không thể chỉnh sửa,.
*   **Phân quyền (RBAC/ABAC):**
    *   **Quyền hạn:** EMP có quyền `CREATE`, `SUBMIT`, `READ` và `EXPORT` báo cáo,.
    *   **Sở hữu (Ownership):** EMP chỉ được xem và thao tác với các báo cáo do **chính mình tạo** (`submitted_by = ME`),.
    *   **Ngăn chặn xung đột (SoD):** EMP **không** có quyền `APPROVE` (Tự duyệt báo cáo chính mình) để đảm bảo tính minh bạch.

---

### 2. Các Chức năng & Giao diện Chi tiết

Trang báo cáo của EMP bao gồm 3 khu vực chức năng chính:

#### A. Khu vực Soạn thảo & Gửi (Action Area)
Thực hiện User Story **US-EMP-03-01**.

*   **Chọn Kỳ báo cáo:**
    *   Dropdown chọn loại kỳ: **Tuần (Week)**, **Tháng (Month)**, hoặc **Quý (Quarter)**.
    *   Hệ thống tự động điền ngày bắt đầu (`period_start`) và kết thúc (`period_end`) dựa trên lựa chọn.
*   **Nhập Tiêu đề:** Trường bắt buộc (Ví dụ: "Báo cáo tiến độ dự án Alpha tuần 3").
*   **Soạn thảo Nội dung (Rich Text Editor):**
    *   Trình soạn thảo văn bản hỗ trợ định dạng (đậm, nghiêng, list) để nhân viên gạch đầu dòng các công việc đã làm, khó khăn và đề xuất.
*   **Nút thao tác:**
    *   **Lưu nháp (Save Draft):** Lưu lại nội dung để sửa sau, trạng thái là `DRAFT`.
    *   **Gửi báo cáo (Submit):** Chuyển trạng thái sang `SUBMITTED`, kích hoạt thông báo gửi đến CEO/Manager.

#### B. Khu vực Lịch sử & Xuất dữ liệu (Management Area)
Thực hiện User Story **US-EMP-03-02**.

*   **Danh sách báo cáo:**
    *   Hiển thị lịch sử các báo cáo đã gửi theo thời gian.
    *   Mỗi dòng hiển thị: Tiêu đề, Kỳ báo cáo, Ngày gửi và **Trạng thái (Badge màu)**.
*   **Chức năng Xuất (Export):**
    *   Nút xuất báo cáo ra file (PDF hoặc Excel) để nhân viên lưu trữ cá nhân hoặc làm minh chứng đánh giá năng lực.

#### C. Khu vực Phản hồi & Tương tác (Feedback Loop)
Thực hiện User Story **US-EMP-03-03**.
Đây là nơi nhân viên nhận tương tác từ cấp trên sau khi báo cáo đã gửi đi:

*   **Xem Chỉ đạo (Comments):**
    *   Hiển thị các bình luận/nhận xét của CEO hoặc Manager ngay dưới báo cáo.
    *   Mục đích: Giúp nhân viên nhận chỉ thị hoặc rút kinh nghiệm kịp thời.
*   **Xem Cảm xúc (Reactions):**
    *   Hiển thị các biểu tượng (Like, Vỗ tay, Tim) mà sếp đã "thả" vào báo cáo,.
    *   Mục đích: Động viên tinh thần nhân viên một cách nhanh chóng.

---

### 3. Cấu trúc Dữ liệu Nền tảng (Database Mapping)

Để hỗ trợ các chức năng trên, giao diện này kết nối trực tiếp với các bảng sau trong cơ sở dữ liệu:

1.  **`reports`:** Bảng chính lưu trữ nội dung, kỳ báo cáo và trạng thái.
2.  **`report_comments`:** Lưu trữ các đoạn hội thoại, chỉ đạo của sếp gắn với báo cáo.
3.  **`report_reactions`:** Lưu trữ các reaction (Like/Clap) gắn với báo cáo.
4.  **`notifications`:** Sinh ra thông báo khi trạng thái báo cáo thay đổi hoặc có comment mới.

### Tóm tắt cho đội Phát triển (Dev Team)
*   **Frontend:** Cần Form có Validate không cho chọn ngày kết thúc < ngày bắt đầu. Nút "Gửi" cần confirm dialog.
*   **Backend API:** Phải chặn nếu user cố tình tạo báo cáo thứ 2 trong cùng 1 kỳ (Check Unique Constraint).
*   **Permission:** API chỉ trả về danh sách báo cáo `WHERE submitted_by = current_user_id`.