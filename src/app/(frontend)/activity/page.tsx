/**
 * Activity Page - Nhật ký hoạt động
 * 
 * User Stories:
 * - US-EMP-04-01: Xem Activity của chính mình theo từng ngày
 * - US-EMP-04-02: Activity hiển thị các sự kiện (chốt subtask, log time, comment)
 * - US-MNG-06-01: PM xem Activity của mình và toàn bộ EMP trong dự án
 * - US-MNG-06-02: PM lọc Activity theo dự án/nhân sự/loại sự kiện
 * - US-CEO-04-01: CEO xem Activity toàn công ty
 * - US-CEO-04-02: CEO lọc Activity theo dự án/phòng ban/nhân sự
 * 
 * Access:
 * - EMP: Chỉ xem activity của mình
 * - PM: Xem activity trong projects mình quản lý
 * - CEO: Xem activity toàn org
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Calendar,
    Clock,
    CheckCircle2,
    CheckSquare,
    MessageSquare,
    BarChart3,
    FileText,
    Filter,
    ChevronDown,
    Loader2,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

interface ActivityEvent {
    id: string;
    actor: { id: string; full_name: string };
    project: { id: string; name: string; code: string } | null;
    activity_date: string;
    occurred_at: string;
    activity_type: string;
    entity_type: string;
    entity_id: string;
    summary: string;
}

interface Project {
    id: string;
    name: string;
    code: string;
}

const ACTIVITY_TYPES = {
    TASK_CREATED: { label: 'Tạo task', icon: FileText, color: 'text-blue-600 bg-blue-50' },
    TASK_DONE: { label: 'Hoàn thành task', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    SUBTASK_DONE: { label: 'Hoàn thành subtask', icon: CheckSquare, color: 'text-green-600 bg-green-50' },
    LOG_TIME: { label: 'Log time', icon: Clock, color: 'text-amber-600 bg-amber-50' },
    COMMENT: { label: 'Bình luận', icon: MessageSquare, color: 'text-purple-600 bg-purple-50' },
    REPORT_SUBMITTED: { label: 'Gửi báo cáo', icon: BarChart3, color: 'text-indigo-600 bg-indigo-50' },
    TASK_UPDATE: { label: 'Cập nhật task', icon: FileText, color: 'text-slate-600 bg-slate-50' },
};

// Activity Item Component
const ActivityItem = ({ event }: { event: ActivityEvent }) => {
    const typeConfig = ACTIVITY_TYPES[event.activity_type as keyof typeof ACTIVITY_TYPES] || {
        label: event.activity_type,
        icon: FileText,
        color: 'text-slate-600 bg-slate-50'
    };
    const Icon = typeConfig.icon;

    const time = new Date(event.occurred_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Determine link based on entity_type
    const getEntityLink = () => {
        if (event.entity_type === 'TASK') return `/tasks/${event.entity_id}`;
        if (event.entity_type === 'SUBTASK') return `/tasks/${event.entity_id}`;
        if (event.entity_type === 'REPORT') return `/reports/${event.entity_id}`;
        return null;
    };

    const entityLink = getEntityLink();

    return (
        <div
            className="p-4 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-all group"
            data-testid={`activity-item-${event.id}`}
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarFallback className="text-sm font-bold bg-slate-100 text-slate-600">
                        {event.actor.full_name.charAt(0)}
                    </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">
                            {event.actor.full_name}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                            {time}
                        </span>
                    </div>

                    {/* Activity Summary */}
                    <div className="flex items-center gap-2 mt-1">
                        <span className={cn("p-1 rounded", typeConfig.color)}>
                            <Icon size={14} />
                        </span>
                        <span className="text-sm text-slate-600">
                            {event.summary}
                        </span>
                    </div>

                    {/* Project & Link */}
                    <div className="flex items-center justify-between mt-2">
                        {event.project && (
                            <Link
                                href={`/projects/${event.project.id}`}
                                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                📁 {event.project.name}
                            </Link>
                        )}
                        {entityLink && (
                            <Link
                                href={entityLink}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                data-testid={`link-entity-${event.id}`}
                            >
                                Xem chi tiết <ExternalLink size={12} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Date Section Component
const DateSection = ({ date, events }: { date: string; events: ActivityEvent[] }) => {
    const formattedDate = new Date(date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div className="space-y-3" data-testid={`date-section-${date}`}>
            <div className="flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {formattedDate}
                </span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className="space-y-2">
                {events.map((event) => (
                    <ActivityItem key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
};

// Main Page Component
export default function ActivityPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityEvent[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    // Filters
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
    const [selectedProject, setSelectedProject] = useState('ALL');
    const [selectedType, setSelectedType] = useState('ALL');
    const [selectedActor, setSelectedActor] = useState('ALL');

    const canFilterByUser = user?.role === 'PROJECT_MANAGER' || user?.role === 'CEO' || user?.role === 'ORG_ADMIN';

    // Fetch activities
    const fetchActivities = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (selectedProject !== 'ALL') params.append('project_id', selectedProject);
            if (selectedType !== 'ALL') params.append('activity_type', selectedType);
            if (selectedActor !== 'ALL') params.append('actor_id', selectedActor);

            const res = await fetch(`/api/activity?${params.toString()}`, {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setActivities(data.data || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch projects for filter
    const fetchProjects = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/projects', {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setProjects(data.data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    // Fetch users for filter
    const fetchUsers = async () => {
        if (!user || !canFilterByUser) return;
        try {
            const res = await fetch('/api/admin/users', {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setUsers(data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProjects();
            fetchUsers();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchActivities();
        }
    }, [user, dateFrom, dateTo, selectedProject, selectedType, selectedActor]);

    // Group activities by date
    const activitiesByDate = activities.reduce((acc, event) => {
        const date = event.activity_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
    }, {} as Record<string, ActivityEvent[]>);

    return (
        <AppLayout>
            <PermissionGuard permission={PERMISSIONS.ACTIVITY_READ} showFullPageError>
                <div className="space-y-6 animate-in fade-in duration-700" data-testid="activity-page-container">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="activity-page-title">
                                    {user?.role === 'CEO' ? '📈 Nhịp đập doanh nghiệp' : '📰 Nhật ký hoạt động'}
                                </h1>
                                {user?.role === 'CEO' && (
                                    <Badge className="bg-rose-500 text-white animate-pulse border-none">
                                        LIVE
                                    </Badge>
                                )}
                            </div>
                            <p className="text-slate-500 mt-1 font-medium">
                                {user?.role === 'CEO'
                                    ? 'Giám sát toàn bộ dòng chảy công việc của tổ chức theo thời gian thực.'
                                    : user?.role === 'EMPLOYEE'
                                        ? 'Theo dõi lịch sử hoạt động của bạn.'
                                        : 'Theo dõi hoạt động của dự án và thành viên.'}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="border-none shadow-sm" data-testid="activity-filters">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* Date Range */}
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-36"
                                        data-testid="input-date-from"
                                    />
                                    <span className="text-slate-400">→</span>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-36"
                                        data-testid="input-date-to"
                                    />
                                </div>

                                {/* Project Filter */}
                                <Select value={selectedProject} onValueChange={setSelectedProject}>
                                    <SelectTrigger className="w-[180px]" data-testid="filter-project">
                                        <SelectValue placeholder="Tất cả dự án" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả dự án</SelectItem>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                [{p.code}] {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Actor Filter */}
                                {canFilterByUser && (
                                    <Select value={selectedActor} onValueChange={setSelectedActor}>
                                        <SelectTrigger className="w-[180px]" data-testid="filter-actor">
                                            <SelectValue placeholder="Tất cả nhân sự" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tất cả nhân sự</SelectItem>
                                            {users.map((u) => (
                                                <SelectItem key={u.id} value={u.id}>
                                                    {u.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Activity Type Filter */}
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger className="w-[180px]" data-testid="activity-filter-type">
                                        <SelectValue placeholder="Tất cả loại" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả loại</SelectItem>
                                        {Object.entries(ACTIVITY_TYPES).map(([code, config]) => (
                                            <SelectItem key={code} value={code}>
                                                {config.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card >

                    {/* Activity List */}
                    {
                        loading ? (
                            <div className="space-y-6" data-testid="activity-loading">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="h-4 w-48 mx-auto" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-20 w-full" />
                                            <Skeleton className="h-20 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : Object.keys(activitiesByDate).length > 0 ? (
                            <div className="space-y-8" data-testid="activity-list">
                                {Object.entries(activitiesByDate)
                                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                                    .map(([date, events]) => (
                                        <DateSection key={date} date={date} events={events} />
                                    ))}
                            </div>
                        ) : (
                            <Card className="border-none shadow-sm" data-testid="activity-empty">
                                <CardContent className="py-16 text-center">
                                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-4xl">
                                        📭
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        Không có hoạt động nào
                                    </h3>
                                    <p className="text-slate-500">
                                        Trong khoảng thời gian đã chọn
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    }
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
