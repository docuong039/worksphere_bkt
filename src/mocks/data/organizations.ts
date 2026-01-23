export const mockOrganizations = [
    {
        id: 'org-1',
        code: 'worksphere',
        name: 'Tập đoàn Công nghệ WorkSphere',
        status: 'ACTIVE',
        timezone: 'Asia/Ho_Chi_Minh',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
    },
    {
        id: 'org-2',
        code: 'fpt-corp',
        name: 'Công ty Cổ phần FPT',
        status: 'ACTIVE',
        timezone: 'Asia/Ho_Chi_Minh',
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
    },
    {
        id: 'org-3',
        code: 'vin-global',
        name: 'Tập đoàn Vingroup',
        status: 'PENDING',
        timezone: 'Asia/Ho_Chi_Minh',
        created_at: '2025-01-10T00:00:00Z',
        updated_at: '2025-01-10T00:00:00Z',
    }
];

export const mockOrgQuotas = [
    {
        org_id: 'org-1',
        max_users: 500,
        max_storage_mb: 102400,
        max_projects: 200,
    }
];
