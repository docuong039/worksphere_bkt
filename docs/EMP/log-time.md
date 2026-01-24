Dựa trên yêu cầu của bạn, tôi xin trình bày chuyên sâu về **Giao diện & Logic Ghi nhận thời gian (Time Log)** dành riêng cho vai trò Nhân viên (EMP). Đây là chức năng quan trọng nhất để tính toán hiệu suất và chi phí dự án, được thiết kế với các quy tắc nghiệp vụ chặt chẽ.

### 1. Vị trí & Cách kích hoạt Giao diện (Entry Points)

Giao diện Log Time không phải lúc nào cũng hiển thị. Nó tuân theo quy tắc "Ngữ cảnh" (Context-aware).

*   **Vị trí hiển thị:**
    1.  **Nút bấm trên Chi tiết Task/Subtask:** Nút "Log Time" (hoặc icon đồng hồ) nằm cạnh trạng thái công việc,.
    2.  **Menu Context (Chuột phải) trên Danh sách:** Tại màn hình "My Assigned Tasks", chuột phải vào một công việc hợp lệ sẽ có tùy chọn "Log Time".
*   **Điều kiện hiển thị (Trạng thái Enable/Disable):**
    *   **Đối với Subtask:** Nút Log Time chỉ **sáng (Enable)** khi EMP đã tích chọn hoàn thành (`is_done = TRUE`),.
    *   **Đối với Task chính:** Nút Log Time chỉ **sáng (Enable)** khi PM đã chuyển trạng thái Task sang `DONE`,. Nếu Task đang `In Progress`, nút này sẽ bị mờ (Disabled) hoặc ẩn đi.

---

### 2. Chi tiết Giao diện Nhập liệu (Log Time Modal/Form)

Khi EMP kích hoạt chức năng, một Modal (Popup) sẽ xuất hiện với các trường thông tin sau:

#### A. Các trường dữ liệu (Input Fields)
1.  **Ngày làm việc (`work_date`):**
    *   *UI:* Date Picker.
    *   *Mặc định:* Ngày hiện tại (`Today`).
    *   *Ràng buộc:* Cho phép chọn ngày quá khứ (để log bù), nhưng **không được chọn** ngày thuộc các "Kỳ đã khóa" (Locked Period).
2.  **Thời gian thực hiện (`minutes`):**
    *   *UI:* Ô nhập liệu hỗ trợ cú pháp thông minh (VD: nhập "1h 30m", "90m", hoặc "1.5h").
    *   *Backend:* Hệ thống tự quy đổi ra số nguyên **phút** để lưu vào DB.
    *   *Validate:* Bắt buộc > 0.
3.  **Ghi chú (`note`):**
    *   *UI:* Text area (nhiều dòng).
    *   *Yêu cầu:* EMP mô tả ngắn gọn công việc (VD: "Fix bug login API"). Đây là trường bắt buộc hoặc tùy chọn tùy cấu hình Org, nhưng thiết kế DB cho phép NULL.

#### B. Logic "Phân bổ Log Time" (Hierarchy Logic)
Hệ thống tự động điều hướng việc ghi nhận dựa trên cấu trúc công việc,:
*   **Trường hợp 1 (Task có Subtask):** Hệ thống ép buộc log vào Subtask. Nếu EMP mở Task cha để log, hệ thống sẽ yêu cầu chọn một Subtask cụ thể từ dropdown (hoặc disable nút log ở Task cha).
    *   *Lý do:* Để chi tiết hóa chi phí đến từng đầu việc nhỏ.
*   **Trường hợp 2 (Task độc lập):** Nếu Task không có Subtask nào, EMP được phép log trực tiếp vào Task chính.

---

### 3. Giao diện Lịch sử & Quản lý Log Time (My Time Logs)

EMP cần một nơi để xem lại "bảng chấm công" của chính mình (US-EMP-02-03).

