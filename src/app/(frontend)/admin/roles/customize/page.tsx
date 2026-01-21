'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
    Shield,
    Plus,
    Edit2,
    Trash2,
    Copy,
    Save,
    RefreshCw,
    ChevronRight,
    Lock,
    Unlock,
    Search,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface Permission {
    id: string;
    key: string;
    name: string;
    description: string;
    category: string;
}

interface CustomRole {
    id: string;
    name: string;
    description: string;
    base_role: string;
    is_custom: boolean;
    permissions: string[];
    user_count: number;
    created_at: string;
}

const ALL_PERMISSIONS: Permission[] = [
    { id: 'p1', key: 'tasks.view', name: 'Xem Task', description: 'Quyền xem danh sách và chi tiết task', category: 'Tasks' },
    { id: 'p2', key: 'tasks.create', name: 'Tạo Task', description: 'Quyền tạo task mới', category: 'Tasks' },
    { id: 'p3', key: 'tasks.edit', name: 'Sửa Task', description: 'Quyền chỉnh sửa task', category: 'Tasks' },
    { id: 'p4', key: 'tasks.delete', name: 'Xóa Task', description: 'Quyền xóa task', category: 'Tasks' },
    { id: 'p5', key: 'tasks.assign', name: 'Phân công Task', description: 'Quyền assign task cho người khác', category: 'Tasks' },
    { id: 'p6', key: 'projects.view', name: 'Xem Project', description: 'Quyền xem danh sách dự án', category: 'Projects' },
    { id: 'p7', key: 'projects.create', name: 'Tạo Project', description: 'Quyền tạo dự án mới', category: 'Projects' },
    { id: 'p8', key: 'projects.edit', name: 'Sửa Project', description: 'Quyền chỉnh sửa dự án', category: 'Projects' },
    { id: 'p9', key: 'reports.view', name: 'Xem Report', description: 'Quyền xem báo cáo', category: 'Reports' },
    { id: 'p10', key: 'reports.create', name: 'Tạo Report', description: 'Quyền tạo báo cáo', category: 'Reports' },
    { id: 'p11', key: 'hr.view_salary', name: 'Xem Lương', description: 'Quyền xem thông tin lương', category: 'HR' },
    { id: 'p12', key: 'hr.edit_salary', name: 'Sửa Lương', description: 'Quyền chỉnh sửa lương', category: 'HR' },
    { id: 'p13', key: 'admin.users', name: 'Quản lý Users', description: 'Quyền quản trị người dùng', category: 'Admin' },
    { id: 'p14', key: 'admin.roles', name: 'Quản lý Roles', description: 'Quyền quản trị vai trò', category: 'Admin' },
];

