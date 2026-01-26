/**
 * Recycle Bin Page - Thùng rác
 * 
 * User Stories:
 * - US-EMP-06-01: EMP xem danh sách các mục đã xóa của mình
 * - US-EMP-06-02: EMP khôi phục hoặc xóa vĩnh viễn các mục
 * - US-MNG-08-01: PM xem các mục đã xóa trong dự án
 * - US-MNG-08-02: PM khôi phục hoặc xóa vĩnh viễn
 * - US-MNG-08-03: Giới hạn thời gian lưu trữ 30 ngày
 * - US-CEO-06-01: CEO xem toàn bộ thùng rác của công ty
 * - US-CEO-06-02: CEO khôi phục hoặc xóa vĩnh viễn
 * 
 * Access:
 * - EMP: deleted_by = current_user
 * - PM: items in managed projects
 * - CEO: all items in org
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Trash2,
    RotateCcw,
    AlertTriangle,
    Clock,
    FileText,
    CheckSquare,
    FolderOpen,
    File,
    Loader2,
    Trash,
    User,
    Users,
    BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AppLayout from '@/components/layout/AppLayout';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RecycleBinItem {
    id: string;
    entity_type: 'TASK' | 'SUBTASK' | 'PROJECT' | 'DOCUMENT' | 'USER' | 'REPORT';
    entity_id: string;
    entity_title: string;
    deleted_at: string;
    deleted_by: { id: string; full_name: string };
    project: { id: string; name: string } | null;
    days_remaining: number;
    details?: string;
    is_locked?: boolean;
}

const ENTITY_TYPES = {
    TASK: { label: 'Task', icon: FileText, color: 'text-blue-600' },
    SUBTASK: { label: 'Subtask', icon: CheckSquare, color: 'text-green-600' },
    PROJECT: { label: 'Project', icon: FolderOpen, color: 'text-purple-600' },
    DOCUMENT: { label: 'Tài liệu', icon: File, color: 'text-amber-600' },
    USER: { label: 'Thành viên', icon: User, color: 'text-indigo-600' },
    REPORT: { label: 'Báo cáo', icon: BarChart3, color: 'text-rose-600' },
};

// Recycle Bin Item Component
const RecycleBinItemCard = ({
    item,
    isSelected,
    onSelect,
    onRestore,
    onDelete,
    canDestroy
}: {
    item: RecycleBinItem;
    isSelected: boolean;
    onSelect: (checked: boolean) => void;
    onRestore: () => void;
    onDelete: () => void;
    canDestroy: boolean;
}) => {
    const typeConfig = ENTITY_TYPES[item.entity_type] || ENTITY_TYPES.TASK;
    const Icon = typeConfig.icon;
    const isExpiringSoon = item.days_remaining <= 3;

    return (
        <Card
            className={cn(
                "border-none shadow-sm hover:shadow-md transition-all",
                isSelected && "ring-2 ring-blue-400"
            )}
            data-testid={`recycle-item-${item.id}`}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onSelect}
                        className="mt-1"
                        data-testid={`checkbox-${item.id}`}
                    />

                    {/* Icon */}
                    <div className={cn("p-2 rounded-lg bg-slate-100", typeConfig.color)}>
                        <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs font-bold">
                                {typeConfig.label}
                            </Badge>
                            {isExpiringSoon && (
                                <Badge className="text-xs font-bold bg-red-100 text-red-700 border-none">
                                    <AlertTriangle size={10} className="mr-1" />
                                    Sắp xóa
                                </Badge>
                            )}
                        </div>

                        <h3 className="font-bold text-slate-900 line-clamp-1">
                            {item.entity_title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                            {item.project && (
                                <span>📁 {item.project.name}</span>
                            )}
                            <span className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-[8px]">
                                        {item.deleted_by.full_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {item.deleted_by.full_name}
                            </span>
                            <span>
                                {new Date(item.deleted_at).toLocaleDateString('vi-VN')}
                            </span>
                            <span className={cn(
                                "font-medium",
                                isExpiringSoon ? "text-red-600" : "text-slate-400"
                            )}>
                                <Clock size={12} className="inline mr-1" />
                                Còn {item.days_remaining} ngày
                            </span>
                            {item.details && (
                                <span className="text-slate-400 italic">({item.details})</span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRestore}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            data-testid={`btn-restore-${item.id}`}
                        >
                            <RotateCcw size={14} className="mr-1" />
                            Khôi phục
                        </Button>
                        {canDestroy && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onDelete}
                                disabled={item.is_locked}
                                className={cn(
                                    "text-red-600 hover:text-red-700 hover:bg-red-50",
                                    item.is_locked && "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200"
                                )}
                                title={item.is_locked ? "KHÔNG THỂ XÓA: Mục này đang chứa dữ liệu quan trọng hoặc đã được khóa để đối soát." : "Xóa vĩnh viễn"}
                                data-testid={`btn-delete-${item.id}`}
                            >
                                <Trash2 size={14} className="mr-1" />
                                {item.is_locked ? "Bị khóa" : "Xóa"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Main Page Component
export default function RecycleBinPage() {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<RecycleBinItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filterType, setFilterType] = useState('ALL');
    const [isProcessing, setIsProcessing] = useState(false);

    const canDestroy = user?.role !== 'EMPLOYEE';

    // Dialogs
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [emptyDialogOpen, setEmptyDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Filters for CEO/MNG
    const [selectedProject, setSelectedProject] = useState('ALL');
    const [selectedActor, setSelectedActor] = useState('ALL');
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    const isManager = user?.role === 'CEO' || user?.role === 'ORG_ADMIN' || user?.role === 'PROJECT_MANAGER';

    // Fetch recycle bin items
    const fetchItems = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType !== 'ALL') params.append('entity_type', filterType);
            if (selectedProject !== 'ALL') params.append('project_id', selectedProject);
            if (selectedActor !== 'ALL') params.append('actor_id', selectedActor);

            const res = await fetch(`/api/recycle-bin?${params.toString()}`, {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setItems(data.data || []);
        } catch (error) {
            console.error('Error fetching recycle bin:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchItems();
    }, [user, filterType, selectedProject, selectedActor]);

    useEffect(() => {
        if (user && isManager) {
            // Fetch projects and users for filters
            fetch('/api/projects', { headers: { 'x-user-id': user.id } })
                .then(res => res.json())
                .then(data => setProjects(data.data || []));

            fetch('/api/admin/users', { headers: { 'x-user-id': user.id } })
                .then(res => res.json())
                .then(data => setUsers(data.data || []));
        }
    }, [user]);

    // Toggle selection
    const toggleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    // Select all
    const selectAll = () => {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(i => i.id));
        }
    };

    // Restore item
    const handleRestore = async (id: string) => {
        setIsProcessing(true);
        try {
            await fetch(`/api/recycle-bin/${id}/restore`, {
                method: 'POST',
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            setItems(prev => prev.filter(i => i.id !== id));
            setSelectedIds(prev => prev.filter(i => i !== id));
            toast({
                title: 'Khôi phục thành công',
                description: 'Mục đã được đưa về vị trí cũ.',
                variant: 'success'
            });
        } catch (error) {
            console.error('Error restoring item:', error);
            toast({
                title: 'Lỗi khôi phục',
                description: 'Không thể khôi phục mục này. Vui lòng thử lại.',
                variant: 'destructive'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Delete item permanently
    const handleDelete = async (id: string) => {
        setIsProcessing(true);
        try {
            await fetch(`/api/recycle-bin/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            setItems(prev => prev.filter(i => i.id !== id));
            setSelectedIds(prev => prev.filter(i => i !== id));
            toast({
                title: 'Đã xóa vĩnh viễn',
                description: 'Dữ liệu đã được gỡ bỏ khỏi hệ thống.',
                variant: 'success'
            });
        } catch (error) {
            console.error('Error deleting item:', error);
            toast({
                title: 'Lỗi khi xóa',
                description: 'Không thể xóa mục này vĩnh viễn.',
                variant: 'destructive'
            });
        } finally {
            setIsProcessing(false);
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    // Empty all
    const handleEmptyAll = async () => {
        setIsProcessing(true);
        try {
            await fetch('/api/recycle-bin/empty', {
                method: 'DELETE',
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            setItems([]);
            setSelectedIds([]);
        } catch (error) {
            console.error('Error emptying recycle bin:', error);
        } finally {
            setIsProcessing(false);
            setEmptyDialogOpen(false);
        }
    };

    // Open delete confirmation
    const openDeleteConfirm = (id: string) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    return (
        <AppLayout>
            <PermissionGuard permission={PERMISSIONS.RECYCLE_BIN_READ} showFullPageError>
                <div className="space-y-6 animate-in fade-in duration-700" data-testid="recycle-bin-container">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="recycle-bin-title">
                                <Trash2 className="inline-block mr-2 h-8 w-8 text-slate-600" />
                                {user?.role === 'CEO' ? 'Lưới an toàn dữ liệu' : 'Thùng rác'}
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                {user?.role === 'CEO'
                                    ? 'Giám sát việc hủy bỏ tài nguyên và khôi phục thông tin quan trọng của toàn công ty.'
                                    : 'Các mục đã xóa được giữ trong 30 ngày trước khi xóa vĩnh viễn.'}
                            </p>
                        </div>

                        {items.length > 0 && canDestroy && (
                            <Button
                                variant="destructive"
                                onClick={() => setEmptyDialogOpen(true)}
                                data-testid="btn-empty-all"
                            >
                                <Trash className="mr-2 h-4 w-4" /> Làm trống
                            </Button>
                        )}
                    </div>

                    {/* Filters */}
                    <Card className="border-none shadow-sm" data-testid="recycle-filters">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="w-[140px]" data-testid="recycle-bin-filter-type">
                                            <SelectValue placeholder="Loại" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tất cả loại</SelectItem>
                                            {Object.entries(ENTITY_TYPES).map(([code, config]) => (
                                                <SelectItem key={code} value={code}>
                                                    {config.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {isManager && (
                                        <>
                                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                                <SelectTrigger className="w-[160px]" data-testid="recycle-bin-filter-project">
                                                    <SelectValue placeholder="Dự án" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">Mọi dự án</SelectItem>
                                                    {projects.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select value={selectedActor} onValueChange={setSelectedActor}>
                                                <SelectTrigger className="w-[160px]" data-testid="recycle-bin-filter-actor">
                                                    <SelectValue placeholder="Người xóa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">Mọi người</SelectItem>
                                                    {users.map(u => (
                                                        <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </>
                                    )}

                                    {items.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={selectAll}
                                            data-testid="btn-select-all"
                                        >
                                            {selectedIds.length === items.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-amber-600">
                                    <AlertTriangle size={16} />
                                    <span>Giữ 30 ngày trước khi xóa vĩnh viễn</span>
                                </div>
                            </div>

                            {/* Bulk Actions */}
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-3 mt-4 p-3 bg-slate-50 rounded-lg" data-testid="bulk-actions">
                                    <span className="text-sm font-medium text-slate-600">
                                        Đã chọn {selectedIds.length} mục
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => selectedIds.forEach(id => handleRestore(id))}
                                        disabled={isProcessing}
                                        data-testid="btn-bulk-restore"
                                    >
                                        <RotateCcw size={14} className="mr-1" />
                                        Khôi phục đã chọn
                                    </Button>
                                    {canDestroy && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600"
                                            onClick={() => setDeleteDialogOpen(true)}
                                            disabled={isProcessing}
                                            data-testid="btn-bulk-delete"
                                        >
                                            <Trash2 size={14} className="mr-1" />
                                            Xóa đã chọn
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items List */}
                    {loading ? (
                        <div className="space-y-4" data-testid="recycle-loading">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : items.length > 0 ? (
                        <div className="space-y-3" data-testid="recycle-list">
                            {items.map((item) => (
                                <RecycleBinItemCard
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedIds.includes(item.id)}
                                    onSelect={(checked) => toggleSelect(item.id, checked)}
                                    onRestore={() => handleRestore(item.id)}
                                    onDelete={() => openDeleteConfirm(item.id)}
                                    canDestroy={canDestroy}
                                />
                            ))}
                            <p className="text-sm text-slate-400 text-center pt-4">
                                Hiển thị {items.length} mục
                            </p>
                        </div>
                    ) : (
                        <Card className="border-none shadow-sm" data-testid="recycle-empty">
                            <CardContent className="py-16 text-center">
                                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                    <Trash2 className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    Thùng rác trống
                                </h3>
                                <p className="text-slate-500">
                                    Các mục đã xóa sẽ xuất hiện ở đây.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogContent data-testid="dialog-confirm-delete">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa vĩnh viễn</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel data-testid="btn-cancel-delete">Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => itemToDelete && handleDelete(itemToDelete)}
                                    className="bg-red-600 hover:bg-red-700"
                                    data-testid="btn-confirm-delete"
                                >
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xóa vĩnh viễn'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Empty All Dialog */}
                    <AlertDialog open={emptyDialogOpen} onOpenChange={setEmptyDialogOpen}>
                        <AlertDialogContent data-testid="dialog-confirm-empty">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Làm trống thùng rác?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tất cả {items.length} mục sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel data-testid="btn-cancel-empty">Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleEmptyAll}
                                    className="bg-red-600 hover:bg-red-700"
                                    data-testid="btn-confirm-empty"
                                >
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Làm trống'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
