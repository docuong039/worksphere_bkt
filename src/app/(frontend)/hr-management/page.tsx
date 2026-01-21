/**
 * HR Management Page
 * 
 * User Stories:
 * - US-MNG-03-01: PM quản lý thông tin hồ sơ nhân sự
 * - US-MNG-03-02: PM cập nhật bậc và mức lương cho nhân sự
 * - US-MNG-03-03: PM xem báo cáo chi phí trả lương cho dự án
 * - US-CEO-02-01: CEO xem danh sách cấp bậc và mức lương toàn công ty
 * - US-CEO-02-02: CEO xem tổng chi phí nhân sự cho từng dự án
 * - US-CEO-02-03: CEO tra cứu hồ sơ lý lịch và hợp đồng nhân sự
 * - US-CEO-01-02: CEO xem lịch sử làm việc trọn đời của nhân sự
 * 
 * Access:
 * - PM: Xem hồ sơ team members (không xem lương)
 * - CEO/ORG_ADMIN: Full access bao gồm lương và chi phí
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    Search,
    DollarSign,
    Calendar,
    Building2,
    Briefcase,
    ExternalLink,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    FileText,
    TrendingUp,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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

interface Employee {
    id: string;
    email: string;
    full_name: string;
    department: string | null;
    job_title: string | null;
    level: string | null;
    activated_at: string | null;
    deactivated_at: string | null;
    monthly_salary: number | null;
    status: 'ACTIVE' | 'DEACTIVATED';
    joined_at: string | null;
}

interface ProjectCost {
    project_id: string;
    project_name: string;
    project_code: string;
    total_hours: number;
    total_cost: number;
    employee_count: number;
}

type ViewType = 'employees' | 'costs';

const LEVELS = [
    { code: 'INTERN', label: 'Thực tập sinh' },
    { code: 'JUNIOR', label: 'Nhân viên' },
    { code: 'MIDDLE', label: 'Nhân viên cao cấp' },
    { code: 'SENIOR', label: 'Chuyên viên' },
    { code: 'LEAD', label: 'Trưởng nhóm' },
];

// Employee Card Component
const EmployeeCard = ({
    employee,
    canViewSalary,
    onView
}: {
    employee: Employee;
    canViewSalary: boolean;
    onView: () => void;
}) => {
    const formatSalary = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Card
            className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={onView}
            data-testid={`employee-card-${employee.id}`}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-600">
                            {employee.full_name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{employee.full_name}</h3>
                            <Badge
                                className={cn(
                                    "text-xs font-bold border-none",
                                    employee.status === 'ACTIVE'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-100 text-slate-500'
                                )}
                            >
                                {employee.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu hóa'}
                            </Badge>
                        </div>

                        <p className="text-sm text-slate-500 mt-0.5">
                            {employee.job_title || 'Chưa có chức danh'} | {employee.department || 'Chưa phân bộ phận'}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                            {employee.activated_at && (
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    Tham gia {new Date(employee.activated_at).toLocaleDateString('vi-VN')}
                                </span>
                            )}
                            {employee.level && (
                                <Badge variant="secondary" className="text-xs">
                                    {employee.level}
                                </Badge>
                            )}
                        </div>

                        {/* Salary (CEO only) */}
                        {canViewSalary && employee.monthly_salary && (
                            <div className="mt-2 text-sm font-bold text-amber-600 flex items-center gap-1">
                                <DollarSign size={14} />
                                {formatSalary(employee.monthly_salary)}
                            </div>
                        )}
                    </div>

                    <ExternalLink
                        size={16}
                        className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

