'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Trash2,
    Building2,
    Users,
    MoreVertical,
    RefreshCw,
    RotateCcw,
    AlertTriangle,
    XCircle,
    Search,
    FolderKanban,
    CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DeletedOrg {
    id: string;
    name: string;
    slug: string;
    user_count: number;
    project_count: number;
    deleted_at: string;
    deleted_by_name: string;
    delete_reason?: string;
    retention_deadline: string;
}

export default function DeletedOrgsPage() {
    const [orgs, setOrgs] = useState<DeletedOrg[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Dialogs
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<DeletedOrg | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchDeletedOrgs();
    }, []);

    const fetchDeletedOrgs = async () => {
        setLoading(true);
        try {
            // Mock data - US-SYS-03
            const mockOrgs: DeletedOrg[] = [
                {
                    id: 'org-d1',
                    name: 'Defunct Corp',
                    slug: 'defunct-corp',
                    user_count: 25,
                    project_count: 8,
                    deleted_at: '2025-01-10T14:30:00Z',
                    deleted_by_name: 'System Admin',
                    delete_reason: 'Không thanh toán 3 tháng liên tiếp',
                    retention_deadline: '2025-02-10T14:30:00Z',
                },
                {
                    id: 'org-d2',
                    name: 'Old Startup XYZ',
                    slug: 'old-startup-xyz',
                    user_count: 12,
                    project_count: 3,
                    deleted_at: '2024-12-20T09:00:00Z',
                    deleted_by_name: 'Admin User',
                    delete_reason: 'Yêu cầu từ khách hàng',
                    retention_deadline: '2025-01-20T09:00:00Z',
                },
                {
                    id: 'org-d3',
                    name: 'Test Organization',
                    slug: 'test-org',
                    user_count: 5,
                    project_count: 1,
                    deleted_at: '2025-01-15T11:00:00Z',
                    deleted_by_name: 'System Admin',
                    retention_deadline: '2025-02-15T11:00:00Z',
                },
            ];
            setOrgs(mockOrgs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openRestoreDialog = (org: DeletedOrg) => {
        setSelectedOrg(org);
        setRestoreDialogOpen(true);
    };

    const openHardDeleteDialog = (org: DeletedOrg) => {
        setSelectedOrg(org);
        setHardDeleteDialogOpen(true);
    };

    const handleRestore = async () => {
        if (!selectedOrg) return;
        setIsSubmitting(true);
        try {
            // Mock restore - thực tế gọi API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setOrgs(orgs.filter(o => o.id !== selectedOrg.id));
            setRestoreDialogOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleHardDelete = async () => {
        if (!selectedOrg) return;
        setIsSubmitting(true);
        try {
            // Mock hard delete - thực tế gọi API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setOrgs(orgs.filter(o => o.id !== selectedOrg.id));
            setHardDeleteDialogOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDaysRemaining = (deadline: string) => {
        const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (days <= 0) return <Badge className="bg-red-100 text-red-700">Hết hạn</Badge>;
        if (days <= 7) return <Badge className="bg-amber-100 text-amber-700">{days} ngày</Badge>;
        return <Badge className="bg-slate-100 text-slate-600">{days} ngày</Badge>;
    };

    const filteredOrgs = orgs.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="deleted-orgs-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="admin-deleted-orgs-page-title">
                            <Trash2 className="inline-block mr-3 h-8 w-8 text-red-500" />
                            Organizations đã xóa
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Khôi phục hoặc xóa vĩnh viễn Org (US-SYS-03-01/02/03)
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchDeletedOrgs} data-testid="admin-deleted-orgs-btn-refresh">
                        <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-none shadow-sm" data-testid="admin-deleted-orgs-stat-total">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Tổng Org đã xóa</p>
                                    <p className="text-2xl font-bold text-slate-900">{orgs.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="admin-deleted-orgs-stat-users">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Users bị ảnh hưởng</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {orgs.reduce((sum, o) => sum + o.user_count, 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="admin-deleted-orgs-stat-projects">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <FolderKanban className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Projects bị xóa</p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {orgs.reduce((sum, o) => sum + o.project_count, 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card className="border-none shadow-sm" data-testid="admin-deleted-orgs-search-card">
                    <CardContent className="p-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm theo tên hoặc slug..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                                data-testid="admin-deleted-orgs-input-search"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-none shadow-sm" data-testid="orgs-table-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách Organizations đã xóa</CardTitle>
                        <CardDescription>
                            Các Org sẽ bị xóa vĩnh viễn sau thời hạn retention (30 ngày)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="admin-deleted-orgs-loading-skeleton">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : filteredOrgs.length > 0 ? (
                            <Table data-testid="deleted-orgs-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold">Organization</TableHead>
                                        <TableHead className="font-bold">Người xóa</TableHead>
                                        <TableHead className="font-bold">Lý do</TableHead>
                                        <TableHead className="font-bold">Users</TableHead>
                                        <TableHead className="font-bold">Thời hạn</TableHead>
                                        <TableHead className="text-right font-bold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrgs.map((org) => (
                                        <TableRow key={org.id} data-testid={`org-row-${org.id}`}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium" data-testid={`org-name-${org.id}`}>{org.name}</p>
                                                    <p className="text-xs text-slate-400">{org.slug}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <p>{org.deleted_by_name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(org.deleted_at).toLocaleDateString('vi-VN')}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">
                                                {org.delete_reason || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{org.user_count} users</Badge>
                                            </TableCell>
                                            <TableCell data-testid={`org-deadline-${org.id}`}>
                                                {getDaysRemaining(org.retention_deadline)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" data-testid={`org-actions-${org.id}`}>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => openRestoreDialog(org)}
                                                            className="text-emerald-600"
                                                            data-testid={`btn-restore-${org.id}`}
                                                        >
                                                            <RotateCcw className="mr-2 h-4 w-4" />
                                                            Khôi phục
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => openHardDeleteDialog(org)}
                                                            className="text-red-600"
                                                            data-testid={`btn-hard-delete-${org.id}`}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Xóa vĩnh viễn
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-12 text-center" data-testid="admin-deleted-orgs-empty-state">
                                <CheckCircle2 className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Không có Org nào đã xóa</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Restore Dialog */}
                <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="restore-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <RotateCcw className="h-5 w-5 text-emerald-600" />
                                Khôi phục Organization
                            </DialogTitle>
                            <DialogDescription>
                                Bạn có chắc muốn khôi phục <strong>{selectedOrg?.name}</strong>?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <p className="text-sm text-emerald-700">
                                    Khi khôi phục, tất cả dữ liệu của Org sẽ được phục hồi bao gồm:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-emerald-600 list-disc list-inside">
                                    <li>{selectedOrg?.user_count} users</li>
                                    <li>{selectedOrg?.project_count} projects</li>
                                    <li>Tất cả tasks và dữ liệu liên quan</li>
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} data-testid="btn-cancel-restore">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleRestore}
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700"
                                data-testid="btn-confirm-restore"
                            >
                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                Khôi phục
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Hard Delete Dialog */}
                <Dialog open={hardDeleteDialogOpen} onOpenChange={setHardDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="hard-delete-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Xóa vĩnh viễn
                            </DialogTitle>
                            <DialogDescription>
                                Bạn có chắc muốn xóa vĩnh viễn <strong>{selectedOrg?.name}</strong>?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-700 font-medium">
                                    ⚠️ CẢNH BÁO: Hành động này không thể hoàn tác!
                                </p>
                                <p className="mt-2 text-sm text-red-600">
                                    Tất cả dữ liệu sau sẽ bị xóa vĩnh viễn:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-red-600 list-disc list-inside">
                                    <li>{selectedOrg?.user_count} users và tài khoản</li>
                                    <li>{selectedOrg?.project_count} projects và tasks</li>
                                    <li>Tất cả file đính kèm</li>
                                    <li>Audit logs liên quan</li>
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setHardDeleteDialogOpen(false)} data-testid="btn-cancel-hard-delete">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleHardDelete}
                                disabled={isSubmitting}
                                className="bg-red-600 hover:bg-red-700"
                                data-testid="btn-confirm-hard-delete"
                            >
                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                Xóa vĩnh viễn
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
