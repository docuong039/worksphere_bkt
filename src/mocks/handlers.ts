import { http, HttpResponse } from 'msw';
import { mockUsers, mockUserRoles, mockOrgMemberships } from './data/users';
import { mockProjects } from './data/projects';
import { mockTasks, mockSubtasks } from './data/tasks';
import { mockActivities } from './data/activity';
import { mockNotifications } from './data/notifications';
import { mockReports, mockReportComments } from './data/reports';
import { mockTimeLogs } from './data/timelogs';
import { mockCompensations, mockJobLevels } from './data/hr';
import { mockOrganizations } from './data/organizations';
import { mockRecycleBin } from './data/recycle-bin';


export const handlers = [
    // Auth Handlers
    http.post('/api/auth/login', async ({ request }) => {
        const { email } = await request.json() as any;
        const user = mockUsers.find(u => u.email === email);

        if (!user) {
            return HttpResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const role = mockUserRoles.find(r => r.user_id === user.id);

        return HttpResponse.json({
            success: true,
            user: {
                ...user,
                role: role?.role_code || 'EMPLOYEE',
                org_id: role?.org_id
            },
            token: 'mock-jwt-token-for-' + user.id
        });
    }),

    // User Profile Handlers
    http.get('/api/users/me', ({ request }) => {
        const userId = request.headers.get('x-user-id') || 'user-emp';
        const user = mockUsers.find(u => u.id === userId);
        const userRole = mockUserRoles.find(r => r.user_id === userId);

        if (!user) {
            return HttpResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return HttpResponse.json({
            success: true,
            data: {
                ...user,
                avatar_url: null,
                roles: [userRole?.role_code || 'EMPLOYEE'],
                profile: {
                    phone: '0987654321',
                    address: 'Tầng 12, Tòa nhà Keangnam, Mễ Trì, Hà Nội',
                    birth_date: '1995-05-15',
                    department: 'Phát triển Sản phẩm',
                    job_title: 'Chuyên viên cao cấp',
                    joined_at: user.created_at
                }
            }
        });
    }),

    http.put('/api/users/me', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: body
        });
    }),

    http.put('/api/users/me/password', async ({ request }) => {
        const body = await request.json() as any;
        const { current_password, new_password } = body;

        if (current_password === 'wrong') {
            return HttpResponse.json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            }, { status: 400 });
        }

        return HttpResponse.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    }),

    // Dashboard Handlers (Mô phỏng data theo Role)
    http.get('/api/dashboard', ({ request }) => {
        const role = request.headers.get('x-user-role') || request.headers.get('x-mock-role');

        let stats = [
            { label: 'Tổng công việc', value: 12, change: 8, icon: 'CheckCircle2' },
            { label: 'Dự án đang chạy', value: 3, change: 0, icon: 'Briefcase' },
            { label: 'Giờ làm hôm nay', value: '5.5h', change: 15, icon: 'Clock' },
            { label: 'Thông báo mới', value: 4, change: -2, icon: 'Bell' },
        ];

        if (role === 'CEO' || role === 'ORG_ADMIN') {
            stats[0] = { label: 'Tổng nhân sự', value: mockUsers.length, change: 2, icon: 'Users' };
            stats[2] = { label: 'Chi phí tháng này', value: '1.2B', change: 5, icon: 'TrendingUp' };
        }

        return HttpResponse.json({
            success: true,
            stats,
            recentActivities: mockActivities.slice(0, 5)
        });
    }),

    // Project Handlers
    http.get('/api/projects', ({ request }) => {
        const orgId = request.headers.get('x-org-id') || 'org-1';
        const filteredProjects = mockProjects.filter(p => p.org_id === orgId);

        return HttpResponse.json({
            success: true,
            data: filteredProjects
        });
    }),

    http.get('/api/tasks', ({ request }) => {
        const url = new URL(request.url);
        const role = request.headers.get('x-user-role');
        const userId = request.headers.get('x-user-id');
        const status = url.searchParams.get('status');
        const priority = url.searchParams.get('priority');
        const search = url.searchParams.get('search');

        let filteredTasks = [...mockTasks];

        // Role-based scoping (Scoping Logic)
        if (role === 'EMPLOYEE') {
            filteredTasks = filteredTasks.filter(t =>
                t.assignees.some(a => a.id === userId) || t.created_by === userId
            );
        }

        // Filters
        if (status && status !== 'ALL') {
            filteredTasks = filteredTasks.filter(t => t.status_code === status);
        }
        if (priority && priority !== 'ALL') {
            filteredTasks = filteredTasks.filter(t => t.priority_code === priority);
        }
        if (search) {
            filteredTasks = filteredTasks.filter(t =>
                t.title.toLowerCase().includes(search.toLowerCase())
            );
        }

        return HttpResponse.json({
            success: true,
            data: filteredTasks.map(t => ({
                ...t,
                status: t.status_code,
                priority: t.priority_code,
                project: { id: t.project_id, name: 'Hệ thống Quản trị WorkSphere 2.0', code: 'WS001' },
                subtasks_count: mockSubtasks.filter(s => s.task_id === t.id).length,
                subtasks_done: mockSubtasks.filter(s => s.task_id === t.id && s.status_code === 'DONE').length
            }))
        });
    }),

    http.get('/api/projects/overview/:id', ({ params }) => {
        const project = mockProjects.find(p => p.id === params.id);
        return HttpResponse.json({
            success: true,
            data: {
                ...project,
                stats: {
                    total_tasks: 25,
                    completed_tasks: 15,
                    completion_rate: 60,
                    overdue_tasks: 3,
                    total_hours_logged: 120.5,
                    by_status: [
                        { status: 'TODO', count: 5 },
                        { status: 'IN_PROGRESS', count: 5 },
                        { status: 'DONE', count: 15 },
                        { status: 'BLOCKED', count: 0 }
                    ],
                    by_member: [
                        { name: 'John Doe', total: 10, done: 6, overdue: 1 },
                        { name: 'Alice Smith', total: 15, done: 9, overdue: 2 }
                    ]
                },
                members: [
                    { user_id: 'user-pm', full_name: 'Hoàng Ngọc Sơn', role: 'PROJECT_MANAGER' },
                    { user_id: 'user-emp', full_name: 'Nguyễn Thị Lan Anh', role: 'EMPLOYEE' }
                ],
                resources: [
                    { id: 'r1', name: 'Tài liệu thiết kế', type: 'GFX', url: '#' },
                    { id: 'r2', name: 'Đặc tả API', type: 'DOC', url: '#' }
                ],
                custom_fields: []
            }
        });
    }),

    http.post('/api/projects', async ({ request }) => {
        const body = await request.json() as any;
        const newProject = {
            id: Math.random().toString(36).slice(2, 11),
            ...body,
            status: 'ACTIVE',
            member_count: body.members?.length || 0,
            task_count: 0,
            completion_rate: 0,
            created_at: new Date().toISOString()
        };

        // In a real mock, we would push to mockProjects, but since it's an import, 
        // we just return success for the UI to Proceed.
        return HttpResponse.json({
            success: true,
            data: newProject
        }, { status: 201 });
    }),

    http.post('/api/projects/:id/members', async ({ params, request }) => {
        const { user_ids } = await request.json() as any;
        return HttpResponse.json({ success: true, message: `Added ${user_ids.length} members` });
    }),

    http.delete('/api/projects/:id/members/:userId', ({ params }) => {
        return HttpResponse.json({ success: true, message: `Removed user ${params.userId}` });
    }),

    http.get('/api/projects/:id/locks', ({ params }) => {
        return HttpResponse.json({
            success: true,
            projectName: 'Hệ thống Quản trị WorkSphere 2.0',
            locks: [
                {
                    id: '1',
                    period_start: '2026-01-01',
                    period_end: '2026-01-07',
                    is_locked: true,
                    created_at: '2026-01-08T10:00:00Z',
                    created_by_name: 'Admin User'
                }
            ]
        });
    }),

    http.post('/api/projects/:id/locks', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            lock: { id: Math.random().toString(36).substr(2, 9), ...body, is_locked: true, created_at: new Date().toISOString() }
        });
    }),

    http.patch('/api/projects/:id/locks/:lockId', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, is_locked: body.is_locked });
    }),

    http.get('/api/projects/:id/field-permissions', () => {
        return HttpResponse.json({
            success: true,
            members: [
                { id: 'user-pm', full_name: 'Hoàng Ngọc Sơn', role: 'PROJECT_MANAGER' },
                { id: 'user-emp', full_name: 'Nguyễn Thị Lan Anh', role: 'EMPLOYEE' }
            ],
            fields: [
                { id: 'title', field_name: 'Tiêu đề', is_custom: false },
                { id: 'description', field_name: 'Mô tả', is_custom: false },
                { id: 'due_date', field_name: 'Ngày hết hạn', is_custom: false }
            ],
            permissions: {
                'u2': ['title', 'description']
            }
        });
    }),

    http.post('/api/projects/:id/field-permissions', async ({ request }) => {
        return HttpResponse.json({ success: true });
    }),

    http.post('/api/projects/:id/custom-fields', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: { id: Math.random().toString(36).substr(2, 9), ...body }
        });
    }),

    http.get('/api/projects/:id/bugs', () => {
        return HttpResponse.json({
            success: true,
            stats: {
                total: 25,
                open: 8,
                in_progress: 5,
                resolved: 12,
                by_severity: {
                    URGENT: 5,
                    HIGH: 8,
                    MEDIUM: 7,
                    LOW: 5
                }
            },
            bugs: [
                {
                    id: 'b1',
                    title: 'Lỗi đăng nhập với ký tự đặc biệt',
                    priority_code: 'URGENT',
                    assignee: { id: 'user-pm', full_name: 'Hoàng Ngọc Sơn' },
                    created_at: '2026-01-15T10:00:00Z',
                    status_code: 'TODO'
                },
                {
                    id: 'b2',
                    title: 'Dashboard not loading on Safari',
                    priority_code: 'HIGH',
                    assignee: { id: 'u2', full_name: 'Alice Smith' },
                    created_at: '2026-01-14T09:00:00Z',
                    status_code: 'TODO'
                }
            ]
        });
    }),

    // HR Handlers (Mô phỏng US-CEO-02-02)
    http.get('/api/hr/employees', () => {
        const employees = mockUsers.map(u => {
            const comp = mockCompensations.find(c => c.user_id === u.id);
            const level = mockJobLevels.find(l => l.id === comp?.level_id);
            return {
                ...u,
                level: level?.name || 'N/A',
                monthly_salary: comp?.monthly_salary || null,
                department: 'Phòng Kỹ thuật'
            };
        });
        return HttpResponse.json({ success: true, data: employees });
    }),

    http.get('/api/hr/project-costs', () => {
        const costs = mockProjects.map(p => ({
            project_id: p.id,
            project_name: p.name,
            project_code: p.code,
            total_hours: 120.5,
            total_cost: 45000000,
            employee_count: p.member_count
        }));
        return HttpResponse.json({ success: true, data: costs });
    }),

    http.patch('/api/hr/career-path/:userId', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: { id: params.userId, ...body }
        });
    }),

    // Task Detail Handlers
    http.get('/api/tasks/:id', ({ params }) => {
        const task = mockTasks.find(t => t.id === params.id);
        const subtasks = mockSubtasks.filter(s => s.task_id === params.id);

        if (!task) return HttpResponse.json({ error: 'Task not found' }, { status: 404 });

        return HttpResponse.json({
            ...task,
            project: { id: 'prj-1', name: 'Worksphere Platform', code: 'WSP' },
            assignees: task.assignees.map(a => ({ user: a })),
            subtasks: subtasks.map(s => ({
                ...s,
                status: s.status_code,
                creator_name: 'Nguyễn Thị Lan Anh'
            })),
            comments: [
                { id: 'c1', author_name: 'Hoàng Ngọc Sơn', content: 'Cần hoàn thành mốc này gấp nhé!', created_at: new Date().toISOString() }
            ]
        });
    }),

    http.put('/api/tasks/:id', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: { id: params.id, ...body }
        });
    }),

    http.delete('/api/tasks/:id', () => {
        return HttpResponse.json({ success: true });
    }),

    // Subtask Handlers
    http.post('/api/tasks/:id/subtasks', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: { id: Math.random().toString(36).substr(2, 9), task_id: params.id, ...body, status_code: 'TODO' }
        });
    }),

    http.put('/api/subtasks/:id', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, data: { id: params.id, ...body } });
    }),

    http.delete('/api/subtasks/:id', () => {
        return HttpResponse.json({ success: true });
    }),

    http.patch('/api/subtasks/:id/reorder', async ({ request }) => {
        return HttpResponse.json({ success: true });
    }),

    // Personal Task Handlers
    http.get('/api/personal-tasks', () => {
        return HttpResponse.json({
            success: true,
            data: {
                TODO: [
                    { id: 'pt-1', title: 'Học Next.js 15 & React Server Components', description: 'Xem tài liệu mới tại nextjs.org/docs', status_code: 'TODO', priority_code: 'HIGH', due_date: '2025-02-01' }
                ],
                IN_PROGRESS: [],
                DONE: [
                    { id: 'pt-2', title: 'Thiết lập cấu trúc dự án', description: 'Đã hoàn thành base project với Shadcn UI', status_code: 'DONE', priority_code: 'MEDIUM' }
                ]
            }
        });
    }),

    http.post('/api/personal-tasks', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, data: { id: Math.random().toString(36).substr(2, 9), ...body } });
    }),

    http.put('/api/personal-tasks/:id', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, data: { id: params.id, ...body } });
    }),

    http.delete('/api/personal-tasks/:id', () => {
        return HttpResponse.json({ success: true });
    }),

    http.patch('/api/personal-tasks/:id/reorder', async ({ request }) => {
        return HttpResponse.json({ success: true });
    }),

    // Time Log Handlers
    http.get('/api/tasks/done-for-timelog', () => {
        return HttpResponse.json({
            success: true,
            data: [
                { id: 'task-3', title: 'Fix bug Login UI', project_name: 'Worksphere Platform', type: 'TASK' },
                { id: 'sub-1', title: 'Cài đặt MSW', project_name: 'Worksphere Platform', type: 'SUBTASK', parent_task_id: 'task-1' }
            ]
        });
    }),

    http.post('/api/tasks/:id/time-logs', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: { id: Math.random().toString(36).substr(2, 9), task_id: params.id, ...body, created_at: new Date().toISOString() }
        });
    }),

    // Notifications, Reports, Time Logs ...
    http.get('/api/tasks/:id/history', () => {
        return HttpResponse.json({
            success: true,
            data: [
                { id: 'h1', actor_name: 'Nguyễn Thị Lan Anh', action: 'Đã tạo subtask', summary: 'Cài đặt MSW', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
                { id: 'h2', actor_name: 'Hoàng Ngọc Sơn', action: 'Đã thay đổi hạn chót', summary: 'Hạn chót mới: 2025-01-30', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
                { id: 'h3', actor_name: 'Nguyễn Thị Lan Anh', action: 'Đã bình luận', summary: 'Em đang xử lý task này ạ.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
            ]
        });
    }),

    http.get('/api/reports', ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search');

        let reports = [...mockReports];

        // Enrich the reports
        const enrichedReports = reports.map(r => {
            const user = mockUsers.find(u => u.id === r.submitted_by);
            const commentsCount = mockReportComments.filter(c => c.report_id === r.id).length;

            return {
                ...r,
                submitted_by: user ? { id: user.id, full_name: user.full_name } : { id: 'unknown', full_name: 'Unknown User' },
                reactions: [], // Mock reactions
                comments_count: commentsCount
            };
        });

        if (search) {
            return HttpResponse.json({
                success: true,
                data: enrichedReports.filter(r =>
                    r.title.toLowerCase().includes(search.toLowerCase()) ||
                    r.submitted_by.full_name.toLowerCase().includes(search.toLowerCase())
                )
            });
        }

        return HttpResponse.json({ success: true, data: enrichedReports });
    }),

    http.get('/api/time-logs', ({ request }) => {
        const url = new URL(request.url);
        const dateFrom = url.searchParams.get('date_from');
        const dateTo = url.searchParams.get('date_to');

        let logs = [...mockTimeLogs];

        if (dateFrom && dateTo) {
            logs = logs.filter(l => l.work_date >= dateFrom && l.work_date <= dateTo);
        }

        const enrichedLogs = logs.map(log => {
            const project = mockProjects.find(p => p.id === log.project_id);
            const task = mockTasks.find(t => t.id === log.task_id);
            const subtask = mockSubtasks.find(s => s.id === log.subtask_id);

            return {
                ...log,
                project: project ? { id: project.id, name: project.name, code: project.code } : { id: 'unknown', name: 'Unknown', code: 'UNK' },
                task: task ? { id: task.id, title: task.title } : { id: 'unknown', title: 'Unknown Task' },
                subtask: subtask ? { id: subtask.id, title: subtask.title } : null,
                is_locked: false // Simply defaulting for now
            };
        });

        return HttpResponse.json({ success: true, data: enrichedLogs });
    }),

    // Admin Users Handlers
    http.get('/api/admin/users', ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search');
        const status = url.searchParams.get('status');
        const role = url.searchParams.get('role');

        let users = mockUsers.map(u => {
            const membership = mockOrgMemberships.find(m => m.user_id === u.id);
            const userRole = mockUserRoles.find(r => r.user_id === u.id);
            return {
                ...u,
                user_status: u.status,
                member_status: membership?.member_status || 'ACTIVE',
                roles: [userRole?.role_code || 'EMPLOYEE'],
                last_login_at: u.updated_at,
                joined_at: membership?.activated_at || u.created_at
            };
        });

        if (search) {
            users = users.filter(u =>
                u.full_name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        return HttpResponse.json({ success: true, data: users });
    }),

    http.post('/api/admin/users/invite', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            invite_url: `https://worksphere.com/join?code=${Math.random().toString(36).substr(2, 8)}`,
            data: body
        });
    }),

    http.post('/api/admin/users', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, data: body });
    }),

    http.patch('/api/admin/users/:id/status', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, id: params.id, status: body.status });
    }),

    http.post('/api/admin/users/:id/reset-password', () => {
        return HttpResponse.json({ success: true, temporaryPassword: 'Worksphere@' + Math.random().toString(36).substr(2, 6) });
    }),

    // Admin Roles & Permissions
    http.get('/api/admin/roles', () => {
        const roles = [
            { id: '1', code: 'SYS_ADMIN', name: 'Quản trị hệ thống', description: 'Toàn quyền hệ thống', is_system: true, permissions: ['*'] },
            { id: '2', code: 'ORG_ADMIN', name: 'Quản trị tổ chức', description: 'Quản trị tổ chức khách hàng', is_system: true, permissions: ['org.*', 'user.*'] },
            { id: '3', code: 'CEO', name: 'Giám đốc (CEO)', description: 'Giám đốc điều hành', is_system: true, permissions: ['report.view', 'project.view'] },
            { id: '4', code: 'PROJECT_MANAGER', name: 'Quản lý dự án', description: 'Quản lý dự án (PM)', is_system: true, permissions: ['project.edit', 'task.*'] },
            { id: '5', code: 'EMPLOYEE', name: 'Nhân viên', description: 'Nhân viên phổ thông', is_system: true, permissions: ['task.view', 'time.log'] },
        ];
        return HttpResponse.json({ success: true, data: roles });
    }),

    http.get('/api/admin/permissions', () => {
        const permissions = [
            { code: 'task.view', name: 'Xem công việc', category: 'TASK' },
            { code: 'task.edit', name: 'Sửa công việc', category: 'TASK' },
            { code: 'project.view', name: 'Xem dự án', category: 'PROJECT' },
            { code: 'time.log', name: 'Ghi nhật ký', category: 'TIME' },
            { code: 'user.manage', name: 'Quản lý nhân sự', category: 'USER' },
            { code: 'org.settings', name: 'Cấu hình tổ chức', category: 'ORG' },
        ];
        return HttpResponse.json({ success: true, data: permissions });
    }),

    // Admin Organizations
    http.get('/api/admin/organizations', () => {
        const data = mockOrganizations.map(org => ({
            ...org,
            member_count: mockOrgMemberships.filter(m => m.org_id === org.id).length,
            project_count: mockProjects.filter(p => p.org_id === org.id).length
        }));
        return HttpResponse.json({ success: true, data });
    }),

    http.post('/api/admin/organizations', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, data: { ...body, id: 'new-org', status: 'ACTIVE' } });
    }),

    http.patch('/api/admin/organizations/:id/status', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, id: params.id, action: body.action });
    }),

    http.get('/api/admin/audit-logs', () => {
        const data = mockActivities.map(a => ({
            ...a,
            actor: mockUsers.find(u => u.id === a.actor_user_id),
            organization: mockOrganizations.find(o => o.id === a.org_id)
        }));
        return HttpResponse.json({ success: true, data, total: data.length });
    }),

    http.get('/api/admin/organizations/:id/users', ({ params }) => {
        const users = mockUsers.map(u => {
            const userRole = mockUserRoles.find(r => r.user_id === u.id);
            return {
                ...u,
                role: userRole?.role_code || 'EMPLOYEE'
            };
        });
        return HttpResponse.json({ success: true, data: users });
    }),

    http.post('/api/admin/impersonate', async ({ request }) => {
        return HttpResponse.json({ success: true, message: 'Impersonation started' });
    }),

    http.patch('/api/admin/workspace/settings', async ({ request }) => {
        return HttpResponse.json({ success: true });
    }),

    // Activity Handlers
    http.get('/api/activity', ({ request }) => {
        const url = new URL(request.url);
        const actorId = url.searchParams.get('actor_id');
        const projectId = url.searchParams.get('project_id');
        const activityType = url.searchParams.get('activity_type');

        let data = mockActivities.map(a => {
            const user = mockUsers.find(u => u.id === a.actor_user_id);
            const project = mockProjects.find(p => p.id === a.project_id);
            return {
                ...a,
                actor: {
                    id: user?.id || a.actor_user_id,
                    full_name: user?.full_name || 'Unknown User'
                },
                project: project ? {
                    id: project.id,
                    name: project.name,
                    code: project.code
                } : null
            };
        });

        if (actorId && actorId !== 'ALL') {
            data = data.filter(a => a.actor_user_id === actorId);
        }
        if (projectId && projectId !== 'ALL') {
            data = data.filter(a => a.project_id === projectId);
        }
        if (activityType && activityType !== 'ALL') {
            data = data.filter(a => a.activity_type === activityType);
        }

        return HttpResponse.json({ success: true, data });
    }),

    // Recycle Bin Handlers
    http.get('/api/recycle-bin', ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get('entity_type');

        let filtered = [...mockRecycleBin];
        if (type && type !== 'ALL') {
            filtered = filtered.filter(item => item.entity_type === type);
        }

        return HttpResponse.json({
            success: true,
            data: filtered
        });
    }),

    http.post('/api/recycle-bin/:id/restore', () => {
        return HttpResponse.json({ success: true });
    }),

    http.delete('/api/recycle-bin/empty', () => {
        return HttpResponse.json({ success: true });
    }),

    http.delete('/api/recycle-bin/:id', () => {
        return HttpResponse.json({ success: true });
    }),

    // Notifications Handlers
    http.get('/api/notifications', ({ request }) => {
        const url = new URL(request.url);
        const isRead = url.searchParams.get('is_read');

        let filtered = [...mockNotifications];
        if (isRead === 'false') {
            filtered = filtered.filter(n => !n.is_read);
        }

        return HttpResponse.json({
            success: true,
            data: filtered,
            unread_count: mockNotifications.filter(n => !n.is_read).length
        });
    }),

    http.put('/api/notifications/:id/read', () => {
        return HttpResponse.json({ success: true });
    }),

    http.put('/api/notifications/mark-all-read', () => {
        return HttpResponse.json({ success: true });
    }),

    // === MISSING HANDLERS (Fix JSON parse errors) ===

    // Time Logs - Delete
    http.delete('/api/time-logs/:id', () => {
        return HttpResponse.json({ success: true });
    }),

    // Reports - Get Detail
    http.get('/api/reports/:id', ({ params }) => {
        const report = mockReports.find(r => r.id === params.id);
        if (!report) {
            return HttpResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
        }
        const user = mockUsers.find(u => u.id === report.submitted_by);
        const comments = mockReportComments.filter(c => c.report_id === report.id);
        return HttpResponse.json({
            success: true,
            data: {
                ...report,
                submitted_by: user ? { id: user.id, full_name: user.full_name } : null,
                reactions: [
                    { code: 'LIKE', count: 2 },
                    { code: 'CLAP', count: 1 }
                ],
                comments: comments.map(c => ({
                    ...c,
                    author: mockUsers.find(u => u.id === c.author_user_id)
                }))
            }
        });
    }),

    // Reports - Add Reaction
    http.post('/api/reports/:id/react', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, reaction: body.reaction_code });
    }),

    // Reports - Add Comment
    http.post('/api/reports/:id/comments', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: {
                id: Math.random().toString(36).substr(2, 9),
                report_id: params.id,
                ...body,
                created_at: new Date().toISOString()
            }
        });
    }),

    // Projects - Get Members
    http.get('/api/projects/:id/members', () => {
        return HttpResponse.json({
            success: true,
            data: [
                { user_id: 'user-pm', full_name: 'Hoàng Ngọc Sơn', email: 'son.hoang@worksphere.com', role: 'PROJECT_MANAGER' },
                { user_id: 'user-emp', full_name: 'Nguyễn Thị Lan Anh', email: 'anh.lan@worksphere.com', role: 'EMPLOYEE' },
                { user_id: 'user-emp-dev1', full_name: 'Phạm Minh Thu', email: 'thu.pham@worksphere.com', role: 'EMPLOYEE' }
            ]
        });
    }),

    // Projects - Get Custom Fields
    http.get('/api/projects/:id/custom-fields', () => {
        return HttpResponse.json({
            success: true,
            data: [
                { id: 'cf1', field_name: 'Sprint', field_type: 'TEXT', is_required: false, field_options: null },
                { id: 'cf2', field_name: 'Story Points', field_type: 'NUMBER', is_required: false, field_options: null },
                { id: 'cf3', field_name: 'Environment', field_type: 'SELECT', is_required: false, field_options: ['DEV', 'STAGING', 'PRODUCTION'] }
            ]
        });
    }),

    // Projects - Get Gantt Data  
    http.get('/api/projects/:id/gantt', ({ params }) => {
        const projectTasks = mockTasks.filter(t => t.project_id === params.id || true); // for mock, return all
        return HttpResponse.json({
            success: true,
            projectName: 'Hệ thống Quản trị WorkSphere 2.0',
            data: projectTasks.slice(0, 10).map((t, index) => ({
                id: t.id,
                title: t.title,
                type: 'TASK',
                start_date: t.start_date || '2026-01-01',
                due_date: t.due_date || '2026-01-15',
                status_code: t.status_code,
                progress: t.status_code === 'DONE' ? 100 : (t.status_code === 'IN_PROGRESS' ? 50 : 0),
                assignees: t.assignees,
                sort_order: index,
                subtasks: mockSubtasks
                    .filter(s => s.task_id === t.id)
                    .slice(0, 3)
                    .map((s: any) => ({
                        id: s.id,
                        title: s.title,
                        type: 'SUBTASK',
                        start_date: s.start_date || '2025-01-02',
                        end_date: s.end_date || '2025-01-10',
                        status_code: s.status_code,
                        progress: s.status_code === 'DONE' ? 100 : 0
                    }))
            }))
        });
    }),

    // Tasks - Add Comment
    http.post('/api/tasks/:id/comments', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: {
                id: Math.random().toString(36).substr(2, 9),
                task_id: params.id,
                content: body.content,
                author_name: 'Current User',
                created_at: new Date().toISOString()
            }
        });
    }),

    // Auth - Verify Reset Token
    http.get('/api/auth/verify-reset-token', ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get('token');

        if (!token || token === 'invalid') {
            return HttpResponse.json({ valid: false, error: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 400 });
        }

        return HttpResponse.json({ valid: true, email: 'user@example.com' });
    }),

    // Auth - Reset Password
    http.post('/api/auth/reset-password', async ({ request }) => {
        const body = await request.json() as any;
        if (!body.token || !body.password) {
            return HttpResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }
        return HttpResponse.json({ success: true, message: 'Mật khẩu đã được cập nhật thành công' });
    }),

    // Workspace Settings - Get
    http.get('/api/admin/workspace/settings', () => {
        return HttpResponse.json({
            success: true,
            data: {
                name: 'Tập đoàn Công nghệ WorkSphere',
                code: 'worksphere',
                timezone: 'Asia/Ho_Chi_Minh',
                logo_url: null,
                settings: {
                    auto_lock_day: 0, // Sunday
                    auto_lock_time: '23:59'
                }
            }
        });
    }),

    // Tags - Get all
    http.get('/api/tags', () => {
        return HttpResponse.json({
            success: true,
            data: [
                { id: 'tag-1', name: 'Bug', color_code: '#ef4444' },
                { id: 'tag-2', name: 'Feature', color_code: '#22c55e' },
                { id: 'tag-3', name: 'Urgent', color_code: '#f97316' },
                { id: 'tag-4', name: 'Documentation', color_code: '#3b82f6' }
            ]
        });
    }),

    // Create Task
    http.post('/api/tasks', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: {
                id: Math.random().toString(36).substr(2, 9),
                ...body,
                status_code: 'TODO',
                created_at: new Date().toISOString()
            }
        });
    }),
];
