Dựa trên 5 tài liệu hệ thống, dưới đây là mô tả **100% đầy đủ** về Giao diện, Chức năng và Logic nghiệp vụ của trang **Thùng Rác Dự Án (Project Recycle Bin)** dành riêng cho vai trò **Project Manager (PM/MNG)**.

Đây là công cụ giúp PM kiểm soát rủi ro mất mát dữ liệu và dọn dẹp tài nguyên dư thừa trong phạm vi dự án mình quản lý.

---

### 1. TỔNG QUAN & NGUỒN DỮ LIỆU
*   **Mục đích:** Quản lý các đối tượng đã bị **Xóa mềm (Soft Delete)** trong dự án.
*   **Nguồn dữ liệu hiển thị:** Hệ thống không truy vấn quét tất cả các bảng nghiệp vụ mà truy vấn tập trung từ bảng metadata trung gian là `recycle_bin_items`,.
*   **Phân quyền (RBAC):** PM có 3 quyền chính trên tài nguyên `RECYCLE_BIN` là `READ`, `RESTORE`, `DESTROY`.

---

### 2. GIAO DIỆN DANH SÁCH THÙNG RÁC (RECYCLE BIN UI)

**Giao diện hiển thị:**
PM sẽ thấy một danh sách dạng bảng (Data Grid) bao gồm các cột thông tin sau lấy từ bảng `recycle_bin_items`:
1.  **Loại đối tượng (Entity Type):** Icon/Text phân loại (Task, Subtask, Time Log, Document, Resource).
2.  **Tên đối tượng (Entity Title):** Tiêu đề của Task hoặc tên file tại thời điểm bị xóa.
3.  **Người xóa (Deleted By):** Tên nhân viên đã thực hiện thao tác xóa.
4.  **Thời điểm xóa (Deleted At):** Ngày giờ thực hiện xóa.
5.  **Dự án (Project):** Tên dự án chứa dữ liệu này (Quan trọng nếu PM quản lý nhiều dự án).

**Bộ lọc & Tìm kiếm:**
*   **Lọc theo Dự án:** PM chọn dự án cụ thể để xem rác của dự án đó (Bắt buộc theo logic Scope).
*   **Lọc theo Loại:** Chỉ xem Task đã xóa hoặc Time log đã xóa.
*   **Lọc theo Người xóa:** Tìm xem ai là người đã xóa dữ liệu này.

---

### 3. CHỨC NĂNG CHI TIẾT (ACTIONS)

PM có thể thực hiện 2 hành động chính đối với từng dòng dữ liệu:

#### A. Khôi phục (RESTORE)
*   **Mô tả:** Đưa dữ liệu từ thùng rác quay trở lại trạng thái hoạt động bình thường trong dự án.
*   **Logic hệ thống:**
    1.  Hệ thống tìm bản ghi gốc trong bảng nghiệp vụ (ví dụ: bảng `tasks`) dựa trên `entity_id`.
    2.  Set cột `deleted_at` về `NULL`.
    3.  Xóa dòng metadata tương ứng trong bảng `recycle_bin_items`.
    4.  *(Tùy chọn)* Nếu có `original_data` (snapshot json), hệ thống có thể dùng để đối chiếu.

#### B. Xóa vĩnh viễn (DESTROY / HARD DELETE)
*   **Mô tả:** Xóa hoàn toàn dữ liệu khỏi cơ sở dữ liệu để giải phóng tài nguyên. Hành động này **không thể hoàn tác**.
*   **Logic hệ thống:**
    1.  Thực hiện lệnh `DELETE` vật lý trên bảng nghiệp vụ gốc.
    2.  Xóa dòng trong `recycle_bin_items`.

---

### 4. LOGIC NGHIỆP VỤ & RÀNG BUỘC (CONSTRAINTS)

#### A. Ràng buộc về Phạm vi (Scope Isolation)
*   **Nguyên tắc:** PM chỉ được xem và thao tác với dữ liệu rác thuộc các dự án mà mình được phân công quản lý (`project_id = Managed Project`),.
*   **Chặn truy cập:** PM không thể thấy rác của dự án khác, hoặc rác cấp hệ thống (của Org Admin/Sys Admin).

#### B. Ràng buộc về Tính toàn vẹn dữ liệu (Data Integrity)
Khi PM thực hiện **Xóa vĩnh viễn (Destroy)**, hệ thống áp dụng các quy tắc ràng buộc Khóa ngoại (Foreign Key) chặt chẽ:

1.  **Quy tắc CASCADE (Xóa dây chuyền):**
    *   Nếu PM xóa vĩnh viễn một **Task**, hệ thống sẽ tự động xóa luôn các **Subtask**, **Comment**, **File đính kèm** và **Tag** gắn liền với Task đó.
    *   Lý do: Các dữ liệu con này không thể tồn tại độc lập nếu Task cha đã mất.

2.  **Quy tắc RESTRICT (Chặn xóa - Quan trọng):**
    *   **Time Log (Bảng công):** Nếu một Task (hoặc Subtask) đã có phát sinh **Time Log** (ghi nhận giờ làm việc) để tính lương/chi phí, hệ thống sẽ **CHẶN** hành động xóa vĩnh viễn Task đó (Logic `RESTRICT` tại bảng `time_logs`).
    *   **Lý do:** Để đảm bảo lịch sử tính lương và báo cáo chi phí tài chính không bị sai lệch trong quá khứ. PM phải xóa Time Log trước (nếu muốn), sau đó mới xóa được Task.

#### C. Logic Xóa Subtask
*   Nếu PM khôi phục một **Task cha**, các **Subtask** của nó (nếu cũng đang nằm trong thùng rác do bị xóa theo cha) thường sẽ được khôi phục theo logic nghiệp vụ của ứng dụng (Application Logic) để đảm bảo tính nguyên vẹn cấu trúc công việc.

---

### 5. TÓM TẮT QUYỀN HẠN PM TẠI TRANG NÀY

| Hành động | Quyền (Permission) | Logic kiểm soát (ABAC/Constraint) |
| :--- | :--- | :--- |
| **Xem danh sách** | `RECYCLE_BIN.READ` | `project_id` thuộc danh sách dự án PM quản lý. |
| **Khôi phục** | `RECYCLE_BIN.RESTORE` | Dữ liệu gốc chưa bị hỏng/mâu thuẫn logic. |
| **Xóa vĩnh viễn** | `RECYCLE_BIN.DESTROY` | Không vi phạm ràng buộc khóa ngoại (VD: có Time Log). |

Trang Thùng rác đảm bảo rằng PM có quyền lực tối cao trong việc quản lý vòng đời dữ liệu dự án ("Hối hận" khi xóa nhầm hoặc "Dọn dẹp" triệt để), nhưng vẫn bị kiểm soát bởi các quy tắc an toàn tài chính của hệ thống.