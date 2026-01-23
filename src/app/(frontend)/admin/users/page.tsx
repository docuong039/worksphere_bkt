/**
 * Admin Users Page (Org Admin)
 * 
 * User Stories:
 * - US-ORG-01-01: Tạo tài khoản và mời User mới
 * - US-ORG-01-02: Quản lý trạng thái User
 * - US-ORG-01-03: Gán vai trò cho User mới
 * - US-ORG-01-04: Tạo email invite với Join Code
 * 
 * Access:
 * - ORG_ADMIN, SYS_ADMIN
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    UserPlus,
    Mail,
    Clock,
    Shield,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Send,
    Lock,
    Unlock,
    Key,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface OrgMember {
    id: string;
    email: string;
    full_name: string;
    user_status: 'ACTIVE' | 'LOCKED';
    member_status: 'INVITED' | 'ACTIVE' | 'DEACTIVATED';
    roles: string[];
    last_login_at: string | null;
    joined_at: string | null;
}

const ROLE_OPTIONS = [
    { code: 'CEO', label: 'CEO', color: 'bg-amber-100 text-amber-700' },
    { code: 'PROJECT_MANAGER', label: 'Quản lý dự án', color: 'bg-blue-100 text-blue-700' },
    { code: 'EMPLOYEE', label: 'Nhân viên', color: 'bg-purple-100 text-purple-700' },
];

const STATUS_CONFIG = {
    INVITED: { label: 'Đã mời', color: 'bg-amber-100 text-amber-700', icon: Mail },
    ACTIVE: { label: 'Hoạt động', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    DEACTIVATED: { label: 'Vô hiệu hóa', color: 'bg-slate-100 text-slate-500', icon: XCircle },
};

// Member Card Component
const MemberCard = ({
    member,
    onAction
}: {
    member: OrgMember;
    onAction: (action: string) => void;
}) => {
    const statusConfig = STATUS_CONFIG[member.member_status] || STATUS_CONFIG.ACTIVE;
    const StatusIcon = statusConfig.icon;

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-all" data-testid={`member-card-${member.id}`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-600">
                            {member.full_name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900">{member.full_name}</h3>
                        <p className="text-sm text-slate-500">{member.email}</p>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className={cn("text-xs font-bold border-none", statusConfig.color)}>
                                <StatusIcon size={12} className="mr-1" />
                                {statusConfig.label}
                            </Badge>

                            {member.roles.map(role => {
                                const roleConfig = ROLE_OPTIONS.find(r => r.code === role);
                                return (
                                    <Badge
                                        key={role}
                                        className={cn("text-xs font-bold border-none", roleConfig?.color || 'bg-slate-100')}
                                    >
                                        {role}
                                    </Badge>
                                );
                            })}
                        </div>

                        {member.last_login_at && (
                            <p className="text-xs text-slate-400 mt-2">
                                <Clock size={12} className="inline mr-1" />
                                Đăng nhập cuối: {new Date(member.last_login_at).toLocaleDateString('vi-VN')}
                            </p>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`btn-actions-${member.id}`}>
                                <MoreVertical size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {member.member_status === 'INVITED' && (
                                <>
                                    <DropdownMenuItem onClick={() => onAction('resend')}>
                                        <Send size={14} className="mr-2" />
                                        Gửi lại lời mời
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onAction('cancel')} className="text-red-600">
                                        <XCircle size={14} className="mr-2" />
                                        Hủy lời mời
                                    </DropdownMenuItem>
                                </>
                            )}
                            {member.member_status === 'ACTIVE' && (
                                <>
                                    <DropdownMenuItem onClick={() => onAction('reset-password')}>
                                        <Key size={14} className="mr-2" />
                                        Đặt lại mật khẩu
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onAction('deactivate')} className="text-red-600">
                                        <Lock size={14} className="mr-2" />
                                        Vô hiệu hóa
                                    </DropdownMenuItem>
                                </>
                            )}
                            {member.member_status === 'DEACTIVATED' && (
                                <DropdownMenuItem onClick={() => onAction('activate')}>
                                    <Unlock size={14} className="mr-2" />
                                    Kích hoạt lại
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

// Main Page Component
export default function AdminUsersPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<OrgMember[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterRole, setFilterRole] = useState('ALL');
    const [filterOrg, setFilterOrg] = useState('ALL');
    const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);

    // Create/Invite dialog
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteMode, setInviteMode] = useState<'INVITE' | 'MANUAL'>('INVITE');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [invitePassword, setInvitePassword] = useState('');
    const [inviteRoles, setInviteRoles] = useState<string[]>(['EMPLOYEE']);
    const [inviting, setInviting] = useState(false);
    const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});
    const [generatedLink, setGeneratedLink] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    // Reset password dialog
    const [resetOpen, setResetOpen] = useState(false);
    const [resetMember, setResetMember] = useState<OrgMember | null>(null);
    const [tempPassword, setTempPassword] = useState('');
    const [reseting, setReseting] = useState(false);

    // Filtered members for Tab view
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'DEACTIVATED' | 'INVITED'>('ACTIVE');

    // Fetch members
    const fetchMembers = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filterStatus !== 'ALL') params.append('status', filterStatus);
            if (filterRole !== 'ALL') params.append('role', filterRole);

            if (user.role === 'SYS_ADMIN') {
                if (filterOrg !== 'ALL') params.append('org_id', filterOrg);
            } else {
                params.append('org_id', user.org_id || '');
            }

            const res = await fetch(`/api/admin/users?${params.toString()}`, {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setMembers(data.data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(m => {
        if (activeTab === 'ACTIVE') return m.member_status === 'ACTIVE';
        if (activeTab === 'INVITED') return m.member_status === 'INVITED';
        if (activeTab === 'DEACTIVATED') return m.member_status === 'DEACTIVATED';
        return true;
    });

    const fetchOrgs = async () => {
        try {
            const res = await fetch('/api/admin/organizations', {
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            const data = await res.json();
            setOrgs(data.data || []);
        } catch (error) {
            console.error('Error fetching orgs:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMembers();
            if (user.role === 'SYS_ADMIN') fetchOrgs();
        }
    }, [user, filterOrg]);

    // Toggle invite role
    const toggleInviteRole = (roleCode: string) => {
        setInviteRoles(prev =>
            prev.includes(roleCode)
                ? prev.filter(r => r !== roleCode)
                : [...prev, roleCode]
        );
    };

    // Validate invite
    const validateInvite = () => {
        const errors: Record<string, string> = {};
        if (!inviteEmail.trim()) errors.email = 'Email là bắt buộc';
        if (!inviteEmail.includes('@')) errors.email = 'Email không hợp lệ';
        if (!inviteName.trim()) errors.name = 'Họ tên là bắt buộc';
        if (inviteMode === 'MANUAL' && (!invitePassword || invitePassword.length < 8)) {
            errors.password = 'Mật khẩu phải ít nhất 8 ký tự';
        }
        if (inviteRoles.length === 0) errors.roles = 'Chọn ít nhất một vai trò';
        setInviteErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit invite
    const handleInvite = async () => {
        if (!validateInvite()) return;
        setInviting(true);
        try {
            const res = await fetch(inviteMode === 'INVITE' ? '/api/admin/users/invite' : '/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({
                    email: inviteEmail.trim(),
                    full_name: inviteName.trim(),
                    role_codes: inviteRoles,
                    password: inviteMode === 'MANUAL' ? invitePassword : undefined
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (inviteMode === 'INVITE' && data.invite_url) {
                    setGeneratedLink(data.invite_url);
                } else {
                    setInviteOpen(false);
                    setInviteEmail('');
                    setInviteName('');
                    setInvitePassword('');
                    setInviteRoles(['EMPLOYEE']);
                }
                fetchMembers();
            }
        } catch (error) {
            console.error('Error inviting user:', error);
        } finally {
            setInviting(false);
        }
    };

    // Handle member action
    const handleMemberAction = async (memberId: string, action: string) => {
        const member = members.find(m => m.id === memberId);
        if (!member) return;

        if (action === 'reset-password') {
            setResetMember(member);
            setTempPassword('');
            setResetOpen(true);
            return;
        }

        try {
            let method = 'POST';
            let endpoint = `/api/admin/users/${memberId}/${action}`;

            // Map actions to actual endpoints if needed or use a generic status update
            if (action === 'deactivate' || action === 'activate') {
                method = 'PATCH';
                endpoint = `/api/admin/users/${memberId}/status`;
            }

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: action === 'deactivate' ? JSON.stringify({ status: 'DEACTIVATED' }) :
                    action === 'activate' ? JSON.stringify({ status: 'ACTIVE' }) : undefined
            });

            if (res.ok) {
                fetchMembers(); // Refresh list
            }
        } catch (error) {
            console.error(` Error performing ${action}:`, error);
        }
    };

    const handleConfirmReset = async () => {
        if (!resetMember) return;
        setReseting(true);
        try {
            const res = await fetch(`/api/admin/users/${resetMember.id}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            const data = await res.json();
            if (res.ok) {
                setTempPassword(data.temporaryPassword || 'Worksphere@2025'); // Fallback for mock
            }
        } catch (error) {
            console.error('Error resetting password:', error);
        } finally {
            setReseting(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="admin-users-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="admin-users-title">
                            <Users className="inline-block mr-2 h-8 w-8 text-blue-600" />
                            Quản lý Nhân sự
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Mời và quản lý người dùng trong tổ chức.
                        </p>
                    </div>

                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={() => setInviteOpen(true)}
                        data-testid="btn-invite-user"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Mời User
                    </Button>
                </div>

                {/* Tabs & Filters */}
                <div className="space-y-4">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                            <TabsTrigger value="ACTIVE" data-testid="tab-active">Hoạt động</TabsTrigger>
                            <TabsTrigger value="INVITED" data-testid="tab-invited">Đã mời</TabsTrigger>
                            <TabsTrigger value="DEACTIVATED" data-testid="tab-deactivated">Vô hiệu hóa</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Card className="border-none shadow-sm" data-testid="users-filters">
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
                                            data-testid="admin-users-input-search"
                                        />
                                    </div>
                                </div>

                                <Select value={filterRole} onValueChange={setFilterRole}>
                                    <SelectTrigger className="w-[140px]" data-testid="filter-role">
                                        <SelectValue placeholder="Vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                                        {ROLE_OPTIONS.map(r => (
                                            <SelectItem key={r.code} value={r.code}>
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {user?.role === 'SYS_ADMIN' && (
                                    <Select value={filterOrg} onValueChange={setFilterOrg}>
                                        <SelectTrigger className="w-[180px]" data-testid="filter-org">
                                            <SelectValue placeholder="Tất cả tổ chức" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tất cả tổ chức</SelectItem>
                                            {orgs.map(o => (
                                                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Button variant="outline" onClick={fetchMembers} data-testid="admin-users-btn-search">
                                    Tìm kiếm
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Members List */}
                {loading ? (
                    <div className="grid gap-4" data-testid="users-loading">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-28 w-full rounded-xl" />
                        ))}
                    </div>
                ) : filteredMembers.length > 0 ? (
                    <div className="grid gap-4" data-testid="users-list">
                        {filteredMembers.map((member) => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                onAction={(action) => handleMemberAction(member.id, action)}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="border-none shadow-sm" data-testid="users-empty">
                        <CardContent className="py-16 text-center">
                            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Chưa có thành viên
                            </h3>
                            <p className="text-slate-500 mb-6">
                                Bắt đầu bằng cách mời người dùng đầu tiên!
                            </p>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setInviteOpen(true)}
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Mời User
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Invite Dialog */}
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="dialog-invite">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-blue-600" />
                                {inviteMode === 'INVITE' ? 'Mời User Mới' : 'Tạo Tài Khoản Trực Tiếp'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                            <button
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                                    inviteMode === 'INVITE' ? "bg-white shadow-sm text-blue-600" : "text-slate-500"
                                )}
                                onClick={() => setInviteMode('INVITE')}
                            >
                                Gửi Link Mời
                            </button>
                            <button
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                                    inviteMode === 'MANUAL' ? "bg-white shadow-sm text-blue-600" : "text-slate-500"
                                )}
                                onClick={() => setInviteMode('MANUAL')}
                            >
                                Tạo Trực Tiếp
                            </button>
                        </div>

                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    placeholder="newuser@company.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className={inviteErrors.email ? 'border-red-300' : ''}
                                    data-testid="input-invite-email"
                                />
                                {inviteErrors.email && (
                                    <p className="text-sm text-red-600">{inviteErrors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Họ tên <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Nguyễn Văn A"
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    className={inviteErrors.name ? 'border-red-300' : ''}
                                    data-testid="input-invite-name"
                                />
                                {inviteErrors.name && (
                                    <p className="text-sm text-red-600">{inviteErrors.name}</p>
                                )}
                            </div>

                            {inviteMode === 'MANUAL' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Mật khẩu ban đầu <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Tối thiểu 8 ký tự"
                                            value={invitePassword}
                                            onChange={(e) => setInvitePassword(e.target.value)}
                                            className={inviteErrors.password ? 'border-red-300' : ''}
                                            data-testid="input-invite-password"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setInvitePassword(Math.random().toString(36).slice(-10) + 'A1!')}
                                        >
                                            Tự tạo
                                        </Button>
                                    </div>
                                    {inviteErrors.password && (
                                        <p className="text-sm text-red-600">{inviteErrors.password}</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Vai trò <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                    {ROLE_OPTIONS.map(role => (
                                        <label
                                            key={role.code}
                                            className="flex items-center gap-3 cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={inviteRoles.includes(role.code)}
                                                onCheckedChange={() => toggleInviteRole(role.code)}
                                                data-testid={`checkbox-role-${role.code}`}
                                            />
                                            <span className="text-sm">{role.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {inviteErrors.roles && (
                                    <p className="text-sm text-red-600">{inviteErrors.roles}</p>
                                )}
                            </div>

                            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                                {inviteMode === 'INVITE' ? (
                                    <>
                                        <Mail size={12} className="inline mr-1" />
                                        User sẽ nhận email với link kích hoạt. Link có hiệu lực trong 7 ngày.
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={12} className="inline mr-1" />
                                        Tài khoản sẽ được tạo ngay lập tức. Bạn cần cung cấp mật khẩu cho nhân viên.
                                    </>
                                )}
                            </div>

                            {generatedLink && (
                                <div className="space-y-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Link mời đã tạo</label>
                                        <span className="text-[10px] text-emerald-600 font-medium">Hết hạn sau 7 ngày</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            readOnly
                                            value={generatedLink}
                                            className="bg-white border-emerald-200 text-emerald-800 text-xs"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(generatedLink);
                                                setIsCopied(true);
                                                setTimeout(() => setIsCopied(false), 2000);
                                            }}
                                            className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                        >
                                            {isCopied ? 'Đã copy' : 'Copy'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            {generatedLink ? (
                                <Button
                                    onClick={() => {
                                        setInviteOpen(false);
                                        setGeneratedLink('');
                                        setInviteEmail('');
                                        setInviteName('');
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                >
                                    Hoàn thành
                                </Button>
                            ) : (
                                <>
                                    <DialogClose asChild>
                                        <Button variant="outline" data-testid="btn-cancel-invite">
                                            Hủy
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        onClick={handleInvite}
                                        disabled={inviting}
                                        className="bg-blue-600 hover:bg-blue-700"
                                        data-testid="btn-confirm-invite"
                                    >
                                        {inviting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="mr-2 h-4 w-4" />
                                        )}
                                        {inviteMode === 'INVITE' ? 'Gửi Lời Mời' : 'Tạo Tài Khoản'}
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reset Password Dialog */}
                <Dialog open={resetOpen} onOpenChange={(open) => {
                    setResetOpen(open);
                    if (!open) {
                        setResetMember(null);
                        setTempPassword('');
                    }
                }}>
                    <DialogContent className="sm:max-w-md" data-testid="dialog-reset-password">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-amber-500" />
                                Đặt lại mật khẩu
                            </DialogTitle>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            {!tempPassword ? (
                                <p className="text-sm text-slate-500">
                                    Bạn có chắc chắn muốn đặt lại mật khẩu cho <span className="font-bold text-slate-900">{resetMember?.full_name}</span>?
                                    Hệ thống sẽ tạo một mật khẩu tạm thời.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
                                        <CheckCircle2 size={16} /> Mật khẩu đã được đặt lại thành công!
                                    </p>
                                    <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between group">
                                        <code className="text-lg font-black tracking-wider text-slate-900">{tempPassword}</code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigator.clipboard.writeText(tempPassword)}
                                            className="text-blue-600"
                                        >
                                            Sao chép
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">Hãy cung cấp mật khẩu này cho nhân viên một cách an toàn.</p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            {!tempPassword ? (
                                <>
                                    <DialogClose asChild>
                                        <Button variant="outline">Hủy</Button>
                                    </DialogClose>
                                    <Button
                                        onClick={handleConfirmReset}
                                        disabled={reseting}
                                        className="bg-amber-500 hover:bg-amber-600"
                                        data-testid="btn-confirm-reset"
                                    >
                                        {reseting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Xác nhận đặt lại'}
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setResetOpen(false)} className="w-full">Đóng</Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
