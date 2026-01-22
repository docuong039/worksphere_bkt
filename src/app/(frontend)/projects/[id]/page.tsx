'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Search, Filter, Plus, Calendar,
    User, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProjectTasksPage() {
    const params = useParams();
    const projectId = params.id;
    const [loading, setLoading] = useState(false); // Simulate loading
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data for UI Check
    const tasks = [
        { id: 'T-001', title: 'Thiết kế Database Schema Phase 2', assignee: 'Nguyễn Văn A', status: 'IN_PROGRESS', priority: 'HIGH', due: '2024-02-20' },
        { id: 'T-002', title: 'API Phân quyền RBAC', assignee: 'Trần Thị B', status: 'TODO', priority: 'CRITICAL', due: '2024-02-22' },
        { id: 'T-003', title: 'UI Màn hình Dashboard', assignee: 'Lê Văn C', status: 'DONE', priority: 'MEDIUM', due: '2024-02-15' },
    ];

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-500" data-testid="project-tasks-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900" data-testid="project-tasks-title">
                            Danh sách công việc
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Quản lý, theo dõi và phân công nhiệm vụ trong dự án.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/projects/${projectId}/import-export`}>
                            <Button variant="outline" size="sm" data-testid="btn-import-export">
                                Import/Export
                            </Button>
                        </Link>
                        <Button className="bg-blue-600 hover:bg-blue-700" size="sm" asChild data-testid="btn-create-task">
                            <Link href={`/tasks/new?projectId=${projectId}`}>
                                <Plus className="mr-2 h-4 w-4" /> Thêm mới Task
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="shadow-sm border-slate-200" data-testid="project-tasks-filters-card">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                placeholder="Tìm kiếm task theo tên, ID..."
                                className="pl-9 h-10 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                data-testid="project-tasks-input-search"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button variant="outline" size="sm" className="h-10 border-dashed" data-testid="filter-status">
                                <Filter className="mr-2 h-4 w-4 text-slate-500" /> Trạng thái
                            </Button>
                            <Button variant="outline" size="sm" className="h-10 border-dashed" data-testid="filter-assignee">
                                <User className="mr-2 h-4 w-4 text-slate-500" /> Người thực hiện
                            </Button>
                            <Button variant="outline" size="sm" className="h-10 border-dashed" data-testid="filter-priority">
                                <AlertCircle className="mr-2 h-4 w-4 text-slate-500" /> Độ ưu tiên
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Grid/List */}
                {loading ? (
                    <div className="space-y-4" data-testid="project-tasks-loading-skeleton">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" data-testid="project-tasks-list">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Mã Task</th>
                                        <th className="px-6 py-4">Tên công việc</th>
                                        <th className="px-6 py-4">Người thực hiện</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4">Ưu tiên</th>
                                        <th className="px-6 py-4">Hạn chót</th>
                                        <th className="px-6 py-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-slate-500">{task.id}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 font-bold">
                                                        {task.assignee.charAt(0)}
                                                    </div>
                                                    {task.assignee}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={task.status === 'DONE' ? 'default' : 'secondary'} className={task.status === 'DONE' ? 'bg-green-600' : ''}>
                                                    {task.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={task.priority === 'CRITICAL' ? 'text-red-600 border-red-200 bg-red-50' : ''}>
                                                    {task.priority}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> {task.due}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="sm" variant="ghost" asChild data-testid={`btn-view-task-${task.id}`}>
                                                    <Link href={`/tasks/${task.id}`}>Chi tiết</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {tasks.length === 0 && (
                            <div className="p-12 text-center text-slate-500" data-testid="project-tasks-empty-state">
                                <p>Chưa có công việc nào trong dự án này.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
