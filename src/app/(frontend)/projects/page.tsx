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
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';

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
}

const ProjectCard = ({ project }: { project: Project }) => {
    return (
        <Card
            className="group hover:shadow-xl transition-all duration-300 border-none shadow-sm overflow-hidden bg-white"
            data-testid={`project-card-${project.code.toLowerCase()}`}
        >
            <CardContent className="p-0">
                <Link href={`/projects/${project.id}/overview`} className="block p-6">
                    <div className="flex justify-between items-start mb-4">
                        <Badge
                            variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className={project.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none px-3" : ""}
                            data-testid={`project-status-${project.code.toLowerCase()}`}
                        >
                            {project.status === 'ACTIVE' ? 'Hoạt động' : 'Lưu trữ'}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                    <MoreVertical size={18} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                                <DropdownMenuItem>Lưu trữ dự án</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Xóa dự án</DropdownMenuItem>
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
    const { user } = useAuthStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const canCreateProject = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';

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
            <div className="space-y-8 animate-in fade-in duration-700" data-testid="projects-page-container">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="projects-page-title">
                            Dự án
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Quản lý và theo dõi các dự án của tổ chức.
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
        </AppLayout>
    );
}
