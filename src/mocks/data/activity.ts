export const mockActivities = [
    {
        id: 'act-1',
        org_id: 'org-1',
        project_id: 'prj-1',
        actor_user_id: 'user-emp',
        activity_date: '2025-01-20',
        occurred_at: '2025-01-20T10:00:00Z',
        activity_type: 'TASK_UPDATE',
        entity_type: 'TASK',
        entity_id: 'task-1',
        summary: 'Nguyễn Thị Lan Anh đã cập nhật trạng thái công việc "Thiết kế Hệ thống Mock Data"',
        metadata: { status: 'IN_PROGRESS' }
    },
    {
        id: 'act-2',
        org_id: 'org-1',
        project_id: 'prj-1',
        actor_user_id: 'user-pm',
        activity_date: '2025-01-19',
        occurred_at: '2025-01-19T14:00:00Z',
        activity_type: 'TASK_CREATE',
        entity_type: 'TASK',
        entity_id: 'task-2',
        summary: 'Hoàng Ngọc Sơn đã tạo công việc mới "Tài liệu hướng dẫn Kiểm thử Tự động"',
        metadata: { priority: 'MEDIUM' }
    }
];
