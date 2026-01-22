export const mockProjects = [
    {
        id: 'prj-1',
        org_id: 'org-1',
        code: 'WS001',
        name: 'Phát triển Worksphere Platform',
        description: 'Dự án trọng điểm phát triển nền tảng quản trị công việc.',
        status: 'ACTIVE',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        created_at: '2025-01-01T08:00:00Z',
        created_by: 'user-orgadmin',
        member_count: 6,
        task_count: 8,
    },
    {
        id: 'prj-2',
        org_id: 'org-1',
        code: 'MKTG-01',
        name: 'Chiến dịch Marketing Q1',
        description: 'Chiến dịch quảng bá thương hiệu quý 1.',
        status: 'ACTIVE',
        start_date: '2025-02-01',
        end_date: '2025-04-30',
        created_at: '2025-01-15T10:00:00Z',
        created_by: 'user-pm',
        member_count: 3,
        task_count: 2,
    },
    {
        id: 'prj-3',
        org_id: 'org-1',
        code: 'INTERNAL-01',
        name: 'Đào tạo nội bộ',
        description: 'Chương trình đào tạo kỹ năng cho nhân viên.',
        status: 'ARCHIVED',
        start_date: '2024-11-01',
        end_date: '2024-12-31',
        created_at: '2024-10-01T08:00:00Z',
        created_by: 'user-orgadmin',
        member_count: 10,
        task_count: 15,
    },
    {
        id: 'prj-4',
        org_id: 'org-1',
        code: 'PRJ-BETA',
        name: 'Project Beta App',
        description: 'Phát triển ứng dụng mobile cho khách hàng Beta.',
        status: 'ACTIVE',
        start_date: '2025-02-15',
        end_date: '2025-08-30',
        created_at: '2025-01-20T08:00:00Z',
        created_by: 'user-pm-2',
        member_count: 4,
        task_count: 0,
    }
];

export const mockProjectMembers = [
    // Project 1 (Managed by user-pm)
    { project_id: 'prj-1', user_id: 'user-pm', member_role: 'PM' },
    { project_id: 'prj-1', user_id: 'user-emp', member_role: 'MEMBER' },
    { project_id: 'prj-1', user_id: 'user-emp-dev1', member_role: 'MEMBER' },
    { project_id: 'prj-1', user_id: 'user-emp-dev2', member_role: 'MEMBER' },
    { project_id: 'prj-1', user_id: 'user-emp-qa', member_role: 'MEMBER' },
    { project_id: 'prj-1', user_id: 'user-ceo', member_role: 'VIEWER' },

    // Project 2 (Managed by user-pm)
    { project_id: 'prj-2', user_id: 'user-pm', member_role: 'PM' },
    { project_id: 'prj-2', user_id: 'user-emp', member_role: 'MEMBER' },
    { project_id: 'prj-2', user_id: 'user-emp-designer', member_role: 'MEMBER' },

    // Project 4 (Managed by user-pm-2)
    { project_id: 'prj-4', user_id: 'user-pm-2', member_role: 'PM' },
    { project_id: 'prj-4', user_id: 'user-emp-dev1', member_role: 'MEMBER' }, // Shared resource
    { project_id: 'prj-4', user_id: 'user-emp-qa', member_role: 'MEMBER' }, // Shared resource
    { project_id: 'prj-4', user_id: 'user-ceo', member_role: 'VIEWER' },
];
