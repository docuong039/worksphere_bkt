# APP LAYOUT

## 1. CƠ BẢN

**User Stories được cover:**
- Tất cả User Stories yêu cầu xác thực (EMP, MNG, CEO, SYS, ORG)

**Nguồn:** 
- Epic EMP-00, MNG-00, CEO-00, SYS-00, ORG-00 (Xác thực & Truy cập)
- Epic EMP-05, MNG-07, CEO-05 (Thông báo)

**Mục đích:** Layout wrapper chính cho toàn bộ ứng dụng sau khi đăng nhập

**Quyền truy cập:**
- ✅ Authenticated users (EMP, PM, CEO, ORG_ADMIN, SYS_ADMIN)
- ❌ Guest → Redirect về Login

---

## 2. LAYOUT STRUCTURE

### 2.1. Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] WorkSphere              [@User ▼] [🔔 3]  [Settings]    │  ← Header
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────────────────────────────────────────┐ │
│  │          │  │                                              │ │
│  │ Sidebar  │  │              MAIN CONTENT                    │ │
│  │          │  │                                              │ │
│  │ Dashboard│  │         [Page Content - Slot]                │ │
│  │ • Tasks  │  │                                              │ │
│  │ Projects │  │         Rendered by child page               │ │
│  │ Time Logs│  │                                              │ │
│  │ Reports  │  │                                              │ │
│  │ Activity │  │                                              │ │
│  │          │  │                                              │ │
│  │ ──────── │  │                                              │ │
│  │ Settings │  │                                              │ │
│  │ Logout   │  │                                              │ │
│  │          │  │                                              │ │
│  └──────────┘  └──────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Mobile Layout

```
┌──────────────────────────┐
│ ☰  WorkSphere     🔔 3   │  ← Header (hamburger menu)
├──────────────────────────┤
│                          │
│   [Page Content - Slot]  │
│                          │
│   Full width content     │
│                          │
├──────────────────────────┤
│ 🏠  📋  📊  👤  ⚙️       │  ← Bottom Navigation
└──────────────────────────┘
```

---

## 3. DỮ LIỆU CHI TIẾT

### 3.1. Database Context (Session User)

**Nguồn:** Section 3.1.3 (`users`), Section 3.1.4 (`org_memberships`), Section 3.7 (RBAC)

```typescript
interface CurrentUser {
  id: string;                    // users.id
  email: string;                 // users.email
  full_name: string;             // users.full_name
  avatar_url: string | null;     // user_profiles.avatar_url
  
  // Org context
  current_org_id: string;        // org_memberships.org_id
  org_name: string;              // organizations.name
  
  // Role context
  roles: {
    code: string;                // roles.code (EMP, PM, CEO, ORG_ADMIN, SYS_ADMIN)
    scope_type: 'PLATFORM' | 'TENANT';
    org_id: string | null;
    project_id: string | null;
  }[];
  
  permissions: string[];         // Aggregated từ role_permissions
}
```

### 3.2. Sidebar Navigation Items

| Menu Item | Route | Icon | Roles Allowed | Nguồn |
|-----------|-------|------|---------------|-------|
| Dashboard | `/dashboard` | 🏠 | All | - |
| My Tasks | `/tasks` | 📋 | All | EMP-01 |
| Projects | `/projects` | 📁 | PM, CEO | MNG-01 |
| Time Logs | `/time-logs` | ⏱️ | All | EMP-02 |
| Reports | `/reports` | 📊 | All | EMP-03, MNG-04-03, CEO-03 |
| Personal Board | `/personal-board` | 📌 | All | EMP-07 |
| Activity | `/activity` | 📰 | All | EMP-04, MNG-06, CEO-04 |
| Recycle Bin | `/recycle-bin` | 🗑️ | All | EMP-06, MNG-08, CEO-06 |
| **Admin** | | | | |
| Organizations | `/admin/organizations` | 🏢 | SYS_ADMIN | SYS-01 |
| Users | `/admin/users` | 👥 | ORG_ADMIN | ORG-01 |
| Roles | `/admin/roles` | 🔐 | ORG_ADMIN | ORG-02 |
| Audit Logs | `/admin/audit-logs` | 📜 | SYS_ADMIN | SYS-02 |
| **Settings** | | | | |
| Profile | `/settings/profile` | 👤 | All | - |
| Workspace | `/settings/workspace` | ⚙️ | ORG_ADMIN | ORG-03 |

### 3.3. Header Elements

| Element | Mô tả | Data Source |
|---------|-------|-------------|
| Logo | Logo hệ thống | Static |
| App Name | "WorkSphere" | Static |
| User Menu | Dropdown với avatar và tên | `users.full_name`, `user_profiles.avatar_url` |
| Notification Bell | Icon với badge số lượng unread | `notification_recipients` WHERE `is_read = false` |
| Settings | Link tới settings | Static |

---

## 4. PHÂN QUYỀN HIỂN THỊ MENU

### 4.1. Bảng phân quyền Menu

**Nguồn:** So sánh quyền hạn trong `1. Epic - user stories.md`

