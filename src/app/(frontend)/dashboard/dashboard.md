# DASHBOARD

## 1. CƠ BẢN

**User Stories được cover:**
- **US-MNG-02-01**: Là PM, tôi muốn **xem dashboard thống kê dự án** (tiến độ, % hoàn thành)
- **US-MNG-02-02**: Là PM, tôi muốn **xem thống kê chi tiết theo nhân sự** (tỉ lệ hoàn thành, trễ hạn)
- **US-CEO-01-01**: Là CEO, tôi muốn **xem dashboard tổng hợp tất cả dự án**
- **US-SYS-02-01**: Là System Admin, tôi muốn **xem Dashboard tổng hợp toàn hệ thống**

**Nguồn:** Epic MNG-02, CEO-01, SYS-02

**Route:** `/(frontend)/dashboard`

**Quyền truy cập:**
- ✅ EMP - Dashboard cá nhân
- ✅ PM/MNG - Dashboard dự án + thống kê team
- ✅ CEO - Dashboard tổng hợp toàn công ty
- ✅ SYS_ADMIN - Dashboard toàn hệ thống
- ❌ Guest

---

## 2. PHÂN QUYỀN CHI TIẾT

### 👤 Employee (EMP)
**Nguồn:** Epic EMP-01, Lưu ý phân quyền nghiệp vụ

**Dashboard Widgets:**
- ✅ Task của tôi (theo status)
- ✅ Task sắp đến hạn
- ✅ Time logged hôm nay/tuần này
- ❌ Thống kê team/tài chính

### 👔 Manager (PM/MNG)
**Nguồn:** Section 3.2.2 Database Design

**Dashboard Widgets:**
- ✅ Tổng quan các dự án quản lý
- ✅ Tiến độ theo % hoàn thành
- ✅ Thống kê task theo nhân sự
- ✅ Task trễ hạn trong team

### 👨‍💼 CEO
**Nguồn:** Epic CEO-01-01

**Dashboard Widgets:**
- ✅ Tổng quan tất cả dự án
- ✅ Chi phí dự án tổng hợp
- ✅ Báo cáo chưa đọc

### 🔧 System Admin
**Nguồn:** Epic SYS-02-01

**Dashboard Widgets:**
- ✅ Tổng số Organizations
- ✅ Tổng số Users active

---

## 3. DỮ LIỆU

### 3.1. Database Tables

**Nguồn:** Section 3.2.4 (`tasks`), 3.3.2 (`time_logs`), 3.2.1 (`projects`)

| Table | Dùng cho |
|-------|----------|
| tasks | Count, status stats, overdue |
| time_logs | Total minutes logged |
| projects | Project overview |

### 3.2. API Endpoint

**GET /api/dashboard**

```typescript
interface DashboardResponse {
  // EMP
  my_tasks: { total: number; by_status: object };
  time_logged: { today_minutes: number; week_minutes: number };
  
  // PM
  projects_overview?: object[];
  team_stats?: object[];
  
  // CEO
  org_overview?: object;
  cost_summary?: object;
}
```

---

## 4. GIAO DIỆN

### 4.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  📊 Dashboard                                    │
│             │                                                   │
│             │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│             │  │ 📋 12 Tasks │ │ ⏱️ 4h 30m   │ │ ✅ 85%      │  │
│             │  └─────────────┘ └─────────────┘ └─────────────┘  │
│             │                                                   │
│             │  ┌──────────────────────────────────────────────┐ │
│             │  │ Tasks by Status                              │ │
│             │  │  TODO ████████░░░  5                         │ │
│             │  │  DONE ██████████░  4                         │ │
│             │  └──────────────────────────────────────────────┘ │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

---

## 5. COMPONENTS

- **StatsCard** - Thẻ thống kê
- **RecentActivity** - Activity gần đây
- **ProjectProgressCard** - Tiến độ dự án

---

## 6. STATES

- **Loading** - Skeleton cards
- **Error** - Retry button
- **Empty** - "Chưa có dữ liệu"

---

## 7. RELATED PAGES

```
/dashboard → /tasks, /projects/[id], /reports
```

---

**END OF DOCUMENTATION**
