export const mockOrganizations = [
    {
        id: 'org-1',
        code: 'worksphere',
        name: 'Worksphere Corp',
        status: 'ACTIVE',
        timezone: 'Asia/Ho_Chi_Minh',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
    },
    {
        id: 'org-2',
        code: 'acme',
        name: 'Acme Industries',
        status: 'ACTIVE',
        timezone: 'America/New_York',
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
    }
];

export const mockOrgQuotas = [
    {
        org_id: 'org-1',
        max_users: 100,
        max_storage_mb: 10240,
        max_projects: 50,
    }
];
