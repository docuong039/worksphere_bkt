Dựa trên tài liệu User Stories (Epic CEO-06), Phân quyền RBAC Phase 2 và Thiết kế Database (Phase 1 & 2), dưới đây là mô tả chi tiết **100% giao diện, chức năng và logic** của **Phân hệ Thùng rác Toàn công ty (Org Recycle Bin)** dành riêng cho vai trò **CEO**.

Phân hệ này đóng vai trò là "lưới an toàn dữ liệu" (Data Safety Net), giúp CEO giám sát việc hủy bỏ tài nguyên và khôi phục lại các thông tin quan trọng bị nhân viên xóa nhầm.

---

### 1. Giao diện & Chức năng (Front-end Specification)

Giao diện này cung cấp một cái nhìn tập trung về tất cả các tài sản số đã bị xóa (Soft Delete) trong toàn bộ tổ chức, không phân biệt dự án hay phòng ban.

#### A. Danh sách Dữ liệu đã xóa (Global Deleted Items)
*   **Hiển thị dạng bảng (Grid View):** Liệt kê tất cả các mục đã xóa với các cột thông tin quan trọng:
    *   **Tên đối tượng:** Tiêu đề Task, Tên tài liệu, hoặc Tiêu đề báo cáo.
    *   **Loại (Type):** Phân loại rõ ràng (Task, Subtask, Document, Report, User...).
    *   **Dự án gốc:** Hiển thị tên dự án mà đối tượng này từng thuộc về (nếu có).
    *   **Người xóa (Deleted By):** Tên nhân viên thực hiện thao tác xóa.
    *   **Thời gian xóa:** Thời điểm xóa (VD: "2 giờ trước").
*   **Bộ lọc nâng cao (Advanced Filters):**
    *   **Lọc theo Dự án:** Chọn xem dữ liệu đã xóa của một dự án cụ thể hoặc "Tất cả dự án".
    *   **Lọc theo Loại:** Chỉ xem các "Document" bị xóa hoặc các "Report" bị xóa.
    *   **Lọc theo Người xóa:** Tìm xem nhân viên A đã xóa những gì gần đây (để phát hiện hành vi phá hoại nếu có).

#### B. Hành động Khôi phục (Restore Action)
*   **Nút Khôi phục (Restore Button):**
    *   Bên cạnh mỗi dòng dữ liệu có nút "Khôi phục".
    *   Khi CEO bấm nút này, dữ liệu sẽ ngay lập tức biến mất khỏi Thùng rác và xuất hiện trở lại tại vị trí cũ (ví dụ: Task quay lại dự án, File quay lại mục tài liệu).
*   **Khôi phục hàng loạt (Bulk Restore):** Cho phép CEO tích chọn nhiều dòng và bấm "Khôi phục tất cả" để xử lý sự cố xóa nhầm hàng loạt.

#### C. Hành động Xóa vĩnh viễn (Permanent Delete / Destroy)
*   **Cảnh báo đỏ:** Mặc dù User Story của CEO tập trung vào khôi phục, nhưng bảng phân quyền cho phép `RECYCLE_BIN.ALL`. Do đó, CEO có nút "Xóa vĩnh viễn".
*   **Chức năng:** Xóa hoàn toàn dữ liệu khỏi cơ sở dữ liệu vật lý. Hành động này không thể hoàn tác và hệ thống sẽ hiển thị Popup cảnh báo xác nhận (Confirm Dialog) trước khi thực hiện.

---

### 2. Logic Nghiệp vụ & Phân quyền (Backend Logic)

Logic tại đây được thiết kế để đảm bảo CEO có quyền lực tối cao đối với dữ liệu rác của công ty, vượt qua giới hạn của PM.

#### A. Logic Truy vấn Dữ liệu (Query Scope)
*   **Tenant-wide Visibility (Tầm nhìn toàn tổ chức):**
    *   Hệ thống truy vấn bảng `recycle_bin_items` với điều kiện duy nhất: `WHERE org_id = CEO.org_id`.
    *   **Khác biệt với PM:** PM chỉ nhìn thấy rác thuộc `project_id` mà họ quản lý. CEO nhìn thấy rác của tất cả dự án và cả rác cấp công ty (như User bị xóa, Org Docs bị xóa).

