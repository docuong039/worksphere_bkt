'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Trash2,
    RotateCcw,
    XCircle,
    Search,
    Filter,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    ListTodo,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface DeletedItem {
    id: string;
    type: 'TASK' | 'DOCUMENT' | 'REPORT';
    name: string;
    deleted_at: string;
    deleted_by: string;
    details?: string;
}

export default function ProjectRecycleBinPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<DeletedItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [projectName, setProjectName] = useState('');

    // Confirm Dialog
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'restore' | 'delete'>('restore');
    const [targetItem, setTargetItem] = useState<DeletedItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                setProjectName('Worksphere Platform');
                // Mock data - US-MNG-06-03
                const mockItems: DeletedItem[] = [
                    { id: 't1', type: 'TASK', name: 'Implement legacy feature', deleted_at: '2026-01-20T10:00:00Z', deleted_by: 'Dev Lead', details: 'Trạng thái trước: IN_PROGRESS' },
                    { id: 't2', type: 'TASK', name: 'Bug fix old API', deleted_at: '2026-01-18T15:00:00Z', deleted_by: 'Lê Văn PM', details: 'Đã hoàn thành 50%' },
                    { id: 'd1', type: 'DOCUMENT', name: 'Old Requirements.pdf', deleted_at: '2026-01-15T09:30:00Z', deleted_by: 'Alice Designer', details: 'Size: 1.2MB' },
                    { id: 'r1', type: 'REPORT', name: 'Weekly Progress Q4-2025', deleted_at: '2026-01-10T11:00:00Z', deleted_by: 'Nguyễn Văn A', details: 'Draft version' },
                ];
                setItems(mockItems);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchItems();
    }, [projectId, user]);

    const handleConfirm = async () => {
        if (!targetItem) return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setItems(items.filter(i => i.id !== targetItem.id));
            setConfirmDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkAction = async (action: 'restore' | 'delete') => {
        if (selectedItems.size === 0) return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setItems(items.filter(i => !selectedItems.has(i.id)));
            setSelectedItems(new Set());
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredItems = items.filter(i => {
        const matchSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = typeFilter === 'ALL' || i.type === typeFilter;
        return matchSearch && matchType;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'TASK': return <ListTodo className="h-4 w-4 text-emerald-500" />;
            case 'DOCUMENT': return <FileText className="h-4 w-4 text-blue-500" />;
            case 'REPORT': return <RefreshCw className="h-4 w-4 text-amber-500" />;
            default: return <Trash2 className="h-4 w-4 text-slate-500" />;
        }
    };

    if (!isPM && user) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-32 text-center h-[70vh]">
                    <Trash2 size={48} className="text-slate-200 mb-6" />
                    <h2 className="text-2xl font-black text-slate-900">Truy cập bị hạn chế</h2>
                    <p className="text-slate-500 mt-2 max-w-xs font-medium">Chỉ Quản lý dự án mới có thể truy cập thùng rác của dự án.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700" data-testid="project-recycle-bin-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                    <div className="space-y-2">
                        <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900 mb-2">
                            <Link href={`/projects/${projectId}/overview`}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại Dự án
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight" data-testid="project-recycle-bin-title">
                            Thùng rác Dự án
                        </h1>
                        <p className="text-slate-500 font-medium">Quản lý và khôi phục các mục đã xóa trong {projectName}.</p>
                    </div>

                    <div className="flex gap-3">
                        {selectedItems.size > 0 && (
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 font-bold shadow-lg shadow-emerald-100"
                                onClick={() => handleBulkAction('restore')}
                                data-testid="btn-bulk-restore"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" /> Khôi phục ({selectedItems.size})
                            </Button>
                        )}
                        <Button variant="outline" className="h-11 px-6 font-bold border-slate-200" onClick={() => window.location.reload()}>
                            <RefreshCw size={16} className="mr-2" /> Làm mới
                        </Button>
                    </div>
                </div>

                {/* Filters Row */}
                <Card className="border-none shadow-sm bg-white mb-6">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input
                                placeholder="Tìm theo tên mục đã xóa..."
                                className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                data-testid="recycle-search-input"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button
                                variant={typeFilter === 'TASK' ? 'default' : 'outline'}
                                className={cn("rounded-xl font-bold h-11", typeFilter === 'TASK' && "bg-blue-600")}
                                onClick={() => setTypeFilter(typeFilter === 'TASK' ? 'ALL' : 'TASK')}
                            >
                                <ListTodo size={14} className="mr-2" /> Tasks
                            </Button>
                            <Button
                                variant={typeFilter === 'DOCUMENT' ? 'default' : 'outline'}
                                className={cn("rounded-xl font-bold h-11", typeFilter === 'DOCUMENT' && "bg-blue-600")}
                                onClick={() => setTypeFilter(typeFilter === 'DOCUMENT' ? 'ALL' : 'DOCUMENT')}
                            >
                                <FileText size={14} className="mr-2" /> Documents
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-none shadow-sm bg-white overflow-hidden" data-testid="recycle-bin-card">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                    <TableHead className="w-12 px-6">
                                        <Checkbox
                                            checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedItems(new Set(filteredItems.map(i => i.id)));
                                                else setSelectedItems(new Set());
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Tên mục</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Loại</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Ngày xóa</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Xóa bởi</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4 text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="px-6 py-4"><Skeleton className="h-4 w-4" /></TableCell>
                                            <TableCell className="px-6 py-4"><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 rounded-lg ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors group" data-testid={`recycle-row-${item.id}`}>
                                            <TableCell className="px-6 py-4">
                                                <Checkbox
                                                    checked={selectedItems.has(item.id)}
                                                    onCheckedChange={(checked) => {
                                                        const fresh = new Set(selectedItems);
                                                        if (checked) fresh.add(item.id);
                                                        else fresh.delete(item.id);
                                                        setSelectedItems(fresh);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                        {getTypeIcon(item.type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-none mb-1">{item.name}</p>
                                                        <p className="text-[10px] font-medium text-slate-400">{item.details}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge variant="secondary" className="text-[10px] font-black tracking-tighter bg-slate-100 text-slate-600 border-none uppercase px-2 py-0.5">
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm font-medium text-slate-500">
                                                {new Date(item.deleted_at).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm font-medium text-slate-500">
                                                {item.deleted_by}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-emerald-600 font-bold hover:bg-emerald-50 h-8"
                                                        onClick={() => {
                                                            setConfirmAction('restore');
                                                            setTargetItem(item);
                                                            setConfirmDialogOpen(true);
                                                        }}
                                                        data-testid={`btn-restore-${item.id}`}
                                                    >
                                                        <RotateCcw size={14} className="mr-1" /> Khôi phục
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-rose-600 font-bold hover:bg-rose-50 h-8"
                                                        onClick={() => {
                                                            setConfirmAction('delete');
                                                            setTargetItem(item);
                                                            setConfirmDialogOpen(true);
                                                        }}
                                                        data-testid={`btn-delete-${item.id}`}
                                                    >
                                                        <XCircle size={14} className="mr-1" /> Xóa hẳn
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <CheckCircle2 size={48} className="text-emerald-100 mb-4" />
                                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Thùng rác trống</p>
                                                <p className="text-xs text-slate-400 mt-1">Sạch sẽ như mới!</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Info Note */}
                <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-4 items-start">
                    <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={20} />
                    <div className="text-xs font-semibold text-blue-800/80 leading-relaxed">
                        <p className="font-black text-blue-900 uppercase tracking-widest mb-2">Chính sách lưu trữ</p>
                        <p>Các mục đã xóa sẽ được lưu trong thùng rác tối đa <span className="text-blue-900 font-black">30 ngày</span> trước khi hệ thống xóa vĩnh viễn.</p>
                        <p className="mt-1">Khi khôi phục một công việc, mọi thuộc tính, bình luận và nhật ký thời gian liên quan sẽ được phục hồi lại trạng thái trước khi bị xóa.</p>
                    </div>
                </div>

                {/* Confirm Dialog */}
                <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="recycle-confirm-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {confirmAction === 'restore' ? 'Xác nhận khôi phục' : 'Xác nhận xóa vĩnh viễn'}
                            </DialogTitle>
                            <DialogDescription>
                                {confirmAction === 'restore'
                                    ? `Mục "${targetItem?.name}" sẽ được quay trở lại vị trí ban đầu.`
                                    : `Hành động này không thể hoàn tác. Mục "${targetItem?.name}" sẽ biến mất mãi mãi.`
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button variant="ghost" className="font-bold" onClick={() => setConfirmDialogOpen(false)}>Hủy</Button>
                            <Button
                                className={cn("font-bold px-6", confirmAction === 'restore' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700")}
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                data-testid="recycle-confirm-btn"
                            >
                                {isSubmitting ? <RefreshCw className="animate-spin h-4 w-4" /> : 'Xác nhận'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
