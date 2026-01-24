export const mockActivities = [
    // --- Ngày 24/01/2026 (Hôm nay) ---
    {
        id: 'act-101',
        org_id: 'org-1',
        project_id: 'prj-1',
        actor_user_id: 'user-emp',
        activity_date: '2026-01-24',
        occurred_at: '2026-01-24T10:15:00Z',
        activity_type: 'SUBTASK_DONE',
        entity_type: 'SUBTASK',
        entity_id: 'task-1',
        summary: 'Bạn đã hoàn thành đầu việc: "Thiết kế API Login"',
        metadata: { subtask_name: 'Thiết kế API Login' }
    },
    {
        id: 'act-102',
        org_id: 'org-1',
        project_id: 'prj-1',
        actor_user_id: 'user-emp',
        activity_date: '2026-01-24',
        occurred_at: '2026-01-24T14:30:00Z',
        activity_type: 'LOG_TIME',
        entity_type: 'TASK',
        entity_id: 'task-1',
        summary: 'Ghi nhận 120 phút làm việc: "Code logic xác thực người dùng"',
        metadata: { minutes: 120, task_title: 'Code logic xác thực người dùng' }
    },
    {
        id: 'act-103',
        org_id: 'org-1',
        project_id: 'prj-2',
        actor_user_id: 'user-emp',
        activity_date: '2026-01-24',
        occurred_at: '2026-01-24T16:45:00Z',
        activity_type: 'COMMENT',
        entity_type: 'TASK',
        entity_id: 'task-2',
        summary: 'Bạn đã để lại bình luận tại task "Sửa lỗi UI": "Đã fix xong, nhờ PM check lại"',
        metadata: { comment: 'Đã fix xong, nhờ PM check lại' }
    },

    // --- Ngày 23/01/2026 ---
    {
        id: 'act-104',
        org_id: 'org-1',
        project_id: 'prj-1',
        actor_user_id: 'user-emp',
        activity_date: '2026-01-23',
        occurred_at: '2026-01-23T09:00:00Z',
        activity_type: 'REPORT_SUBMITTED',
        entity_type: 'REPORT',
        entity_id: 'rep-1',
        summary: 'Bạn đã nộp báo cáo tuần: "Báo cáo tiến độ Sprint 3"',
        metadata: { report_title: 'Báo cáo tiến độ Sprint 3' }
    },

    // --- Hoạt động của PM (Để test isolation) ---
    {
        id: 'act-201',
        org_id: 'org-1',
        project_id: 'prj-1',
        actor_user_id: 'user-pm',
        activity_date: '2026-01-24',
        occurred_at: '2026-01-24T08:30:00Z',
        activity_type: 'TASK_CREATE',
        entity_type: 'TASK',
        entity_id: 'task-3',
        summary: 'Hoàng Ngọc Sơn đã tạo công việc mới: "Kiểm thử hệ thống"',
        metadata: { priority: 'HIGH' }
    }
];
