export const mockTasks = [
    {
        id: 'task-1',
        org_id: 'org-1',
        project_id: 'prj-1',
        title: 'Thiết kế Hệ thống Mock Data',
        description: 'Thiết kế và triển khai hệ thống dữ liệu giả lập cho kiểm thử Frontend.',
        status_code: 'IN_PROGRESS',
        priority_code: 'HIGH',
        type_code: 'TASK',
        start_date: '2025-01-18',
        due_date: '2025-01-25',
        created_at: '2025-01-18T09:00:00Z',
        created_by: 'user-pm',
        updated_at: '2025-01-20T10:00:00Z',
        assignees: [
            { id: 'user-emp-dev1', full_name: 'Phạm Minh Thu' },
            { id: 'user-emp', full_name: 'Nguyễn Thị Lan Anh' }
        ]
    },
    {
        id: 'task-2',
        org_id: 'org-1',
        project_id: 'prj-1',
        title: 'Tài liệu hướng dẫn Kiểm thử Tự động',
        description: 'Hướng dẫn đội QA cách viết kịch bản kiểm thử với Playwright và định danh phần tử.',
        status_code: 'TODO',
        priority_code: 'MEDIUM',
        type_code: 'TASK',
        start_date: '2025-01-20',
        due_date: '2025-01-28',
        created_at: '2025-01-19T14:00:00Z',
        created_by: 'user-pm',
        updated_at: '2025-01-19T14:00:00Z',
        assignees: [
            { id: 'user-emp-qa', full_name: 'Trần Quang Vinh' }
        ]
    },
    {
        id: 'task-3',
        org_id: 'org-1',
        project_id: 'prj-1',
        title: 'Sửa lỗi giao diện Đăng nhập',
        description: 'Khắc phục lỗi hiển thị không căn giữa trên các thiết bị iPhone đời cũ.',
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
            { id: 'user-emp-dev1', full_name: 'Phạm Minh Thu' },
            { id: 'user-emp-dev2', full_name: 'Vũ Thành Đạt' }
        ]
    },
    {
        id: 'task-4',
        org_id: 'org-1',
        project_id: 'prj-2',
        title: 'Thiết kế Bộ nhận diện Tết 2025',
        description: 'Thiết kế KV, Banner, Standee cho chiến dịch Tết Nguyên Đán sắp tới.',
        status_code: 'IN_PROGRESS',
        priority_code: 'HIGH',
        type_code: 'TASK',
        start_date: '2025-01-15',
        due_date: '2025-01-30',
        created_at: '2025-01-22T08:00:00Z',
        created_by: 'user-pm',
        updated_at: '2025-01-22T08:00:00Z',
        assignees: [
            { id: 'user-emp-designer', full_name: 'Lê Thảo My' }
        ]
    },
    {
        id: 'task-5',
        org_id: 'org-1',
        project_id: 'prj-4',
        title: 'Thiết lập Cấu trúc Dự án Mobile',
        description: 'Khởi tạo mã nguồn cơ sở (boilerplate) và cấu hình môi trường cho ứng dụng React Native.',
        status_code: 'TODO',
        priority_code: 'CRITICAL',
        type_code: 'TASK',
        start_date: '2025-02-15',
        due_date: '2025-02-16',
        created_at: '2025-01-22T09:00:00Z',
        created_by: 'user-pm-2',
        updated_at: '2025-01-22T09:00:00Z',
        assignees: [
            { id: 'user-emp-dev1', full_name: 'Phạm Minh Thu' }
        ]
    }
];

export const mockSubtasks = [
    {
        id: 'sub-1',
        task_id: 'task-1',
        title: 'Cài đặt thư viện MSW',
        status_code: 'DONE',
        created_by: 'user-emp-dev1',
    },
    {
        id: 'sub-2',
        task_id: 'task-1',
        title: 'Định nghĩa dữ liệu Dự án mẫu',
        status_code: 'IN_PROGRESS',
        created_by: 'user-emp-dev1',
    },
    {
        id: 'sub-3',
        task_id: 'task-1',
        title: 'Viết các bộ xử lý API (Handlers)',
        status_code: 'TODO',
        created_by: 'user-emp',
    },
    {
        id: 'sub-4',
        task_id: 'task-4',
        title: 'Phác thảo ý tưởng Key Visual',
        status_code: 'DONE',
        created_by: 'user-emp-designer',
    }
];
