'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    Users,
    Plus,
    Search,
    MoreVertical,
    Mail,
    Shield,
    UserCheck,
    UserX,
    Key,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface OrgMember {
    id: string;
    user_id: string;
    email: string;
    full_name: string;
    role_code: 'EMPLOYEE' | 'PROJECT_MANAGER' | 'CEO' | 'ORG_ADMIN';
    member_status: 'INVITED' | 'ACTIVE' | 'DEACTIVATED';
    join_method: 'MANUAL' | 'INVITE';
    joined_at: string | null;
    deactivated_at: string | null;
}

export default function OrgMembersPage() {
    const { user } = useAuthStore();
    const [members, setMembers] = useState<OrgMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
    const [newRole, setNewRole] = useState('');

    // Create form
    const [createForm, setCreateForm] = useState({ email: '', full_name: '', role: 'EMPLOYEE' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            // Mock data - US-ORG-01, US-ORG-02
            const mockMembers: OrgMember[] = [
                {
                    id: 'm1', user_id: 'u1', email: 'admin@company.com', full_name: 'Nguyễn Văn Admin',
                    role_code: 'ORG_ADMIN', member_status: 'ACTIVE', join_method: 'MANUAL',
                    joined_at: '2024-01-01T00:00:00Z', deactivated_at: null
                },
                {
                    id: 'm2', user_id: 'u2', email: 'ceo@company.com', full_name: 'Trần Thị CEO',
                    role_code: 'CEO', member_status: 'ACTIVE', join_method: 'MANUAL',
                    joined_at: '2024-01-02T00:00:00Z', deactivated_at: null
                },
                {
                    id: 'm3', user_id: 'u3', email: 'pm@company.com', full_name: 'Lê Văn PM',
                    role_code: 'PROJECT_MANAGER', member_status: 'ACTIVE', join_method: 'INVITE',
                    joined_at: '2024-02-15T00:00:00Z', deactivated_at: null
                },
                {
                    id: 'm4', user_id: 'u4', email: 'dev1@company.com', full_name: 'Phạm Văn Dev',
                    role_code: 'EMPLOYEE', member_status: 'ACTIVE', join_method: 'INVITE',
                    joined_at: '2024-03-01T00:00:00Z', deactivated_at: null
                },
                {
                    id: 'm5', user_id: 'u5', email: 'pending@company.com', full_name: 'Hoàng Thị Pending',
                    role_code: 'EMPLOYEE', member_status: 'INVITED', join_method: 'INVITE',
                    joined_at: null, deactivated_at: null
                },
                {
                    id: 'm6', user_id: 'u6', email: 'inactive@company.com', full_name: 'Vũ Văn Inactive',
                    role_code: 'EMPLOYEE', member_status: 'DEACTIVATED', join_method: 'MANUAL',
                    joined_at: '2023-06-01T00:00:00Z', deactivated_at: '2024-06-01T00:00:00Z'
                },
            ];
            setMembers(mockMembers);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMember = async () => {
        if (!createForm.email || !createForm.full_name) return;
        setIsSubmitting(true);
        try {
            const newMember: OrgMember = {
                id: `m${Date.now()}`,
                user_id: `u${Date.now()}`,
                email: createForm.email,
                full_name: createForm.full_name,
                role_code: createForm.role as any,
                member_status: 'ACTIVE',
                join_method: 'MANUAL',
                joined_at: new Date().toISOString(),
                deactivated_at: null,
            };
            setMembers([...members, newMember]);
            setIsCreateDialogOpen(false);
            setCreateForm({ email: '', full_name: '', role: 'EMPLOYEE' });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = (member: OrgMember) => {
        if (!confirm(`Bạn có chắc muốn vô hiệu hóa tài khoản ${member.full_name}?`)) return;
        setMembers(members.map(m =>
            m.id === member.id
                ? { ...m, member_status: 'DEACTIVATED' as const, deactivated_at: new Date().toISOString() }
                : m
        ));
    };

    const handleReactivate = (member: OrgMember) => {
        if (!confirm(`Bạn có chắc muốn kích hoạt lại tài khoản ${member.full_name}?`)) return;
        setMembers(members.map(m =>
            m.id === member.id
                ? { ...m, member_status: 'ACTIVE' as const, deactivated_at: null }
                : m
        ));
    };

    const handleResetPassword = (member: OrgMember) => {
        if (!confirm(`Gửi email reset mật khẩu đến ${member.email}?`)) return;
        alert(`Đã gửi email reset mật khẩu đến ${member.email}`);
    };

    const openRoleDialog = (member: OrgMember) => {
        setSelectedMember(member);
        setNewRole(member.role_code);
        setIsRoleDialogOpen(true);
    };

    const handleChangeRole = () => {
        if (!selectedMember || !newRole) return;
        setMembers(members.map(m =>
            m.id === selectedMember.id ? { ...m, role_code: newRole as any } : m
        ));
        setIsRoleDialogOpen(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Hoạt động</Badge>;
            case 'INVITED':
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Chờ xác nhận</Badge>;
            case 'DEACTIVATED':
                return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Đã vô hiệu</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ORG_ADMIN':
                return <Badge className="bg-purple-100 text-purple-700">Org Admin</Badge>;
            case 'CEO':
                return <Badge className="bg-rose-100 text-rose-700">CEO</Badge>;
            case 'PROJECT_MANAGER':
                return <Badge className="bg-blue-100 text-blue-700">PM</Badge>;
            case 'EMPLOYEE':
                return <Badge className="bg-slate-100 text-slate-600">Nhân viên</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    const filteredMembers = members.filter(m => {
        const matchSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || m.member_status === statusFilter;
        const matchRole = roleFilter === 'ALL' || m.role_code === roleFilter;
        return matchSearch && matchStatus && matchRole;
    });

    const stats = {
        total: members.length,
        active: members.filter(m => m.member_status === 'ACTIVE').length,
        invited: members.filter(m => m.member_status === 'INVITED').length,
        deactivated: members.filter(m => m.member_status === 'DEACTIVATED').length,
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="org-members-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="admin-members-page-title">
                            <Users className="inline-block mr-3 h-8 w-8 text-blue-600" />
                            Quản lý Thành viên
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Quản lý vòng đời nhân sự trong tổ chức (US-ORG-01, US-ORG-02)
                        </p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={() => setIsCreateDialogOpen(true)}
                        data-testid="btn-create-member"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm thành viên
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm" data-testid="admin-members-stat-total">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Tổng</p>
                                    <p className="text-xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="admin-members-stat-active">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Hoạt động</p>
                                    <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-invited">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Chờ xác nhận</p>
                                    <p className="text-xl font-bold text-amber-600">{stats.invited}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-deactivated">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <XCircle className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Đã vô hiệu</p>
                                    <p className="text-xl font-bold text-slate-500">{stats.deactivated}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-none shadow-sm" data-testid="admin-members-filters-card">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm theo tên hoặc email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                        data-testid="admin-members-input-search"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]" data-testid="admin-members-filter-status">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                    <SelectItem value="INVITED">Chờ xác nhận</SelectItem>
                                    <SelectItem value="DEACTIVATED">Đã vô hiệu</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[160px]" data-testid="filter-role">
                                    <SelectValue placeholder="Vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                                    <SelectItem value="ORG_ADMIN">Org Admin</SelectItem>
                                    <SelectItem value="CEO">CEO</SelectItem>
                                    <SelectItem value="PROJECT_MANAGER">PM</SelectItem>
                                    <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Members Table */}
                <Card className="border-none shadow-sm" data-testid="members-table-card">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="admin-members-loading-skeleton">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : filteredMembers.length > 0 ? (
                            <Table data-testid="members-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold">Thành viên</TableHead>
                                        <TableHead className="font-bold">Email</TableHead>
                                        <TableHead className="font-bold">Vai trò</TableHead>
                                        <TableHead className="font-bold">Trạng thái</TableHead>
                                        <TableHead className="font-bold">Ngày tham gia</TableHead>
                                        <TableHead className="text-right font-bold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMembers.map((member) => (
                                        <TableRow key={member.id} data-testid={`member-row-${member.id}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                                                            {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium" data-testid={`member-name-${member.id}`}>
                                                        {member.full_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600" data-testid={`member-email-${member.id}`}>
                                                {member.email}
                                            </TableCell>
                                            <TableCell data-testid={`member-role-${member.id}`}>
                                                {getRoleBadge(member.role_code)}
                                            </TableCell>
                                            <TableCell data-testid={`member-status-${member.id}`}>
                                                {getStatusBadge(member.member_status)}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {member.joined_at
                                                    ? new Date(member.joined_at).toLocaleDateString('vi-VN')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" data-testid={`member-actions-${member.id}`}>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => openRoleDialog(member)}
                                                            data-testid={`btn-change-role-${member.id}`}
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            Đổi vai trò
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleResetPassword(member)}
                                                            data-testid={`btn-reset-password-${member.id}`}
                                                        >
                                                            <Key className="mr-2 h-4 w-4" />
                                                            Reset mật khẩu
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {member.member_status === 'ACTIVE' ? (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeactivate(member)}
                                                                className="text-red-600"
                                                                data-testid={`btn-deactivate-${member.id}`}
                                                            >
                                                                <UserX className="mr-2 h-4 w-4" />
                                                                Vô hiệu hóa
                                                            </DropdownMenuItem>
                                                        ) : member.member_status === 'DEACTIVATED' ? (
                                                            <DropdownMenuItem
                                                                onClick={() => handleReactivate(member)}
                                                                className="text-emerald-600"
                                                                data-testid={`btn-reactivate-${member.id}`}
                                                            >
                                                                <UserCheck className="mr-2 h-4 w-4" />
                                                                Kích hoạt lại
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-12 text-center" data-testid="admin-members-empty-state">
                                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Không tìm thấy thành viên</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Dialog - US-ORG-01-01 */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="create-member-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Thêm thành viên mới</DialogTitle>
                            <DialogDescription>
                                Tạo tài khoản thủ công cho nhân viên (US-ORG-01-01)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email *</label>
                                <Input
                                    type="email"
                                    placeholder="example@company.com"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    data-testid="input-create-email"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Họ tên *</label>
                                <Input
                                    placeholder="Nguyễn Văn A"
                                    value={createForm.full_name}
                                    onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                                    data-testid="input-create-name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Vai trò</label>
                                <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                                    <SelectTrigger data-testid="select-create-role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                                        <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                                        <SelectItem value="CEO">CEO</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="btn-cancel-create">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleCreateMember}
                                disabled={isSubmitting || !createForm.email || !createForm.full_name}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="btn-confirm-create"
                            >
                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo tài khoản
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Change Role Dialog - US-ORG-02-01/02 */}
                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="change-role-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Thay đổi vai trò</DialogTitle>
                            <DialogDescription>
                                Gán hoặc thay đổi vai trò cho {selectedMember?.full_name} (US-ORG-02-01/02)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger data-testid="select-new-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                                    <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                                    <SelectItem value="CEO">CEO</SelectItem>
                                    <SelectItem value="ORG_ADMIN">Org Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)} data-testid="btn-cancel-role">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleChangeRole}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="btn-confirm-role"
                            >
                                Cập nhật vai trò
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
