# FRONTEND UI DOCUMENTATION INDEX

## Giới thiệu

Tài liệu này tổng hợp toàn bộ Frontend UI Documentation cho dự án WorkSphere. Tất cả nội dung được tạo dựa trên:

1. **`1. Epic - user stories.md`** - User Stories theo từng Epic
2. **`3. Database Design.md`** - Thiết kế Database

**Nguyên tắc:**
- ✅ Chỉ sử dụng thông tin từ 2 file nguồn
- ✅ Copy nguyên văn Business Rules từ user stories
- ✅ Đảm bảo mọi field hiển thị đều tồn tại trong DB schema
- ❌ Không tự sáng tác tính năng mới
- ❌ Không thêm field không có trong Database Design

---

## Cấu trúc thư mục

```
src/app/(frontend)/
├── _shared/
│   ├── layouts/
│   │   ├── auth-layout.md        ✅ Auth pages layout
│   │   └── app-layout.md         ✅ Main app layout
│   ├── components/
│   │   └── ui/
│   │       └── ui-components.md  ✅ Shared UI components
│   └── features/
│       └── sorting.md            ✅ US-EMP-01-10, US-MNG-01-14
│
├── (auth)/
│   ├── login/
│   │   └── login.md              ✅ US-EMP-00-01
│   └── forgot-password/
│       └── forgot-password.md    ✅ US-EMP-00-03
│
├── dashboard/
│   └── dashboard.md              ✅ US-MNG-02-01, US-CEO-01-01, US-SYS-02-01
│
├── tasks/
│   ├── tasks.md                  ✅ US-EMP-01-01, US-EMP-01-02
│   ├── new/
│   │   └── create-task.md        ✅ US-MNG-01-02, US-MNG-01-03
│   └── [id]/
│       └── detail.md             ✅ US-EMP-01-03 ~ US-EMP-01-09
│
├── projects/
│   ├── projects.md               ✅ US-MNG-01-01
│   └── [id]/
│       ├── overview.md           ✅ US-MNG-01-01, US-MNG-02, US-MNG-05
│       ├── gantt.md              ✅ US-MNG-09-01 ~ US-MNG-09-05
│       ├── time-locks.md         ✅ US-MNG-04-01, US-MNG-04-02
│       ├── import-export.md      ✅ US-MNG-01-12, US-MNG-01-15
│       ├── quality.md            ✅ US-MNG-01-05
│       └── settings/
│           └── field-permissions.md ✅ US-MNG-01-13
│
├── time-logs/
│   └── my-logs.md                ✅ US-EMP-02-01 ~ US-EMP-02-04
│
├── reports/
│   └── my-reports.md             ✅ US-EMP-03, US-MNG-04-03, US-CEO-03
│
├── personal-board/
│   └── board.md                  ✅ US-EMP-07-01 ~ US-EMP-07-05
│
├── activity/
│   └── activity.md               ✅ US-EMP-04, US-MNG-06, US-CEO-04
│
├── notifications/
│   └── notifications.md          ✅ US-EMP-05, US-MNG-07, US-CEO-05
│
├── recycle-bin/
│   └── recycle-bin.md            ✅ US-EMP-06, US-MNG-08, US-CEO-06
│
├── hr-management/
│   └── hr-management.md          ✅ US-MNG-03, US-CEO-01-02, US-CEO-02
│
├── admin/
│   ├── organizations/
│   │   └── admin-organizations.md ✅ US-SYS-01-01 ~ 06, US-SYS-02
│   ├── users/
│   │   └── admin-users.md        ✅ US-ORG-01, US-ORG-02
│   ├── quotas/
│   │   └── quotas.md             ✅ US-SYS-01-07
│   └── org-recycle-bin/
│       └── org-recycle-bin.md    ✅ US-ORG-04, US-SYS-03
│
└── settings/
    └── workspace.md              ✅ US-ORG-03
```

---

## Mapping User Stories → Documentation

### Epic EMP (Employee)

| User Story | Documentation | Status |
|------------|---------------|--------|
| US-EMP-00-01 | login.md | ✅ |
| US-EMP-00-02 | app-layout.md | ✅ |
| US-EMP-00-03 | forgot-password.md | ✅ |
| US-EMP-01-01 ~ 02 | tasks.md | ✅ |
| US-EMP-01-03 ~ 09 | tasks/[id]/detail.md | ✅ |
| US-EMP-01-10 | _shared/features/sorting.md | ✅ |
| US-EMP-02-01 ~ 04 | time-logs/my-logs.md | ✅ |
| US-EMP-03-01 ~ 03 | reports/my-reports.md | ✅ |
| US-EMP-04-01 ~ 02 | activity/activity.md | ✅ |
| US-EMP-05-01 ~ 04 | notifications/notifications.md | ✅ |
| US-EMP-06-01 ~ 02 | recycle-bin/recycle-bin.md | ✅ |
| US-EMP-07-01 ~ 05 | personal-board/board.md | ✅ |

### Epic MNG (Manager/PM)

