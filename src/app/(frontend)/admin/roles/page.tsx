/**
 * Admin Roles Page
 * 
 * User Stories:
 * - US-ORG-02-01: Xem và chỉnh sửa Roles nội bộ
 * - US-ORG-02-02: Gán Permission cho Role
 * 
 * Access: ORG_ADMIN, SYS_ADMIN
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Lock,
    Plus,
    Eye,
    Edit2,
    Trash2,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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

interface Role {
    id: string;
    code: string;
    name: string;
    description: string | null;
    is_system: boolean;
    permissions: string[];
}

interface Permission {
    code: string;
    name: string;
    category: string;
}

const PERMISSION_CATEGORIES = [
    { key: 'TASK', label: 'Công việc' },
    { key: 'PROJECT', label: 'Dự án' },
    { key: 'TIME', label: 'Nhật ký thời gian' },
    { key: 'REPORT', label: 'Báo cáo' },
    { key: 'USER', label: 'Người dùng' },
    { key: 'ORG', label: 'Tổ chức' },
];

// Role Card Component
const RoleCard = ({
    role,
    onView,
    onEdit,
    onDelete
}: {
    role: Role;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-all" data-testid={`role-card-${role.code}`}>
        <CardContent className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{role.name}</h3>
                        {role.is_system && (
                            <Badge className="bg-blue-100 text-blue-700 border-none text-xs">
                                <Lock size={10} className="mr-1" />
                                Hệ thống
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        {role.description || `Code: ${role.code}`}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                        {role.permissions.slice(0, 5).map(p => (
                            <Badge key={p} variant="secondary" className="text-xs">
                                {p}
                            </Badge>
                        ))}
                        {role.permissions.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                                +{role.permissions.length - 5} quyền khác
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={onView} data-testid={`btn-view-${role.code}`}>
                        <Eye size={14} />
                    </Button>
                    {!role.is_system && (
                        <>
                            <Button variant="ghost" size="sm" onClick={onEdit} data-testid={`btn-edit-${role.code}`}>
                                <Edit2 size={14} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={onDelete}
                                data-testid={`btn-delete-${role.code}`}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
);

// Main Page Component
export default function AdminRolesPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [filterOrg, setFilterOrg] = useState('MASTER');
    const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);

    // Detail dialog
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    // Create/Edit dialog
    const [editOpen, setEditOpen] = useState(false);
    const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
    const [editName, setEditName] = useState('');
    const [editCode, setEditCode] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPermissions, setEditPermissions] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Fetch roles
    const fetchRoles = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (user.role === 'SYS_ADMIN') {
                if (filterOrg !== 'ALL') params.append('org_id', filterOrg === 'MASTER' ? 'NULL' : filterOrg);
            } else {
                params.append('org_id', user.org_id || '');
            }

            const res = await fetch(`/api/admin/roles?${params.toString()}`, {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setRoles(data.data || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const fetchPermissions = async () => {
        try {
            const res = await fetch('/api/admin/permissions', {
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            const data = await res.json();
            setPermissions(data.data || []);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchRoles();
            fetchPermissions();
            if (user.role === 'SYS_ADMIN') fetchOrgs();
        }
    }, [user, filterOrg]);

    // View role
    const handleView = (role: Role) => {
        setSelectedRole(role);
        setDetailOpen(true);
    };

    // Open create dialog
    const handleCreate = () => {
        setEditMode('create');
        setEditName('');
        setEditCode('');
        setEditDescription('');
        setEditPermissions([]);
        setEditOpen(true);
    };

    // Open edit dialog
    const handleEdit = (role: Role) => {
        setEditMode('edit');
        setSelectedRole(role);
        setEditName(role.name);
        setEditCode(role.code);
        setEditDescription(role.description || '');
        setEditPermissions(role.permissions);
        setEditOpen(true);
    };

    // Toggle permission
    const togglePermission = (permCode: string) => {
        setEditPermissions(prev =>
            prev.includes(permCode)
                ? prev.filter(p => p !== permCode)
                : [...prev, permCode]
        );
    };

    // Save Role
    const handleSave = async () => {
        if (!editName || !editCode) return;
        setSaving(true);
        try {
            const method = editMode === 'create' ? 'POST' : 'PATCH';
            const url = editMode === 'create'
                ? '/api/admin/roles'
                : `/api/admin/roles/${selectedRole?.id}`;

            const payload = {
                name: editName,
                code: editCode,
                description: editDescription,
                permissions: editPermissions,
                org_id: filterOrg === 'MASTER' ? null : filterOrg
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setEditOpen(false);
                fetchRoles();
            } else {
                const data = await res.json();
                console.error('Error saving role:', data.message);
            }
        } catch (error) {
            console.error('Error saving role:', error);
        } finally {
            setSaving(false);
        }
    };

    // Delete Role
    const handleDelete = async (roleId: string) => {
        if (!confirm('Bạn có chắc muốn xóa vai trò này?')) return;
        try {
            const res = await fetch(`/api/admin/roles/${roleId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            if (res.ok) fetchRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
        }
    };

    // Group permissions by category
    const groupedPermissions = PERMISSION_CATEGORIES.map(cat => ({
        ...cat,
        perms: permissions.filter(p => p.category === cat.key)
    }));

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="admin-roles-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="admin-roles-title">
                            <Shield className="inline-block mr-2 h-8 w-8 text-blue-600" />
                            Quản lý Vai trò
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Định nghĩa vai trò và phân quyền (Permissions) trong hệ thống.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {user?.role === 'SYS_ADMIN' && (
                            <Select value={filterOrg} onValueChange={setFilterOrg}>
                                <SelectTrigger className="w-[200px]" data-testid="filter-org">
                                    <SelectValue placeholder="Chọn phạm vi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MASTER">Vai trò Gốc (Mặc định)</SelectItem>
                                    <SelectItem value="ALL">Tất cả Vai trò Tổ chức</SelectItem>
                                    {orgs.map(o => (
                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                            onClick={handleCreate}
                            data-testid="btn-create-role"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo Vai trò mới
                        </Button>
                    </div>
                </div>

                {/* Roles List */}
                {
                    loading ? (
                        <div className="grid gap-4" data-testid="roles-loading">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-28 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : roles.length > 0 ? (
                        <div className="grid gap-4" data-testid="roles-list">
                            {roles.map((role) => (
                                <RoleCard
                                    key={role.id}
                                    role={role}
                                    onView={() => handleView(role)}
                                    onEdit={() => handleEdit(role)}
                                    onDelete={() => handleDelete(role.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-none shadow-sm" data-testid="roles-empty">
                            <CardContent className="py-16 text-center">
                                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                    <Shield className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    Chưa có vai trò nào
                                </h3>
                                <p className="text-slate-500">
                                    Tạo vai trò đầu tiên cho tổ chức.
                                </p>
                            </CardContent>
                        </Card>
                    )
                }

                {/* Detail Dialog */}
                <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                    <DialogContent className="sm:max-w-lg" data-testid="dialog-role-detail">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                {selectedRole?.name}
                            </DialogTitle>
                        </DialogHeader>

                        {selectedRole && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Mã (Code):</span>
                                        <p className="font-mono font-medium">{selectedRole.code}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Loại:</span>
                                        <p>{selectedRole.is_system ? 'Vai trò Hệ thống' : 'Vai trò Tùy chỉnh'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-700 mb-2">Quyền hạn ({selectedRole.permissions.length})</h4>
                                    <div className="flex flex-wrap gap-1 max-h-40 overflow-auto">
                                        {selectedRole.permissions.map(p => (
                                            <Badge key={p} variant="secondary" className="text-xs">
                                                {p}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Create/Edit Dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto" data-testid="dialog-role-edit">
                        <DialogHeader>
                            <DialogTitle>
                                {editMode === 'create' ? 'Tạo vai trò mới' : 'Chỉnh sửa vai trò'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Tên Vai trò</label>
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Lập trình viên Cao cấp"
                                        data-testid="input-role-name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Mã (Code)</label>
                                    <Input
                                        value={editCode}
                                        onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                                        placeholder="SENIOR_DEV"
                                        disabled={editMode === 'edit'}
                                        data-testid="input-role-code"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Mô tả</label>
                                <Input
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Nhân viên senior với quyền đặc biệt..."
                                    data-testid="input-role-description"
                                />
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-700">Quyền hạn (Permissions)</h4>
                                {groupedPermissions.map(cat => (
                                    <div key={cat.key} className="space-y-2">
                                        <p className="text-sm font-medium text-slate-500">{cat.label}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {cat.perms.map(perm => (
                                                <label
                                                    key={perm.code}
                                                    className="flex items-center gap-2 cursor-pointer text-sm"
                                                >
                                                    <Checkbox
                                                        checked={editPermissions.includes(perm.code)}
                                                        onCheckedChange={() => togglePermission(perm.code)}
                                                    />
                                                    {perm.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Hủy</Button>
                            </DialogClose>
                            <Button
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={handleSave}
                                data-testid="btn-save-role"
                            >
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Lưu
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div >
        </AppLayout >
    );
}