#### B. Cơ chế "Soft Delete" (Xóa mềm)
*   **Nguyên lý hoạt động:** Trong hệ thống này, khi nhân viên bấm "Xóa", dữ liệu không bị mất đi vật lý.
    *   Trường `deleted_at` trong bảng gốc (ví dụ: `tasks`) được cập nhật thời gian hiện tại.
    *   Một bản ghi metadata được chèn vào bảng `recycle_bin_items` để hiển thị trên giao diện Thùng rác.
*   **Logic Khôi phục:** Khi CEO bấm "Restore":
    1.  Hệ thống set `deleted_at = NULL` trên bảng gốc (ví dụ `tasks`).
    2.  Hệ thống xóa dòng tương ứng trong bảng `recycle_bin_items`.

#### C. Quyền hạn (Permissions)
*   **Role:** CEO.
*   **Permission:** **`RECYCLE_BIN.ALL`** (Bao gồm `READ`, `RESTORE`, `DESTROY`).
*   **Constraint:** Phạm vi truy cập bị giới hạn bởi `ATTR_ORG_ID` (Chỉ thao tác trên dữ liệu của công ty mình).

---

### 3. Thiết kế Dữ liệu Nền tảng (Database Schema)

Giao diện Thùng rác của CEO không truy vấn trực tiếp vào từng bảng nghiệp vụ (như `tasks`, `documents`...) vì sẽ rất chậm và phức tạp. Thay vào đó, nó lấy dữ liệu từ một bảng trung tâm.

**Bảng dữ liệu chính:** `recycle_bin_items`.

| Trường thông tin (Column) | Ý nghĩa & Logic hiển thị cho CEO |
| :--- | :--- |
| **`id`** | ID của mục trong thùng rác. |
| **`org_id`** | **Khóa chính để lọc:** Đảm bảo CEO chỉ thấy rác của công ty mình. |
| **`project_id`** | Dùng cho bộ lọc "Theo dự án" trên giao diện CEO. |
| **`entity_type`** | Hiển thị loại dữ liệu (`TASK`, `DOCUMENT`, `REPORT`...). |
| **`entity_id`** | ID tham chiếu để thực hiện lệnh Restore về bảng gốc. |
| **`entity_title`** | Tên hiển thị (Snapshot tại thời điểm xóa) để CEO nhận diện nhanh. |
| **`deleted_at`** | Sắp xếp danh sách theo thời gian xóa mới nhất -> cũ nhất. |
| **`deleted_by`** | Hiển thị tên người xóa để quy trách nhiệm (Audit). |
| **`original_data`** | (JSONB) Chứa snapshot dữ liệu cũ để hỗ trợ khôi phục chính xác. |

### Tóm tắt: CEO thấy gì khác PM và Employee trong Thùng rác?

| Đặc điểm | CEO Recycle Bin | PM Recycle Bin | Employee Recycle Bin |
| :--- | :--- | :--- | :--- |
| **Phạm vi (Scope)** | **Toàn công ty** (Bao gồm User, Report, Docs, Tasks của mọi dự án). | **Dự án quản lý** (Chỉ Task, Doc thuộc dự án mình làm PM). | **Cá nhân** (Chỉ dữ liệu do chính mình tạo và xóa). |
| **Quyền hạn** | Khôi phục tất cả mọi thứ. | Khôi phục trong phạm vi dự án. | Chỉ khôi phục đồ của mình. |
| **Mục đích** | Quản trị rủi ro dữ liệu, giám sát hành vi phá hoại. | Quản lý tài nguyên dự án, sửa lỗi xóa nhầm của team. | Tự sửa lỗi cá nhân (Undo). |

Đây là thiết kế đảm bảo CEO có thể kiểm soát "vòng đời cuối cùng" của dữ liệu, ngăn chặn việc mất mát tài sản số quan trọng của doanh nghiệp.