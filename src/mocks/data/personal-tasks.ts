export interface PersonalTask {
    id: string;
    user_id: string;
    org_id: string;
    title: string;
    description: string | null;
    status_code: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority_code: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    due_date: string | null;
    sort_order: number;
    created_at: string;
}

export const mockPersonalTasks: PersonalTask[] = [
    {
        id: 'pt-1',
        user_id: 'user-emp',
        org_id: 'org-1',
        title: 'Học Next.js 15 & React Server Components',
        description: 'Xem tài liệu mới tại nextjs.org/docs',
        status_code: 'TODO',
        priority_code: 'HIGH',
        due_date: '2026-02-01',
        sort_order: 1,
        created_at: '2026-01-20T10:00:00Z'
    },
    {
        id: 'pt-2',
        user_id: 'user-emp',
        org_id: 'org-1',
        title: 'Thiết lập cấu trúc dự án',
        description: 'Đã hoàn thành base project với Shadcn UI',
        status_code: 'DONE',
        priority_code: 'MEDIUM',
        due_date: null,
        sort_order: 1,
        created_at: '2026-01-19T09:00:00Z'
    },
    {
        id: 'pt-3',
        user_id: 'user-pm',
        org_id: 'org-1',
        title: 'Lập kế hoạch Sprint 4',
        description: 'Chuẩn bị backlog cho tuần tới',
        status_code: 'IN_PROGRESS',
        priority_code: 'URGENT',
        due_date: '2026-01-25',
        sort_order: 1,
        created_at: '2026-01-22T08:00:00Z'
    }
];
