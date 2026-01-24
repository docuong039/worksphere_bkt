export const mockRecycleBin = [
    {
        id: 'rb-1',
        entity_type: 'TASK',
        entity_id: 'task-old-1',
        entity_title: 'Nghiên cứu thị trường Thương mại điện tử',
        deleted_at: '2025-01-15T10:00:00Z',
        deleted_by: { id: 'user-pm', full_name: 'Hoàng Ngọc Sơn' },
        project: { id: 'prj-1', name: 'Hệ thống Quản trị WorkSphere 2.0' },
        days_remaining: 25,
    },
    {
        id: 'rb-2',
        entity_type: 'DOCUMENT',
        entity_id: 'doc-old-1',
        entity_title: 'Bản thảo Đặc tả Yêu cầu v1.0',
        deleted_at: '2024-12-25T09:00:00Z',
        deleted_by: { id: 'user-emp', full_name: 'Nguyễn Thị Lan Anh' },
        project: { id: 'prj-1', name: 'Hệ thống Quản trị WorkSphere 2.0' },
        days_remaining: 2,
    },
    {
        id: 'rb-3',
        entity_type: 'PROJECT',
        entity_id: 'prj-old-1',
        entity_title: 'Dự án Cũ - Bảo trì 2024',
        deleted_at: '2025-01-05T08:00:00Z',
        deleted_by: { id: 'user-orgadmin', full_name: 'Đỗ Minh Hoàng' },
        project: null,
        days_remaining: 15,
    },
    {
        id: 'rb-4',
        entity_type: 'USER',
        entity_id: 'user-old-1',
        entity_title: 'Lê Văn Tài (Dev)',
        deleted_at: '2025-01-20T11:00:00Z',
        deleted_by: { id: 'user-orgadmin', full_name: 'Đỗ Minh Hoàng' },
        project: null,
        days_remaining: 28,
        details: 'Email: tai.le@example.com'
    },
    {
        id: 'rb-5',
        entity_type: 'REPORT',
        entity_id: 'report-old-1',
        entity_title: 'Báo cáo Tuần 3 - Tháng 12',
        deleted_at: '2025-01-10T15:30:00Z',
        deleted_by: { id: 'user-emp', full_name: 'Nguyễn Thị Lan Anh' },
        project: { id: 'prj-1', name: 'Hệ thống Quản trị WorkSphere 2.0' },
        days_remaining: 10,
        details: 'Kỳ báo cáo: 15/12 - 21/12'
    }
];
