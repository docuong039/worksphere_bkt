'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    DialogDescription,
    DialogFooter,
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
    Search,
    Plus,
    UserPlus,
    Mail,
    Phone,
    Building2,
    Calendar,
    MoreVertical,
    Edit2,
    UserX,
    UserCheck,
    KeyRound,
    Eye,
    RefreshCw,
    CheckCircle2,
    Clock,
    XCircle,
    Filter,
    Download,
    Briefcase,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Employee {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    role: 'EMPLOYEE' | 'PROJECT_MANAGER' | 'CEO' | 'ORG_ADMIN';
    member_status: 'ACTIVE' | 'INVITED' | 'DEACTIVATED';
    department: string;
    position: string;
    join_method: 'MANUAL' | 'INVITE';
    joined_at: string | null;
    created_at: string;
}

export default function EmployeesListPage() {
    const { user } = useAuthStore();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');

    // Dialogs
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [newEmployeeForm, setNewEmployeeForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: 'EMPLOYEE',
        department: '',
        position: '',
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            // Mock data - US-ORG-01-01
            const mockEmployees: Employee[] = [
                { id: 'e1', full_name: 'Nguyễn Văn A', email: 'nguyen.a@company.com', phone: '0987654321', avatar_url: null, role: 'PROJECT_MANAGER', member_status: 'ACTIVE', department: 'Engineering', position: 'Engineering Manager', join_method: 'MANUAL', joined_at: '2023-01-15', created_at: '2023-01-10' },
                { id: 'e2', full_name: 'Trần Thị B', email: 'tran.b@company.com', phone: '0912345678', avatar_url: null, role: 'EMPLOYEE', member_status: 'ACTIVE', department: 'Design', position: 'Lead Designer', join_method: 'INVITE', joined_at: '2023-06-01', created_at: '2023-05-20' },
                { id: 'e3', full_name: 'Lê Văn C', email: 'le.c@company.com', phone: '0901234567', avatar_url: null, role: 'EMPLOYEE', member_status: 'INVITED', department: 'Engineering', position: 'Junior Developer', join_method: 'INVITE', joined_at: null, created_at: '2025-01-18' },
                { id: 'e4', full_name: 'Phạm Thị D', email: 'pham.d@company.com', phone: '0976543210', avatar_url: null, role: 'EMPLOYEE', member_status: 'DEACTIVATED', department: 'Marketing', position: 'Marketing Specialist', join_method: 'MANUAL', joined_at: '2024-01-01', created_at: '2023-12-20' },
                { id: 'e5', full_name: 'Hoàng Văn E', email: 'hoang.e@company.com', phone: '0965432109', avatar_url: null, role: 'EMPLOYEE', member_status: 'ACTIVE', department: 'Customer Support', position: 'Support Agent', join_method: 'INVITE', joined_at: '2024-09-01', created_at: '2024-08-25' },
                { id: 'e6', full_name: 'Đỗ Minh F', email: 'do.f@company.com', phone: '0954321098', avatar_url: null, role: 'CEO', member_status: 'ACTIVE', department: 'Executive', position: 'Chief Executive Officer', join_method: 'MANUAL', joined_at: '2022-01-01', created_at: '2022-01-01' },
                { id: 'e7', full_name: 'Vũ Thị G', email: 'vu.g@company.com', phone: '0943210987', avatar_url: null, role: 'PROJECT_MANAGER', member_status: 'ACTIVE', department: 'Engineering', position: 'Tech Lead', join_method: 'MANUAL', joined_at: '2023-03-15', created_at: '2023-03-10' },
                { id: 'e8', full_name: 'Ngô Văn H', email: 'ngo.h@company.com', phone: '0932109876', avatar_url: null, role: 'EMPLOYEE', member_status: 'ACTIVE', department: 'Engineering', position: 'Senior Developer', join_method: 'INVITE', joined_at: '2024-02-01', created_at: '2024-01-20' },
            ];
            setEmployees(mockEmployees);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle2 className="mr-1 h-3 w-3" />Đang hoạt động</Badge>;
            case 'INVITED':
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="mr-1 h-3 w-3" />Chờ xác nhận</Badge>;
            case 'DEACTIVATED':
                return <Badge className="bg-slate-100 text-slate-600 border-slate-200"><XCircle className="mr-1 h-3 w-3" />Đã vô hiệu hóa</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'CEO':
                return <Badge className="bg-purple-100 text-purple-700 border-purple-200">CEO</Badge>;
            case 'ORG_ADMIN':
                return <Badge className="bg-red-100 text-red-700 border-red-200">Org Admin</Badge>;
            case 'PROJECT_MANAGER':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Quản lý</Badge>;
            case 'EMPLOYEE':
                return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Nhân viên</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchSearch = emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || emp.member_status === statusFilter;
        const matchRole = roleFilter === 'ALL' || emp.role === roleFilter;
        const matchDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
        return matchSearch && matchStatus && matchRole && matchDept;
    });

    const departments = [...new Set(employees.map(e => e.department))];

    const stats = {
        total: employees.length,
        active: employees.filter(e => e.member_status === 'ACTIVE').length,
        invited: employees.filter(e => e.member_status === 'INVITED').length,
        deactivated: employees.filter(e => e.member_status === 'DEACTIVATED').length,
    };

    const handleSendInvite = () => {
        console.log('Send invite to:', inviteEmail);
        setInviteDialogOpen(false);
        setInviteEmail('');
    };

    const handleCreateEmployee = () => {
        console.log('Create employee:', newEmployeeForm);
        setCreateDialogOpen(false);
        setNewEmployeeForm({ full_name: '', email: '', phone: '', role: 'EMPLOYEE', department: '', position: '' });
        fetchEmployees();
    };

    const canManage = user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="employees-list-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="employees-page-title">
                            <Users className="inline-block mr-3 h-8 w-8 text-blue-600" />
                            Danh sách Nhân viên
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Quản lý vòng đời nhân sự (US-ORG-01-01 đến US-ORG-01-05)
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchEmployees} data-testid="btn-refresh-employees">
                            <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
                        </Button>
                        {canManage && (
                            <>
                                <Button variant="outline" onClick={() => setInviteDialogOpen(true)} data-testid="btn-invite-employee">
                                    <Mail className="mr-2 h-4 w-4" /> Gửi lời mời
                                </Button>
                                <Button onClick={() => setCreateDialogOpen(true)} data-testid="btn-create-employee">
                                    <UserPlus className="mr-2 h-4 w-4" /> Tạo nhân viên
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm" data-testid="stat-total-employees">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Tổng nhân sự</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-active-employees">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Đang hoạt động</p>
                                    <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-invited-employees">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Chờ xác nhận</p>
                                    <p className="text-2xl font-bold text-amber-600">{stats.invited}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-deactivated-employees">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <XCircle className="h-6 w-6 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Đã vô hiệu hóa</p>
                                    <p className="text-2xl font-bold text-slate-500">{stats.deactivated}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-none shadow-sm" data-testid="employees-filters">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm theo tên, email, vị trí..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                        data-testid="input-search-employees"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[170px]" data-testid="filter-status">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                                    <SelectItem value="INVITED">Chờ xác nhận</SelectItem>
                                    <SelectItem value="DEACTIVATED">Đã vô hiệu hóa</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[150px]" data-testid="filter-role">
                                    <SelectValue placeholder="Vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                                    <SelectItem value="CEO">CEO</SelectItem>
                                    <SelectItem value="PROJECT_MANAGER">Quản lý</SelectItem>
                                    <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-[170px]" data-testid="filter-department">
                                    <SelectValue placeholder="Phòng ban" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
                                    {departments.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Employees Table */}
                <Card className="border-none shadow-sm" data-testid="employees-table-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách nhân viên</CardTitle>
                        <CardDescription>Quản lý thông tin và trạng thái nhân sự trong tổ chức</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="loading-employees">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : filteredEmployees.length > 0 ? (
                            <Table data-testid="employees-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold">Nhân viên</TableHead>
                                        <TableHead className="font-bold">Vai trò</TableHead>
                                        <TableHead className="font-bold">Phòng ban</TableHead>
                                        <TableHead className="font-bold">Trạng thái</TableHead>
                                        <TableHead className="font-bold">Ngày tham gia</TableHead>
                                        <TableHead className="text-right font-bold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.map((emp) => (
                                        <TableRow key={emp.id} data-testid={`employee-row-${emp.id}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.id}`} />
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold text-sm">
                                                            {emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-slate-900" data-testid={`emp-name-${emp.id}`}>{emp.full_name}</p>
                                                        <p className="text-xs text-slate-400">{emp.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell data-testid={`emp-role-${emp.id}`}>
                                                {getRoleBadge(emp.role)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                                    <Building2 className="h-3 w-3" />
                                                    <span>{emp.department}</span>
                                                </div>
                                                <p className="text-xs text-slate-400">{emp.position}</p>
                                            </TableCell>
                                            <TableCell data-testid={`emp-status-${emp.id}`}>
                                                {getStatusBadge(emp.member_status)}
                                            </TableCell>
                                            <TableCell>
                                                {emp.joined_at ? (
                                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                                        <Calendar className="h-3 w-3" />
                                                        {emp.joined_at}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Chưa tham gia</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" data-testid={`btn-actions-${emp.id}`}>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/hr/employees/${emp.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" /> Xem hồ sơ
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {canManage && (
                                                            <>
                                                                <DropdownMenuItem>
                                                                    <Edit2 className="mr-2 h-4 w-4" /> Chỉnh sửa
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <KeyRound className="mr-2 h-4 w-4" /> Reset mật khẩu
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {emp.member_status === 'ACTIVE' ? (
                                                                    <DropdownMenuItem className="text-red-600">
                                                                        <UserX className="mr-2 h-4 w-4" /> Vô hiệu hóa
                                                                    </DropdownMenuItem>
                                                                ) : emp.member_status === 'DEACTIVATED' && (
                                                                    <DropdownMenuItem className="text-emerald-600">
                                                                        <UserCheck className="mr-2 h-4 w-4" /> Kích hoạt lại
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-12 text-center" data-testid="empty-employees">
                                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Không tìm thấy nhân viên</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Invite Dialog - US-ORG-01-02 */}
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="invite-employee-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Gửi lời mời</DialogTitle>
                            <DialogDescription>
                                Gửi link mời gia nhập tổ chức qua email (US-ORG-01-02)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Email người được mời</label>
                                <Input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="mt-1"
                                    data-testid="input-invite-email"
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                Người nhận sẽ nhận được email chưa link để tự đăng ký thông tin cá nhân và mật khẩu.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Hủy</Button>
                            <Button onClick={handleSendInvite} data-testid="btn-send-invite">
                                <Mail className="mr-2 h-4 w-4" /> Gửi lời mời
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Employee Dialog - US-ORG-01-01 */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent className="sm:max-w-lg" data-testid="create-employee-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Tạo nhân viên mới</DialogTitle>
                            <DialogDescription>
                                Tạo trực tiếp tài khoản cho nhân viên (US-ORG-01-01)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Họ và tên *</label>
                                    <Input
                                        value={newEmployeeForm.full_name}
                                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, full_name: e.target.value })}
                                        placeholder="Nguyễn Văn A"
                                        className="mt-1"
                                        data-testid="input-emp-fullname"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Email *</label>
                                    <Input
                                        type="email"
                                        value={newEmployeeForm.email}
                                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                                        placeholder="email@company.com"
                                        className="mt-1"
                                        data-testid="input-emp-email"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                                    <Input
                                        value={newEmployeeForm.phone}
                                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, phone: e.target.value })}
                                        placeholder="0987654321"
                                        className="mt-1"
                                        data-testid="input-emp-phone"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Vai trò</label>
                                    <Select value={newEmployeeForm.role} onValueChange={(v) => setNewEmployeeForm({ ...newEmployeeForm, role: v })}>
                                        <SelectTrigger className="mt-1" data-testid="select-emp-role">
                                            <SelectValue placeholder="Chọn vai trò" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                                            <SelectItem value="PROJECT_MANAGER">Quản lý dự án</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Phòng ban</label>
                                    <Input
                                        value={newEmployeeForm.department}
                                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, department: e.target.value })}
                                        placeholder="Engineering"
                                        className="mt-1"
                                        data-testid="input-emp-department"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Vị trí</label>
                                    <Input
                                        value={newEmployeeForm.position}
                                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, position: e.target.value })}
                                        placeholder="Senior Developer"
                                        className="mt-1"
                                        data-testid="input-emp-position"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                Mật khẩu mặc định sẽ được gửi qua email cho nhân viên.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
                            <Button onClick={handleCreateEmployee} data-testid="btn-create-employee-submit">
                                <UserPlus className="mr-2 h-4 w-4" /> Tạo nhân viên
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
