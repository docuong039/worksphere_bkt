/**
 * Admin Organizations Page
 * 
 * Access: SYS_ADMIN only
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Building2,
    Search,
    Plus,
    Clock,
    MoreVertical,
    Users,
    CheckCircle2,
    XCircle,
    Globe,
    HardDrive,
    Shield,
    Eye,
    Calendar,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

interface Organization {
    id: string;
    code: string;
    name: string;
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
    member_count: number;
    project_count: number;
    timezone?: string;
    created_at?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    ACTIVE: { label: 'Hoạt động', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700', icon: Clock },
    SUSPENDED: { label: 'Đình chỉ', color: 'bg-red-100 text-red-700', icon: XCircle },
};

interface Stats {
    total: number;
    active: number;
    totalUsers: number;
}

const OrganizationStats = ({ stats }: { stats: Stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="org-stats-grid">
        <Card className="border-none shadow-sm bg-blue-50/50">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Building2 size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium">Tổng Tổ chức</p>
                    <p className="text-xl font-bold text-slate-900" data-testid="stat-total-orgs">{stats.total || 0}</p>
                </div>
            </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50/50" data-testid="stat-card-active">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium">Đang hoạt động</p>
                    <p className="text-xl font-bold text-emerald-700" data-testid="stat-active-orgs">{stats.active || 0}</p>
                </div>
            </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-purple-50/50" data-testid="stat-card-users">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <Users size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium">Người dùng toàn sàn</p>
                    <p className="text-xl font-bold text-purple-700" data-testid="stat-total-users">{stats.totalUsers || 0}</p>
                </div>
            </CardContent>
        </Card>
    </div>
);

const OrgDetailDialog = ({ open, onOpenChange, org, onEdit }: { open: boolean; onOpenChange: (open: boolean) => void; org: Organization | null; onEdit: () => void }) => {
    if (!org) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl overflow-hidden" data-testid="dialog-org-detail">
                <DialogHeader className="relative pb-12">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-600 to-blue-500 opacity-10"></div>
                    <div className="relative pt-6 flex flex-col items-center">
                        <Avatar className="h-20 w-20 rounded-2xl border-4 border-white shadow-xl mb-4">
                            <AvatarFallback className="bg-indigo-50 text-indigo-600 text-2xl font-black">
                                {org.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <DialogTitle className="text-2xl font-black text-slate-900">{org.name}</DialogTitle>
                        <Badge variant="outline" className="mt-2 font-mono text-xs uppercase tracking-widest text-slate-500 bg-white/50">
                            {org.code}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-2">
                    <Card className="border-none bg-slate-50/50 p-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Thông tin vận hành</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Trạng thái</span>
                                <Badge className={cn("text-[10px] font-bold px-2", STATUS_CONFIG[org.status].color)}>
                                    {STATUS_CONFIG[org.status].label}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Múi giờ</span>
                                <span className="text-xs font-bold text-slate-700">{org.timezone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Ngày tạo</span>
                                <span className="text-xs font-bold text-slate-700">
                                    {org.created_at ? new Date(org.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none bg-indigo-50/30 p-4">
                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">Tài nguyên & Quota</p>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-500">USERS</span>
                                    <span className="text-indigo-600">{org.member_count} / 50</span>
                                </div>
                                <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(org.member_count / 50) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-500">PROJECTS</span>
                                    <span className="text-indigo-600">8 / 20</span>
                                </div>
                                <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl text-white mt-2 relative overflow-hidden group">
                    <Shield className="absolute -right-2 -bottom-2 h-16 w-16 text-white/5 opacity-10 group-hover:scale-110 transition-transform" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Quyền truy cập hệ thống</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        Bạn có quyền can thiệp vào cấu hình Quota và đăng nhập hỗ trợ cho tổ chức này dưới tư cách System Admin.
                    </p>
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" className="rounded-xl font-bold" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            onEdit();
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-100"
                        data-testid="btn-detail-edit"
                    >
                        Chỉnh sửa thông tin
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Edit Org Dialog - US-SYS-01-02 Part of PLATFORM_ORG.UPDATE
const EditOrgDialog = ({ open, onOpenChange, org, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; org: Organization | null; onSuccess: () => void }) => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        timezone: 'Asia/Ho_Chi_Minh'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (org && open) {
            setFormData({
                name: org.name,
                timezone: org.timezone || 'Asia/Ho_Chi_Minh'
            });
        }
    }, [org, open]);

    const handleSubmit = async () => {
        if (!org) return;
        if (!formData.name) {
            setError('Tên tổ chức không được để trống');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/admin/organizations/${org.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Lỗi khi cập nhật tổ chức');
            }

            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]" data-testid="dialog-edit-org">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa Tổ chức - {org?.code}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tên tổ chức *</label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            data-testid="input-edit-org-name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Múi giờ</label>
                        <Select
                            value={formData.timezone}
                            onValueChange={val => setFormData({ ...formData, timezone: val })}
                        >
                            <SelectTrigger data-testid="select-edit-timezone">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</SelectItem>
                                <SelectItem value="Asia/Tokyo">Japan (GMT+9)</SelectItem>
                                <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                                <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                                <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600" data-testid="btn-save-org-edit">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const OrgCard = ({ org, onAction }: { org: Organization; onAction: (action: string) => void }) => {
    const status = STATUS_CONFIG[org.status] || STATUS_CONFIG.ACTIVE;
    const StatusIcon = status.icon;

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-all group" data-testid={`org-card-${org.code}`}>
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-14 w-14 rounded-xl border-2 border-slate-50 shadow-sm">
                        <AvatarFallback className="rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xl">
                            {org.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 text-lg truncate group-hover:text-blue-600 transition-colors" data-testid={`org-name-${org.code}`}>
                                {org.name}
                            </h3>
                            <Badge variant="outline" className="font-mono text-xs text-slate-500" data-testid={`org-code-${org.code}`}>
                                {org.code}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                                <Users size={14} className="text-slate-400" />
                                <span data-testid={`org-members-${org.code}`}>{org.member_count} Users</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-slate-400" />
                                <span className="text-xs" data-testid={`org-date-${org.code}`}>
                                    {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Badge className={cn("px-2.5 py-0.5 rounded-full border-none whitespace-nowrap text-[10px] font-bold uppercase", status.color)} data-testid={`org-status-badge-${org.code}`}>
                            <StatusIcon size={12} className="mr-1.5" />
                            {status.label}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" data-testid={`btn-org-actions-${org.code}`}>
                                    <MoreVertical size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem onClick={() => onAction('view')} data-testid={`menu-view-${org.code}`}>
                                    <Eye size={14} className="mr-2 text-slate-400" /> Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onAction('quota')} data-testid={`menu-quota-${org.code}`}>
                                    <HardDrive size={14} className="mr-2 text-slate-400" /> Cấu hình Quota
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onAction('impersonate')} className="text-blue-600" data-testid={`menu-impersonate-${org.code}`}>
                                    <Shield size={14} className="mr-2" /> Đăng nhập hỗ trợ
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {org.status === 'PENDING' && (
                                    <>
                                        <DropdownMenuItem onClick={() => onAction('approve')} className="text-emerald-600" data-testid={`menu-approve-${org.code}`}>
                                            <CheckCircle2 size={14} className="mr-2" />
                                            Phê duyệt Organization
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onAction('reject')} className="text-rose-600" data-testid={`menu-reject-${org.code}`}>
                                            <XCircle size={14} className="mr-2" />
                                            Từ chối đơn
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {org.status === 'ACTIVE' && (
                                    <DropdownMenuItem onClick={() => onAction('suspend')} className="text-amber-600" data-testid={`menu-suspend-${org.code}`}>
                                        <Clock size={14} className="mr-2" />
                                        Đình chỉ hoạt động
                                    </DropdownMenuItem>
                                )}
                                {org.status === 'SUSPENDED' && (
                                    <DropdownMenuItem onClick={() => onAction('activate')} className="text-emerald-600" data-testid={`menu-activate-${org.code}`}>
                                        <CheckCircle2 size={14} className="mr-2" />
                                        Kích hoạt lại
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const QuotaConfigDialog = ({ open, onOpenChange, org, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; org: Organization | null; onSuccess: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        max_users: 50,
        max_storage_mb: 1024,
        max_projects: 50,
        effective_from: '',
        effective_to: ''
    });

    useEffect(() => {
        if (org && open) {
            setFormData({
                max_users: 50,
                max_storage_mb: 1024,
                max_projects: 50,
                effective_from: '',
                effective_to: ''
            });
        }
    }, [org, open]);

    const handleSubmit = async () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onSuccess();
            onOpenChange(false);
        }, 800);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]" data-testid="dialog-quota-config">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HardDrive className="text-indigo-600" size={20} />
                        Cấu hình Quota - {org?.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Giới hạn User</label>
                            <Input
                                type="number"
                                value={formData.max_users}
                                onChange={e => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                                data-testid="input-quota-users"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Dự án tối đa</label>
                            <Input
                                type="number"
                                value={formData.max_projects}
                                onChange={e => setFormData({ ...formData, max_projects: parseInt(e.target.value) })}
                                data-testid="input-quota-projects"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Dung lượng (MB)</label>
                        <Input
                            type="number"
                            value={formData.max_storage_mb}
                            onChange={e => setFormData({ ...formData, max_storage_mb: parseInt(e.target.value) })}
                            data-testid="input-quota-storage"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-500">Ngày hiệu lực</label>
                            <Input
                                type="date"
                                value={formData.effective_from}
                                onChange={e => setFormData({ ...formData, effective_from: e.target.value })}
                                data-testid="input-quota-from"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-500">Ngày hết hạn</label>
                            <Input
                                type="date"
                                value={formData.effective_to}
                                onChange={e => setFormData({ ...formData, effective_to: e.target.value })}
                                data-testid="input-quota-to"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-indigo-600" data-testid="btn-save-quota">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cập nhật hạn mức
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const CreateOrgDialog = ({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        timezone: 'Asia/Ho_Chi_Minh',
        admin_email: '',
        admin_full_name: '',
        admin_password: '',
        max_users: 50,
        max_storage_mb: 1024,
        max_projects: 50
    });
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!formData.code || !formData.name || !formData.admin_email || !formData.admin_password) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/organizations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Lỗi khi tạo tổ chức');

            onSuccess();
            onOpenChange(false);
            setFormData({ code: '', name: '', timezone: 'Asia/Ho_Chi_Minh', admin_email: '', admin_full_name: '', admin_password: '', max_users: 50, max_storage_mb: 1024, max_projects: 50 });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]" data-testid="dialog-create-org">
                <DialogHeader>
                    <DialogTitle>Tạo Tổ Chức Mới</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mã tổ chức *</label>
                            <Input
                                placeholder="ACME-001"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                data-testid="input-org-code"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tên tổ chức *</label>
                            <Input
                                placeholder="ACME Corporation"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                data-testid="input-org-name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Múi giờ</label>
                        <Select
                            value={formData.timezone}
                            onValueChange={val => setFormData({ ...formData, timezone: val })}
                        >
                            <SelectTrigger data-testid="select-timezone">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</SelectItem>
                                <SelectItem value="Asia/Tokyo">Japan (GMT+9)</SelectItem>
                                <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                                <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                                <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative border-t my-4">
                        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-2 text-xs text-slate-500 font-medium italic">
                            Cấu hình Quota ban đầu
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">User</label>
                            <Input
                                type="number"
                                value={formData.max_users}
                                onChange={e => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                                data-testid="input-init-quota-users"
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Storage (MB)</label>
                            <Input
                                type="number"
                                value={formData.max_storage_mb}
                                onChange={e => setFormData({ ...formData, max_storage_mb: parseInt(e.target.value) })}
                                data-testid="input-init-quota-storage"
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Dự án</label>
                            <Input
                                type="number"
                                value={formData.max_projects}
                                onChange={e => setFormData({ ...formData, max_projects: parseInt(e.target.value) })}
                                data-testid="input-init-quota-projects"
                                className="h-9"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Hủy</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={loading} data-testid="btn-submit-org">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Tạo Org
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function AdminOrganizationsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [quotaOpen, setQuotaOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

    const fetchOrgs = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/organizations', {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setOrgs(data.data || []);
        } catch (error) {
            console.error('Error fetching orgs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchOrgs();
    }, [user]);

    const filteredOrgs = orgs.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: orgs.length,
        active: orgs.filter(o => o.status === 'ACTIVE').length,
        totalUsers: orgs.reduce((sum, o) => sum + (o.member_count || 0), 0)
    };

    const handleAction = async (org: Organization, action: string) => {
        if (action === 'view') {
            setSelectedOrg(org);
            setDetailOpen(true);
            return;
        }

        if (action === 'impersonate') {
            window.location.href = `/admin/impersonation?orgId=${org.id}`;
            return;
        }

        if (action === 'quota') {
            setSelectedOrg(org);
            setQuotaOpen(true);
            return;
        }

        if (['approve', 'reject', 'suspend', 'activate'].includes(action)) {
            try {
                const res = await fetch(`/api/admin/organizations/${org.id}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': user?.id || '',
                        'x-user-role': user?.role || ''
                    },
                    body: JSON.stringify({ action })
                });

                if (res.ok) {
                    fetchOrgs();
                }
            } catch (error) {
                console.error(`Error updating org status ${action}:`, error);
            }
        }
    };

    return (
        <AppLayout>
            <PermissionGuard permission={PERMISSIONS.PLATFORM_ORG_READ} showFullPageError>
                <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700" data-testid="admin-orgs-container">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="admin-orgs-title">
                                <Building2 className="inline-block mr-2 h-8 w-8 text-indigo-600" />
                                Hệ thống Tổ chức
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Quản lý các tổ chức và doanh nghiệp trong hệ thống.
                            </p>
                        </div>

                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                            onClick={() => setCreateOpen(true)}
                            data-testid="btn-create-org"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo Tổ chức mới
                        </Button>
                    </div>

                    <OrganizationStats stats={stats} />

                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm theo tên hoặc mã tổ chức..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white border-slate-200"
                            data-testid="input-search-org"
                        />
                    </div>

                    <div className="space-y-4" data-testid="orgs-list">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" data-testid="org-skeleton" />
                            ))
                        ) : filteredOrgs.length > 0 ? (
                            filteredOrgs.map(org => (
                                <OrgCard
                                    key={org.id}
                                    org={org}
                                    onAction={(action) => handleAction(org, action)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200" data-testid="org-empty-state">
                                <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-900">Không tìm thấy tổ chức nào</h3>
                                <p className="text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc tạo mới.</p>
                            </div>
                        )}
                    </div>

                    <CreateOrgDialog
                        open={createOpen}
                        onOpenChange={setCreateOpen}
                        onSuccess={fetchOrgs}
                    />

                    <QuotaConfigDialog
                        open={quotaOpen}
                        onOpenChange={setQuotaOpen}
                        org={selectedOrg}
                        onSuccess={fetchOrgs}
                    />

                    <OrgDetailDialog
                        open={detailOpen}
                        onOpenChange={setDetailOpen}
                        org={selectedOrg}
                        onEdit={() => setEditOpen(true)}
                    />

                    <EditOrgDialog
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        org={selectedOrg}
                        onSuccess={fetchOrgs}
                    />
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
