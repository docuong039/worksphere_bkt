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
    FileText,
    Search,
    Download,
    Eye,
    Calendar,
    User,
    Building2,
    Filter,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    Clock,
    XCircle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface Contract {
    id: string;
    employee_id: string;
    employee_name: string;
    employee_email: string;
    contract_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'PROBATION';
    status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'TERMINATED';
    start_date: string;
    end_date: string | null;
    department: string;
    position: string;
    salary_gross: number;
    file_url?: string;
    signed_at?: string;
    created_at: string;
}

export default function ContractsPage() {
    const { user } = useAuthStore();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');

    // View Dialog
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            // Mock data - US-CEO-02-03
            const mockContracts: Contract[] = [
                {
                    id: 'ct-1', employee_id: 'u1', employee_name: 'Nguyễn Văn A',
                    employee_email: 'nguyen.a@company.com', contract_type: 'FULL_TIME',
                    status: 'ACTIVE', start_date: '2024-01-15', end_date: null,
                    department: 'Engineering', position: 'Senior Developer',
                    salary_gross: 35000000, signed_at: '2024-01-10', created_at: '2024-01-08T00:00:00Z'
                },
                {
                    id: 'ct-2', employee_id: 'u2', employee_name: 'Trần Thị B',
                    employee_email: 'tran.b@company.com', contract_type: 'FULL_TIME',
                    status: 'ACTIVE', start_date: '2023-06-01', end_date: null,
                    department: 'Design', position: 'Lead Designer',
                    salary_gross: 30000000, signed_at: '2023-05-25', created_at: '2023-05-20T00:00:00Z'
                },
                {
                    id: 'ct-3', employee_id: 'u3', employee_name: 'Lê Văn C',
                    employee_email: 'le.c@company.com', contract_type: 'PROBATION',
                    status: 'PENDING', start_date: '2025-02-01', end_date: '2025-04-01',
                    department: 'Engineering', position: 'Junior Developer',
                    salary_gross: 15000000, created_at: '2025-01-18T00:00:00Z'
                },
                {
                    id: 'ct-4', employee_id: 'u4', employee_name: 'Phạm Thị D',
                    employee_email: 'pham.d@company.com', contract_type: 'CONTRACTOR',
                    status: 'EXPIRED', start_date: '2024-01-01', end_date: '2024-12-31',
                    department: 'Marketing', position: 'SEO Specialist',
                    salary_gross: 20000000, signed_at: '2023-12-28', created_at: '2023-12-20T00:00:00Z'
                },
                {
                    id: 'ct-5', employee_id: 'u5', employee_name: 'Hoàng Văn E',
                    employee_email: 'hoang.e@company.com', contract_type: 'PART_TIME',
                    status: 'ACTIVE', start_date: '2024-09-01', end_date: '2025-03-01',
                    department: 'Customer Support', position: 'Support Agent',
                    salary_gross: 10000000, signed_at: '2024-08-28', created_at: '2024-08-25T00:00:00Z'
                },
            ];
            setContracts(mockContracts);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openViewDialog = (contract: Contract) => {
        setSelectedContract(contract);
        setViewDialogOpen(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Đang hiệu lực</Badge>;
            case 'EXPIRED':
                return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Hết hạn</Badge>;
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Chờ ký</Badge>;
            case 'TERMINATED':
                return <Badge className="bg-red-100 text-red-700 border-red-200">Đã chấm dứt</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'FULL_TIME': return <Badge variant="outline">Toàn thời gian</Badge>;
            case 'PART_TIME': return <Badge variant="outline">Bán thời gian</Badge>;
            case 'CONTRACTOR': return <Badge variant="outline">Hợp đồng dịch vụ</Badge>;
            case 'PROBATION': return <Badge variant="outline">Thử việc</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    const filteredContracts = contracts.filter(c => {
        const matchSearch = c.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.employee_email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
        const matchType = typeFilter === 'ALL' || c.contract_type === typeFilter;
        return matchSearch && matchStatus && matchType;
    });

    const stats = {
        total: contracts.length,
        active: contracts.filter(c => c.status === 'ACTIVE').length,
        pending: contracts.filter(c => c.status === 'PENDING').length,
        expired: contracts.filter(c => c.status === 'EXPIRED').length,
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="contracts-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="hr-contracts-page-title">
                            <FileText className="inline-block mr-3 h-8 w-8 text-blue-600" />
                            Hợp đồng Nhân sự
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Xem và quản lý hợp đồng lao động (US-CEO-02-03)
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchContracts} data-testid="hr-contracts-btn-refresh">
                        <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm" data-testid="hr-contracts-stat-total">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Tổng hợp đồng</p>
                                    <p className="text-xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="hr-contracts-stat-active">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Đang hiệu lực</p>
                                    <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-pending">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Chờ ký</p>
                                    <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-expired">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Hết hạn</p>
                                    <p className="text-xl font-bold text-slate-500">{stats.expired}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-none shadow-sm" data-testid="hr-contracts-filters-card">
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
                                        data-testid="hr-contracts-input-search"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]" data-testid="hr-contracts-filter-status">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="ACTIVE">Đang hiệu lực</SelectItem>
                                    <SelectItem value="PENDING">Chờ ký</SelectItem>
                                    <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                                    <SelectItem value="TERMINATED">Đã chấm dứt</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[180px]" data-testid="hr-contracts-filter-type">
                                    <SelectValue placeholder="Loại hợp đồng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả loại</SelectItem>
                                    <SelectItem value="FULL_TIME">Toàn thời gian</SelectItem>
                                    <SelectItem value="PART_TIME">Bán thời gian</SelectItem>
                                    <SelectItem value="CONTRACTOR">Hợp đồng dịch vụ</SelectItem>
                                    <SelectItem value="PROBATION">Thử việc</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Contracts Table */}
                <Card className="border-none shadow-sm" data-testid="contracts-table-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách hợp đồng</CardTitle>
                        <CardDescription>Quản lý hợp đồng lao động toàn công ty</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="hr-contracts-loading-skeleton">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : filteredContracts.length > 0 ? (
                            <Table data-testid="contracts-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold">Nhân viên</TableHead>
                                        <TableHead className="font-bold">Loại</TableHead>
                                        <TableHead className="font-bold">Trạng thái</TableHead>
                                        <TableHead className="font-bold">Thời hạn</TableHead>
                                        <TableHead className="font-bold text-right">Lương Gross</TableHead>
                                        <TableHead className="text-right font-bold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredContracts.map((contract) => (
                                        <TableRow key={contract.id} data-testid={`contract-row-${contract.id}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                                                            {contract.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium" data-testid={`contract-employee-${contract.id}`}>
                                                            {contract.employee_name}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{contract.position}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell data-testid={`contract-type-${contract.id}`}>
                                                {getTypeBadge(contract.contract_type)}
                                            </TableCell>
                                            <TableCell data-testid={`contract-status-${contract.id}`}>
                                                {getStatusBadge(contract.status)}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <Calendar className="h-3 w-3" />
                                                    {contract.start_date}
                                                </div>
                                                {contract.end_date && (
                                                    <div className="text-xs text-slate-400">
                                                        đến {contract.end_date}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium" data-testid={`contract-salary-${contract.id}`}>
                                                {formatCurrency(contract.salary_gross)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openViewDialog(contract)}
                                                        data-testid={`btn-view-${contract.id}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        data-testid={`btn-download-${contract.id}`}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-12 text-center" data-testid="hr-contracts-empty-state">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Không tìm thấy hợp đồng</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* View Dialog */}
                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                    <DialogContent className="sm:max-w-lg" data-testid="view-contract-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Chi tiết hợp đồng</DialogTitle>
                            <DialogDescription>
                                Thông tin hợp đồng của {selectedContract?.employee_name}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedContract && (
                            <div className="space-y-4 py-4">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                    <Avatar className="h-14 w-14">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-lg">
                                            {selectedContract.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-lg">{selectedContract.employee_name}</p>
                                        <p className="text-slate-500">{selectedContract.position}</p>
                                        <p className="text-xs text-slate-400">{selectedContract.employee_email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Loại hợp đồng</p>
                                        <div className="mt-1">{getTypeBadge(selectedContract.contract_type)}</div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Trạng thái</p>
                                        <div className="mt-1">{getStatusBadge(selectedContract.status)}</div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Phòng ban</p>
                                        <p className="font-medium">{selectedContract.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Lương Gross</p>
                                        <p className="font-medium text-emerald-600">{formatCurrency(selectedContract.salary_gross)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Ngày bắt đầu</p>
                                        <p className="font-medium">{selectedContract.start_date}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Ngày kết thúc</p>
                                        <p className="font-medium">{selectedContract.end_date || 'Không xác định'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-500 font-medium">Ngày ký</p>
                                        <p className="font-medium">{selectedContract.signed_at || 'Chưa ký'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t">
                                    <Button className="flex-1" variant="outline" data-testid="btn-download-contract">
                                        <Download className="mr-2 h-4 w-4" />
                                        Tải hợp đồng
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
