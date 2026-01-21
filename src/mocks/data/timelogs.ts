export const mockTimeLogs = [
    {
        id: 'tl-1',
        org_id: 'org-1',
        project_id: 'prj-1',
        task_id: 'task-1',
        subtask_id: 'sub-1',
        owner_user_id: 'user-emp',
        work_date: '2025-01-19',
        minutes: 120,
        note: 'Cấu hình MSW base.',
        status: 'APPROVED',
    },
    {
        id: 'tl-2',
        org_id: 'org-1',
        project_id: 'prj-1',
        task_id: 'task-1',
        subtask_id: 'sub-2',
        owner_user_id: 'user-emp',
        work_date: '2025-01-20',
        minutes: 180,
        note: 'Viết mock data cho 5 thực thể chính.',
        status: 'PENDING',
    }
];

export const mockWorkPeriodLocks = [
    {
        id: 'lock-1',
        org_id: 'org-1',
        project_id: 'prj-1',
        period_type: 'WEEK',
        period_start: '2025-01-01',
        period_end: '2025-01-07',
        is_locked: true,
        locked_at: '2025-01-08T09:00:00Z',
        locked_by: 'user-pm',
    }
];
