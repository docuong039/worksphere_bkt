'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    ListTodo,
    Plus,
    Search,
    ArrowLeft,
    RefreshCw,
    Calendar,
    Users,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Eye,
    Filter,
    ArrowUpDown,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface Task {
    id: string;
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    due_date: string | null;
    assignees: { id: string; name: string }[];
    estimated_hours: number;
}

interface BulkAssignment {
    taskIds: string[];
    assigneeId: string;
    action: 'ADD' | 'REMOVE' | 'REPLACE';
}

export default function BulkAssignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState('');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

    // Selection
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Assign Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [assignAction, setAssignAction] = useState<'ADD' | 'REMOVE' | 'REPLACE'>('ADD');
    const [selectedMember, setSelectedMember] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            setProjectName('Worksphere Platform');

            // Mock tasks - US-MNG-02-01
            const mockTasks: Task[] = [
                { id: 't1', title: 'Implement authentication flow', status: 'TODO', priority: 'HIGH', due_date: '2025-01-25', assignees: [], estimated_hours: 8 },
                { id: 't2', title: 'Design dashboard mockup', status: 'IN_PROGRESS', priority: 'MEDIUM', due_date: '2025-01-23', assignees: [{ id: 'u1', name: 'Nguyễn Văn A' }], estimated_hours: 6 },
                { id: 't3', title: 'Write API documentation', status: 'TODO', priority: 'LOW', due_date: '2025-02-01', assignees: [], estimated_hours: 4 },
                { id: 't4', title: 'Fix login bug on mobile', status: 'TODO', priority: 'CRITICAL', due_date: '2025-01-22', assignees: [], estimated_hours: 3 },
                { id: 't5', title: 'User profile page', status: 'IN_PROGRESS', priority: 'MEDIUM', due_date: '2025-01-28', assignees: [{ id: 'u2', name: 'Trần Thị B' }], estimated_hours: 10 },
                { id: 't6', title: 'Notification system', status: 'TODO', priority: 'HIGH', due_date: '2025-02-05', assignees: [], estimated_hours: 12 },
                { id: 't7', title: 'Performance optimization', status: 'TODO', priority: 'MEDIUM', due_date: null, assignees: [], estimated_hours: 8 },
                { id: 't8', title: 'Unit tests for auth module', status: 'IN_REVIEW', priority: 'MEDIUM', due_date: '2025-01-24', assignees: [{ id: 'u3', name: 'Lê Văn C' }], estimated_hours: 5 },
            ];

            const mockMembers = [
                { id: 'u1', name: 'Nguyễn Văn A' },
                { id: 'u2', name: 'Trần Thị B' },
                { id: 'u3', name: 'Lê Văn C' },
                { id: 'u4', name: 'Phạm Thị D' },
                { id: 'u5', name: 'Hoàng Văn E' },
            ];

            setTasks(mockTasks);
            setMembers(mockMembers);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
        const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
        return matchSearch && matchStatus && matchPriority;
    });

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedTasks(new Set(filteredTasks.map(t => t.id)));
        } else {
            setSelectedTasks(new Set());
        }
    };

    const handleSelectTask = (taskId: string, checked: boolean) => {
        const newSelected = new Set(selectedTasks);
        if (checked) {
            newSelected.add(taskId);
        } else {
            newSelected.delete(taskId);
        }
        setSelectedTasks(newSelected);
        setSelectAll(newSelected.size === filteredTasks.length);
    };

    const openAssignDialog = () => {
        if (selectedTasks.size === 0) {
            alert('Vui lòng chọn ít nhất một task');
            return;
        }
        setSelectedMember('');
        setAssignAction('ADD');
        setDialogOpen(true);
    };

    const handleBulkAssign = async () => {
        if (!selectedMember) return;
        setIsSubmitting(true);
        try {
            const member = members.find(m => m.id === selectedMember);
            if (!member) return;

            setTasks(tasks.map(t => {
                if (!selectedTasks.has(t.id)) return t;

                let newAssignees = [...t.assignees];
                if (assignAction === 'ADD') {
                    if (!newAssignees.find(a => a.id === member.id)) {
                        newAssignees.push(member);
                    }
                } else if (assignAction === 'REMOVE') {
                    newAssignees = newAssignees.filter(a => a.id !== member.id);
                } else if (assignAction === 'REPLACE') {
                    newAssignees = [member];
                }

                return { ...t, assignees: newAssignees };
            }));

            setDialogOpen(false);
            setSelectedTasks(new Set());
            setSelectAll(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'TODO': return <Badge className="bg-slate-100 text-slate-600">Todo</Badge>;
            case 'IN_PROGRESS': return <Badge className="bg-blue-100 text-blue-600">In Progress</Badge>;
            case 'IN_REVIEW': return <Badge className="bg-purple-100 text-purple-600">Review</Badge>;
            case 'DONE': return <Badge className="bg-emerald-100 text-emerald-600">Done</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return <Badge className="bg-red-100 text-red-600">Critical</Badge>;
            case 'HIGH': return <Badge className="bg-orange-100 text-orange-600">High</Badge>;
            case 'MEDIUM': return <Badge className="bg-amber-100 text-amber-600">Medium</Badge>;
            case 'LOW': return <Badge className="bg-slate-100 text-slate-600">Low</Badge>;
            default: return <Badge variant="outline">{priority}</Badge>;
        }
    };

    const unassignedCount = tasks.filter(t => t.assignees.length === 0).length;

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="bulk-assign-page">
                {/* Header */}
                <div>
                    <Button variant="ghost" asChild className="-ml-4 mb-4 text-slate-500">
                        <Link href={`/projects/${projectId}/overview`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại {projectName}
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                                <Users className="inline-block mr-3 h-8 w-8 text-blue-600" />
                                Phân công hàng loạt
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Assign nhiều task cùng lúc (US-MNG-02-01)
                            </p>
                        </div>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                            onClick={openAssignDialog}
                            disabled={selectedTasks.size === 0}
                            data-testid="btn-bulk-assign"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Phân công ({selectedTasks.size})
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm" data-testid="stat-total">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <ListTodo className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Tổng tasks</p>
                                <p className="text-xl font-bold">{tasks.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-unassigned">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Chưa assign</p>
                                <p className="text-xl font-bold text-amber-600">{unassignedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-selected">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Đã chọn</p>
                                <p className="text-xl font-bold text-blue-600">{selectedTasks.size}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-members">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Thành viên</p>
                                <p className="text-xl font-bold">{members.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-none shadow-sm" data-testid="filters-card">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm task..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                        data-testid="input-search"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]" data-testid="filter-status">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="TODO">Todo</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[140px]" data-testid="filter-priority">
                                    <SelectValue placeholder="Độ ưu tiên" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks List */}
                <Card className="border-none shadow-sm" data-testid="tasks-card">
                    <CardHeader className="border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={selectAll}
                                    onCheckedChange={(checked: boolean) => handleSelectAll(!!checked)}
                                    data-testid="checkbox-select-all"
                                />
                                <span className="font-medium text-slate-900">Chọn tất cả</span>
                            </div>
                            <span className="text-sm text-slate-500">
                                {filteredTasks.length} tasks
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="loading-skeleton">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100" data-testid="tasks-list">
                                {filteredTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors ${selectedTasks.has(task.id) ? 'bg-blue-50/50' : ''}`}
                                        data-testid={`task-row-${task.id}`}
                                    >
                                        <Checkbox
                                            checked={selectedTasks.has(task.id)}
                                            onCheckedChange={(checked: boolean) => handleSelectTask(task.id, !!checked)}
                                            data-testid={`checkbox-${task.id}`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate" data-testid={`task-title-${task.id}`}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getStatusBadge(task.status)}
                                                {getPriorityBadge(task.priority)}
                                                {task.due_date && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {task.due_date}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {task.assignees.length > 0 ? (
                                                <div className="flex -space-x-2">
                                                    {task.assignees.slice(0, 3).map(a => (
                                                        <Avatar key={a.id} className="h-8 w-8 border-2 border-white">
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                                                                {a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                                    Chưa assign
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Assign Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="assign-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Phân công hàng loạt</DialogTitle>
                            <DialogDescription>
                                Assign {selectedTasks.size} tasks đã chọn
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Chọn hành động</label>
                                <Select value={assignAction} onValueChange={(v) => setAssignAction(v as any)}>
                                    <SelectTrigger data-testid="select-action">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADD">Thêm người (ADD)</SelectItem>
                                        <SelectItem value="REMOVE">Gỡ bỏ người (REMOVE)</SelectItem>
                                        <SelectItem value="REPLACE">Thay thế toàn bộ (REPLACE)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Chọn thành viên</label>
                                <Select value={selectedMember} onValueChange={setSelectedMember}>
                                    <SelectTrigger data-testid="select-member">
                                        <SelectValue placeholder="Chọn thành viên..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {members.map(m => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Preview */}
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 mb-2">Xem trước:</p>
                                <p className="text-sm">
                                    {assignAction === 'ADD' && `Thêm người vào ${selectedTasks.size} tasks`}
                                    {assignAction === 'REMOVE' && `Gỡ người khỏi ${selectedTasks.size} tasks`}
                                    {assignAction === 'REPLACE' && `Thay thế assignee của ${selectedTasks.size} tasks`}
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="btn-cancel">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleBulkAssign}
                                disabled={isSubmitting || !selectedMember}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="btn-submit"
                            >
                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                Xác nhận
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
