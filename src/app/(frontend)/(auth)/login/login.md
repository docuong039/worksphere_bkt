# ĐĂNG NHẬP (LOGIN)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-EMP-00-01**: Là người dùng, tôi muốn **đăng nhập** bằng email và mật khẩu, để truy cập vào hệ thống làm việc.
- **US-MNG-00-01**: Là Quản lý, tôi muốn **đăng nhập** để điều phối dự án và phê duyệt công việc.
- **US-CEO-00-01**: Là CEO, tôi muốn **đăng nhập** để xem dashboard tổng thể và báo cáo tài chính.
- **US-SYS-00-01**: Là System Admin, tôi muốn **đăng nhập** với bảo mật cao để quản trị toàn bộ nền tảng SaaS.
- **US-ORG-00-01**: Là Org Admin, tôi muốn **đăng nhập** để quản lý nhân sự và cấu hình tổ chức của mình.

**Nguồn:** Epic EMP-00, MNG-00, CEO-00, SYS-00, ORG-00 (Xác thực & Truy cập)

**Route:** `/(frontend)/(auth)/login`

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
| id | uuid | NOT NULL | gen | ❌ | Dùng cho session |
| email | varchar(320) | NOT NULL | | ✅ | **Input field** |
| password_hash | varchar(255) | NOT NULL | | ❌ | So sánh với input password |
| full_name | varchar(255) | NOT NULL | | ❌ | Sau login hiển thị ở header |
| status | varchar(30) | NOT NULL | `ACTIVE` | ❌ | Check ACTIVE mới cho login |
| last_login_at | timestamptz | NULL | | ❌ | Cập nhật khi login thành công |

#### Bảng liên quan: `org_memberships`
**Nguồn:** Section 3.1.4

**Mục đích:** Xác định user thuộc Org nào

| Column | Type | Hiển thị UI? | Ghi chú |
|--------|------|--------------|---------|
| org_id | uuid | ❌ | Set vào session sau login |
| user_id | uuid | ❌ | FK từ users |
| member_status | varchar(30) | ❌ | Phải là ACTIVE |

---

### 2.2. API Endpoints

#### **POST /api/auth/login** - Đăng nhập

**Request:**
```typescript
interface LoginRequest {
  email: string;           // users.email
  password: string;        // Plain text, server validate với password_hash
  remember_me?: boolean;   // Extend session duration
}
```

**Response Success (200):**
```typescript
interface LoginResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
  };
  org: {
    id: string;
    name: string;
    code: string;
  };
  roles: string[];          // ['EMP'] hoặc ['PM'] hoặc ['CEO']...
  access_token: string;     // JWT token
  expires_at: string;       // ISO 8601 datetime
}
```

**Response Error:**
```typescript
interface LoginErrorResponse {
  error: {
    code: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'ACCOUNT_DEACTIVATED' | 'ORG_SUSPENDED';
    message: string;
  };
}
```

**Status Codes:**
- `200 OK` - Login thành công
- `400 Bad Request` - Thiếu email hoặc password
- `401 Unauthorized` - Sai email/password
- `403 Forbidden` - Tài khoản bị khóa hoặc Org bị suspend
- `500 Internal Server Error` - Lỗi server

---

## 3. BUSINESS RULES

### Rule 1: Validate User Status
**Nguồn:** Section 3.1.3 Database Design - `users.status`

> Check constraint: `status IN ('ACTIVE','LOCKED')`

**Implementation:**
- Chỉ cho phép login khi `users.status = 'ACTIVE'`
- Nếu `status = 'LOCKED'` → Error "Tài khoản đã bị khóa"

---

### Rule 2: Validate Org Membership Status
**Nguồn:** Section 3.1.4 Database Design - `org_memberships.member_status`

> Check constraint: `member_status IN ('INVITED','ACTIVE','DEACTIVATED')`

