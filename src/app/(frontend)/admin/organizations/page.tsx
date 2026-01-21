/**
 * Admin Organizations Page
 * 
 * Access: SYS_ADMIN only
 * 
 * Features:
 * - List all organizations
 * - View member counts
 * - Status badges
 * - Full data-testid for E2E testing
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
    Globe
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
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface Organization {
    id: string;
    code: string;
    name: string;
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
    member_count: number;
    project_count: number;
    timezone?: string;
    logo_url?: string;
    created_at?: string;
}

const STATUS_CONFIG: any = {
    ACTIVE: { label: 'Hoạt động', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700', icon: Clock },
    SUSPENDED: { label: 'Đình chỉ', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const OrgCard = ({ org, onAction }: { org: Organization; onAction: (action: string) => void }) => {
    const status = STATUS_CONFIG[org.status] || STATUS_CONFIG.ACTIVE;
    const StatusIcon = status.icon;

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-all group" data-testid={`org-card-${org.code}`}>
            <CardContent className="p-5 flex items-center gap-4">
                <Avatar className="h-14 w-14 rounded-xl border-2 border-slate-50 shadow-sm">
                    {org.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={org.logo_url} alt={org.name} className="h-full w-full object-cover" />
                    ) : (
                        <AvatarFallback className="rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xl">
                            {org.name.charAt(0)}
                        </AvatarFallback>
                    )}
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg truncate group-hover:text-blue-600 transition-colors" data-testid={`org-name-${org.code}`}>
                            {org.name}
                        </h3>
                        <Badge variant="outline" className="font-mono text-xs text-slate-500">
                            {org.code}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span data-testid={`org-members-${org.code}`}>{org.member_count} thành viên</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Globe size={14} />
                            <span>{org.project_count || 0} dự án</span>
                        </div>
                        {org.timezone && (
                            <div className="flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-100 rounded">
                                {org.timezone}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Badge className={cn("px-2.5 py-0.5 rounded-full border-none", status.color)}>
                        <StatusIcon size={12} className="mr-1.5" />
                        {status.label}
                    </Badge>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" data-testid={`btn-org-actions-${org.code}`}>
                                <MoreVertical size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onAction('view')}>
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction('settings')}>
                                Cấu hình
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction('impersonate')} className="text-blue-600">
                                <Building2 size={14} className="mr-2" />
                                Impersonate
                            </DropdownMenuItem>
                            {org.status === 'PENDING' && (
                                <>
                                    <DropdownMenuItem onClick={() => onAction('approve')} className="text-emerald-600">
                                        <CheckCircle2 size={14} className="mr-2" />
                                        Phê duyệt (Approve)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onAction('reject')} className="text-rose-600">
                                        <XCircle size={14} className="mr-2" />
                                        Từ chối (Reject)
                                    </DropdownMenuItem>
                                </>
                            )}
                            {org.status === 'ACTIVE' && (
                                <DropdownMenuItem onClick={() => onAction('suspend')} className="text-amber-600">
                                    <Clock size={14} className="mr-2" />
                                    Tạm đình chỉ (Suspend)
                                </DropdownMenuItem>
                            )}
                            {org.status === 'SUSPENDED' && (
                                <DropdownMenuItem onClick={() => onAction('activate')} className="text-emerald-600">
                                    <CheckCircle2 size={14} className="mr-2" />
                                    Kích hoạt lại (Activate)
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

// Create Org Dialog
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
import { Loader2 } from 'lucide-react';

const CreateOrgDialog = ({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        timezone: 'Asia/Ho_Chi_Minh',
        admin_email: '',
        admin_full_name: '',
        admin_password: ''
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
            setFormData({ code: '', name: '', timezone: 'Asia/Ho_Chi_Minh', admin_email: '', admin_full_name: '', admin_password: '' });
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
                        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-2 text-xs text-slate-500 font-medium">
                            Org Admin Mặc định
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Admin *</label>
                            <Input
                                type="email"
                                placeholder="admin@acme.com"
                                value={formData.admin_email}
                                onChange={e => setFormData({ ...formData, admin_email: e.target.value })}
                                data-testid="input-admin-email"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Họ tên Admin</label>
                            <Input
                                placeholder="Admin Name"
                                value={formData.admin_full_name}
                                onChange={e => setFormData({ ...formData, admin_full_name: e.target.value })}
                                data-testid="input-admin-name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password khởi tạo *</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={formData.admin_password}
                            onChange={e => setFormData({ ...formData, admin_password: e.target.value })}
                            data-testid="input-admin-password"
                        />
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

    const handleAction = async (org: Organization, action: string) => {
        console.log(`Action ${action} on org ${org.code}`);
        if (action === 'impersonate') {
            window.location.href = `/admin/impersonation?orgId=${org.id}`;
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
                    fetchOrgs(); // Refresh list
                }
            } catch (error) {
                console.error(`Error updating org status ${action}:`, error);
            }
        }
    };

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700" data-testid="admin-orgs-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="admin-orgs-title">
                            <Building2 className="inline-block mr-2 h-8 w-8 text-indigo-600" />
                            Danh sách Tổ chức
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

                {/* Filters */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc mã tổ chức..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-slate-200"
                        data-testid="input-search-org"
                    />
                </div>

                {/* List */}
                <div className="space-y-4" data-testid="orgs-list">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
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
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
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
            </div>
        </AppLayout>
    );
}
