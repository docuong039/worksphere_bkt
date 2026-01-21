export const mockRecycleBin = [
    {
        id: 'rb-1',
        entity_type: 'TASK',
        entity_id: 'task-old-1',
        entity_title: 'Nghiên cứu thị trường ngách',
        deleted_at: '2025-01-15T10:00:00Z',
        deleted_by: { id: 'user-pm', full_name: 'Lê Văn PM' },
        project: { id: 'prj-1', name: 'Worksphere Platform' },
        days_remaining: 25,
    },
    {
        id: 'rb-2',
        entity_type: 'DOCUMENT',
        entity_id: 'doc-old-1',
        entity_title: 'Draft Spec v1.0',
        deleted_at: '2024-12-25T09:00:00Z',
        deleted_by: { id: 'user-emp', full_name: 'Phạm Văn Nhân Viên' },
        project: { id: 'prj-1', name: 'Worksphere Platform' },
        days_remaining: 2,
    },
    {
        id: 'rb-3',
        entity_type: 'PROJECT',
        entity_id: 'prj-old-1',
        entity_title: 'Old Legacy Project',
        deleted_at: '2025-01-05T08:00:00Z',
        deleted_by: { id: 'user-orgadmin', full_name: 'Nguyễn Văn Admin' },
        project: null,
        days_remaining: 15,
    }
];