**Implementation:**
- Chỉ cho phép login khi `org_memberships.member_status = 'ACTIVE'`
- Nếu `INVITED` → "Vui lòng xác nhận lời mời trước"
- Nếu `DEACTIVATED` → "Tài khoản đã bị vô hiệu hóa"

---

### Rule 3: Validate Organization Status
**Nguồn:** Section 3.1.1 Database Design - `organizations.status`

> Check constraint: `status IN ('PENDING','ACTIVE','SUSPENDED')`

**Implementation:**
- Chỉ cho phép login khi `organizations.status = 'ACTIVE'`
- Nếu `SUSPENDED` → "Tổ chức đang bị đình chỉ. Liên hệ Admin."

---

### Rule 4: Update Last Login
**Nguồn:** Section 3.1.3 Database Design - `users.last_login_at`

**Implementation:**
```sql
UPDATE users 
SET last_login_at = NOW() 
WHERE id = :user_id;
```

---

## 4. GIAO DIỆN

### 4.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│   │                         │  │                             │  │
│   │     [Logo]              │  │   Đăng nhập                 │  │
│   │     WorkSphere          │  │   ─────────────────────     │  │
│   │                         │  │                             │  │
│   │   "Quản lý công việc    │  │   Email                     │  │
│   │    hiệu quả"            │  │   ┌─────────────────────┐   │  │
│   │                         │  │   │ email@example.com   │   │  │
│   │                         │  │   └─────────────────────┘   │  │
│   │                         │  │                             │  │
│   │                         │  │   Mật khẩu                  │  │
│   │                         │  │   ┌─────────────────────┐   │  │
│   │                         │  │   │ ••••••••••    👁️   │   │  │
│   │                         │  │   └─────────────────────┘   │  │
│   │                         │  │                             │  │
│   │                         │  │   ☐ Ghi nhớ đăng nhập       │  │
│   │                         │  │                             │  │
│   │                         │  │   [    Đăng nhập    ]       │  │
│   │                         │  │                             │  │
│   │                         │  │   Quên mật khẩu?            │  │
│   │                         │  │                             │  │
│   └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2. Wireframe Mobile

```
┌──────────────────────────┐
│      [Logo]              │
│      WorkSphere          │
├──────────────────────────┤
│                          │
│   Đăng nhập              │
│   ─────────────────────  │
│                          │
│   Email                  │
│   ┌────────────────────┐ │
│   │ email@example.com  │ │
│   └────────────────────┘ │
│                          │
│   Mật khẩu               │
│   ┌────────────────────┐ │
│   │ ••••••••    👁️    │ │
│   └────────────────────┘ │
│                          │
│   ☐ Ghi nhớ đăng nhập    │
│                          │
│   [    Đăng nhập    ]    │
│                          │
│   Quên mật khẩu?         │
│                          │
└──────────────────────────┘
```

---

## 5. FORM FIELDS

### 5.1. Form Schema

```typescript
interface LoginFormData {
  email: string;
  password: string;
  remember_me: boolean;
}

const loginFormSchema = {
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
  password: {
    type: 'password',
    label: 'Mật khẩu',
    placeholder: '••••••••',
    required: true,
    validation: {
      minLength: 8,
      maxLength: 128,
    },
    showPasswordToggle: true,
  },
  remember_me: {
    type: 'checkbox',
    label: 'Ghi nhớ đăng nhập',
    defaultValue: false,
  },
};
```

---

## 6. STATES (TRẠNG THÁI)

### 6.1. Initial State
```
┌────────────────────────────┐
│   Đăng nhập                │
│                            │
│   Email                    │
│   ┌────────────────────┐   │
│   │                    │   │  ← Empty, focus
│   └────────────────────┘   │
│                            │
│   Mật khẩu                 │
│   ┌────────────────────┐   │
│   │                    │   │
│   └────────────────────┘   │
│                            │
│   [   Đăng nhập   ]        │  ← Disabled until valid
│                            │
└────────────────────────────┘
```

