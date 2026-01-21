'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DollarSign,
    Users,
    Search,
    Download,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Clock,
    Filter,
    Building2,
    Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface CostSummary {
    total_cost: number;
    total_hours: number;
    total_employees: number;
    avg_hourly_cost: number;
    cost_change: number;
    hours_change: number;
}

interface DepartmentCost {
    department: string;
    employee_count: number;
    total_hours: number;
    total_cost: number;
    cost_percent: number;
    avg_cost_per_employee: number;
}

interface EmployeeCost {
    user_id: string;
    full_name: string;
    email: string;
    department: string;
    position: string;
    hours_logged: number;
    hourly_rate: number;
    total_cost: number;
}

export default function OrgCostAnalysisPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<CostSummary | null>(null);
    const [departments, setDepartments] = useState<DepartmentCost[]>([]);
    const [employees, setEmployees] = useState<EmployeeCost[]>([]);
    const [timeRange, setTimeRange] = useState('month');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Mock data - US-CEO-02-01
            const mockSummary: CostSummary = {
                total_cost: 850000000,
                total_hours: 2450,
                total_employees: 45,
                avg_hourly_cost: 347000,
                cost_change: 8.5,
                hours_change: 12,
            };

            const mockDepartments: DepartmentCost[] = [
                { department: 'Engineering', employee_count: 20, total_hours: 1200, total_cost: 450000000, cost_percent: 52.9, avg_cost_per_employee: 22500000 },
                { department: 'Design', employee_count: 8, total_hours: 480, total_cost: 168000000, cost_percent: 19.8, avg_cost_per_employee: 21000000 },
                { department: 'Product', employee_count: 5, total_hours: 300, total_cost: 105000000, cost_percent: 12.4, avg_cost_per_employee: 21000000 },
                { department: 'QA', employee_count: 7, total_hours: 280, total_cost: 77000000, cost_percent: 9.1, avg_cost_per_employee: 11000000 },
                { department: 'Management', employee_count: 5, total_hours: 190, total_cost: 50000000, cost_percent: 5.9, avg_cost_per_employee: 10000000 },
            ];

            const mockEmployees: EmployeeCost[] = [
                { user_id: 'u1', full_name: 'Nguyễn Văn A', email: 'nguyen.a@company.com', department: 'Engineering', position: 'Tech Lead', hours_logged: 168, hourly_rate: 500000, total_cost: 84000000 },
                { user_id: 'u2', full_name: 'Trần Thị B', email: 'tran.b@company.com', department: 'Engineering', position: 'Senior Developer', hours_logged: 160, hourly_rate: 400000, total_cost: 64000000 },
                { user_id: 'u3', full_name: 'Lê Văn C', email: 'le.c@company.com', department: 'Design', position: 'Design Lead', hours_logged: 152, hourly_rate: 450000, total_cost: 68400000 },
                { user_id: 'u4', full_name: 'Phạm Thị D', email: 'pham.d@company.com', department: 'Product', position: 'Product Manager', hours_logged: 144, hourly_rate: 480000, total_cost: 69120000 },
                { user_id: 'u5', full_name: 'Hoàng Văn E', email: 'hoang.e@company.com', department: 'QA', position: 'QA Lead', hours_logged: 160, hourly_rate: 350000, total_cost: 56000000 },
                { user_id: 'u6', full_name: 'Vũ Thị F', email: 'vu.f@company.com', department: 'Engineering', position: 'Middle Developer', hours_logged: 168, hourly_rate: 350000, total_cost: 58800000 },
            ];

            setSummary(mockSummary);
            setDepartments(mockDepartments);
            setEmployees(mockEmployees);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(value);
    };

    const filteredEmployees = employees.filter(e => {
        const matchDepartment = departmentFilter === 'ALL' || e.department === departmentFilter;
        const matchSearch = e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchDepartment && matchSearch;
    });

    const allDepartments = [...new Set(employees.map(e => e.department))];

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="org-cost-analysis-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                            <DollarSign className="inline-block mr-3 h-8 w-8 text-emerald-600" />
                            Chi phí Nhân sự
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Phân tích chi phí nhân sự toàn tổ chức (US-CEO-02-01)
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[140px]" data-testid="select-time-range">
                                <SelectValue placeholder="Thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Tuần này</SelectItem>
                                <SelectItem value="month">Tháng này</SelectItem>
                                <SelectItem value="quarter">Quý này</SelectItem>
                                <SelectItem value="year">Năm nay</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" data-testid="btn-export">
                            <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4" data-testid="loading-skeleton">
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : summary && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50" data-testid="stat-total-cost">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            <TrendingUp className="h-3 w-3 mr-1" />+{summary.cost_change}%
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">Tổng chi phí</p>
                                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(summary.total_cost)}</p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm" data-testid="stat-total-hours">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-700">
                                            <TrendingUp className="h-3 w-3 mr-1" />+{summary.hours_change}%
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">Tổng giờ</p>
                                    <p className="text-3xl font-bold text-slate-900">{summary.total_hours.toLocaleString()}h</p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm" data-testid="stat-employees">
                                <CardContent className="p-6">
                                    <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                                        <Users className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">Nhân viên</p>
                                    <p className="text-3xl font-bold text-slate-900">{summary.total_employees}</p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm" data-testid="stat-avg-hourly">
                                <CardContent className="p-6">
                                    <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                                        <TrendingUp className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">Chi phí TB/giờ</p>
                                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(summary.avg_hourly_cost)}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Department Breakdown */}
                        <Card className="border-none shadow-sm" data-testid="department-breakdown-card">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    Chi phí theo Phòng ban
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4" data-testid="department-list">
                                    {departments.map(dept => (
                                        <div key={dept.department} className="flex items-center gap-4" data-testid={`dept-${dept.department}`}>
                                            <div className="w-32">
                                                <p className="font-medium text-slate-900">{dept.department}</p>
                                                <p className="text-xs text-slate-400">{dept.employee_count} người</p>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-end pr-2"
                                                        style={{ width: `${dept.cost_percent}%` }}
                                                    >
                                                        <span className="text-xs text-white font-medium">{dept.cost_percent.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-28 text-right">
                                                <p className="font-bold text-emerald-600">{formatCurrency(dept.total_cost)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employee Details */}
                        <Card className="border-none shadow-sm" data-testid="employee-details-card">
                            <CardHeader className="border-b border-slate-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-lg font-bold">Chi tiết theo nhân viên</CardTitle>
                                        <CardDescription>Top nhân viên theo chi phí</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Tìm nhân viên..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9 w-[200px]"
                                                data-testid="input-search"
                                            />
                                        </div>
                                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                            <SelectTrigger className="w-[150px]" data-testid="filter-department">
                                                <SelectValue placeholder="Phòng ban" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">Tất cả</SelectItem>
                                                {allDepartments.map(d => (
                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table data-testid="employees-table">
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="font-bold">Nhân viên</TableHead>
                                            <TableHead className="font-bold">Phòng ban</TableHead>
                                            <TableHead className="font-bold text-right">Giờ</TableHead>
                                            <TableHead className="font-bold text-right">Rate/h</TableHead>
                                            <TableHead className="font-bold text-right">Tổng</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEmployees.map(emp => (
                                            <TableRow key={emp.user_id} data-testid={`emp-row-${emp.user_id}`}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                                                                {emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{emp.full_name}</p>
                                                            <p className="text-xs text-slate-400">{emp.position}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{emp.department}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{emp.hours_logged}h</TableCell>
                                                <TableCell className="text-right">{formatCurrency(emp.hourly_rate)}</TableCell>
                                                <TableCell className="text-right font-bold text-emerald-600">
                                                    {formatCurrency(emp.total_cost)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