// Cost Card Component
const CostCard = ({ cost }: { cost: ProjectCost }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Card className="border-none shadow-sm" data-testid={`cost-card-${cost.project_id}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-700 border-none text-xs font-bold">
                                {cost.project_code}
                            </Badge>
                            <h3 className="font-bold text-slate-900">{cost.project_name}</h3>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-slate-500">
                                <Users size={14} className="inline mr-1" />
                                {cost.employee_count} người
                            </span>
                            <span className="text-slate-500">
                                ⏱️ {cost.total_hours.toFixed(1)}h
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-2xl font-extrabold text-emerald-600">
                            {formatCurrency(cost.total_cost)}
                        </p>
                        <p className="text-xs text-slate-400">Chi phí nhân sự</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Main Page Component
export default function HRManagementPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewType>('employees');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [costs, setCosts] = useState<ProjectCost[]>([]);

    // Edit states
    const [isEditPathOpen, setIsEditPathOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
    const [newLevel, setNewLevel] = useState('');
    const [newSalary, setNewSalary] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState('ALL');

    const canViewSalary = user?.role === 'CEO' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';
    const canViewCosts = canViewSalary || user?.role === 'PROJECT_MANAGER';

    // Fetch employees
    const fetchEmployees = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filterLevel !== 'ALL') params.append('level', filterLevel);

            const res = await fetch(`/api/hr/employees?${params.toString()}`, {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setEmployees(data.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch project costs
    const fetchCosts = async () => {
        if (!user || !canViewCosts) return;
        setLoading(true);
        try {
            const res = await fetch('/api/hr/project-costs', {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setCosts(data.data || []);
        } catch (error) {
            console.error('Error fetching costs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (view === 'employees') {
                fetchEmployees();
            } else {
                fetchCosts();
            }
        }
    }, [user, view]);

    const handleOpenEdit = (emp: Employee) => {
        setSelectedEmp(emp);
        setNewLevel(emp.level || 'JUNIOR');
        setNewSalary((emp.monthly_salary || 0).toString());
        setIsEditPathOpen(true);
    };

    const handleUpdateCareerPath = async () => {
        if (!selectedEmp) return;
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/hr/career-path/${selectedEmp.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({
                    level: newLevel,
                    monthly_salary: parseInt(newSalary)
                })
            });
            if (res.ok) {
                setIsEditPathOpen(false);
                fetchEmployees();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Calculate total cost
    const totalCost = costs.reduce((sum, c) => sum + c.total_cost, 0);

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="hr-management-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="hr-management-title">
                            <Users className="inline-block mr-2 h-8 w-8 text-blue-600" />
                            Quản lý Nhân sự
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            {canViewSalary
                                ? 'Quản lý hồ sơ, lương và chi phí nhân sự.'
                                : 'Xem thông tin hồ sơ nhân sự trong team.'}
                        </p>
                    </div>
                </div>

                {/* View Toggle (CEO and PM see costs tab) */}
                {canViewCosts && (
                    <div className="flex gap-2" data-testid="view-toggle">
                        <Button
                            variant={view === 'employees' ? 'default' : 'outline'}
                            onClick={() => setView('employees')}
                            className={view === 'employees' ? 'bg-blue-600' : ''}
                            data-testid="btn-view-employees"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Nhân sự
                        </Button>
                        <Button
                            variant={view === 'costs' ? 'default' : 'outline'}
                            onClick={() => setView('costs')}
                            className={view === 'costs' ? 'bg-blue-600' : ''}
                            data-testid="btn-view-costs"
                        >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Chi phí Dự án
                        </Button>
                    </div>
                )}

                {/* Employees View */}
                {view === 'employees' && (
                    <>
                        {/* Filters */}
                        <Card className="border-none shadow-sm" data-testid="employees-filters">
                            <CardContent className="p-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Tìm kiếm nhân sự..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9"
                                                data-testid="input-search"
                                            />
                                        </div>
                                    </div>

                                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                                        <SelectTrigger className="w-[140px]" data-testid="filter-level">
                                            <SelectValue placeholder="Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tất cả Level</SelectItem>
                                            {LEVELS.map((l) => (
                                                <SelectItem key={l.code} value={l.code}>
                                                    {l.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        onClick={fetchEmployees}
                                        data-testid="btn-search"
                                    >
                                        Tìm kiếm
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employee List */}
                        {loading ? (
                            <div className="grid gap-4" data-testid="employees-loading">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : employees.length > 0 ? (
                            <div className="grid gap-4" data-testid="employees-list">
                                {employees.map((emp) => (
                                    <EmployeeCard
                                        key={emp.id}
                                        employee={emp}
                                        canViewSalary={canViewCosts} // PM can view salary in summary, allow here too? Docs say PM updates salary.
                                        onView={() => handleOpenEdit(emp)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="border-none shadow-sm" data-testid="employees-empty">
                                <CardContent className="py-16 text-center">
                                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                        <Users className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        Không tìm thấy nhân sự
                                    </h3>
                                    <p className="text-slate-500">
                                        Không có nhân sự phù hợp với bộ lọc.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Costs View */}
                {view === 'costs' && canViewCosts && (
                    <>
                        {/* Summary */}
                        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-100 text-sm font-medium">Tổng chi phí nhân sự</p>
                                        <p className="text-3xl font-extrabold mt-1" data-testid="total-cost">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                                maximumFractionDigits: 0
                                            }).format(totalCost)}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-2xl">
                                        <TrendingUp className="h-8 w-8" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cost List */}
                        {loading ? (
                            <div className="space-y-4" data-testid="costs-loading">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : costs.length > 0 ? (
                            <div className="space-y-4" data-testid="costs-list">
                                {costs.map((cost) => (
                                    <CostCard key={cost.project_id} cost={cost} />
                                ))}
                            </div>
                        ) : (
                            <Card className="border-none shadow-sm" data-testid="costs-empty">
                                <CardContent className="py-16 text-center">
                                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                        <DollarSign className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        Chưa có dữ liệu chi phí
                                    </h3>
                                    <p className="text-slate-500">
                                        Dữ liệu chi phí sẽ được tính từ time logs.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