### 6.2. Validation Error State
```
┌────────────────────────────┐
│   Email                    │
│   ┌────────────────────┐   │
│   │ invalid-email      │   │  ← Border red
│   └────────────────────┘   │
│   ⚠️ Email không hợp lệ   │  ← Error message
│                            │
└────────────────────────────┘
```

### 6.3. Loading State
```
┌────────────────────────────┐
│                            │
│   [ ⏳ Đang đăng nhập... ] │  ← Button disabled, spinner
│                            │
│   Inputs disabled          │
│                            │
└────────────────────────────┘
```

### 6.4. Error State (Wrong Credentials)
```
┌────────────────────────────┐
│   ❌ Email hoặc mật khẩu   │  ← Alert banner
│      không đúng            │
│                            │
│   Email                    │
│   ┌────────────────────┐   │
│   │ wrong@email.com    │   │
│   └────────────────────┘   │
│                            │
└────────────────────────────┘
```

### 6.5. Success State
- Redirect về `/dashboard`
- Toast: "Đăng nhập thành công"

---

## 7. VALIDATION & ERROR HANDLING

### 7.1. Client-side Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Required | "Vui lòng nhập email" |
| Email | Valid format | "Email không hợp lệ" |
| Email | Max 320 chars | "Email quá dài" |
| Password | Required | "Vui lòng nhập mật khẩu" |
| Password | Min 8 chars | "Mật khẩu tối thiểu 8 ký tự" |

### 7.2. Server Error Mapping

| Error Code | UI Message |
|------------|------------|
| INVALID_CREDENTIALS | "Email hoặc mật khẩu không đúng" |
| ACCOUNT_LOCKED | "Tài khoản đã bị khóa. Liên hệ Admin." |
| ACCOUNT_DEACTIVATED | "Tài khoản đã bị vô hiệu hóa." |
| ORG_SUSPENDED | "Tổ chức đang bị đình chỉ. Liên hệ Admin." |

---

## 8. COMPONENTS USED

### Từ `_shared/components/ui/`:
- **Input** - Email và Password fields
- **Button** - Submit button
- **Checkbox** - Remember me
- **Alert** - Error messages

### Từ `_shared/layouts/`:
- **AuthLayout** - Wrapper layout

---

## 9. INTERACTIONS

### 9.1. Submit Form
1. User điền email và password
2. Click "Đăng nhập" hoặc Enter
3. Client validate → API call
4. Success → Redirect `/dashboard`
5. Error → Hiển thị error message

### 9.2. Toggle Password Visibility
- Click icon 👁️ → Toggle `type="password"` ↔ `type="text"`

### 9.3. Navigate to Forgot Password
- Click "Quên mật khẩu?" → Navigate `/forgot-password`

---

## 10. ACCESSIBILITY (A11Y)

### 10.1. Form Accessibility
```html
<form aria-label="Đăng nhập">
  <label for="email">Email</label>
  <input 
    id="email" 
    type="email" 
    aria-required="true"
    aria-invalid="false"
    aria-describedby="email-error"
  />
  <span id="email-error" role="alert"></span>
</form>
```

### 10.2. Keyboard Navigation
| Key | Action |
|-----|--------|
| `Tab` | Navigate between fields |
| `Enter` | Submit form |
| `Space` | Toggle checkbox |

---

## 11. SECURITY CONSIDERATIONS

- ⚠️ Rate limiting: Max 5 attempts/minute
- ⚠️ Password không log vào console/network
- ⚠️ HTTPS required
- ⚠️ CSRF token trong form

---

## 12. RELATED PAGES

**Navigation flow:**
```
/login (This page)
  ├─→ /dashboard           (Login success)
  ├─→ /forgot-password     (Click "Quên mật khẩu?")
  └─→ /register            (Nếu có link)
```

---

## 13. CHANGELOG

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | AI Agent | Initial documentation |

---

**END OF DOCUMENTATION**
