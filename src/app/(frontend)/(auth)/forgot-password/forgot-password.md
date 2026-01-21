# QUÊN MẬT KHẨU (FORGOT PASSWORD)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-EMP-00-03**: Là người dùng, tôi muốn **yêu cầu khôi phục mật khẩu** qua email khi quên, để có thể lấy lại quyền truy cập tài khoản một cách tự phục vụ.
- **US-MNG-00-03**: Là Quản lý, tôi muốn **quên mật khẩu** và nhận link reset qua email để chủ động lấy lại tài khoản.
- **US-CEO-00-03**: Là CEO, tôi muốn **quên mật khẩu** để tự reset khi cần mà không phải qua bộ phận kỹ thuật.
- **US-SYS-00-03**: Là System Admin, tôi muốn **quên mật khẩu** để reset tài khoản admin qua email xác thực.
- **US-ORG-00-03**: Là Org Admin, tôi muốn **quên mật khẩu** để khôi phục tài khoản khi cần thiết.

**Nguồn:** Epic EMP-00, MNG-00, CEO-00, SYS-00, ORG-00 (Xác thực & Truy cập)

**Route:** `/(frontend)/(auth)/forgot-password`

**Quyền truy cập:**
- ✅ Guest (chưa đăng nhập)
- ❌ Authenticated users → Redirect về Dashboard

---

## 2. DỮ LIỆU CHI TIẾT

### 2.1. Database Tables

#### Bảng chính: `users`
**Nguồn:** Section 3.1.3 trong `3. Database Design.md`

| Column | Type | Null | Default | Hiển thị UI? | Ghi chú |
|--------|------|------|---------|--------------|---------|
| id | uuid | NOT NULL | gen | ❌ | Dùng để generate token |
| email | varchar(320) | NOT NULL | | ✅ | **Input field** |
| reset_token | varchar(255) | NULL | | ❌ | Token gửi qua email |
| reset_token_expires_at | timestamptz | NULL | | ❌ | Thời hạn token |
| status | varchar(30) | NOT NULL | `ACTIVE` | ❌ | Chỉ ACTIVE mới được reset |

---

### 2.2. API Endpoints

#### **POST /api/auth/forgot-password** - Yêu cầu reset password

**Request:**
```typescript
interface ForgotPasswordRequest {
  email: string;   // users.email
}
```

**Response Success (200):**
```typescript
interface ForgotPasswordResponse {
  message: string;   // "Nếu email tồn tại, chúng tôi đã gửi link khôi phục."
}
```

> ⚠️ **Security Note:** Response luôn trả về success message dù email có tồn tại hay không, để tránh email enumeration attack.

**Server-side Logic:**
```sql
-- Step 1: Tìm user theo email
SELECT id, email, status FROM users WHERE email = :email AND deleted_at IS NULL;

-- Step 2: Nếu tìm thấy và ACTIVE, generate token
UPDATE users 
SET 
  reset_token = :generated_token,
  reset_token_expires_at = NOW() + INTERVAL '1 hour'
WHERE id = :user_id;

-- Step 3: Gửi email với link reset
```

**Status Codes:**
- `200 OK` - Luôn trả về (security)
- `400 Bad Request` - Thiếu email hoặc format sai
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Lỗi server

---

## 3. BUSINESS RULES

### Rule 1: Token Expiration
**Nguồn:** Section 3.1.3 Database Design - `users.reset_token_expires_at`

> Token chỉ có hiệu lực trong thời gian giới hạn

**Implementation:**
- Token có hiệu lực 1 giờ (configurable)
- Sau khi hết hạn, user phải request lại

---

### Rule 2: Single Active Token
**Nguồn:** Logic nghiệp vụ hợp lý

> Mỗi user chỉ có 1 reset token active tại một thời điểm

**Implementation:**
- Request mới sẽ override token cũ
- Token cũ tự động invalidate

---

### Rule 3: User Status Check
**Nguồn:** Section 3.1.3 Database Design - `users.status`

> Chỉ user ACTIVE mới được reset password

**Implementation:**
- Nếu `status = 'LOCKED'` → Không gửi email (silent fail)
- UI vẫn hiển thị success message (security)

---

### Rule 4: Rate Limiting
**Nguồn:** Lưu ý kỹ thuật #3 trong `1. Epic - user stories.md`

> "Join Code nên có thời hạn hoặc có nút Refresh..."

**Implementation:**
- Max 3 requests/email/hour
- Max 10 requests/IP/hour

---

## 4. GIAO DIỆN

### 4.1. Wireframe Desktop - Step 1 (Request)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│   │                         │  │                             │  │
│   │     [Logo]              │  │   Quên mật khẩu             │  │
│   │     WorkSphere          │  │   ─────────────────────     │  │
│   │                         │  │                             │  │
│   │   "Quản lý công việc    │  │   Nhập email đã đăng ký,    │  │
│   │    hiệu quả"            │  │   chúng tôi sẽ gửi link     │  │
│   │                         │  │   khôi phục mật khẩu.       │  │
│   │                         │  │                             │  │
│   │                         │  │   Email                     │  │
│   │                         │  │   ┌─────────────────────┐   │  │
│   │                         │  │   │ email@example.com   │   │  │
│   │                         │  │   └─────────────────────┘   │  │
│   │                         │  │                             │  │
│   │                         │  │   [   Gửi link khôi phục  ] │  │
│   │                         │  │                             │  │
│   │                         │  │   ← Quay lại đăng nhập      │  │
│   │                         │  │                             │  │
│   └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2. Wireframe Desktop - Step 2 (Success)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│   │                         │  │                             │  │
│   │     [Logo]              │  │   ✉️ Kiểm tra email          │  │
│   │     WorkSphere          │  │   ─────────────────────     │  │
│   │                         │  │                             │  │
│   │                         │  │   Nếu email tồn tại trong   │  │
│   │                         │  │   hệ thống, chúng tôi đã    │  │
│   │                         │  │   gửi link khôi phục đến:   │  │
│   │                         │  │                             │  │
│   │                         │  │   📧 exam***@example.com    │  │
│   │                         │  │                             │  │
│   │                         │  │   Link có hiệu lực trong    │  │
│   │                         │  │   1 giờ.                    │  │
│   │                         │  │                             │  │
│   │                         │  │   [   Quay lại đăng nhập  ] │  │
│   │                         │  │                             │  │
│   │                         │  │   Không nhận được email?    │  │
│   │                         │  │   [Gửi lại]                 │  │
│   │                         │  │                             │  │
│   └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. FORM FIELDS