| Menu Item | EMP | PM | CEO | ORG_ADMIN | SYS_ADMIN |
|-----------|-----|----|----|-----------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| My Tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Projects | ❌ | ✅ | ✅ | ✅ | ❌ |
| Time Logs | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | ❌ |
| Personal Board | ✅ | ✅ | ✅ | ✅ | ❌ |
| Activity | ✅ | ✅ | ✅ | ✅ | ❌ |
| Recycle Bin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Organizations | ❌ | ❌ | ❌ | ❌ | ✅ |
| Users | ❌ | ❌ | ❌ | ✅ | ✅ |
| Roles | ❌ | ❌ | ❌ | ✅ | ✅ |
| Audit Logs | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 5. BUSINESS RULES

### Rule 1: Authentication Required
**Nguồn:** Epic EMP-00-01, MNG-00-01, CEO-00-01

> Toàn bộ ứng dụng yêu cầu đăng nhập

**Implementation:**
- Check session/token khi mount
- Nếu chưa authenticated → `redirect('/login')`

### Rule 2: Role-based Menu Visibility
**Nguồn:** Section 5 trong `1. Epic - user stories.md` (So sánh quyền hạn)

> Mỗi role chỉ thấy menu items được phép

**Implementation:**
```typescript
const isMenuVisible = (menuItem: MenuItem, userRoles: string[]) => {
  return menuItem.allowedRoles.some(role => userRoles.includes(role));
};
```

### Rule 3: Org Context Isolation
**Nguồn:** Section 2.1 Database Design (Multi-tenant)

> "Mọi quan hệ FK giữa các bảng tenant đi qua composite key (org_id, id)"

**Implementation:**
- App Layout lưu `current_org_id` trong context
- Mọi API call đính kèm `org_id` header

---

## 6. STATES

### 6.1. Authenticated State (Default)
- Hiển thị Header + Sidebar + Main Content
- Load user data và notifications

### 6.2. Loading State
```
┌────────────────────────────┐
│      [Skeleton Header]     │
├─────────┬──────────────────┤
│         │                  │
│ [Skel.] │  [Skeleton]      │
│ [Skel.] │  [Content]       │
│ [Skel.] │                  │
│         │                  │
└─────────┴──────────────────┘
```

### 6.3. Error State (Session Expired)
- Hiển thị toast "Session expired. Please login again"
- Redirect về `/login`

---

## 7. GIAO DIỆN

### 7.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] WorkSphere              [@John Doe ▼] [🔔 3]  [⚙️]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────────────────────────────────────────┐ │
│  │ 🏠 Home  │  │                                              │ │
│  │ 📋 Tasks │  │                                              │ │
│  │ 📁 Proj  │  │           [Page Content Here]                │ │
│  │ ⏱️ Time  │  │                                              │ │
│  │ 📊 Rpt   │  │                                              │ │
│  │ 📌 Board │  │                                              │ │
│  │ 📰 Act   │  │                                              │ │
│  │ 🗑️ Trash │  │                                              │ │
│  │          │  │                                              │ │
│  │ ──────── │  │                                              │ │
│  │ 👤 Prof  │  │                                              │ │
│  │ 🚪 Out   │  │                                              │ │
│  └──────────┘  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. COMPONENTS USED

### Từ `_shared/components/ui/`:
- **Avatar** - User avatar trong header
- **Badge** - Notification count
- **Dropdown** - User menu
- **Tooltip** - Menu item tooltips

### Từ `_shared/components/common/`:
- **Header** - Top navigation bar
- **Sidebar** - Left navigation menu
- **UserMenu** - User dropdown component
- **NotificationBell** - Notification icon với badge

---

## 9. DESIGN SPECIFICATIONS

### 9.1. Layout Measurements

```
Desktop (1024px+):
├─ Header: height 64px, fixed
├─ Sidebar: width 240px, fixed
├─ Main Content: calc(100% - 240px)
│  ├─ Max width: 1200px
│  └─ Padding: 32px

Tablet (640px - 1024px):
├─ Header: height 56px
├─ Sidebar: 240px (collapsible drawer)
├─ Main Content: 100% when sidebar closed

Mobile (< 640px):
├─ Header: height 56px
├─ Sidebar: hidden (drawer)
├─ Main Content: 100%
├─ Bottom Nav: height 60px, fixed
└─ Content padding-bottom: 76px
```

### 9.2. Design Tokens
```typescript
const appLayoutTokens = {
  header: {
    height: { desktop: '64px', mobile: '56px' },
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    zIndex: 50,
  },
  sidebar: {
    width: '240px',
    background: '#F9FAFB',
    borderRight: '1px solid #E5E7EB',
  },
  bottomNav: {
    height: '60px',
    background: '#FFFFFF',
    borderTop: '1px solid #E5E7EB',
    zIndex: 50,
  },
};
```

---

## 10. ACCESSIBILITY (A11Y)

### 10.1. Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between menu items |
| `Enter` | Activate menu item |
| `Escape` | Close dropdown/drawer |
| `Alt + M` | Toggle sidebar (desktop) |

### 10.2. ARIA Labels
```html
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/dashboard">Dashboard</a>
    </li>
  </ul>
</nav>

<button aria-label="Notifications (3 unread)" aria-haspopup="true">
  🔔 <span aria-hidden="true">3</span>
</button>
```

---

## 11. CHANGELOG

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | AI Agent | Initial documentation |

---

**END OF DOCUMENTATION**
