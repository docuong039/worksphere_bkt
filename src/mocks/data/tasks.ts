export const mockTasks = [
    {
        id: 'task-1',
        org_id: 'org-1',
        project_id: 'prj-1',
        title: 'Thiết kế Mock Data System',
        description: 'Thiết kế và triển khai hệ thống mock data cho Frontend testing.',
        status_code: 'IN_PROGRESS',
        priority_code: 'HIGH',
        type_code: 'TASK',
        start_date: '2025-01-18',
        due_date: '2025-01-25',
        created_at: '2025-01-18T09:00:00Z',
        created_by: 'user-pm',
        updated_at: '2025-01-20T10:00:00Z',
        assignees: [
            { id: 'user-emp', full_name: 'Phạm Văn Nhân Viên' }
        ]
    },
    {
        id: 'task-2',
        org_id: 'org-1',
        project_id: 'prj-1',
        title: 'Viết tài liệu hướng dẫn sử dụng Playwright',
        description: 'Hướng dẫn QA cách viết test script với data-testid.',
        status_code: 'TODO',
        priority_code: 'MEDIUM',
        type_code: 'TASK',
        start_date: '2025-01-20',
        due_date: '2025-01-28',
        created_at: '2025-01-19T14:00:00Z',
        created_by: 'user-pm',
        updated_at: '2025-01-19T14:00:00Z',
        assignees: [
            { id: 'user-emp', full_name: 'Phạm Văn Nhân Viên' },
            { id: 'user-pm', full_name: 'Lê Văn PM' }
        ]
    },
    {
        id: 'task-3',
        org_id: 'org-1',
        project_id: 'prj-1',
        title: 'Fix bug Login UI',
        description: 'Lỗi hiển thị trên màn hình mobile.',
        status_code: 'DONE',
        priority_code: 'URGENT',
        type_code: 'BUG',
        start_date: '2025-01-15',
        due_date: '2025-01-17',
        created_at: '2025-01-15T08:00:00Z',
        created_by: 'user-pm',
        completed_at: '2025-01-17T17:00:00Z',
        updated_at: '2025-01-17T17:00:00Z',
        assignees: [
            { id: 'user-emp', full_name: 'Phạm Văn Nhân Viên' }
        ]
    }
];

export const mockSubtasks = [
    {
        id: 'sub-1',
        task_id: 'task-1',
        title: 'Cài đặt MSW',
        status_code: 'DONE',
        created_by: 'user-emp',
    },
    {
        id: 'sub-2',
        task_id: 'task-1',
        title: 'Định nghĩa Project Mock Data',
        status_code: 'IN_PROGRESS',
        created_by: 'user-emp',
    },
    {
        id: 'sub-3',
        task_id: 'task-1',
        title: 'Viết Handlers',
        status_code: 'TODO',
        created_by: 'user-emp',
    }
];
