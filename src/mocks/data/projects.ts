export const mockProjects = [
    {
        id: 'prj-1',
        org_id: 'org-1',
        code: 'WS001',
        name: 'Hệ thống Quản trị WorkSphere 2.0',
        description: 'Dự án trọng điểm phát triển nền tảng quản trị công việc thế hệ mới.',
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
        code: 'MKTG-2025',
        name: 'Chiến dịch Thương hiệu Tết 2025',
        description: 'Chiến dịch quảng bá thương hiệu tích hợp cho dịp Tết Nguyên Đán.',
        status: 'ACTIVE',
        start_date: '2025-01-15',
        end_date: '2025-02-15',
        created_at: '2025-01-15T10:00:00Z',
        created_by: 'user-pm',
        member_count: 3,
        task_count: 2,
    },
    {
        id: 'prj-3',
        org_id: 'org-1',
        code: 'HR-TRAIN',
        name: 'Đào tạo Chuyển đổi số',
        description: 'Chương trình đào tạo kỹ năng số cho toàn bộ cán bộ nhân viên.',
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
        code: 'Vingroup-App',
        name: 'Ứng dụng Di động VinGroup',
        description: 'Phát triển ứng dụng Mobile tích hợp cho hệ sinh thái VinGroup.',
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
