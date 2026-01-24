'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Activity,
    User,
    Clock,
    Filter,
    Search,
    RefreshCw,
    CheckCircle2,
    MessageSquare,
    PlusCircle,
    Trash2,
    Calendar,
    ArrowRight,
    Tag,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ActivityLog {
    id: string;
    user_name: string;
    action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'COMMENT' | 'STATUS_CHANGE' | 'ASSIGN' | 'TIME_LOG';
    entity_name: string;
    entity_id: string;
    details: string;
    created_at: string;
}

export default function ProjectActivityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [projectName, setProjectName] = useState('');

    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            try {
                // Mock project name fetch
                setProjectName('Worksphere Platform');

                // Mock activities data - US-MNG-06-01
                const mockActivities: ActivityLog[] = [
                    { id: '1', user_name: 'Nguyễn Văn A', action_type: 'TIME_LOG', entity_name: 'Task #123', entity_id: 't123', details: 'đã ghi nhận 4.5 giờ làm việc.', created_at: '2026-01-24T10:30:00Z' },
                    { id: '2', user_name: 'Trần Thị B', action_type: 'STATUS_CHANGE', entity_name: 'Fix bug Login UI', entity_id: 't001', details: 'đã chuyển trạng thái sang DONE.', created_at: '2026-01-24T09:15:00Z' },
                    { id: '3', user_name: 'Lê Văn PM', action_type: 'CREATE', entity_name: 'Setup Production Cluster', entity_id: 't456', details: 'đã tạo một công việc mới.', created_at: '2026-01-23T16:00:00Z' },
                    { id: '4', user_name: 'Alice Designer', action_type: 'COMMENT', entity_name: 'User Onboarding Flow', entity_id: 't789', details: 'đã bình luận: "Cần cập nhật lại màu sắc nút."', created_at: '2026-01-23T14:45:00Z' },
                    { id: '5', user_name: 'Lê Văn PM', action_type: 'ASSIGN', entity_name: 'Task #999', entity_id: 't999', details: 'đã phân công công việc cho Nguyễn Văn A.', created_at: '2026-01-23T11:20:00Z' },
                    { id: '6', user_name: 'Bob Backend', action_type: 'UPDATE', entity_name: 'Database Schema', entity_id: 't222', details: 'đã cập nhật mô tả chi tiết.', created_at: '2026-01-23T08:00:00Z' },
                    { id: '7', user_name: 'HR Manager', action_type: 'DELETE', entity_name: 'Old Meeting Notes', entity_id: 'd10', details: 'đã xóa một tài liệu khỏi dự án.', created_at: '2026-01-22T17:30:00Z' },
                ];

                setActivities(mockActivities);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchActivities();
    }, [projectId, user]);

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'CREATE': return <PlusCircle className="text-emerald-500" size={16} />;
            case 'UPDATE': return <RefreshCw className="text-blue-500" size={16} />;
            case 'DELETE': return <Trash2 className="text-rose-500" size={16} />;
            case 'COMMENT': return <MessageSquare className="text-amber-500" size={16} />;
            case 'STATUS_CHANGE': return <CheckCircle2 className="text-purple-500" size={16} />;
            case 'ASSIGN': return <User className="text-indigo-500" size={16} />;
            case 'TIME_LOG': return <Clock className="text-slate-500" size={16} />;
            default: return <Activity className="text-slate-400" size={16} />;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            if (diffInHours === 0) return 'Vừa xong';
            return `${diffInHours} giờ trước`;
        }
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const filteredActivities = activities.filter(a => {
        const matchesType = typeFilter === 'ALL' || a.action_type === typeFilter;
        const matchesSearch = a.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.details.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    if (!isPM && user) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-32 text-center h-[70vh]">
                    <Activity size={48} className="text-slate-200 mb-6" />
                    <h2 className="text-2xl font-black text-slate-900">Truy cập bị hạn chế</h2>
                    <p className="text-slate-500 mt-2 max-w-xs font-medium">Bạn cần quyền Quản lý dự án để xem nhật ký hoạt động toàn dự án.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700" data-testid="project-activity-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                    <div className="space-y-2">
                        <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900 mb-2">
                            <Link href={`/projects/${projectId}/overview`}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại Dự án
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight" data-testid="project-activity-title">
                            Nhật ký hoạt động
                        </h1>
                        <p className="text-slate-500 font-medium">Theo dõi mọi thay đổi và hoạt động của thành viên trong {projectName}.</p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="h-10 font-bold border-slate-200" data-testid="btn-refresh-activity">
                            <RefreshCw size={16} className="mr-2" /> Làm mới
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-none shadow-sm bg-white mb-8">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input
                                placeholder="Tìm theo tên thành viên, công việc..."
                                className="pl-10 h-10 bg-slate-50 border-none rounded-xl font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                data-testid="activity-search-input"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-48 h-10 bg-slate-50 border-none rounded-xl font-bold" data-testid="activity-type-filter">
                                <SelectValue placeholder="Loại hoạt động" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả hoạt động</SelectItem>
                                <SelectItem value="CREATE">Tạo mới</SelectItem>
                                <SelectItem value="UPDATE">Cập nhật</SelectItem>
                                <SelectItem value="COMMENT">Bình luận</SelectItem>
                                <SelectItem value="STATUS_CHANGE">Trạng thái</SelectItem>
                                <SelectItem value="TIME_LOG">Ghi nhận giờ</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-slate-100 hidden md:block"></div>

                    <div className="space-y-8 relative">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex gap-6">
                                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                                    <div className="space-y-2 flex-1 pt-2">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-16 w-full rounded-2xl" />
                                    </div>
                                </div>
                            ))
                        ) : filteredActivities.length > 0 ? (
                            filteredActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex flex-col md:flex-row gap-6 group"
                                    data-testid={`activity-row-${activity.id}`}
                                >
                                    {/* Icon/Avatar Circle */}
                                    <div className="relative z-10 shrink-0 flex items-center justify-center md:block">
                                        <Avatar className="h-12 w-12 border-4 border-white shadow-sm ring-1 ring-slate-100 group-hover:scale-105 transition-transform">
                                            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs uppercase">
                                                {activity.user_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm ring-1 ring-slate-100">
                                            {getActionIcon(activity.action_type)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-2 md:pt-1">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                                <span className="font-extrabold text-slate-900">{activity.user_name}</span>
                                                <span className="text-slate-500 font-medium text-sm whitespace-pre"> {activity.details}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none font-bold text-[10px] uppercase tracking-tighter px-2"
                                                >
                                                    {activity.entity_name}
                                                </Badge>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                                <Clock size={12} /> {formatTimestamp(activity.created_at)}
                                            </span>
                                        </div>

                                        {/* Optional action details preview */}
                                        <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white/50 backdrop-blur-sm group-hover:bg-white transition-colors duration-300">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-500 transition-colors">
                                                        <Activity size={18} />
                                                    </div>
                                                    <div className="text-xs">
                                                        <p className="font-bold text-slate-700">Thao tác: {activity.action_type}</p>
                                                        <p className="text-slate-500 mt-0.5">ID đối tượng: {activity.entity_id}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="rounded-lg h-8 px-3 font-bold text-blue-600 hover:bg-blue-50" asChild>
                                                    <Link href={`/${activity.entity_id.startsWith('t') ? 'tasks' : 'projects'}/${activity.entity_id}`}>
                                                        Chi tiết <ArrowRight size={14} className="ml-1" />
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100" data-testid="activity-empty-state">
                                <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-2xl font-black text-slate-900">Không tìm thấy hoạt động nào</h3>
                                <p className="text-slate-500 font-medium max-w-xs mx-auto">Thử thay đổi bộ lọc hoặc tìm kiếm để xem các hoạt động khác.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Legend/Key */}
                <div className="mt-16 p-6 bg-slate-900 rounded-3xl border border-slate-800 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                        <Activity size={120} />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Tag className="text-blue-500" size={18} /> Ghi chú nghiệp vụ
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0"><RefreshCw size={18} className="text-blue-400" /></div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-200 mb-1">Audit Trail</p>
                                    <p className="text-slate-400 leading-relaxed font-medium">Mọi thay đổi nhạy cảm đều được ghi lại vĩnh viễn và không thể chỉnh sửa bởi bất kỳ ai.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0"><Clock size={18} className="text-emerald-400" /></div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-200 mb-1">Real-time Updates</p>
                                    <p className="text-slate-400 leading-relaxed font-medium">Hoạt động mới sẽ xuất hiện ngay lập tức trong bảng tin này.</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0"><Filter size={18} className="text-amber-400" /></div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-200 mb-1">Deep Filtering</p>
                                    <p className="text-slate-400 leading-relaxed font-medium">Bạn có thể lọc theo thành viên cụ thể hoặc loại hành động để tra soát nhanh.</p>
                                </div>
                            </div>
                            <Button variant="link" className="text-blue-400 font-bold p-0 h-auto text-[10px] uppercase tracking-widest hover:text-blue-300">
                                <Download size={14} className="mr-2" /> Xuất nhật ký lịch sử (.csv)
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
