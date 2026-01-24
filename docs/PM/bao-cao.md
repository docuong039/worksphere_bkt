Dựa trên 5 tài liệu hệ thống (đặc biệt là User Stories và Thiết kế Database), dưới đây là mô tả chi tiết **100%** về giao diện, chức năng và logic nghiệp vụ của **Trang Báo Cáo (Reports)** dành riêng cho vai trò **Project Manager (PM/MNG)**.

**Lưu ý quan trọng về thiết kế:** Trong hệ thống này, Báo cáo được thiết kế theo cơ chế "1 luồng duy nhất" (Single Stream). Nghĩa là mỗi nhân sự chỉ gửi **1 báo cáo duy nhất** cho chu kỳ (Tuần/Tháng) chứa nội dung của tất cả dự án họ tham gia, thay vì gửi nhiều báo cáo lẻ tẻ cho từng dự án. Do đó, PM sẽ xem báo cáo tổng hợp của nhân viên mình quản lý.

---

### 1. GIAO DIỆN DANH SÁCH BÁO CÁO (REPORT INBOX)

Đây là màn hình đầu tiên khi PM truy cập vào module Báo cáo để kiểm tra tình hình nhân sự.

**Giao diện & Chức năng:**
1.  **Bộ lọc & Tìm kiếm (Filter Bar):**
    *   **Kỳ báo cáo:** Lọc theo Tuần (Week), Tháng (Month), hoặc Quý (Quarter).
    *   **Thời gian:** Chọn khoảng thời gian cụ thể (VD: Tuần 40).
    *   **Trạng thái:** Đã nộp (Submitted), Đã duyệt (Approved - nếu có), Nháp (Draft - thường không hiện cho PM xem).
    *   **Nhân sự:** Tìm kiếm tên nhân viên cụ thể.
2.  **Danh sách Báo cáo (Data Grid):**
    *   Hiển thị các cột:
        *   **Người gửi:** Tên nhân viên + Avatar.
        *   **Tiêu đề:** VD: "Báo cáo tuần 42 - Nguyễn Văn A".
        *   **Kỳ:** Thời gian bắt đầu - Thời gian kết thúc.
        *   **Ngày nộp:** Thời gian thực tế nộp (created_at/updated_at).
        *   **Trạng thái:** `SUBMITTED`, `APPROVED`.
3.  **Hành động nhanh:**
    *   Click vào dòng để xem chi tiết.

**Logic nghiệp vụ & Truy vấn:**
*   **Phạm vi hiển thị (Scope):** Hệ thống sẽ lọc danh sách nhân sự dựa trên logic: "Hiển thị báo cáo của những nhân viên (`submitted_by`) đang là thành viên trong các dự án mà tôi làm PM (`project_id = Managed Project`)",.
*   **Dữ liệu:** Truy vấn từ bảng `reports` kết hợp với bảng `users`.

---

### 2. GIAO DIỆN CHI TIẾT BÁO CÁO (REPORT DETAIL)

Đây là nơi PM thực hiện công việc quản lý chính: Đọc hiểu và Phản hồi.

**Giao diện & Chức năng:**
1.  **Khu vực Nội dung Báo cáo:**
    *   **Thông tin chung:** Người gửi, Kỳ báo cáo, Ngày gửi.
    *   **Nội dung chính:** Hiển thị văn bản định dạng (Rich Text) mô tả kết quả công việc, khó khăn, đề xuất.
    *   *Lưu ý:* Vì báo cáo là tổng hợp, nhân viên thường sẽ gạch đầu dòng theo từng dự án. PM cần đọc phần liên quan đến dự án của mình.
2.  **Khu vực Phản hồi & Chỉ đạo (Feedback Section):**
    *   **Danh sách bình luận (Comments):** Xem các phản hồi trước đó của chính PM hoặc các PM khác (nếu nhân viên làm nhiều dự án) và CEO.
    *   **Form bình luận:**
        *   Nhập nội dung chỉ đạo/nhận xét.
        *   Hỗ trợ **Rich Text** (bôi đậm, gạch đầu dòng).
        *   Nút "Gửi bình luận".
