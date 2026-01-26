import { http, HttpResponse } from 'msw';
import { mockUsers, mockUserRoles, mockOrgMemberships } from './data/users';
import { mockProjects, mockProjectMembers } from './data/projects';
import { mockTasks, mockSubtasks } from './data/tasks';
import { mockActivities } from './data/activity';
import { mockNotifications } from './data/notifications';
import { mockReports, mockReportComments } from './data/reports';
import { mockTimeLogs } from './data/timelogs';
import { mockCompensations, mockJobLevels, mockDocuments } from './data/hr';
import { mockOrganizations } from './data/organizations';
import { mockRecycleBin } from './data/recycle-bin';
import { mockPersonalTasks } from './data/personal-tasks';
import { ROLE_PERMISSIONS, AppRole } from '@/lib/permissions';


export const handlers = [
    // Public Register Org
    http.post('/api/public/register-org', async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, message: 'Registration request submitted', data: body });
    }),

    // Auth Handlers
    http.post('/api/auth/login', async ({ request }) => {
        const { email } = await request.json() as any;
        const user = mockUsers.find(u => u.email === email);

        if (!user) {
            return HttpResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const roleEntry = mockUserRoles.find(r => r.user_id === user.id);
        const role_code = (roleEntry?.role_code || 'EMPLOYEE') as AppRole;

        return HttpResponse.json({
            success: true,
            user: {
                ...user,
                role: role_code,
                org_id: roleEntry?.org_id,
                permissions: ROLE_PERMISSIONS[role_code] || []
            },
            token: 'mock-jwt-token-for-' + user.id
        });
    }),

    // User Profile Handlers
    http.get('/api/users/me', ({ request }) => {
        const userId = request.headers.get('x-user-id') || 'user-emp';
        const user = mockUsers.find(u => u.id === userId);
        const roleEntry = mockUserRoles.find(r => r.user_id === userId);
        const role_code = (roleEntry?.role_code || 'EMPLOYEE') as AppRole;

        if (!user) {
            return HttpResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return HttpResponse.json({
            success: true,
            data: {
                ...user,
                avatar_url: null,
                role: role_code,
                permissions: ROLE_PERMISSIONS[role_code] || [],
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
        const role = request.headers.get('x-user-role');

        if (role === 'EMPLOYEE') {
            return HttpResponse.json({
                success: false,
                message: 'Nhân viên không được phép đổi mật khẩu chủ động'
            }, { status: 403 });
        }

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
        const filteredProjects = mockProjects.filter(p => p.org_id === orgId).map(p => ({
            ...p,
            completion_rate: p.id === 'prj-1' ? 65 : (p.id === 'prj-2' ? 25 : 0),
            overdue_count: p.id === 'prj-2' ? 3 : 0,
            is_blocked: p.id === 'prj-1' ? true : false
        }));

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

        // Role-based scoping (Scoping Logic) - CEO and EMP only see own tasks to avoid micromanagement
        if (role === 'EMPLOYEE' || role === 'CEO') {
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
    http.get('/api/tasks/:id', ({ params, request }) => {
        const task = mockTasks.find(t => t.id === params.id);
        const subtasks = mockSubtasks.filter(s => s.task_id === params.id);
        const logs = mockTimeLogs.filter(l => l.task_id === params.id);

        const totalMinutes = logs.reduce((sum, l) => sum + l.minutes, 0);

        if (!task) return HttpResponse.json({ error: 'Task not found' }, { status: 404 });

        const role = (request.headers.get('x-user-role') || 'EMPLOYEE').toUpperCase();
        const userId = request.headers.get('x-user-id');
        const isPM = role === 'PROJECT_MANAGER' || role === 'ORG_ADMIN' || role === 'SYS_ADMIN';
        const isOwner = task.created_by === userId;
        const isLocked = (task as any).is_locked || false;

        return HttpResponse.json({
            ...task,
            project: { id: 'prj-1', name: 'Worksphere Platform', code: 'WSP' },
            assignees: task.assignees.map(a => ({ user: a })),
            total_logged_minutes: totalMinutes,
            subtasks: subtasks.map(s => {
                const subtaskMinutes = mockTimeLogs
                    .filter(l => l.subtask_id === s.id)
                    .reduce((sum, l) => sum + l.minutes, 0);
                return {
                    ...s,
                    status: s.status_code,
                    creator_name: 'Nguyễn Thị Lan Anh',
                    has_logs: subtaskMinutes > 0,
                    logged_minutes: subtaskMinutes
                };
            }),
            comments: [
                { id: 'c1', author_name: 'Hoàng Ngọc Sơn', content: 'Cần hoàn thành mốc này gấp nhé!', created_at: new Date().toISOString() }
            ],
            // Enterprise Capability Pattern (from phan-quyen.md) - Aligned with US-EMP/US-MNG
            capabilities: {
                can_update: (isPM || isOwner) && !isLocked,
                can_delete: (isPM) && !isLocked,
                can_log_time: task.status_code === 'DONE' && !isLocked,
                allowed_fields: isPM ? ['*'] : (isOwner ? ['description', 'status_code', 'comment'] : ['comment'])
            }
        });
    }),

    http.put('/api/tasks/:id', async ({ params, request }) => {
        const body = await request.json() as any;
        const task = mockTasks.find(t => t.id === params.id);

        // BA Rule: Optimistic Locking (row_version)
        if (task && body.row_version && body.row_version !== (task as any).row_version) {
            return HttpResponse.json({
                success: false,
                message: 'CONF-01: Dữ liệu đã được thay đổi bởi người khác. Vui lòng tải lại trang.'
            }, { status: 409 });
        }

        return HttpResponse.json({
            success: true,
            data: { id: params.id, ...body, row_version: ((task as any).row_version || 1) + 1 }
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
    http.get('/api/personal-tasks', ({ request }) => {
        const userId = request.headers.get('x-user-id') || 'user-emp';

        // BA Rule: Strict Isolation (US-EMP-07-05)
        // Only return tasks belonging to the current user
        const userTasks = mockPersonalTasks.filter(t => t.user_id === userId);

        const grouped = {
            TODO: userTasks.filter(t => t.status_code === 'TODO').sort((a, b) => a.sort_order - b.sort_order),
            IN_PROGRESS: userTasks.filter(t => t.status_code === 'IN_PROGRESS').sort((a, b) => a.sort_order - b.sort_order),
            DONE: userTasks.filter(t => t.status_code === 'DONE').sort((a, b) => a.sort_order - b.sort_order)
        };

        return HttpResponse.json({
            success: true,
            data: grouped
        });
    }),

    http.post('/api/personal-tasks', async ({ request }) => {
        const body = await request.json() as any;
        const userId = request.headers.get('x-user-id');

        const newTask = {
            id: 'pt-' + Math.random().toString(36).substr(2, 9),
            user_id: userId,
            ...body,
            created_at: new Date().toISOString(),
            sort_order: 100 // Default sort order
        };

        // In reality, we'd push to the array. For mock, we just return success.
        return HttpResponse.json({ success: true, data: newTask });
    }),

    http.put('/api/personal-tasks/:id', async ({ params, request }) => {
        const body = await request.json() as any;
        const userId = request.headers.get('x-user-id');

        // In a real mock server with state, we would find by id and check user_id
        return HttpResponse.json({
            success: true,
            data: { id: params.id, user_id: userId, ...body }
        });
    }),

    http.delete('/api/personal-tasks/:id', () => {
        return HttpResponse.json({ success: true });
    }),

    http.patch('/api/personal-tasks/:id/reorder', async ({ request }) => {
        return HttpResponse.json({ success: true });
    }),

    // Time Log Handlers
    http.get('/api/tasks/done-for-timelog', () => {
        const doneTasks = mockTasks.filter(t => t.status_code === 'DONE');
        const doneSubtasks = mockSubtasks.filter(s => s.status_code === 'DONE');

        const options = [
            ...doneTasks.map(t => ({
                id: t.id,
                title: t.title,
                project_id: t.project_id || 'prj-1',
                project_name: 'Worksphere Platform',
                type: 'TASK',
                has_subtasks: mockSubtasks.some(s => s.task_id === t.id)
            })),
            ...doneSubtasks.map(s => {
                const parentTask = mockTasks.find(t => t.id === s.task_id);
                return {
                    id: s.id,
                    title: s.title,
                    project_id: parentTask?.project_id || 'prj-1',
                    project_name: 'Worksphere Platform',
                    type: 'SUBTASK',
                    parent_task_id: s.task_id
                };
            })
        ];

        return HttpResponse.json({
            success: true,
            data: options
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
                { id: 'h1', user_name: 'Nguyễn Thị Lan Anh', action_text: 'đã tạo công việc con "Cài đặt MSW"', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
                { id: 'h2', user_name: 'Hoàng Ngọc Sơn', action_text: 'đã thay đổi hạn hoàn thành thành 2025-01-30', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
                { id: 'h3', user_name: 'Nguyễn Thị Lan Anh', action_text: 'đã thêm bình luận mới', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
            ]
        });
    }),

    http.get('/api/reports', ({ request }) => {
        const url = new URL(request.url);
        const searchQuery = url.searchParams.get('search');
        const role = request.headers.get('x-user-role');
        const userId = request.headers.get('x-user-id');

        let reports = [...mockReports];

        // Scoping Logic: EMP only see own reports
        if (role === 'EMPLOYEE') {
            reports = reports.filter(r => r.submitted_by === userId);
        } else if (role === 'PROJECT_MANAGER') {
            // BA Policy: PM sees reports of team members in managed projects
            const managedProjectIds = mockProjectMembers
                .filter(m => m.user_id === userId && m.member_role === 'PM')
                .map(m => m.project_id);

            const teamMemberIds = mockProjectMembers
                .filter(m => managedProjectIds.includes(m.project_id))
                .map(m => m.user_id);

            reports = reports.filter(r => teamMemberIds.includes(r.submitted_by) || r.submitted_by === userId);
        }

        // Rule: Non-owners cannot see DRAFT
        reports = reports.filter(r => r.status !== 'DRAFT' || r.submitted_by === userId);

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

        if (searchQuery) {
            return HttpResponse.json({
                success: true,
                data: enrichedReports.filter(r =>
                    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.submitted_by.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            });
        }

        return HttpResponse.json({ success: true, data: enrichedReports });
    }),

    http.post('/api/reports', async ({ request }) => {
        const userId = request.headers.get('x-user-id');
        const body = await request.json() as any;

        // BA Rule: One Report per Period per User
        const hasDuplicate = mockReports.find(r =>
            r.submitted_by === userId &&
            r.period_type === body.period_type &&
            r.period_start === body.period_start &&
            r.period_end === body.period_end &&
            r.status !== 'DRAFT' // Drafts don't count towards uniqueness for submission
        );

        if (hasDuplicate && body.status === 'SUBMITTED') {
            return HttpResponse.json({
                success: false,
                message: `Bạn đã có một báo cáo cho kỳ này (${body.period_start} đến ${body.period_end}). Vui lòng kiểm tra lại.`
            }, { status: 400 });
        }

        const newReport = {
            id: Math.random().toString(36).substr(2, 9),
            ...body,
            submitted_by: userId,
            created_at: new Date().toISOString()
        };

        // In a real mock, we would push, but here we just return success
        return HttpResponse.json({ success: true, data: newReport });
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

    http.post('/api/time-logs', async ({ request }) => {
        const body = await request.json() as any;
        const userId = request.headers.get('x-user-id');

        // Mocking Activity Event & Notification generation
        console.log(`[MOCK ACTIVITY] User ${userId} logged ${body.minutes}m into task ${body.task_id}`);
        console.log(`[MOCK NOTIFICATION] Notifying PM of project related to task ${body.task_id}`);

        return HttpResponse.json({
            success: true,
            data: { id: Math.random().toString(36).substr(2, 9), ...body, owner_user_id: userId, created_at: new Date().toISOString() }
        });
    }),

    http.put('/api/time-logs/:id', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, data: { id: params.id, ...body } });
    }),

    http.delete('/api/time-logs/:id', () => {
        return HttpResponse.json({ success: true });
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
            {
                id: '1', code: 'SYS_ADMIN', name: 'Quản trị hệ thống',
                description: 'Toàn quyền điều hành toàn bộ nền tảng SaaS (Dành cho nhân sự nội bộ Worksphere)',
                is_system: true,
                permissions: ['*']
            },
            {
                id: '2', code: 'ORG_ADMIN', name: 'Quản trị tổ chức',
                description: 'Quyền cao nhất của một khách hàng doanh nghiệp. Quản lý người dùng, cấu hình tổ chức và vai trò.',
                is_system: true,
                permissions: ['TENANT_ORG.UPDATE', 'ORG_USER.CREATE', 'ORG_USER.INVITE', 'ORG_USER.READ', 'ROLE_PERM.READ', 'ROLE_PERM.UPDATE', 'RECYCLE_BIN.READ', 'RECYCLE_BIN.ALL']
            },
            {
                id: '3', code: 'CEO', name: 'Giám đốc (CEO)',
                description: 'Giám sát toàn bộ hoạt động, xem báo cáo, chi phí và phê duyệt các quyết định lớn.',
                is_system: true,
                permissions: ['DASHBOARD.READ', 'REPORT.READ', 'REPORT.APPROVE', 'PROJECT.READ', 'COMPENSATION.READ', 'ACTIVITY.READ']
            },
            {
                id: '4', code: 'PROJECT_MANAGER', name: 'Quản lý dự án',
                description: 'Người đứng đầu dự án. Quản lý Task, Subtask, Thành viên và Ngân sách trong dự án mình phụ trách.',
                is_system: true,
                permissions: ['PROJECT.READ', 'PROJECT.UPDATE', 'TASK.CREATE', 'TASK.UPDATE', 'TASK.DELETE', 'TASK.ASSIGN', 'CUSTOM_FIELD.CREATE']
            },
            {
                id: '5', code: 'EMPLOYEE', name: 'Nhân viên',
                description: 'Thành viên cơ bản. Thực hiện Task, ghi Log Time và gửi báo cáo tuần/tháng.',
                is_system: true,
                permissions: ['TASK.READ', 'TASK.UPDATE', 'SUBTASK.CREATE', 'TIME_LOG.LOG_TIME', 'REPORT.CREATE', 'REPORT.SUBMIT']
            },
        ];
        return HttpResponse.json({ success: true, data: roles });
    }),

    http.get('/api/admin/permissions', () => {
        const permissions = [
            // TASK
            { code: 'TASK.CREATE', name: 'Tạo công việc', category: 'TASK' },
            { code: 'TASK.READ', name: 'Xem công việc', category: 'TASK' },
            { code: 'TASK.UPDATE', name: 'Sửa công việc', category: 'TASK' },
            { code: 'TASK.DELETE', name: 'Xóa công việc', category: 'TASK' },
            { code: 'TASK.ASSIGN', name: 'Giao việc cho nhân sự', category: 'TASK' },
            { code: 'TASK.IMPORT', name: 'Nhập dữ liệu Task (Excel)', category: 'TASK' },
            { code: 'TASK.EXPORT', name: 'Xuất dữ liệu Task (Excel)', category: 'TASK' },
            { code: 'SUBTASK.CREATE', name: 'Tạo công việc con', category: 'TASK' },
            { code: 'SUBTASK.UPDATE', name: 'Sửa công việc con', category: 'TASK' },
            { code: 'SUBTASK.DELETE', name: 'Xóa công việc con', category: 'TASK' },

            // PROJECT
            { code: 'PROJECT.CREATE', name: 'Tạo dự án mới', category: 'PROJECT' },
            { code: 'PROJECT.READ', name: 'Xem thông tin dự án', category: 'PROJECT' },
            { code: 'PROJECT.UPDATE', name: 'Cấu hình dự án (PM)', category: 'PROJECT' },
            { code: 'PRJ_LOCK.LOCK', name: 'Khóa đối soát dự án', category: 'PROJECT' },
            { code: 'PRJ_LOCK.UNLOCK', name: 'Mở khóa đối soát', category: 'PROJECT' },
            { code: 'CUSTOM_FIELD.CREATE', name: 'Quản lý trường tùy chỉnh dự án', category: 'PROJECT' },
            { code: 'TAG.UPDATE', name: 'Quản lý nhãn (Tag) dự án', category: 'PROJECT' },
            { code: 'ASSET.CREATE', name: 'Tải lên tài liệu/tài sản dự án', category: 'PROJECT' },

            // TIME
            { code: 'TIME_LOG.LOG_TIME', name: 'Ghi nhật ký thời gian', category: 'TIME' },
            { code: 'TIME_LOG.READ', name: 'Xem nhật ký thời gian', category: 'TIME' },
            { code: 'TIME_LOG.UPDATE', name: 'Sửa nhật ký thời gian', category: 'TIME' },
            { code: 'TIME_LOG.DELETE', name: 'Xóa nhật ký thời gian', category: 'TIME' },

            // REPORTING
            { code: 'REPORT.CREATE', name: 'Tạo báo cáo định kỳ', category: 'REPORT' },
            { code: 'REPORT.SUBMIT', name: 'Gửi báo cáo lên cấp trên', category: 'REPORT' },
            { code: 'REPORT.READ', name: 'Xem báo cáo của cấp dưới', category: 'REPORT' },
            { code: 'REPORT.APPROVE', name: 'Duyệt & Comment báo cáo', category: 'REPORT' },
            { code: 'REPORT.EXPORT', name: 'Xuất báo cáo tổng hợp (CSV)', category: 'REPORT' },

            // USER MANAGEMENT
            { code: 'ORG_USER.CREATE', name: 'Thêm tài khoản nhân sự trực tiếp', category: 'USER' },
            { code: 'ORG_USER.INVITE', name: 'Gửi link mời nhân gia nhập', category: 'USER' },
            { code: 'ORG_USER.READ', name: 'Xem danh sách và hồ sơ nhân sự', category: 'USER' },
            { code: 'ORG_USER.UPDATE', name: 'Cập nhật thông tin/Trạng thái nhân sự', category: 'USER' },

            // HR & FINANCE
            { code: 'COMPENSATION.READ', name: 'Xem thông tin lương & phụ cấp', category: 'HR' },
            { code: 'COMPENSATION.UPDATE', name: 'Cập nhật bảng lương (HR/CEO)', category: 'HR' },
            { code: 'JOB_CONTRACT.READ', name: 'Xem thông tin hợp đồng lao động', category: 'HR' },

            // ORG / SYSTEM
            { code: 'TENANT_ORG.UPDATE', name: 'Cấu hình Không gian làm việc (Workspace)', category: 'ORG' },
            { code: 'ROLE_PERM.READ', name: 'Xem danh sách vai trò nội bộ', category: 'ORG' },
            { code: 'ROLE_PERM.UPDATE', name: 'Chỉnh sửa quyền hạn của vai trò', category: 'ORG' },
            { code: 'ACTIVITY.READ', name: 'Xem nhật ký hoạt động hệ thống', category: 'ORG' },
            { code: 'RECYCLE_BIN.READ', name: 'Xem thùng rác công ty', category: 'ORG' },
            { code: 'RECYCLE_BIN.RESTORE', name: 'Khôi phục dữ liệu từ thùng rác', category: 'ORG' },
            { code: 'RECYCLE_BIN.DESTROY', name: 'Xóa vĩnh viễn dữ liệu (Hủy tài nguyên)', category: 'ORG' },
            { code: 'DASHBOARD.READ', name: 'Truy cập Executive Dashboard', category: 'ORG' },
            { code: 'LOOKUP.ALL', name: 'Tra cứu dữ liệu hệ thống (Lookup)', category: 'ORG' },
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
        const { subject_user_id, org_id } = await request.json() as any;
        const user = mockUsers.find(u => u.id === subject_user_id) || mockUsers[0];
        const roleEntry = mockUserRoles.find(r => r.user_id === user.id);
        const role_code = (roleEntry?.role_code || 'EMPLOYEE') as AppRole;

        return HttpResponse.json({
            success: true,
            user: {
                ...user,
                role: role_code,
                org_id,
                permissions: ROLE_PERMISSIONS[role_code] || []
            },
            token: 'mock-impersonation-token-' + subject_user_id
        });
    }),

    // Admin Organization Approvals
    http.get('/api/admin/org-approvals', () => {
        return HttpResponse.json({
            success: true,
            data: [
                {
                    id: 'app-1', org_name: 'TechStart Vietnam', org_slug: 'techstart-vn',
                    owner_name: 'Nguyễn Văn Founder', owner_email: 'founder@techstart.vn',
                    plan_requested: 'PROFESSIONAL', employee_count: 50, industry: 'Technology',
                    status: 'PENDING', submitted_at: '2025-01-19T14:00:00Z'
                },
                {
                    id: 'app-2', org_name: 'Design Studio XYZ', org_slug: 'design-studio-xyz',
                    owner_name: 'Trần Thị Designer', owner_email: 'designer@xyz.com',
                    plan_requested: 'BASIC', employee_count: 15, industry: 'Design',
                    status: 'PENDING', submitted_at: '2025-01-18T10:00:00Z'
                },
                {
                    id: 'app-3', org_name: 'Marketing Pro', org_slug: 'marketing-pro',
                    owner_name: 'Lê Văn Marketer', owner_email: 'marketer@pro.com',
                    plan_requested: 'ENTERPRISE', employee_count: 200, industry: 'Marketing',
                    status: 'PENDING', submitted_at: '2025-01-17T09:00:00Z'
                },
                {
                    id: 'app-4', org_name: 'Old Company', org_slug: 'old-company',
                    owner_name: 'Phạm Văn Old', owner_email: 'old@company.com',
                    plan_requested: 'FREE', employee_count: 5, industry: 'Other',
                    status: 'APPROVED', submitted_at: '2025-01-10T08:00:00Z',
                    processed_at: '2025-01-11T10:00:00Z', processed_by: 'System Admin'
                },
            ]
        });
    }),

    http.post('/api/admin/org-approvals/:id/approve', async ({ params }) => {
        return HttpResponse.json({ success: true, message: 'Application approved' });
    }),

    http.post('/api/admin/org-approvals/:id/reject', async ({ params, request }) => {
        const { reason } = await request.json() as any;
        return HttpResponse.json({ success: true, message: 'Application rejected', reason });
    }),

    // Admin Quotas
    http.get('/api/admin/quotas', () => {
        return HttpResponse.json({
            success: true,
            data: [
                {
                    id: 'org-1',
                    org_name: 'Tập đoàn Công nghệ WorkSphere',
                    max_users: 50,
                    current_users: 42,
                    max_storage_gb: 100,
                    current_storage_gb: 85,
                    max_projects: 20,
                    current_projects: 18,
                    status: 'WARNING'
                },
                {
                    id: 'org-2',
                    org_name: 'Công ty Cổ phần FPT',
                    max_users: 1000,
                    current_users: 500,
                    max_storage_gb: 1024,
                    current_storage_gb: 200,
                    max_projects: 500,
                    current_projects: 50,
                    status: 'ACTIVE'
                }
            ]
        });
    }),

    http.patch('/api/admin/quotas/:orgId', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({ success: true, data: body });
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
        const role = request.headers.get('x-user-role') || 'EMPLOYEE';
        const userId = request.headers.get('x-user-id');

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

        // BA Rule: Scoping Logic (docs/EMP/hoat-dong.md)
        // EMP only sees their own activity. PM/ADMIN sees all.
        if (role === 'EMPLOYEE') {
            data = data.filter(a => a.actor_user_id === userId);
        } else {
            // Further filters for PM/ADMIN
            if (actorId && actorId !== 'ALL') {
                data = data.filter(a => a.actor_user_id === actorId);
            }
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
        const role = request.headers.get('x-user-role') || 'EMPLOYEE';
        const userId = request.headers.get('x-user-id');

        let filtered = [...mockRecycleBin];

        // Scoping Logic
        if (role === 'EMPLOYEE') {
            // EMP only sees items they deleted themselves (docs/EMP/thung-rac.md)
            filtered = filtered.filter(item => item.deleted_by.id === userId);
        } else if (role === 'PROJECT_MANAGER') {
            // PM only see items within their projects (docs/PM/thung-rac.md)
            filtered = filtered.filter(item => item.project !== null);
        }

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

    http.delete('/api/recycle-bin/empty', ({ request }) => {
        const role = request.headers.get('x-user-role') || 'EMPLOYEE';
        if (role === 'EMPLOYEE') {
            return HttpResponse.json({ success: false, message: 'Nhân viên không có quyền xóa vĩnh viễn' }, { status: 403 });
        }
        return HttpResponse.json({ success: true });
    }),

    http.delete('/api/recycle-bin/:id', ({ request }) => {
        const role = request.headers.get('x-user-role') || 'EMPLOYEE';
        if (role === 'EMPLOYEE') {
            return HttpResponse.json({ success: false, message: 'Nhân viên không có quyền xóa vĩnh viễn' }, { status: 403 });
        }
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

    // Reports - Create
    http.post('/api/reports', async ({ request }) => {
        const body = await request.json() as any;
        const userId = request.headers.get('x-user-id');

        // Rule: One Report per Period per User
        const alreadyExists = mockReports.find(r =>
            r.submitted_by === userId &&
            r.period_type === body.period_type &&
            r.period_start === body.period_start &&
            r.period_end === body.period_end
        );

        if (alreadyExists && body.status !== 'DRAFT') {
            return HttpResponse.json({
                success: false,
                message: `Bạn đã gửi báo cáo cho kỳ ${body.period_start} đến ${body.period_end} rồi. Mỗi kỳ chỉ được phép gửi một báo cáo duy nhất.`
            }, { status: 400 });
        }

        return HttpResponse.json({
            success: true,
            data: {
                id: Math.random().toString(36).substr(2, 9),
                ...body,
                submitted_by: userId,
                created_at: new Date().toISOString()
            }
        });
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
                comments: comments.map(c => {
                    const author = mockUsers.find(u => u.id === c.author_user_id);
                    const roleEntry = mockUserRoles.find(r => r.user_id === c.author_user_id);
                    return {
                        id: c.id,
                        content: (c as any).comment_text || (c as any).content,
                        created_at: c.created_at,
                        user: author ? {
                            id: author.id,
                            full_name: author.full_name,
                            role: roleEntry?.role_code || 'EMPLOYEE'
                        } : null
                    };
                })
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

    // HR - Employees List
    http.get('/api/hr/employees', ({ request }) => {
        const role = request.headers.get('x-user-role');
        const userId = request.headers.get('x-user-id');
        const orgId = request.headers.get('x-org-id') || 'org-1';

        let employees = mockUsers.map(u => {
            const membership = mockOrgMemberships.find(m => m.user_id === u.id);
            const userRole = mockUserRoles.find(r => r.user_id === u.id);
            return {
                id: u.id,
                full_name: u.full_name,
                email: u.email,
                phone: '0987654321',
                avatar_url: null,
                role: userRole?.role_code || 'EMPLOYEE',
                member_status: membership?.member_status || 'ACTIVE',
                department: u.id.includes('dev') || u.id.includes('pm') || u.id.includes('qa') ? 'Engineering' : (u.id.includes('designer') ? 'Design' : 'Executive'),
                position: u.id.includes('pm') ? 'Project Manager' : (u.id.includes('ceo') ? 'CEO' : (u.id.includes('qa') ? 'QA Engineer' : 'Developer')),
                join_method: membership?.join_method || 'MANUAL',
                joined_at: membership?.activated_at?.split('T')[0] || null,
                created_at: u.created_at,
                // Financial info for CEO/Admin - US-CEO-02-01
                ...(role === 'CEO' || role === 'ORG_ADMIN' ? (() => {
                    const comp = mockCompensations.find(c => c.user_id === u.id);
                    const lvl = mockJobLevels.find(l => l.id === comp?.level_id);
                    return {
                        monthly_salary: comp?.monthly_salary || 0,
                        hourly_cost_rate: comp?.hourly_cost_rate || 0,
                        level_code: lvl?.code || 'N/A'
                    };
                })() : {})
            };
        });

        // Filter by Org
        employees = employees.filter(e => {
            const roleEntry = mockUserRoles.find(r => r.user_id === e.id);
            return roleEntry?.org_id === orgId;
        });

        // Scoping Logic: PM only sees members in managed projects
        if (role === 'PROJECT_MANAGER') {
            const managedProjectIds = mockProjectMembers
                .filter(m => m.user_id === userId && m.member_role === 'PM')
                .map(m => m.project_id);

            const teamMemberIds = mockProjectMembers
                .filter(m => managedProjectIds.includes(m.project_id))
                .map(m => m.user_id);

            employees = employees.filter(e => teamMemberIds.includes(e.id) || e.id === userId);
        }

        return HttpResponse.json({
            success: true,
            data: employees
        });
    }),

    // HR - Employee Detail
    http.get('/api/hr/employees/:id', ({ params, request }) => {
        const { id } = params;
        const role = request.headers.get('x-user-role');
        const userId = request.headers.get('x-user-id');

        const u = mockUsers.find(user => user.id === id);
        if (!u) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });

        // Scoping Logic for PM
        if (role === 'PROJECT_MANAGER') {
            const managedProjectIds = mockProjectMembers
                .filter(m => m.user_id === userId && m.member_role === 'PM')
                .map(m => m.project_id);

            const teamMemberIds = mockProjectMembers
                .filter(m => managedProjectIds.includes(m.project_id))
                .map(m => m.user_id);

            if (!teamMemberIds.includes(u.id) && u.id !== userId) {
                return HttpResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
            }
        }

        const membership = mockOrgMemberships.find(m => m.user_id === u.id);
        const userRole = mockUserRoles.find(r => r.user_id === u.id);

        return HttpResponse.json({
            success: true,
            data: {
                id: u.id,
                full_name: u.full_name,
                email: u.email,
                phone: '0987654321',
                avatar_url: null,
                role: userRole?.role_code || 'EMPLOYEE',
                member_status: membership?.member_status || 'ACTIVE',
                department: u.id.includes('dev') || u.id.includes('pm') || u.id.includes('qa') ? 'Engineering' : (u.id.includes('designer') ? 'Design' : 'Executive'),
                position: u.id.includes('pm') ? 'Project Manager' : (u.id.includes('ceo') ? 'CEO' : (u.id.includes('qa') ? 'QA Engineer' : 'Developer')),
                joined_at: membership?.activated_at?.split('T')[0] || null,
                // PII for CEO/Admin - US-CEO-02-01
                ...(role === 'CEO' || role === 'ORG_ADMIN' ? {
                    dob: (u as any).dob || '1990-01-01',
                    id_number: (u as any).id_number || '000000000000',
                    tax_code: (u as any).tax_code || '0000000000',
                    bank_account: (u as any).bank_account || 'N/A',
                    address: (u as any).address || 'N/A',
                } : {})
            }
        });
    }),

    // HR - Job Levels
    http.get('/api/hr/job-levels', () => {
        return HttpResponse.json({
            success: true,
            data: mockJobLevels
        });
    }),

    // HR - Compensations
    http.get('/api/hr/compensations', ({ request }) => {
        const role = request.headers.get('x-user-role');
        const userId = request.headers.get('x-user-id');
        const orgId = request.headers.get('x-org-id') || 'org-1';

        let data = mockCompensations.map(c => {
            const u = mockUsers.find(user => user.id === c.user_id);
            const level = mockJobLevels.find(l => l.id === c.level_id);
            return {
                ...c,
                user_name: u?.full_name || 'Unknown',
                user_email: u?.email || '',
                level_name: level?.name || 'Unknown',
                level_code: level?.code || '',
                department: u?.id.includes('dev') || u?.id.includes('pm') || u?.id.includes('qa') ? 'Engineering' : (u?.id.includes('designer') ? 'Design' : 'Executive'),
                position: u?.id.includes('pm') ? 'Project Manager' : (u?.id.includes('ceo') ? 'CEO' : (u?.id.includes('qa') ? 'QA Engineer' : 'Developer')),
            };
        });

        // Filter by Org
        data = data.filter(c => {
            const roleEntry = mockUserRoles.find(r => r.user_id === c.user_id);
            return roleEntry?.org_id === orgId;
        });

        // Scoping Logic: PM only sees compensations of team members in managed projects
        if (role === 'PROJECT_MANAGER') {
            const managedProjectIds = mockProjectMembers
                .filter(m => m.user_id === userId && m.member_role === 'PM')
                .map(m => m.project_id);

            const teamMemberIds = mockProjectMembers
                .filter(m => managedProjectIds.includes(m.project_id))
                .map(m => m.user_id);

            data = data.filter(c => teamMemberIds.includes(c.user_id) || c.user_id === userId);
        }

        return HttpResponse.json({
            success: true,
            data: data
        });
    }),

    // HR - Update Compensation
    http.put('/api/hr/compensations/:id', async ({ params, request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: { id: params.id, ...body }
        });
    }),

    // Project Lockdown - CEO Capability
    http.get('/api/projects/:id/lockdown', ({ params }) => {
        return HttpResponse.json({
            success: true,
            is_locked: params.id === 'p1-urgent', // Mock 'p1-urgent' as locked
            lock_info: {
                user_name: 'Nguyễn Thế Cường (CEO)',
                at: '2024-01-15 14:30',
                reason: 'Dự án đã bàn giao, chuyển sang chế độ lưu trữ.'
            }
        });
    }),

    http.post('/api/projects/:id/lockdown', async ({ params, request }) => {
        const { action } = await request.json() as any;
        return HttpResponse.json({
            success: true,
            is_locked: action === 'lock',
            lock_info: {
                user_name: 'Nguyễn Thế Cường (CEO)',
                at: new Date().toLocaleString('vi-VN'),
            }
        });
    }),

    // HR - Employee Documents
    http.get('/api/hr/employees/:id/documents', ({ params }) => {
        const docs = mockDocuments.filter(d => d.user_id === params.id);
        return HttpResponse.json({ success: true, data: docs });
    }),
];