### 5.1. Form Schema

```typescript
interface ForgotPasswordFormData {
  email: string;
}

const forgotPasswordFormSchema = {
  email: {
    type: 'email',
    label: 'Email',
    placeholder: 'email@example.com',
    required: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 320,  // Nguồn: users.email varchar(320)
    },
  },
};
```

---

## 6. STATES (TRẠNG THÁI)

### 6.1. Initial State
```
┌────────────────────────────┐
│   Quên mật khẩu            │
│                            │
│   Email                    │
│   ┌────────────────────┐   │
│   │                    │   │  ← Empty, auto-focus
│   └────────────────────┘   │
│                            │
│   [ Gửi link khôi phục ]   │  ← Disabled until valid
│                            │
└────────────────────────────┘
```

### 6.2. Loading State
```
┌────────────────────────────┐
│                            │
│   [ ⏳ Đang gửi... ]       │  ← Button disabled, spinner
│                            │
│   Input disabled           │
│                            │
└────────────────────────────┘
```

### 6.3. Success State
```
┌────────────────────────────┐
│   ✉️ Kiểm tra email         │
│                            │
│   ✅ Link đã được gửi đến  │
│   📧 exam***@example.com   │
│                            │
│   Link có hiệu lực 1 giờ.  │
│                            │
│   [ Quay lại đăng nhập ]   │
│                            │
│   [Gửi lại] (disabled 60s) │
│                            │
└────────────────────────────┘
```

### 6.4. Rate Limit Error
```
┌────────────────────────────┐
│   ⚠️ Quá nhiều yêu cầu.    │
│   Vui lòng thử lại sau     │
│   X phút.                  │
│                            │
└────────────────────────────┘
```

---

## 7. VALIDATION & ERROR HANDLING

### 7.1. Client-side Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Required | "Vui lòng nhập email" |
| Email | Valid format | "Email không hợp lệ" |
| Email | Max 320 chars | "Email quá dài" |

### 7.2. Server Error Mapping

| HTTP Code | UI Action |
|-----------|-----------|
| 200 | Hiển thị success state |
| 400 | Hiển thị validation error |
| 429 | Hiển thị rate limit message |
| 500 | Hiển thị generic error |

---

## 8. COMPONENTS USED

### Từ `_shared/components/ui/`:
- **Input** - Email field
- **Button** - Submit button
- **Alert** - Success/Error messages

### Từ `_shared/layouts/`:
- **AuthLayout** - Wrapper layout

---

## 9. INTERACTIONS

### 9.1. Submit Request
1. User nhập email
2. Click "Gửi link khôi phục" hoặc Enter
3. Client validate → API call
4. Success → Hiển thị success state
5. Error → Hiển thị error message

### 9.2. Resend Link
- Click "Gửi lại"
- Disabled 60 giây sau mỗi lần gửi
- Countdown hiển thị: "Gửi lại (45s)"

### 9.3. Navigate Back
- Click "← Quay lại đăng nhập" → Navigate `/login`

---

## 10. EMAIL TEMPLATE

**Subject:** Khôi phục mật khẩu WorkSphere

**Body:**
```
Xin chào,

Bạn (hoặc ai đó) đã yêu cầu khôi phục mật khẩu cho tài khoản liên kết với email này.

Click link bên dưới để đặt lại mật khẩu:
[Đặt lại mật khẩu] → https://app.worksphere.com/reset-password?token=xxx

Link này có hiệu lực trong 1 giờ.

Nếu bạn không yêu cầu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.

Trân trọng,
Đội ngũ WorkSphere
```

---

## 11. ACCESSIBILITY (A11Y)

### 11.1. Form Accessibility
```html
<form aria-label="Quên mật khẩu">
  <p id="form-description">
    Nhập email đã đăng ký để nhận link khôi phục mật khẩu.
  </p>
  <label for="email">Email</label>
  <input 
    id="email" 
    type="email" 
    aria-required="true"
    aria-describedby="form-description email-error"
  />
</form>
```

---

## 12. SECURITY CONSIDERATIONS

- ⚠️ Không tiết lộ email có tồn tại hay không
- ⚠️ Rate limiting để chống spam
- ⚠️ Token có TTL ngắn (1 giờ)
- ⚠️ Token single-use (invalidate sau khi dùng)
- ⚠️ Mask email trong UI (exam***@example.com)

---

## 13. RELATED PAGES

**Navigation flow:**
```
/forgot-password (This page)
  ├─→ /login              (← Quay lại đăng nhập)
  └─→ /reset-password     (Click link trong email)
```

---

## 14. CHANGELOG

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | AI Agent | Initial documentation |

---

**END OF DOCUMENTATION**