export default function RoleCustomizationPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<CustomRole[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            // Mock data - US-ORG-02-03
            const mockRoles: CustomRole[] = [
                {
                    id: 'r1', name: 'Employee', description: 'Nhân viên thông thường',
                    base_role: 'EMPLOYEE', is_custom: false,
                    permissions: ['tasks.view', 'tasks.edit', 'reports.view', 'reports.create'],
                    user_count: 45, created_at: '2024-01-01'
                },
                {
                    id: 'r2', name: 'Project Manager', description: 'Quản lý dự án',
                    base_role: 'PROJECT_MANAGER', is_custom: false,
                    permissions: ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign', 'projects.view', 'projects.edit', 'reports.view', 'reports.create'],
                    user_count: 8, created_at: '2024-01-01'
                },
                {
                    id: 'r3', name: 'Senior Developer', description: 'Developer cao cấp có thêm quyền',
                    base_role: 'EMPLOYEE', is_custom: true,
                    permissions: ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign', 'reports.view', 'reports.create'],
                    user_count: 5, created_at: '2024-06-15'
                },
                {
                    id: 'r4', name: 'HR Manager', description: 'Quản lý nhân sự',
                    base_role: 'EMPLOYEE', is_custom: true,
                    permissions: ['tasks.view', 'reports.view', 'hr.view_salary', 'hr.edit_salary'],
                    user_count: 2, created_at: '2024-08-01'
                },
            ];
            setRoles(mockRoles);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openEditDialog = (role: CustomRole) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description,
            permissions: [...role.permissions],
        });
        setDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingRole(null);
        setFormData({
            name: '',
            description: '',
            permissions: [],
        });
        setDialogOpen(true);
    };

    const cloneRole = (role: CustomRole) => {
        setEditingRole(null);
        setFormData({
            name: `${role.name} (Copy)`,
            description: role.description,
            permissions: [...role.permissions],
        });
        setDialogOpen(true);
    };

    const handleTogglePermission = (permKey: string) => {
        if (formData.permissions.includes(permKey)) {
            setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permKey) });
        } else {
            setFormData({ ...formData, permissions: [...formData.permissions, permKey] });
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;
        setIsSubmitting(true);
        try {
            if (editingRole) {
                setRoles(roles.map(r =>
                    r.id === editingRole.id
                        ? { ...r, name: formData.name, description: formData.description, permissions: formData.permissions }
                        : r
                ));
            } else {
                const newRole: CustomRole = {
                    id: `r${Date.now()}`,
                    name: formData.name,
                    description: formData.description,
                    base_role: 'EMPLOYEE',
                    is_custom: true,
                    permissions: formData.permissions,
                    user_count: 0,
                    created_at: new Date().toISOString().split('T')[0],
                };
                setRoles([...roles, newRole]);
            }
            setDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        if (!role?.is_custom) {
            alert('Không thể xóa role mặc định');
            return;
        }
        if (role.user_count > 0) {
            if (!confirm(`Role "${role.name}" đang có ${role.user_count} users. Bạn có chắc muốn xóa?`)) return;
        }
        setRoles(roles.filter(r => r.id !== roleId));
    };

    const categories = [...new Set(ALL_PERMISSIONS.map(p => p.category))];

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="role-customization-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                            <Shield className="inline-block mr-3 h-8 w-8 text-blue-600" />
                            Tùy chỉnh Vai trò
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Tạo và tùy chỉnh quyền cho từng vai trò (US-ORG-02-03)
                        </p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={openCreateDialog}
                        data-testid="btn-create-role"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tạo vai trò mới
                    </Button>
                </div>

                {/* Search */}
                <Card className="border-none shadow-sm" data-testid="search-card">
                    <CardContent className="p-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm vai trò..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                                data-testid="input-search"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Roles List */}
                <Card className="border-none shadow-sm" data-testid="roles-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách vai trò</CardTitle>
                        <CardDescription>Click vào vai trò để chỉnh sửa quyền</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="loading-skeleton">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : (
                            <Table data-testid="roles-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold">Vai trò</TableHead>
                                        <TableHead className="font-bold">Loại</TableHead>
                                        <TableHead className="font-bold">Quyền</TableHead>
                                        <TableHead className="font-bold">Users</TableHead>
                                        <TableHead className="text-right font-bold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRoles.map(role => (
                                        <TableRow key={role.id} data-testid={`role-row-${role.id}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-lg ${role.is_custom ? 'bg-purple-100' : 'bg-blue-100'} flex items-center justify-center`}>
                                                        {role.is_custom ? (
                                                            <Unlock className="h-5 w-5 text-purple-600" />
                                                        ) : (
                                                            <Lock className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold" data-testid={`role-name-${role.id}`}>{role.name}</p>
                                                        <p className="text-xs text-slate-400">{role.description}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {role.is_custom ? (
                                                    <Badge className="bg-purple-100 text-purple-700">Tùy chỉnh</Badge>
                                                ) : (
                                                    <Badge variant="outline">Mặc định</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{role.permissions.length} quyền</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{role.user_count}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(role)}
                                                        data-testid={`btn-edit-${role.id}`}
                                                    >
                                                        <Edit2 className="mr-1 h-3 w-3" />
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => cloneRole(role)}
                                                        data-testid={`btn-clone-${role.id}`}
                                                    >
                                                        <Copy className="mr-1 h-3 w-3" />
                                                        Clone
                                                    </Button>
                                                    {role.is_custom && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(role.id)}
                                                            className="text-red-600"
                                                            data-testid={`btn-delete-${role.id}`}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="role-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingRole ? `Chỉnh sửa: ${editingRole.name}` : 'Tạo vai trò mới'}
                            </DialogTitle>
                            <DialogDescription>
                                Cấu hình tên và quyền cho vai trò
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Tên vai trò *</label>
                                    <Input
                                        placeholder="vd: Senior Developer"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        data-testid="input-name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Mô tả</label>
                                    <Input
                                        placeholder="Mô tả ngắn về vai trò"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        data-testid="input-description"
                                    />
                                </div>
                            </div>

                            {/* Permissions by Category */}
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-slate-700">
                                    Quyền ({formData.permissions.length} đã chọn)
                                </p>
                                {categories.map(category => (
                                    <div key={category} className="p-3 bg-slate-50 rounded-lg" data-testid={`category-${category}`}>
                                        <p className="font-medium text-slate-700 mb-2">{category}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ALL_PERMISSIONS.filter(p => p.category === category).map(perm => (
                                                <div
                                                    key={perm.id}
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${formData.permissions.includes(perm.key) ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
                                                    onClick={() => handleTogglePermission(perm.key)}
                                                    data-testid={`perm-${perm.key}`}
                                                >
                                                    <Checkbox
                                                        checked={formData.permissions.includes(perm.key)}
                                                        onCheckedChange={() => handleTogglePermission(perm.key)}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">{perm.name}</p>
                                                        <p className="text-xs text-slate-400">{perm.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="btn-cancel">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.name.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="btn-submit"
                            >
                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                {editingRole ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
