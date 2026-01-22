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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DollarSign,
    Search,
    Plus,
    Edit2,
    Trash2,
    TrendingUp,
    Users,
    Building2,
    Award,
    RefreshCw,
    ArrowUpDown,
    BarChart3,
    Briefcase,
    Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

// Types
interface JobLevel {
    id: string;
    code: string;
    name: string;
    sort_order: number;
    employee_count: number;
    min_salary?: number;
    max_salary?: number;
    created_at: string;
}

interface EmployeeCompensation {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    level_id: string;
    level_name: string;
    level_code: string;
    monthly_salary: number;
    hourly_cost_rate: number;
    currency: string;
    effective_from: string;
    effective_to: string | null;
    department: string;
    position: string;
}

export default function SalaryManagementPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('compensations');

    // Job Levels State
    const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
    const [loadingLevels, setLoadingLevels] = useState(true);

    // Compensations State
    const [compensations, setCompensations] = useState<EmployeeCompensation[]>([]);
    const [loadingCompensations, setLoadingCompensations] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('ALL');

    // Dialogs
    const [editLevelDialogOpen, setEditLevelDialogOpen] = useState(false);
    const [editCompensationDialogOpen, setEditCompensationDialogOpen] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<JobLevel | null>(null);
    const [selectedCompensation, setSelectedCompensation] = useState<EmployeeCompensation | null>(null);

    // Form states
    const [levelForm, setLevelForm] = useState({ code: '', name: '', min_salary: '', max_salary: '' });
    const [compForm, setCompForm] = useState({ monthly_salary: '', hourly_cost_rate: '', level_id: '', effective_from: '' });

    useEffect(() => {
        fetchJobLevels();
        fetchCompensations();
    }, []);

    const fetchJobLevels = async () => {
        setLoadingLevels(true);
        try {
            // Mock data - US-CEO-02-01
            const mockLevels: JobLevel[] = [
                { id: 'lv1', code: 'INTERN', name: 'Thực tập sinh', sort_order: 1, employee_count: 5, min_salary: 3000000, max_salary: 6000000, created_at: '2024-01-01' },
                { id: 'lv2', code: 'FRESHER', name: 'Fresher', sort_order: 2, employee_count: 12, min_salary: 8000000, max_salary: 12000000, created_at: '2024-01-01' },
                { id: 'lv3', code: 'JUNIOR', name: 'Junior', sort_order: 3, employee_count: 18, min_salary: 12000000, max_salary: 20000000, created_at: '2024-01-01' },
                { id: 'lv4', code: 'MIDDLE', name: 'Middle', sort_order: 4, employee_count: 25, min_salary: 20000000, max_salary: 35000000, created_at: '2024-01-01' },
                { id: 'lv5', code: 'SENIOR', name: 'Senior', sort_order: 5, employee_count: 15, min_salary: 35000000, max_salary: 55000000, created_at: '2024-01-01' },
                { id: 'lv6', code: 'LEAD', name: 'Team Lead', sort_order: 6, employee_count: 8, min_salary: 45000000, max_salary: 70000000, created_at: '2024-01-01' },
                { id: 'lv7', code: 'MANAGER', name: 'Manager', sort_order: 7, employee_count: 4, min_salary: 60000000, max_salary: 100000000, created_at: '2024-01-01' },
            ];
            setJobLevels(mockLevels);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingLevels(false);
        }
    };

    const fetchCompensations = async () => {
        setLoadingCompensations(true);
        try {
            // Mock data - US-MNG-03-02
            const mockCompensations: EmployeeCompensation[] = [
                { id: 'c1', user_id: 'u1', user_name: 'Nguyễn Văn A', user_email: 'nguyen.a@company.com', level_id: 'lv5', level_name: 'Senior', level_code: 'SENIOR', monthly_salary: 45000000, hourly_cost_rate: 270000, currency: 'VND', effective_from: '2024-01-01', effective_to: null, department: 'Engineering', position: 'Senior Developer' },
                { id: 'c2', user_id: 'u2', user_name: 'Trần Thị B', user_email: 'tran.b@company.com', level_id: 'lv6', level_name: 'Team Lead', level_code: 'LEAD', monthly_salary: 55000000, hourly_cost_rate: 330000, currency: 'VND', effective_from: '2024-03-01', effective_to: null, department: 'Design', position: 'Design Lead' },
                { id: 'c3', user_id: 'u3', user_name: 'Lê Văn C', user_email: 'le.c@company.com', level_id: 'lv3', level_name: 'Junior', level_code: 'JUNIOR', monthly_salary: 15000000, hourly_cost_rate: 90000, currency: 'VND', effective_from: '2024-06-01', effective_to: null, department: 'Engineering', position: 'Junior Developer' },
                { id: 'c4', user_id: 'u4', user_name: 'Phạm Thị D', user_email: 'pham.d@company.com', level_id: 'lv4', level_name: 'Middle', level_code: 'MIDDLE', monthly_salary: 28000000, hourly_cost_rate: 168000, currency: 'VND', effective_from: '2024-02-01', effective_to: null, department: 'Marketing', position: 'Marketing Specialist' },
                { id: 'c5', user_id: 'u5', user_name: 'Hoàng Văn E', user_email: 'hoang.e@company.com', level_id: 'lv2', level_name: 'Fresher', level_code: 'FRESHER', monthly_salary: 10000000, hourly_cost_rate: 60000, currency: 'VND', effective_from: '2024-09-01', effective_to: null, department: 'Customer Support', position: 'Support Agent' },
                { id: 'c6', user_id: 'u6', user_name: 'Đỗ Minh F', user_email: 'do.f@company.com', level_id: 'lv7', level_name: 'Manager', level_code: 'MANAGER', monthly_salary: 75000000, hourly_cost_rate: 450000, currency: 'VND', effective_from: '2023-01-01', effective_to: null, department: 'Engineering', position: 'Engineering Manager' },
            ];
            setCompensations(mockCompensations);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCompensations(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const getLevelBadgeColor = (code: string) => {
        const colors: Record<string, string> = {
            'INTERN': 'bg-slate-100 text-slate-700 border-slate-200',
            'FRESHER': 'bg-blue-100 text-blue-700 border-blue-200',
            'JUNIOR': 'bg-cyan-100 text-cyan-700 border-cyan-200',
            'MIDDLE': 'bg-green-100 text-green-700 border-green-200',
            'SENIOR': 'bg-purple-100 text-purple-700 border-purple-200',
            'LEAD': 'bg-orange-100 text-orange-700 border-orange-200',
            'MANAGER': 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[code] || 'bg-slate-100 text-slate-700';
    };

    const filteredCompensations = compensations.filter(c => {
        const matchSearch = c.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.position.toLowerCase().includes(searchQuery.toLowerCase());
        const matchLevel = levelFilter === 'ALL' || c.level_id === levelFilter;
        return matchSearch && matchLevel;
    });

    const totalMonthlySalary = compensations.reduce((sum, c) => sum + c.monthly_salary, 0);
    const avgSalary = compensations.length > 0 ? totalMonthlySalary / compensations.length : 0;

    const openEditLevel = (level: JobLevel | null) => {
        setSelectedLevel(level);
        if (level) {
            setLevelForm({
                code: level.code,
                name: level.name,
                min_salary: level.min_salary?.toString() || '',
                max_salary: level.max_salary?.toString() || '',
            });
        } else {
            setLevelForm({ code: '', name: '', min_salary: '', max_salary: '' });
        }
        setEditLevelDialogOpen(true);
    };

    const openEditCompensation = (comp: EmployeeCompensation) => {
        setSelectedCompensation(comp);
        setCompForm({
            monthly_salary: comp.monthly_salary.toString(),
            hourly_cost_rate: comp.hourly_cost_rate.toString(),
            level_id: comp.level_id,
            effective_from: comp.effective_from,
        });
        setEditCompensationDialogOpen(true);
    };

    const handleSaveLevel = () => {
        // TODO: Call API to save level
        console.log('Save level:', levelForm);
        setEditLevelDialogOpen(false);
        fetchJobLevels();
    };

    const handleSaveCompensation = () => {
        // TODO: Call API to save compensation
        console.log('Save compensation:', compForm);
        setEditCompensationDialogOpen(false);
        fetchCompensations();
    };

    const canEdit = user?.role === 'CEO' || user?.role === 'ORG_ADMIN' || user?.role === 'PROJECT_MANAGER';

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="salary-management-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="salary-page-title">
                            <DollarSign className="inline-block mr-3 h-8 w-8 text-emerald-600" />
                            Quản lý Lương & Cấp bậc
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Quản lý cấp bậc và mức lương nhân sự (US-MNG-03-02, US-CEO-02-01)
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => { fetchJobLevels(); fetchCompensations(); }} data-testid="btn-refresh-salary">
                        <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600 text-white" data-testid="stat-total-payroll">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs opacity-80 font-medium">Tổng quỹ lương/tháng</p>
                                    <p className="text-xl font-bold">{formatCurrency(totalMonthlySalary)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-avg-salary">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <BarChart3 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Lương trung bình</p>
                                    <p className="text-xl font-bold text-slate-900">{formatCurrency(avgSalary)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-total-employees">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Tổng nhân sự</p>
                                    <p className="text-xl font-bold text-slate-900">{compensations.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-total-levels">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <Award className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Số cấp bậc</p>
                                    <p className="text-xl font-bold text-slate-900">{jobLevels.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="salary-tabs">
                    <TabsList className="bg-white p-1 border border-slate-200 rounded-lg">
                        <TabsTrigger value="compensations" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                            <DollarSign className="mr-2 h-4 w-4" /> Bảng lương nhân sự
                        </TabsTrigger>
                        <TabsTrigger value="levels" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                            <Award className="mr-2 h-4 w-4" /> Danh mục cấp bậc
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Compensations */}
                    <TabsContent value="compensations" className="space-y-4 animate-in fade-in duration-300">
                        {/* Filters */}
                        <Card className="border-none shadow-sm" data-testid="compensation-filters">
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
                                                data-testid="input-search-compensation"
                                            />
                                        </div>
                                    </div>
                                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                                        <SelectTrigger className="w-[180px]" data-testid="filter-level">
                                            <SelectValue placeholder="Cấp bậc" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tất cả cấp bậc</SelectItem>
                                            {jobLevels.map(lv => (
                                                <SelectItem key={lv.id} value={lv.id}>{lv.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compensations Table */}
                        <Card className="border-none shadow-sm" data-testid="compensations-table-card">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold">Bảng lương nhân sự</CardTitle>
                                <CardDescription>Thông tin lương và chi phí nhân công theo cấp bậc</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loadingCompensations ? (
                                    <div className="p-6 space-y-4" data-testid="loading-compensations">
                                        {[1, 2, 3, 4].map(i => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : filteredCompensations.length > 0 ? (
                                    <Table data-testid="compensations-table">
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="font-bold">Nhân viên</TableHead>
                                                <TableHead className="font-bold">Cấp bậc</TableHead>
                                                <TableHead className="font-bold">Phòng ban</TableHead>
                                                <TableHead className="font-bold text-right">Lương tháng</TableHead>
                                                <TableHead className="font-bold text-right">Chi phí/giờ</TableHead>
                                                <TableHead className="font-bold">Hiệu lực từ</TableHead>
                                                {canEdit && <TableHead className="text-right font-bold">Thao tác</TableHead>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCompensations.map((comp) => (
                                                <TableRow key={comp.id} data-testid={`compensation-row-${comp.id}`}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-sm">
                                                                    {comp.user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{comp.user_name}</p>
                                                                <p className="text-xs text-slate-400">{comp.position}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={cn('font-medium', getLevelBadgeColor(comp.level_code))}>
                                                            {comp.level_name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                                            <Building2 className="h-3 w-3" />
                                                            {comp.department}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-emerald-600" data-testid={`salary-${comp.id}`}>
                                                        {formatCurrency(comp.monthly_salary)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-slate-600" data-testid={`hourly-rate-${comp.id}`}>
                                                        {formatCurrency(comp.hourly_cost_rate)}/h
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                                            <Calendar className="h-3 w-3" />
                                                            {comp.effective_from}
                                                        </div>
                                                    </TableCell>
                                                    {canEdit && (
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openEditCompensation(comp)}
                                                                data-testid={`btn-edit-compensation-${comp.id}`}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="p-12 text-center" data-testid="empty-compensations">
                                        <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">Không tìm thấy dữ liệu lương</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Job Levels */}
                    <TabsContent value="levels" className="space-y-4 animate-in fade-in duration-300">
                        <Card className="border-none shadow-sm" data-testid="job-levels-card">
                            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold">Danh mục cấp bậc</CardTitle>
                                    <CardDescription>Quản lý các cấp bậc và khung lương tương ứng</CardDescription>
                                </div>
                                {canEdit && (
                                    <Button onClick={() => openEditLevel(null)} data-testid="btn-add-level">
                                        <Plus className="mr-2 h-4 w-4" /> Thêm cấp bậc
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {loadingLevels ? (
                                    <div className="p-6 space-y-4" data-testid="loading-levels">
                                        {[1, 2, 3, 4].map(i => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <Table data-testid="job-levels-table">
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="font-bold w-[60px]">STT</TableHead>
                                                <TableHead className="font-bold">Mã</TableHead>
                                                <TableHead className="font-bold">Tên cấp bậc</TableHead>
                                                <TableHead className="font-bold text-right">Khung lương</TableHead>
                                                <TableHead className="font-bold text-center">Số nhân sự</TableHead>
                                                {canEdit && <TableHead className="text-right font-bold">Thao tác</TableHead>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {jobLevels.map((level, index) => (
                                                <TableRow key={level.id} data-testid={`level-row-${level.id}`}>
                                                    <TableCell className="font-medium text-slate-400">{index + 1}</TableCell>
                                                    <TableCell>
                                                        <Badge className={cn('font-mono', getLevelBadgeColor(level.code))}>
                                                            {level.code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{level.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="text-sm">
                                                            <span className="text-slate-500">
                                                                {level.min_salary ? formatCurrency(level.min_salary) : 'N/A'}
                                                            </span>
                                                            <span className="mx-1 text-slate-300">-</span>
                                                            <span className="font-medium text-slate-700">
                                                                {level.max_salary ? formatCurrency(level.max_salary) : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="font-medium">
                                                            {level.employee_count} người
                                                        </Badge>
                                                    </TableCell>
                                                    {canEdit && (
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => openEditLevel(level)}
                                                                    data-testid={`btn-edit-level-${level.id}`}
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                    data-testid={`btn-delete-level-${level.id}`}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Edit Level Dialog */}
                <Dialog open={editLevelDialogOpen} onOpenChange={setEditLevelDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="edit-level-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {selectedLevel ? 'Chỉnh sửa cấp bậc' : 'Thêm cấp bậc mới'}
                            </DialogTitle>
                            <DialogDescription>
                                Nhập thông tin cấp bậc và khung lương
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Mã cấp bậc</label>
                                    <Input
                                        value={levelForm.code}
                                        onChange={(e) => setLevelForm({ ...levelForm, code: e.target.value.toUpperCase() })}
                                        placeholder="VD: SENIOR"
                                        className="mt-1"
                                        data-testid="input-level-code"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Tên hiển thị</label>
                                    <Input
                                        value={levelForm.name}
                                        onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                                        placeholder="VD: Senior Developer"
                                        className="mt-1"
                                        data-testid="input-level-name"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Lương tối thiểu</label>
                                    <Input
                                        type="number"
                                        value={levelForm.min_salary}
                                        onChange={(e) => setLevelForm({ ...levelForm, min_salary: e.target.value })}
                                        placeholder="VND"
                                        className="mt-1"
                                        data-testid="input-min-salary"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Lương tối đa</label>
                                    <Input
                                        type="number"
                                        value={levelForm.max_salary}
                                        onChange={(e) => setLevelForm({ ...levelForm, max_salary: e.target.value })}
                                        placeholder="VND"
                                        className="mt-1"
                                        data-testid="input-max-salary"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditLevelDialogOpen(false)}>Hủy</Button>
                            <Button onClick={handleSaveLevel} data-testid="btn-save-level">Lưu thay đổi</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Compensation Dialog */}
                <Dialog open={editCompensationDialogOpen} onOpenChange={setEditCompensationDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="edit-compensation-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Cập nhật lương</DialogTitle>
                            <DialogDescription>
                                Chỉnh sửa thông tin lương cho {selectedCompensation?.user_name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Cấp bậc</label>
                                <Select value={compForm.level_id} onValueChange={(v) => setCompForm({ ...compForm, level_id: v })}>
                                    <SelectTrigger className="mt-1" data-testid="select-comp-level">
                                        <SelectValue placeholder="Chọn cấp bậc" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobLevels.map(lv => (
                                            <SelectItem key={lv.id} value={lv.id}>{lv.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Lương tháng (VND)</label>
                                    <Input
                                        type="number"
                                        value={compForm.monthly_salary}
                                        onChange={(e) => setCompForm({ ...compForm, monthly_salary: e.target.value })}
                                        className="mt-1"
                                        data-testid="input-monthly-salary"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Chi phí/giờ (VND)</label>
                                    <Input
                                        type="number"
                                        value={compForm.hourly_cost_rate}
                                        onChange={(e) => setCompForm({ ...compForm, hourly_cost_rate: e.target.value })}
                                        className="mt-1"
                                        data-testid="input-hourly-rate"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Hiệu lực từ ngày</label>
                                <Input
                                    type="date"
                                    value={compForm.effective_from}
                                    onChange={(e) => setCompForm({ ...compForm, effective_from: e.target.value })}
                                    className="mt-1"
                                    data-testid="input-effective-from"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditCompensationDialogOpen(false)}>Hủy</Button>
                            <Button onClick={handleSaveCompensation} data-testid="btn-save-compensation">Lưu thay đổi</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
