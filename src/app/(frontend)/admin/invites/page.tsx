'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Link2,
    Plus,
    Copy,
    Trash2,
    RefreshCw,
    MoreVertical,
    Mail,
    Clock,
    CheckCircle2,
    XCircle,
    Users,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface Invite {
    id: string;
    invite_code: string;
    email_hint: string | null;
    expires_at: string;
    revoked_at: string | null;
    created_at: string;
    created_by_name: string;
    status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'USED';
}

export default function InviteManagementPage() {
    const { user } = useAuthStore();
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [emailHint, setEmailHint] = useState('');
    const [expiryDays, setExpiryDays] = useState(7);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchInvites();
    }, []);

    const fetchInvites = async () => {
        setLoading(true);
        try {
            // Mock data - replace with real API
            const mockInvites: Invite[] = [
                {
                    id: 'inv-1',
                    invite_code: 'WS-ABC123XYZ',
                    email_hint: 'nguyen.van.a@company.com',
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    revoked_at: null,
                    created_at: new Date().toISOString(),
                    created_by_name: 'Admin User',
                    status: 'ACTIVE',
                },
                {
                    id: 'inv-2',
                    invite_code: 'WS-DEF456UVW',
                    email_hint: null,
                    expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    revoked_at: null,
                    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                    created_by_name: 'Admin User',
                    status: 'EXPIRED',
                },
                {
                    id: 'inv-3',
                    invite_code: 'WS-GHI789RST',
                    email_hint: 'tran.thi.b@company.com',
                    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    revoked_at: new Date().toISOString(),
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    created_by_name: 'Admin User',
                    status: 'REVOKED',
                },
            ];
            setInvites(mockInvites);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInvite = async () => {
        setIsSubmitting(true);
        try {
            // Mock create - replace with real API
            const newInvite: Invite = {
                id: `inv-${Date.now()}`,
                invite_code: `WS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                email_hint: emailHint || null,
                expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
                revoked_at: null,
                created_at: new Date().toISOString(),
                created_by_name: user?.full_name || 'Admin',
                status: 'ACTIVE',
            };
            setInvites([newInvite, ...invites]);
            setIsCreateDialogOpen(false);
            setEmailHint('');
            setExpiryDays(7);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevokeInvite = async (id: string) => {
        if (!confirm('Bạn có chắc muốn thu hồi mã mời này?')) return;
        setInvites(invites.map(inv =>
            inv.id === id ? { ...inv, status: 'REVOKED' as const, revoked_at: new Date().toISOString() } : inv
        ));
    };

    const handleCopyLink = (invite: Invite) => {
        const link = `${window.location.origin}/join?code=${invite.invite_code}`;
        navigator.clipboard.writeText(link);
        setCopiedId(invite.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Còn hiệu lực</Badge>;
            case 'EXPIRED':
                return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Hết hạn</Badge>;
            case 'REVOKED':
                return <Badge className="bg-red-100 text-red-600 border-red-200">Đã thu hồi</Badge>;
            case 'USED':
                return <Badge className="bg-blue-100 text-blue-600 border-blue-200">Đã sử dụng</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const activeInvites = invites.filter(inv => inv.status === 'ACTIVE').length;
    const usedInvites = invites.filter(inv => inv.status === 'USED').length;

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="invite-management-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="admin-invites-page-title">
                            <Link2 className="inline-block mr-3 h-8 w-8 text-blue-600" />
                            Quản lý Mã mời
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Tạo và quản lý mã mời để nhân sự gia nhập tổ chức (US-ORG-01-02)
                        </p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={() => setIsCreateDialogOpen(true)}
                        data-testid="btn-create-invite"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tạo mã mời
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-none shadow-sm" data-testid="admin-invites-stat-total">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Link2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Tổng mã mời</p>
                                    <p className="text-2xl font-bold text-slate-900">{invites.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="admin-invites-stat-active">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Còn hiệu lực</p>
                                    <p className="text-2xl font-bold text-emerald-600">{activeInvites}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-used">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Đã sử dụng</p>
                                    <p className="text-2xl font-bold text-amber-600">{usedInvites}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invites Table */}
                <Card className="border-none shadow-sm" data-testid="invites-table-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách mã mời</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="admin-invites-loading-skeleton">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : invites.length > 0 ? (
                            <Table data-testid="invites-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold">Mã mời</TableHead>
                                        <TableHead className="font-bold">Email gợi ý</TableHead>
                                        <TableHead className="font-bold">Trạng thái</TableHead>
                                        <TableHead className="font-bold">Hết hạn</TableHead>
                                        <TableHead className="font-bold">Người tạo</TableHead>
                                        <TableHead className="text-right font-bold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invites.map((invite) => (
                                        <TableRow key={invite.id} data-testid={`invite-row-${invite.id}`}>
                                            <TableCell>
                                                <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono" data-testid={`invite-code-${invite.id}`}>
                                                    {invite.invite_code}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                {invite.email_hint ? (
                                                    <span className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-slate-400" />
                                                        {invite.email_hint}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">Không giới hạn</span>
                                                )}
                                            </TableCell>
                                            <TableCell data-testid={`invite-status-${invite.id}`}>
                                                {getStatusBadge(invite.status)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(invite.expires_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {invite.created_by_name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" data-testid={`invite-actions-${invite.id}`}>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleCopyLink(invite)}
                                                            disabled={invite.status !== 'ACTIVE'}
                                                            data-testid={`btn-copy-${invite.id}`}
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            {copiedId === invite.id ? 'Đã sao chép!' : 'Sao chép link'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleRevokeInvite(invite.id)}
                                                            disabled={invite.status !== 'ACTIVE'}
                                                            className="text-red-600"
                                                            data-testid={`btn-revoke-${invite.id}`}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Thu hồi
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-12 text-center" data-testid="admin-invites-empty-state">
                                <Link2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Chưa có mã mời nào</p>
                                <p className="text-slate-400 text-sm mt-1">Tạo mã mời để nhân sự gia nhập tổ chức</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="create-invite-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Tạo mã mời mới</DialogTitle>
                            <DialogDescription>
                                Tạo mã mời để gửi cho nhân sự mới gia nhập tổ chức
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Email gợi ý (tùy chọn)
                                </label>
                                <Input
                                    placeholder="example@company.com"
                                    type="email"
                                    value={emailHint}
                                    onChange={(e) => setEmailHint(e.target.value)}
                                    data-testid="input-email-hint"
                                />
                                <p className="text-xs text-slate-500">
                                    Nếu nhập email, chỉ email này mới có thể sử dụng mã mời
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Thời hạn (ngày)
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={expiryDays}
                                    onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
                                    data-testid="input-expiry-days"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                                data-testid="btn-cancel-create"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleCreateInvite}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="btn-confirm-create"
                            >
                                {isSubmitting ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                Tạo mã mời
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
