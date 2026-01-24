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
            <div className="flex flex-col items-center justify-center py-32 text-center h-[70vh]">
                <Trash2 size={48} className="text-slate-200 mb-6" />
                <h2 className="text-2xl font-black text-slate-900">Truy cập bị hạn chế</h2>
                <p className="text-slate-500 mt-2 max-w-xs font-medium">Chỉ Quản lý dự án mới có thể truy cập thùng rác của dự án.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700" data-testid="project-recycle-bin-container">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight" data-testid="project-recycle-bin-title">
                        Thùng rác Dự án
                    </h2>
                </div>

                <div className="flex gap-3">
                    {selectedItems.size > 0 && (
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 font-bold shadow-lg shadow-emerald-100"
                            onClick={() => handleBulkAction('restore')}
                            size="sm"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" /> Khôi phục ({selectedItems.size})
                        </Button>
                    )}
                    <Button variant="outline" className="h-9 px-6 font-bold border-slate-200" onClick={() => window.location.reload()} size="sm">
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
                            data-testid="recycle-bin-search-input"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-none shadow-sm bg-white overflow-hidden" data-testid="recycle-bin-card">
                <CardContent className="p-0">
                    <Table data-testid="recycle-bin-table">
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="w-12 px-6">
                                    <Checkbox
                                        checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedItems(new Set(filteredItems.map(i => i.id)));
                                            else setSelectedItems(new Set());
                                        }}
                                        data-testid="recycle-bin-select-all"
                                    />
                                </TableHead>
                                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Tên mục</TableHead>
                                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Loại</TableHead>
                                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4 text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i} data-testid="recycle-bin-loading-skeleton">
                                        <TableCell className="px-6 py-4"><Skeleton className="h-4 w-4" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 rounded-lg ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors group" data-testid={`recycle-bin-row-${item.id}`}>
                                        <TableCell className="px-6 py-4">
                                            <Checkbox
                                                checked={selectedItems.has(item.id)}
                                                onCheckedChange={(checked) => {
                                                    const fresh = new Set(selectedItems);
                                                    if (checked) fresh.add(item.id);
                                                    else fresh.delete(item.id);
                                                    setSelectedItems(fresh);
                                                }}
                                                data-testid={`recycle-bin-select-${item.id}`}
                                            />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                    {getTypeIcon(item.type)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-none mb-1" data-testid={`recycle-bin-name-${item.id}`}>{item.name}</p>
                                                    <p className="text-[10px] font-medium text-slate-400">{item.details}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge variant="secondary" className="text-[10px] font-black tracking-tighter bg-slate-100 text-slate-600 border-none uppercase px-2 py-0.5" data-testid={`recycle-bin-type-${item.id}`}>
                                                {item.type}
                                            </Badge>
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
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow data-testid="recycle-bin-empty-state">
                                    <TableCell colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <CheckCircle2 size={48} className="text-emerald-100 mb-4" />
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Thùng rác trống</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Confirm Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent data-testid="confirm-dialog">
                    <DialogHeader>
                        <DialogTitle>{confirmAction === 'restore' ? 'Xác nhận khôi phục' : 'Xác nhận xóa vĩnh viễn'}</DialogTitle>
                        <DialogDescription data-testid="confirm-dialog-description">
                            {confirmAction === 'restore'
                                ? `Mục "${targetItem?.name}" sẽ được quay trở lại vị trí ban đầu.`
                                : `Hành động này không thể hoàn tác.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setConfirmDialogOpen(false)} data-testid="btn-cancel">Hủy</Button>
                        <Button
                            className={cn("font-bold px-6", confirmAction === 'restore' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700")}
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            data-testid="btn-confirm"
                        >
                            {isSubmitting ? <RefreshCw className="animate-spin h-4 w-4" /> : 'Xác nhận'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
