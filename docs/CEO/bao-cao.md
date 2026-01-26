Dựa trên tài liệu tổng hợp (User Stories, RBAC Phase 2, Database Design), dưới đây là mô tả chi tiết **100% chức năng, giao diện và logic** của **Phân hệ Giám sát Báo cáo & Phản hồi (Reporting & Feedback)** dành riêng cho vai trò **CEO**.

Phân hệ này được thiết kế như một kênh giao tiếp trực tiếp (Direct Communication Channel), giúp CEO nắm bắt tình hình từ nhân viên cấp thấp nhất mà không bị "tam sao thất bản" qua các lớp quản lý trung gian.

---

### 1. Giao diện Danh sách Báo cáo (Report Feed)

Đây là màn hình tổng hợp nơi CEO tiếp nhận thông tin từ toàn bộ công ty.

**Giao diện & Chức năng:**
*   **Bộ lọc toàn cục (Global Filter):** CEO có thể lọc báo cáo theo:
    *   **Phòng ban/Dự án:** Để xem sức khỏe của một đơn vị cụ thể.
    *   **Nhân sự:** Tìm kiếm báo cáo của một cá nhân cụ thể để đánh giá năng lực.
    *   **Loại báo cáo:** Tuần (Week), Tháng (Month), Quý (Quarter).
*   **Trạng thái báo cáo:** Hiển thị rõ các nhãn (Tag) trạng thái: `SUBMITTED` (Đã nộp), `APPROVED` (Đã duyệt).
*   **Danh sách hiển thị:** Hiển thị tóm tắt Tiêu đề báo cáo, Người gửi, Ngày gửi và đoạn trích nội dung ngắn.

**Logic Nghiệp vụ (Backend Logic):**
*   **Phạm vi truy cập (Tenant-wide Scope):** Khác với PM chỉ thấy báo cáo của thành viên dự án, hệ thống truy vấn bảng `reports` với điều kiện duy nhất: `WHERE org_id = CEO.org_id`. Không áp dụng bộ lọc `project_id` hay `manager_id` đối với CEO.
*   **Quyền hạn:** Hệ thống kiểm tra quyền **`REPORT.READ`** của vai trò CEO.

---

### 2. Giao diện Chi tiết Báo cáo & Phê duyệt (Detail & Approval)

Khi CEO click vào một báo cáo, giao diện chi tiết sẽ hiện ra với các chức năng tương tác sâu.

**Giao diện & Chức năng:**
*   **Xem nội dung:** Hiển thị toàn bộ nội dung báo cáo (Rich Text) mà nhân viên đã soạn thảo (Thành tích, Khó khăn, Đề xuất).
*   **Nút Duyệt (Approve Button):**
    *   Đây là hành động xác nhận cấp cao.
    *   Khi bấm "Duyệt", trạng thái báo cáo chuyển từ `SUBMITTED` sang `APPROVED`.
    *   Hệ thống ghi nhận "Được duyệt bởi CEO" kèm thời gian thực.

**Logic Nghiệp vụ (Backend Logic):**
*   **Quyền phê duyệt:** CEO sở hữu quyền đặc biệt **`REPORT.APPROVE`** (Quyền này thường chỉ có PM trực tiếp và CEO có, các nhân viên khác không có).
*   **Chính sách (Policy):** Áp dụng Policy mã **`POL-CEO-GOV-01`**, cho phép CEO duyệt báo cáo vượt cấp (bypass quản lý trực tiếp) để đẩy nhanh quy trình hoặc thể hiện sự quan tâm đặc biệt,.

---

### 3. Giao diện Tương tác & Phản hồi (Feedback & Reaction)

Đây là tính năng "mạng xã hội nội bộ" giúp CEO động viên hoặc chỉ đạo nhân viên.

**Giao diện & Chức năng:**
*   **Thả cảm xúc (Reaction):** CEO có thể chọn các biểu tượng cảm xúc (Like, Heart, Clap, Fire...) để thả vào báo cáo. Đây là cách động viên nhanh chóng, thân thiện.
*   **Bình luận chỉ đạo (Direct Comment):**
    *   Khung soạn thảo bình luận cho phép CEO viết phản hồi.
    *   Hỗ trợ **@Mention** (Gắn thẻ) nhân viên hoặc quản lý liên quan để yêu cầu giải trình hoặc khen ngợi công khai,.
*   **Thread (Luồng trao đổi):** Các phản hồi hiển thị dưới dạng hội thoại để dễ theo dõi mạch câu chuyện.

**Logic Nghiệp vụ (Backend Logic):**
*   **Lưu trữ Reaction:** Dữ liệu được ghi vào bảng `report_reactions` gồm: `org_id`, `report_id`, `user_id` (là CEO), và `reaction_code`.
*   **Lưu trữ Comment:** Dữ liệu ghi vào bảng `report_comments`.
*   **Quyền hạn:** CEO sử dụng quyền **`REACTION.REACTION`** và **`COMMENT.CREATE`**.

---

### 4. Hệ thống Thông báo liên quan (Notifications)

Phân hệ này kết nối chặt chẽ với hệ thống thông báo để đảm bảo CEO không bỏ lỡ thông tin quan trọng.

**Chức năng & Logic:**
*   **Nhận thông báo nộp báo cáo:** Dù CEO không trực tiếp quản lý tất cả, hệ thống có thể cấu hình để gửi thông báo (Notify) cho CEO khi các nhân sự Key (Chủ chốt) hoặc Trưởng phòng gửi báo cáo tuần/tháng.
*   **Thông báo phản hồi:** Khi nhân viên trả lời (Reply) lại comment của CEO, CEO sẽ nhận được thông báo ngay lập tức.

---

### Tổng kết Cấu trúc Dữ liệu nền tảng (Database Mapping)

Để phục vụ các chức năng trên của CEO, hệ thống sử dụng các bảng sau trong nhóm **Reporting**:

1.  **`reports`**: Chứa nội dung gốc và trạng thái `status` (Draft/Submitted/Approved).
2.  **`report_comments`**: Lưu trữ chỉ đạo của CEO.
3.  **`report_reactions`**: Lưu trữ tương tác cảm xúc của CEO.
4.  **`notifications`**: Đẩy sự kiện tới CEO.

**Bảng tóm tắt quyền hạn CEO trong phân hệ này:**

| Tài nguyên | Hành động | Ý nghĩa |
| :--- | :--- | :--- |
| **REPORT** | `READ` | Xem tất cả báo cáo toàn công ty. |
| **REPORT** | `APPROVE` | Duyệt báo cáo (Chốt trạng thái). |
| **COMMENT** | `CREATE` | Viết chỉ đạo trực tiếp. |
| **REACTION** | `REACTION` | Thả tim/Like động viên. |

Đây là thiết kế nhằm mục đích **tăng cường sự hiện diện của lãnh đạo** và **giảm khoảng cách quản lý**, cho phép CEO vừa giám sát vĩ mô vừa có thể tương tác vi mô khi cần thiết.