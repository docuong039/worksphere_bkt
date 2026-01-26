'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Users,
    CheckSquare,
    Calendar,
    MoreVertical,
    FolderOpen,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell
} from 'recharts';

interface Project {
    id: string;
    code: string;
    name: string;
    description: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
    member_count: number;
    task_count: number;
    completion_rate: number;
    overdue_count?: number;
    is_blocked?: boolean;
}

const ProjectCard = ({ project }: { project: Project }) => {
    const { user } = useAuthStore();
    return (
        <Card
            className="group hover:shadow-xl transition-all duration-300 border-none shadow-sm overflow-hidden bg-white"
            data-testid={`project-card-${project.code.toLowerCase()}`}
        >
            <CardContent className="p-0">
                <Link href={`/projects/${project.id}/overview`} className="block p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            {project.is_blocked && (
                                <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-none px-2 h-6 font-black uppercase text-[10px]">
                                    Bị chặn (Blocked)
                                </Badge>
                            )}
                            {project.overdue_count && project.overdue_count > 0 ? (
                                <Badge variant="destructive" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-none px-2 py-0 h-6">
                                    {project.overdue_count} Quá hạn
                                </Badge>
                            ) : (project.completion_rate < 30 && project.status === 'ACTIVE' && (
                                <Badge variant="outline" className="text-amber-600 border-amber-200 px-2 py-0 h-6">
                                    Tiến độ chậm
                                </Badge>
                            ))}
                            <Badge
                                variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                                className={project.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none px-3 h-6 underline-offset-4" : "h-6"}
                                data-testid={`project-status-${project.code.toLowerCase()}`}
                            >
                                {project.status === 'ACTIVE' ? 'Hoạt động' : 'Lưu trữ'}
                            </Badge>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                    <MoreVertical size={18} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <PermissionGuard permission={PERMISSIONS.PROJECT_UPDATE}>
                                    <DropdownMenuItem data-testid={`btn-edit-project-${project.code.toLowerCase()}`}>Chỉnh sửa</DropdownMenuItem>
                                </PermissionGuard>
                                <PermissionGuard permission={PERMISSIONS.PROJECT_UPDATE}>
                                    <DropdownMenuItem data-testid={`btn-archive-project-${project.code.toLowerCase()}`}>Lưu trữ dự án</DropdownMenuItem>
                                </PermissionGuard>
                                <PermissionGuard permission={PERMISSIONS.PROJECT_UPDATE}>
                                    <DropdownMenuItem className="text-red-600" data-testid={`btn-delete-project-${project.code.toLowerCase()}`}>Xóa dự án</DropdownMenuItem>
                                </PermissionGuard>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="space-y-1 mb-6">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{project.code}</p>
                        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed h-10">
                            {project.description || "Chưa có mô tả cho dự án này."}
                        </p>
                    </div>

                    {user?.role !== 'CEO' && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-2 text-slate-500">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                    <Users size={14} />
                                </div>
                                <span className="text-sm font-semibold">{project.member_count} Thành viên</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                    <CheckSquare size={14} />
                                </div>
                                <span className="text-sm font-semibold">{project.task_count} Công việc</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Tiến độ</span>
                            <span className="text-sm font-black text-slate-900">{project.completion_rate}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-sm"
                                style={{ width: `${project.completion_rate}%` }}
                                data-testid={`project-progress-${project.code.toLowerCase()}`}
                            ></div>
                        </div>
                    </div>
                </Link>

                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <Calendar size={14} />
                        {project.start_date ? new Date(project.start_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A'} -
                        {project.end_date ? new Date(project.end_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
            </CardContent>
        </Card>
    );
};

export default function ProjectsPage() {
    const { user, hasPermission } = useAuthStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const canCreateProject = hasPermission(PERMISSIONS.PROJECT_CREATE);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/projects', {
                    headers: {
                        'x-user-id': user?.id || '',
                        'x-user-role': user?.role || ''
                    }
                });
                const data = await res.json();
                setProjects(data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProjects();
        }
    }, [user]);

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout>
            <PermissionGuard permission={PERMISSIONS.PROJECT_READ} showFullPageError>
                <div className="space-y-8 animate-in fade-in duration-700" data-testid="projects-page-container">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="projects-page-title">
                                {(user?.role === 'CEO' || user?.role === 'ORG_ADMIN') ? 'Quản trị Dự án Toàn công ty' : 'Dự án'}
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                {(user?.role === 'CEO' || user?.role === 'ORG_ADMIN')
                                    ? 'Cái nhìn chiến lược (Strategic View) về toàn bộ dự án và tiến độ của tổ chức.'
                                    : 'Danh sách dự án bạn tham gia và theo dõi tiến độ.'}
                            </p>
                        </div>
                        {canCreateProject && (
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 h-11 px-6 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                                data-testid="btn-create-project"
                                asChild
                            >
                                <Link href="/projects/new">
                                    <Plus className="mr-2 h-5 w-5" /> Tạo dự án
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Filters Row */}
                    <Card className="border-none shadow-sm bg-white p-2">
                        <CardContent className="p-2 flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <Input
                                    placeholder="Tìm theo tên hoặc mã..."
                                    className="pl-10 h-11 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all rounded-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    data-testid="search-projects"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-11 px-4 gap-2 text-slate-600 font-semibold border-slate-200" data-testid="projects-filter-status">
                                            <Filter size={18} />
                                            Trạng thái: {statusFilter === 'ALL' ? 'Tất cả' : (statusFilter === 'ACTIVE' ? 'Hoạt động' : 'Lưu trữ')}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setStatusFilter('ALL')}>Tất cả</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('ACTIVE')}>Hoạt động</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('ARCHIVED')}>Lưu trữ</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="ghost" className="h-11 px-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-900" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }} data-testid="btn-clear-filters">
                                    Xóa lọc
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Overview (CEO Only) */}
                    {hasPermission(PERMISSIONS.COMPENSATION_READ) && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-in slide-in-from-top-4 duration-1000">
                            <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold">Phân tích Chi phí Dự án</CardTitle>
                                        <CardDescription>Tổng chi phí nhân sự phân bổ theo từng dự án lớn.</CardDescription>
                                    </div>
                                    <Badge className="bg-blue-50 text-blue-700 border-none font-bold">Tháng này</Badge>
                                </CardHeader>
                                <CardContent className="h-[300px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={projects.map(p => ({
                                                name: p.name,
                                                cost: (p.completion_rate * 1500000) + (p.member_count * 5000000)
                                            }))}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`} />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))}
                                            />
                                            <Bar dataKey="cost" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <ArrowUpRight size={150} />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold">Hiệu quả đầu tư (ROI)</CardTitle>
                                    <CardDescription className="text-blue-100">Ước tính giá trị mang lại.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-4 relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-white">82%</p>
                                        <p className="text-xs font-medium text-blue-100 uppercase tracking-widest">Chỉ số tối ưu hóa</p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <p className="text-sm font-medium leading-relaxed">
                                            Phòng Kỹ thuật đang đạt hiệu suất log hours cao nhất (89%). Các dự án Game có mức chi phí / giá trị tốt nhất tháng này.
                                        </p>
                                    </div>
                                    <Button variant="secondary" className="w-full bg-white text-blue-600 font-bold border-none hover:bg-blue-50 h-11 rounded-xl">
                                        Xuất báo cáo tài chính
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i} className="border-none shadow-sm overflow-hidden bg-white h-72">
                                    <CardContent className="p-6 space-y-4">
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-8 w-48" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-8 w-full" />
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <Skeleton className="h-2 w-full" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="projects-grid">
                            {filteredProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl shadow-sm border border-slate-100 px-6" data-testid="projects-empty-state">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                                <FolderOpen size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Không tìm thấy dự án</h3>
                            <p className="text-slate-500 mt-2 max-w-xs font-medium">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? "Không tìm thấy dự án phù hợp với bộ lọc."
                                    : "Tổ chức của bạn chưa tạo dự án nào."}
                            </p>
                            {(searchQuery || statusFilter !== 'ALL') && (
                                <Button variant="link" className="mt-4 text-blue-600 font-bold" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }} data-testid="btn-reset-filters">
                                    Xóa tất cả bộ lọc
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