3.  **Thanh trạng thái (Status Bar):**
    *   Hiển thị trạng thái hiện tại (VD: Đã nộp).

**Logic nghiệp vụ & Quyền hạn:**
*   **Quyền xem (Read):** Dựa trên User Story US-MNG-04-03, PM có quyền xem báo cáo để ghi nhận kết quả.
*   **Quyền bình luận (Comment):**
    *   PM có quyền `CREATE` và `READ` trên tài nguyên `COMMENT` gắn với báo cáo,.
    *   Dữ liệu được lưu vào bảng `report_comments` với `report_id` tương ứng.
*   **Quyền Duyệt (Approval) - Điểm đặc biệt:**
    *   Theo thiết kế RBAC Phase 2, quyền `REPORT.APPROVE` được gán cho vai trò **CEO**. Vai trò **PROJECT_MANAGER** trong tài liệu hiện tại chỉ có quyền xem và bình luận (phản hồi).
    *   *Logic:* PM đóng vai trò người rà soát (Reviewer) và chỉ đạo qua Comment. Việc chốt duyệt cuối cùng (nếu quy trình công ty yêu cầu) thuộc về CEO hoặc cấu hình Org Admin.
*   **Reaction (Cảm xúc):** Theo tài liệu Phase 2, quyền thả Reaction (`REACTION.REACTION`) được liệt kê rõ ràng cho CEO. PM sử dụng Comment là chính.

---

### 3. CƠ CHẾ THÔNG BÁO (NOTIFICATIONS)

PM không cần phải F5 trang báo cáo liên tục, hệ thống sẽ nhắc nhở.

**Logic chức năng:**
*   **Nhận thông báo:**
    *   Khi nhân viên trong dự án gửi báo cáo (`REPORT_SUBMITTED`), PM sẽ nhận được thông báo.
    *   Khi có ai đó (VD: CEO hoặc nhân viên) reply vào comment của PM trên báo cáo, PM sẽ nhận thông báo.
*   **Nguồn dữ liệu:** Bảng `notifications` và `notification_recipients`.

---

### 4. TỔNG HỢP QUYỀN HẠN CỦA PM TẠI MODULE NÀY (Matrix Permissions)

Dựa trên tài liệu RBAC Phase 2 và User Story, đây là profile quyền hạn chính xác của PM trên trang Báo cáo:

1.  **ORG_USER:** `READ` (Để thấy thông tin người gửi báo cáo).
2.  **REPORT:**
    *   Quyền truy cập dựa trên logic nghiệp vụ (Policy) liên kết qua thành viên dự án (US-MNG-04-03).
    *   *Lưu ý:* Bảng phân quyền cứng (RBAC Table) đang tập trung vào quyền `TASK`, `PROJECT`. Quyền xem báo cáo của PM được thực thi qua Policy: "Cho phép nếu `submitted_by` thuộc dự án do tôi quản lý".
3.  **COMMENT:** `CREATE`, `READ` (Quyền chính để tương tác),.
4.  **REACTION:** Không có quyền (Dành cho CEO).
5.  **REPORT.APPROVE:** Không có quyền (Dành cho CEO).

### Tóm tắt trải nghiệm người dùng (UX) của PM
1.  **Vào trang Báo cáo** -> Thấy danh sách nhân viên đã nộp.
2.  **Click xem báo cáo của nhân viên A**.
3.  **Đọc nội dung**, đối chiếu với những gì nhân viên A đã làm trong dự án của mình.
4.  **Viết Comment**: "Tuần này em làm tốt task X, nhưng task Y cần đẩy nhanh hơn nhé".
5.  **Xong**. (Việc đổi trạng thái sang Approved thuộc về cấp cao hơn hoặc tự động).