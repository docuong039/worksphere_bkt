# AUTH LAYOUT

## 1. CƠ BẢN

**User Stories được cover:**
- **US-EMP-00-01**: Là người dùng, tôi muốn **đăng nhập** bằng email và mật khẩu, để truy cập vào hệ thống làm việc.
- **US-EMP-00-02**: Là người dùng, tôi muốn **đăng xuất** khỏi hệ thống, để bảo vệ tài khoản khi không sử dụng.
- **US-EMP-00-03**: Là người dùng, tôi muốn **yêu cầu khôi phục mật khẩu** qua email khi quên, để có thể lấy lại quyền truy cập tài khoản một cách tự phục vụ.

**Nguồn:** Epic EMP-00 (Xác thực & Truy cập)

**Mục đích:** Layout wrapper cho các trang public authentication (login, register, forgot-password)

**Quyền truy cập:**
- ✅ Guest (chưa đăng nhập)
- ❌ Authenticated users → Redirect về Dashboard

---

## 2. LAYOUT STRUCTURE

### 2.1. Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│   │                         │  │                             │  │
│   │     BRANDING PANEL      │  │      AUTH FORM PANEL        │  │
│   │                         │  │                             │  │
│   │   [Logo]                │  │   [Form Content - Slot]     │  │
│   │   WorkSphere            │  │                             │  │
│   │                         │  │   Rendered by child page:   │  │
│   │   "Quản lý công việc    │  │   - Login form              │  │
│   │    hiệu quả"            │  │   - Register form           │  │
│   │                         │  │   - Forgot password form    │  │
│   │   [Illustration/        │  │                             │  │
│   │    Background Image]    │  │                             │  │
│   │                         │  │                             │  │
│   └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Mobile Layout

```
┌──────────────────────────┐
│      [Logo]              │
│      WorkSphere          │
├──────────────────────────┤
│                          │
│   [Auth Form - Slot]     │
│                          │
│   Full width form        │
│   rendered by child      │
│                          │
└──────────────────────────┘
```

---

## 3. DỮ LIỆU CHI TIẾT

### 3.1. Props Interface

```typescript
interface AuthLayoutProps {
  children: React.ReactNode;  // Form content từ page con
}
```

### 3.2. Layout Elements

| Element | Mô tả | Responsive |
|---------|-------|------------|
| Logo | Logo của hệ thống WorkSphere | Luôn hiển thị |
| App Name | "WorkSphere" | Luôn hiển thị |
| Tagline | "Quản lý công việc hiệu quả" | Ẩn trên mobile |
| Branding Panel | Panel bên trái với background | Ẩn trên mobile |
| Form Panel | Khu vực chứa form (children slot) | Full width trên mobile |

---

## 4. BUSINESS RULES

### Rule 1: Redirect Authenticated Users
**Nguồn:** Logic nghiệp vụ cơ bản - Authentication flow

> User đã đăng nhập không cần truy cập các trang auth

**Implementation:**
- Check session/token khi mount
- Nếu đã authenticated → `redirect('/dashboard')`

---

## 5. STATES

### 5.1. Guest State (Default)
- Hiển thị layout bình thường
- Cho phép render form trong slot

### 5.2. Authenticated State
- Redirect về Dashboard
- Không render layout

---

## 6. DESIGN SPECIFICATIONS

### 6.1. Layout Measurements

```
Desktop (1024px+):
├─ Container: max-width 1440px, centered
├─ Branding Panel: 50% width
├─ Form Panel: 50% width
│  └─ Form container: max-width 400px, centered

Tablet (640px - 1024px):
├─ Branding Panel: 40% width
├─ Form Panel: 60% width

Mobile (< 640px):
├─ Branding Panel: hidden
├─ Form Panel: 100% width
│  └─ Padding: 16px
```

### 6.2. Design Tokens

```typescript
const authLayoutTokens = {
  brandingPanel: {
    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    textColor: '#FFFFFF',
  },
  formPanel: {
    background: '#FFFFFF',
    padding: {
      desktop: '48px',
      mobile: '16px',
    },
  },
};
```

---

## 7. ACCESSIBILITY (A11Y)

- Semantic HTML: `<main>` cho form panel
- Skip link tới form chính
- Logo có `alt` text mô tả
- Đảm bảo contrast ratio >= 4.5:1

---

## 8. RELATED PAGES

Các page sử dụng Auth Layout:
- `/login` → Login form
- `/register` → Register form  
- `/forgot-password` → Forgot password form

---

## 9. CHANGELOG

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | AI Agent | Initial documentation |

---

**END OF DOCUMENTATION**
