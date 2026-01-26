Dựa trên các tài liệu thiết kế hệ thống (đặc biệt là Phase 2 về Security và Database Design), dưới đây là chi tiết **100% logic và chức năng** của giao diện **Truy cập Ủy quyền (Impersonation)** dành cho System Admin.

Đây là tính năng nhạy cảm nhất hệ thống (thường gọi là "God Mode"), cho phép System Admin đăng nhập dưới danh nghĩa người dùng khác để hỗ trợ, đòi hỏi quy trình kiểm soát (Audit & Governance) cực kỳ nghiêm ngặt.

### 1. Giao diện & Luồng Người dùng (UI/UX Flow)

**Mục đích:** Hỗ trợ khách hàng thiết lập hệ thống hoặc debug lỗi kỹ thuật trực tiếp trên môi trường của họ.

*   **Vị trí:** Thường nằm trong giao diện "Chi tiết Người dùng" (User Detail) hoặc "Danh sách Người dùng" (User List) của màn hình Quản trị Hệ thống.
*   **Hành động (Action):** Nút bấm **"Đăng nhập dưới quyền" (Log in as this user / Impersonate)**.

**Quy trình tương tác (Step-by-Step):**
1.  **Kích hoạt:** Admin nhấn nút "Impersonate" trên tài khoản người dùng mục tiêu.
2.  **Popup Bắt buộc (Constraint):** Hệ thống hiển thị một Popup yêu cầu nhập **"Lý do truy cập" (Reason)**.
    *   *Logic:* Đây là trường bắt buộc, không được để trống,.
3.  **Chuyển đổi Phiên (Session Switch):**
    *   Sau khi xác nhận, trình duyệt chuyển hướng Admin vào Dashboard của người dùng đó (Org của khách hàng).
    *   Giao diện thường hiển thị một thanh thông báo (Banner) trên cùng: *"Bạn đang truy cập dưới quyền [Tên User]. [Nút Thoát/Stop Impersonating]"* để Admin biết mình đang không dùng tài khoản chính.
4.  **Kết thúc:** Admin nhấn "Stop Impersonating" để quay lại giao diện quản trị System Admin.

---

### 2. Logic Chức năng & Bảo mật (Backend Logic)

Để thực hiện hành động trên, hệ thống xử lý các logic phức tạp sau:

#### A. Kiểm tra Quyền & Chính sách (RBAC/ABAC)
*   **Permission:** Yêu cầu quyền `SESSION.IMPERSONATE`. Chỉ Role `SYS_ADMIN` mới có quyền này.
*   **Policy:** Tuân thủ chính sách `POL-SYS-IMP`,.
*   **Phạm vi (Scope):** System Admin có thể Impersonate **bất kỳ user nào** thuộc **bất kỳ Organization nào** (Cross-tenant).

#### B. Kiểm soát Rủi ro & SoD (Separation of Duties)
Hệ thống được thiết kế để ngăn chặn lạm dụng quyền lực:
*   **Rủi ro:** Admin giả danh người khác làm việc xấu, sau đó xóa log hệ thống để phi tang.
*   **Cơ chế ngăn chặn:** Cặp quyền `SESSION.IMPERSONATE` (Giả danh) và `SYS_AUDIT.READ` (Xem/Xóa Audit Log) được đánh dấu là xung đột rủi ro cao trong bảng SoD. Hệ thống sẽ cảnh báo hoặc yêu cầu giám sát chéo nếu một tài khoản nắm giữ cả hai khả năng này mà không có kiểm soát.

#### C. Cơ chế Ghi Log (Audit Trail) - Phần quan trọng nhất
Khi Impersonation diễn ra, hệ thống ghi log theo tiêu chuẩn "Accountability" (Truy vết trách nhiệm):

1.  **Ghi nhận Phiên (Session Record):** Tạo bản ghi mới trong bảng `impersonation_sessions` với các thông tin:
    *   `actor_user_id`: ID của System Admin (Người thực hiện).
    *   `subject_user_id`: ID của User bị giả danh (Người được hỗ trợ).
    *   `reason`: Lý do đã nhập ở bước 2.
    *   `started_at` / `ended_at`: Thời gian bắt đầu và kết thúc.

2.  **Ghi nhận Hành động (Action Log):** Mọi thao tác Admin làm trong khi giả danh (ví dụ: Xem lương, Xóa task) sẽ được ghi vào bảng `audit_logs` với cấu trúc đặc biệt:
    *   `actor_user_id`: ID của User bị giả danh (để hệ thống chạy đúng logic quyền của user đó).
    *   `original_actor_id`: **ID của System Admin** (để biết ai mới là người thực sự làm hành động này).
    *   `impersonation_session_id`: Link tới phiên hỗ trợ tương ứng.

---

### 3. Thiết kế Cơ sở Dữ liệu (Database Mapping)

Chức năng này dựa trên hai bảng dữ liệu chính trong thiết kế Database,:

**Bảng 1: `impersonation_sessions` (Lưu lịch sử phiên hỗ trợ)**
| Cột (Column) | Ý nghĩa | Logic Ràng buộc |
| :--- | :--- | :--- |
| `id` | ID phiên | Primary Key |
| `org_id` | Org của User | Link tới Organization đang hỗ trợ |
| `actor_user_id` | **System Admin** | Người chủ động thực hiện |
| `subject_user_id` | **Target User** | Người dùng được hỗ trợ |
| `reason` | Lý do | **NOT NULL** (Bắt buộc nhập) |
| `request_id` | Mã Trace | Dùng để truy vết logs kỹ thuật |

**Bảng 2: `audit_logs` (Lưu hành động chi tiết)**
| Cột (Column) | Ý nghĩa | Logic Ràng buộc |
| :--- | :--- | :--- |
| `actor_user_id` | User bị giả danh | Để hiển thị trên Activity Feed của User |
| `original_actor_id` | System Admin | **Bắt buộc có** khi đang Impersonate |
| `impersonation_session_id` | Link phiên | Foreign Key tới bảng trên |

### Tóm tắt Quyền hạn System Admin tại giao diện này:
*   **Hành động:** `IMPERSONATE` (Đăng nhập hộ).
*   **Đối tượng:** `SESSION` (Phiên làm việc).
*   **Ràng buộc:** Phải cung cấp lý do (`reason`) và chịu sự giám sát của Audit Log toàn cục (`SYS_AUDIT`),.