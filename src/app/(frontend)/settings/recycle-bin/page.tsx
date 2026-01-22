'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Trash2,
    RotateCcw,
    Search,
    Users,
    FolderKanban,
    FileText,
    ListTodo,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Filter,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface DeletedItem {
    id: string;
    type: 'USER' | 'PROJECT' | 'TASK' | 'REPORT';
    name: string;
    deleted_at: string;
    deleted_by: string;
    can_restore: boolean;
    details?: string;
}

export default function OrgRecycleBinPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<DeletedItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Confirm Dialog
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'restore' | 'delete'>('restore');
    const [targetItem, setTargetItem] = useState<DeletedItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            // Mock data - US-ORG-04, US-CEO-06
            const mockItems: DeletedItem[] = [
                { id: 'u1', type: 'USER', name: 'Nguyễn Văn Former', deleted_at: '2025-01-15T10:00:00Z', deleted_by: 'Admin', can_restore: true, details: 'former@company.com' },
                { id: 'u2', type: 'USER', name: 'Trần Thị Left', deleted_at: '2025-01-10T14:00:00Z', deleted_by: 'Admin', can_restore: true, details: 'left@company.com' },
                { id: 'p1', type: 'PROJECT', name: 'Old Website Project', deleted_at: '2025-01-12T09:00:00Z', deleted_by: 'PM Manager', can_restore: true, details: '45 tasks' },
                { id: 'p2', type: 'PROJECT', name: 'Canceled Campaign', deleted_at: '2024-12-20T16:00:00Z', deleted_by: 'CEO', can_restore: true, details: '12 tasks' },
                { id: 't1', type: 'TASK', name: 'Implement legacy feature', deleted_at: '2025-01-18T11:00:00Z', deleted_by: 'Dev Lead', can_restore: true, details: 'Project: Old Website' },
                { id: 't2', type: 'TASK', name: 'Bug fix deprecated API', deleted_at: '2025-01-17T15:00:00Z', deleted_by: 'Dev Lead', can_restore: true, details: 'Project: Backend Core' },
                { id: 'r1', type: 'REPORT', name: 'Q3 Performance Report', deleted_at: '2025-01-05T08:00:00Z', deleted_by: 'HR Manager', can_restore: true, details: 'By: Nguyễn Văn A' },
            ];
            setItems(mockItems);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openConfirmDialog = (action: 'restore' | 'delete', item: DeletedItem) => {
        setConfirmAction(action);
        setTargetItem(item);
        setConfirmDialogOpen(true);
    };

    const handleConfirm = async () => {
        if (!targetItem) return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (confirmAction === 'restore') {
                setItems(items.filter(i => i.id !== targetItem.id));
            } else {
                setItems(items.filter(i => i.id !== targetItem.id));
            }
            setConfirmDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkRestore = () => {
        if (selectedItems.size === 0) return;
        setItems(items.filter(i => !selectedItems.has(i.id)));
        setSelectedItems(new Set());
    };

    const handleSelectItem = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedItems);
        if (checked) newSelected.add(id);
        else newSelected.delete(id);
        setSelectedItems(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(new Set(filteredItems.map(i => i.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'USER': return <Users className="h-4 w-4 text-blue-500" />;
            case 'PROJECT': return <FolderKanban className="h-4 w-4 text-purple-500" />;
            case 'TASK': return <ListTodo className="h-4 w-4 text-emerald-500" />;
            case 'REPORT': return <FileText className="h-4 w-4 text-amber-500" />;
            default: return <Trash2 className="h-4 w-4 text-slate-500" />;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'USER': return <Badge className="bg-blue-100 text-blue-700">User</Badge>;
            case 'PROJECT': return <Badge className="bg-purple-100 text-purple-700">Project</Badge>;
            case 'TASK': return <Badge className="bg-emerald-100 text-emerald-700">Task</Badge>;
            case 'REPORT': return <Badge className="bg-amber-100 text-amber-700">Report</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    const filteredItems = items.filter(i => {
        const matchSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = typeFilter === 'ALL' || i.type === typeFilter;
        return matchSearch && matchType;
    });

    const stats = {
        users: items.filter(i => i.type === 'USER').length,
        projects: items.filter(i => i.type === 'PROJECT').length,
        tasks: items.filter(i => i.type === 'TASK').length,
        reports: items.filter(i => i.type === 'REPORT').length,
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="org-recycle-bin-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="settings-recycle-page-title">
                            <Trash2 className="inline-block mr-3 h-8 w-8 text-slate-600" />
                            Thùng rác Tổ chức
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Xem và khôi phục dữ liệu đã xóa (US-ORG-04, US-CEO-06)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedItems.size > 0 && (
                            <Button
                                onClick={handleBulkRestore}
                                className="bg-emerald-600 hover:bg-emerald-700"
                                data-testid="btn-bulk-restore"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Khôi phục ({selectedItems.size})
                            </Button>
                        )}
                        <Button variant="outline" onClick={fetchItems} data-testid="settings-recycle-btn-refresh">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Tabs */}
                <div className="grid grid-cols-4 gap-4">
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${typeFilter === 'USER' ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'USER' ? 'ALL' : 'USER')}
                        data-testid="settings-recycle-stat-users"
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Users</p>
                                <p className="text-xl font-bold">{stats.users}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${typeFilter === 'PROJECT' ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'PROJECT' ? 'ALL' : 'PROJECT')}
                        data-testid="settings-recycle-stat-projects"
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <FolderKanban className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Projects</p>
                                <p className="text-xl font-bold">{stats.projects}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${typeFilter === 'TASK' ? 'ring-2 ring-emerald-500' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'TASK' ? 'ALL' : 'TASK')}
                        data-testid="stat-tasks"
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <ListTodo className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Tasks</p>
                                <p className="text-xl font-bold">{stats.tasks}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${typeFilter === 'REPORT' ? 'ring-2 ring-amber-500' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'REPORT' ? 'ALL' : 'REPORT')}
                        data-testid="stat-reports"
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Reports</p>
                                <p className="text-xl font-bold">{stats.reports}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card className="border-none shadow-sm" data-testid="settings-recycle-search-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Tìm kiếm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                    data-testid="settings-recycle-input-search"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => { setTypeFilter('ALL'); setSearchQuery(''); }}
                                data-testid="btn-clear-filter"
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Items Table */}
                <Card className="border-none shadow-sm" data-testid="items-card">
                    <CardHeader className="border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                                onCheckedChange={(checked: boolean) => handleSelectAll(!!checked)}
                                data-testid="checkbox-select-all"
                            />
                            <CardTitle className="text-lg font-bold">
                                Danh sách đã xóa ({filteredItems.length})
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="settings-recycle-loading-skeleton">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <Table data-testid="items-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="w-10"></TableHead>
                                        <TableHead className="font-bold">Tên</TableHead>
                                        <TableHead className="font-bold">Loại</TableHead>
                                        <TableHead className="font-bold">Ngày xóa</TableHead>
                                        <TableHead className="font-bold">Xóa bởi</TableHead>
                                        <TableHead className="text-right font-bold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map(item => (
                                        <TableRow key={item.id} data-testid={`item-row-${item.id}`}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedItems.has(item.id)}
                                                    onCheckedChange={(checked: boolean) => handleSelectItem(item.id, !!checked)}
                                                    data-testid={`checkbox-${item.id}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(item.type)}
                                                    <div>
                                                        <p className="font-medium" data-testid={`item-name-${item.id}`}>{item.name}</p>
                                                        {item.details && (
                                                            <p className="text-xs text-slate-400">{item.details}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getTypeBadge(item.type)}</TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {new Date(item.deleted_at).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">{item.deleted_by}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openConfirmDialog('restore', item)}
                                                        className="text-emerald-600"
                                                        data-testid={`btn-restore-${item.id}`}
                                                    >
                                                        <RotateCcw className="mr-1 h-3 w-3" />
                                                        Khôi phục
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openConfirmDialog('delete', item)}
                                                        className="text-red-600"
                                                        data-testid={`btn-delete-${item.id}`}
                                                    >
                                                        <XCircle className="mr-1 h-3 w-3" />
                                                        Xóa vĩnh viễn
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-12 text-center" data-testid="settings-recycle-empty-state">
                                <CheckCircle2 className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Thùng rác trống</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Confirm Dialog */}
                <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="confirm-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                {confirmAction === 'restore' ? (
                                    <RotateCcw className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                )}
                                {confirmAction === 'restore' ? 'Xác nhận khôi phục' : 'Xác nhận xóa vĩnh viễn'}
                            </DialogTitle>
                            <DialogDescription>
                                {confirmAction === 'restore'
                                    ? `Bạn có chắc muốn khôi phục "${targetItem?.name}"?`
                                    : `Bạn có chắc muốn xóa vĩnh viễn "${targetItem?.name}"? Hành động này không thể hoàn tác.`
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} data-testid="settings-recycle-btn-cancel">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                className={confirmAction === 'restore' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                                data-testid="btn-confirm"
                            >
                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                {confirmAction === 'restore' ? 'Khôi phục' : 'Xóa vĩnh viễn'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