#### A. Danh sách Lịch sử (List View)
*   **Giao diện:** Bảng dữ liệu hiển thị các cột: Ngày | Tên Task/Subtask | Thời gian (Giờ:Phút) | Ghi chú.
*   **Bộ lọc (Filter):** Xem theo Tuần này, Tháng này hoặc khoảng thời gian tùy chọn.
*   **Tổng hợp (Summary):** Hiển thị tổng số giờ làm việc trong ngày/tuần ở dưới cùng (VD: **Tổng: 8h 15m**) để EMP tự kiểm tra KPI thời gian.

#### B. Chức năng Chỉnh sửa/Xóa (Edit/Delete)
EMP có quyền tự sửa sai sót của mình, nhưng bị giới hạn bởi thời gian (US-EMP-02-04).
*   **Hành động:** Nút "Sửa" (Icon bút chì) và "Xóa" (Icon thùng rác) xuất hiện trên từng dòng log.
*   **Quyền sở hữu:** Chỉ sửa/xóa được các log do chính mình tạo (`owner_user_id = ME`),.

---

### 4. Quy tắc Nghiệp vụ Cốt lõi & Ràng buộc (Backend Logic)

Đây là các quy tắc "bất di bất dịch" (Constraints) được kiểm tra ở tầng Server/Database trước khi lưu dữ liệu.

#### Quy tắc 1: "No Done, No Log" (Chưa xong thì chưa tính công)
*   User Story quy định rõ: Chỉ khi đối tượng (Task/Subtask) ở trạng thái **Hoàn thành (Done)** thì mới được phép log time.
*   Điều này buộc EMP phải hoàn tất công việc trước khi báo cáo thời gian, tránh tình trạng log time tràn lan mà việc không chạy.

#### Quy tắc 2: Cơ chế Khóa kỳ (Time Locking)
PM sẽ thực hiện khóa sổ (Lock Period) vào cuối tuần hoặc cuối tháng (US-MNG-04-01).
*   **Logic:** Khi EMP nhấn Submit (Tạo mới/Sửa/Xóa), hệ thống kiểm tra bảng `work_period_locks` dựa trên `org_id`, `project_id` và `work_date`,.
*   **Hệ quả:**
    *   Nếu kỳ **chưa khóa**: Cho phép lưu.
    *   Nếu kỳ **đã khóa** (`is_locked = TRUE`): Hệ thống báo lỗi *"Kỳ làm việc này đã bị khóa, vui lòng liên hệ PM"* và từ chối hành động. Lúc này, các nút Sửa/Xóa trên giao diện cũng sẽ bị ẩn hoặc mờ đi (Disabled).

#### Quy tắc 3: Logic Dữ liệu & Báo cáo
*   **Dữ liệu:** Log time được lưu vào bảng `time_logs` với `row_version` để xử lý xung đột nếu EMP sửa trên nhiều thiết bị cùng lúc.
*   **Nhật ký hoạt động (Activity):** Mỗi lần log time thành công, hệ thống sinh ra một sự kiện trong bảng `activity_events` (loại `LOG_TIME`) để hiển thị lên Timeline của EMP và Dashboard của PM.
*   **Thông báo:** Nếu PM cấu hình nhận tin, việc log time của EMP sẽ bắn thông báo cho PM (US-MNG-07-01).

### Tóm tắt Luồng Người dùng (User Flow)

1.  **EMP làm việc:** Thực hiện Subtask -> Chuyển trạng thái sang **Done**.
2.  **Hệ thống:** Kích hoạt nút **Log Time**.
3.  **EMP nhập liệu:** Bấm nút Log Time -> Nhập "2h", ghi chú "Đã code xong module A" -> Bấm Lưu.
4.  **Hệ thống Validates:**
    *   Check 1: Subtask đã Done chưa? -> OK.
    *   Check 2: Ngày hôm nay có bị PM khóa không? -> OK.
5.  **Kết quả:**
    *   Lưu vào DB `time_logs`.
    *   Hiện lên Activity Feed.
    *   Cộng dồn vào báo cáo chi phí dự án.

Mô hình này đảm bảo EMP có quyền tự chủ (Self-service) trong việc báo cáo, nhưng vẫn nằm trong khuôn khổ kiểm soát kỷ luật của dự án (Locking & Status rules).