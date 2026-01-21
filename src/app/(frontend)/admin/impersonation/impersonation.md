# IMPERSONATION (ĐĂNG NHẬP HỖ TRỢ)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-SYS-01-06**: Là System Admin, tôi muốn **đăng nhập vào một Tổ chức dưới quyền hỗ trợ (Impersonate)**, để giúp khách hàng thiết lập hệ thống hoặc xử lý lỗi kỹ thuật.

**Nguồn:** Epic SYS-01

**Route:** `/(frontend)/admin/impersonation`

**Quyền truy cập:**
- ✅ SYS_ADMIN - Full access
- ❌ Tất cả role khác

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `impersonation_sessions`
**Nguồn:** Section 3.8.2

| Column | Type | Ghi chú |
|--------|------|---------|
| id | uuid | PK |
| org_id | uuid | Org được impersonate |
| actor_user_id | uuid | System Admin |
| subject_user_id | uuid | User bị mạo danh |
| reason | text | Lý do impersonate (bắt buộc) |
| started_at | timestamptz | Thời điểm bắt đầu |
| ended_at | timestamptz | Thời điểm kết thúc |
| ended_reason | text | Lý do kết thúc |
| request_id | varchar(100) | Ticket ID (nếu có) |

---

### 2.2. API Endpoints

**POST /api/admin/impersonate**

```typescript
interface ImpersonateRequest {
  org_id: string;
  subject_user_id: string;
  reason: string;
  request_id?: string;  // Support ticket ID
}

interface ImpersonateResponse {
  session_id: string;
  token: string;  // JWT token for impersonated session
  expires_at: string;
}
```

**POST /api/admin/impersonate/:sessionId/end**

```typescript
interface EndImpersonateRequest {
  ended_reason: string;
}
```

---

## 3. GIAO DIỆN

### 3.1. Impersonation Dialog

```
┌──────────────────────────────────────────────────────────────┐
│  🔐 Đăng nhập Hỗ trợ (Impersonate)                   [X]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ⚠️ CẢNH BÁO: Mọi thao tác sẽ được ghi log đầy đủ.         │
│                                                              │
│  Chọn Tổ chức *                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 🔍 Tìm kiếm org...                              ▼ │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Đăng nhập với vai trò *                                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Chọn user trong org...                          ▼ │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Lý do Impersonate *                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Hỗ trợ cấu hình dự án theo yêu cầu ticket #1234   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Mã Ticket (Optional)                                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │ TICKET-1234                                        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│                              [Hủy]  [Bắt đầu Impersonate]   │
└──────────────────────────────────────────────────────────────┘
```

### 3.2. Impersonation Banner

Khi đang trong phiên Impersonate, hiển thị banner cố định ở đầu trang:

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔴 ĐANG IMPERSONATE: john@company.com (Acme Corp)              │
│ Bắt đầu: 08:45 | Session ID: abc123   [Kết thúc Impersonate]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. BUSINESS RULES

### Rule 1: Bắt buộc ghi lý do
**Nguồn:** Epic SYS-01, Lưu ý kỹ thuật #1

> "Khi bạn đăng nhập vào Org của khách để hỗ trợ, hệ thống phải ghi log lại cực kỳ chi tiết để tránh các vấn đề pháp lý sau này về quyền riêng tư dữ liệu."

### Rule 2: Audit tất cả thao tác
Mọi action trong phiên impersonate phải được ghi vào `audit_logs` với `impersonation_session_id`.

### Rule 3: Session timeout
Phiên impersonate tự động kết thúc sau 2 giờ hoặc khi System Admin logout.

### Rule 4: Không thể impersonate System Admin khác
System Admin không được phép chọn user có role SYS_ADMIN để impersonate.

---

## 5. RELATED PAGES

```
/admin/impersonation (This page)
  ├─→ /admin/audit-logs     (Xem log impersonate)
  └─→ /admin/organizations  (Chọn org)
```

---

**END OF DOCUMENTATION**