| User Story | Documentation | Status |
|------------|---------------|--------|
| US-MNG-01-01 | projects.md, overview.md | ✅ |
| US-MNG-01-02 ~ 03 | tasks/new/create-task.md | ✅ |
| US-MNG-01-04 | tasks/[id]/detail.md | ✅ |
| US-MNG-01-05 | projects/[id]/quality.md | ✅ |
| US-MNG-01-06 ~ 09 | tasks/[id]/detail.md | ✅ |
| US-MNG-01-10 ~ 11 | projects/[id]/overview.md | ✅ |
| US-MNG-01-12 | projects/[id]/import-export.md | ✅ |
| US-MNG-01-13 | projects/[id]/settings/field-permissions.md | ✅ |
| US-MNG-01-14 | _shared/features/sorting.md | ✅ |
| US-MNG-01-15 | projects/[id]/import-export.md | ✅ |
| US-MNG-02-01 ~ 02 | dashboard.md | ✅ |
| US-MNG-03-01 ~ 03 | hr-management/hr-management.md | ✅ |
| US-MNG-04-01 ~ 02 | projects/[id]/time-locks.md | ✅ |
| US-MNG-04-03 | reports/my-reports.md | ✅ |
| US-MNG-05-01 ~ 04 | projects/[id]/overview.md | ✅ |
| US-MNG-06-01 ~ 02 | activity/activity.md | ✅ |
| US-MNG-07-01 ~ 03 | notifications/notifications.md | ✅ |
| US-MNG-08-01 ~ 03 | recycle-bin/recycle-bin.md | ✅ |
| US-MNG-09-01 ~ 05 | projects/[id]/gantt.md | ✅ |
| US-MNG-10-01 ~ 03 | personal-board/board.md | ✅ |

### Epic CEO

| User Story | Documentation | Status |
|------------|---------------|--------|
| US-CEO-01-01 | dashboard.md | ✅ |
| US-CEO-01-02 | hr-management/hr-management.md | ✅ |
| US-CEO-02-01 ~ 03 | hr-management/hr-management.md | ✅ |
| US-CEO-03-01 ~ 03 | reports/my-reports.md | ✅ |
| US-CEO-04-01 ~ 02 | activity/activity.md | ✅ |
| US-CEO-05-01 ~ 02 | notifications/notifications.md | ✅ |
| US-CEO-06-01 ~ 02 | recycle-bin/recycle-bin.md | ✅ |
| US-CEO-07-01 ~ 03 | personal-board/board.md | ✅ |

### Epic SYS (System Admin)

| User Story | Documentation | Status |
|------------|---------------|--------|
| US-SYS-01-01 ~ 06 | admin/organizations/admin-organizations.md | ✅ |
| US-SYS-01-07 | admin/quotas/quotas.md | ✅ |
| US-SYS-02-01 ~ 02 | admin/organizations/admin-organizations.md | ✅ |
| US-SYS-03-01 ~ 03 | admin/quotas/quotas.md | ✅ |

### Epic ORG (Org Admin)

| User Story | Documentation | Status |
|------------|---------------|--------|
| US-ORG-01-01 ~ 05 | admin/users/admin-users.md | ✅ |
| US-ORG-02-01 ~ 03 | admin/users/admin-users.md | ✅ |
| US-ORG-03-01 ~ 03 | settings/workspace.md | ✅ |
| US-ORG-04-01 ~ 03 | admin/org-recycle-bin/org-recycle-bin.md | ✅ |

---

## Mapping Database Tables → Documentation

| Table | Documentation Files |
|-------|---------------------|
| organizations | admin-organizations.md, workspace.md, quotas.md |
| org_quotas | quotas.md |
| users | login.md, admin-users.md, hr-management.md |
| user_profiles | hr-management.md |
| user_compensations | hr-management.md |
| user_documents | hr-management.md |
| org_memberships | admin-users.md, org-recycle-bin.md |
| org_invites | admin-users.md |
| projects | projects.md, overview.md, org-recycle-bin.md |
| project_members | overview.md |
| project_resources | overview.md |
| project_field_permissions | field-permissions.md |
| tasks | tasks.md, detail.md, create-task.md, import-export.md, quality.md |
| task_assignees | tasks.md, detail.md |
| task_statuses | tasks.md, ui-components.md |
| task_priorities | tasks.md, ui-components.md |
| subtasks | detail.md, sorting.md |
| task_comments | detail.md |
| task_attachments | detail.md |
| time_logs | my-logs.md, hr-management.md |
| work_period_locks | time-locks.md, my-logs.md |
| reports | my-reports.md |
| report_comments | my-reports.md |
| report_reactions | my-reports.md |
| activity_events | activity.md |
| notifications | notifications.md |
| notification_recipients | notifications.md |
| personal_tasks | board.md |
| recycle_bin_items | recycle-bin.md |
| custom_field_definitions | overview.md, import-export.md |
| custom_field_values | import-export.md |
| roles | admin-users.md |
| permissions | admin-users.md |
| impersonation_sessions | admin-organizations.md |
| audit_logs | admin-organizations.md |

---

## Quy ước Documentation

### Mỗi file .md bao gồm:

1. **CƠ BẢN** - User Stories, Route, Permissions
2. **PHÂN QUYỀN** - Chi tiết theo Role (EMP, PM, CEO, etc.)
3. **DỮ LIỆU** - Database tables, API endpoints
4. **BUSINESS RULES** - Trích dẫn từ User Stories
5. **GIAO DIỆN** - Wireframe ASCII
6. **FORM FIELDS** (nếu có)
7. **STATES** - Loading, Empty, Error
8. **INTERACTIONS** - User actions
9. **RELATED PAGES** - Navigation

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-19 | AI Agent | Initial documentation generation |
| 2026-01-19 | AI Agent | Added missing documentation: HR Management, Import/Export, Field Permissions, Quotas, Org Recycle Bin, Quality, Sorting |

---

**END OF INDEX**

