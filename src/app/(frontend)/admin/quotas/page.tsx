'use client';

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Users,
    HardDrive,
    Layers,
    Save,
    Search,
    Info,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    Loader2,
    Building2,
    Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

interface OrgQuota {
    id: string;
    org_name: string;
    max_users: number;
    current_users: number;
    max_storage_gb: number;
    current_storage_gb: number;
    max_projects: number;
    current_projects: number;
    status: 'ACTIVE' | 'WARNING' | 'EXCEEDED';
}

export default function AdminQuotasPage() {
    const { user, hasPermission } = useAuthStore();
    const [quotas, setQuotas] = useState<OrgQuota[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<OrgQuota | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const isSysAdmin = user?.role === 'SYS_ADMIN';

    useEffect(() => {
        const fetchQuotas = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/quotas', {
                    headers: {
                        'x-user-id': user?.id || '',
                        'x-user-role': user?.role || ''
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setQuotas(data.data);
                }
            } catch (error) {
                console.error('Error fetching quotas:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchQuotas();
    }, [user]);

    const handleEditQuota = (org: OrgQuota) => {
        setSelectedOrg(org);
        setIsEditOpen(true);
    };

    const handleSaveQuota = async () => {
        if (!selectedOrg) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/quotas/${selectedOrg.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify(selectedOrg)
            });
            const data = await res.json();
            if (data.success) {
                setQuotas(quotas.map(q => q.id === selectedOrg.id ? selectedOrg : q));
                setIsEditOpen(false);
            }
        } catch (error) {
            console.error('Error saving quota:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredQuotas = quotas.filter(q => {
        const matchesSearch = q.org_name.toLowerCase().includes(searchQuery.toLowerCase());
        if (filterType === 'ALL') return matchesSearch;
        if (filterType === 'USERS') return matchesSearch && q.current_users / q.max_users >= 0.8;
        if (filterType === 'STORAGE') return matchesSearch && q.current_storage_gb / q.max_storage_gb >= 0.8;
        if (filterType === 'PROJECTS') return matchesSearch && q.current_projects / q.max_projects >= 0.8;
        return matchesSearch;
    });

    return (
        <AppLayout>
            <PermissionGuard permission={PERMISSIONS.PLATFORM_ORG_READ} showFullPageError>
                <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700" data-testid="admin-quotas-container">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-blue-600 text-white border-none text-[10px] font-black tracking-widest uppercase">System Control</Badge>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight" data-testid="admin-quotas-title">
                                Giới hạn Tài nguyên (Quota)
                            </h1>
                            <p className="text-slate-500 font-medium">Giám sát và quản lý giới hạn tài nguyên cho tất cả các tổ chức.</p>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                            <div className="px-4 py-2 border-r border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tổng số Tổ chức</p>
                                <p className="text-lg font-black text-slate-900">{quotas.length}</p>
                            </div>
                            <div className="px-4 py-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Vượt giới hạn</p>
                                <p className="text-lg font-black text-rose-600">{quotas.filter(q => q.status === 'EXCEEDED').length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Table */}
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <Input
                                    placeholder="Tìm kiếm tổ chức..."
                                    className="pl-10 h-10 w-72 bg-white border-slate-200 rounded-xl text-sm font-semibold shadow-sm focus:ring-1 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-[180px] h-10 border-slate-200 rounded-xl" data-testid="filter-quota-type">
                                        <SelectValue placeholder="Xem theo giới hạn" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả</SelectItem>
                                        <SelectItem value="USERS">Cảnh báo Seats</SelectItem>
                                        <SelectItem value="STORAGE">Cảnh báo Dung lượng</SelectItem>
                                        <SelectItem value="PROJECTS">Cảnh báo Dự án</SelectItem>
                                    </SelectContent>
                                </Select>
                                <PermissionGuard permission={PERMISSIONS.PLATFORM_ORG_UPDATE}>
                                    <Button variant="outline" size="sm" className="h-10 px-4 font-bold border-slate-200">
                                        <TrendingUp className="mr-2 h-4 w-4" /> Tối ưu hóa Sử dụng
                                    </Button>
                                </PermissionGuard>
                            </div>
                        </div>
                        <CardContent className="p-0">
                            <Table data-testid="quotas-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                        <TableHead className="px-8 py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Tổ chức</TableHead>
                                        <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Tài khoản (Seats)</TableHead>
                                        <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Dung lượng (GB)</TableHead>
                                        <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Dự án</TableHead>
                                        <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Trạng thái</TableHead>
                                        <TableHead className="text-right px-8"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="px-8"><Skeleton className="h-6 w-48" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                <TableCell className="text-right px-8"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredQuotas.map((org) => (
                                        <TableRow key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <TableCell className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                                        <Building2 size={18} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">{org.org_name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {org.id}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1.5 w-32">
                                                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                                                        <span>{org.current_users}/{org.max_users}</span>
                                                        <span>{Math.round((org.current_users / org.max_users) * 100)}%</span>
                                                    </div>
                                                    <Progress value={(org.current_users / org.max_users) * 100} className="h-1.5 bg-slate-100" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1.5 w-32">
                                                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                                                        <span>{org.current_storage_gb}/{org.max_storage_gb}</span>
                                                        <span>{Math.round((org.current_storage_gb / org.max_storage_gb) * 100)}%</span>
                                                    </div>
                                                    <Progress value={(org.current_storage_gb / org.max_storage_gb) * 100} className="h-1.5 bg-slate-100" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1.5 w-32">
                                                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                                                        <span>{org.current_projects}/{org.max_projects}</span>
                                                        <span>{Math.round((org.current_projects / org.max_projects) * 100)}%</span>
                                                    </div>
                                                    <Progress value={(org.current_projects / org.max_projects) * 100} className="h-1.5 bg-slate-100" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "border-none font-bold text-[10px] uppercase tracking-widest px-2.5",
                                                    org.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700" :
                                                        org.status === 'WARNING' ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                                                )}>
                                                    {org.status === 'ACTIVE' ? "Hoạt động" :
                                                        org.status === 'WARNING' ? "Cảnh báo" : "Vượt mức"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <PermissionGuard permission={PERMISSIONS.PLATFORM_ORG_UPDATE}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl"
                                                        onClick={() => handleEditQuota(org)}
                                                        data-testid={`edit-quota-${org.id}`}
                                                    >
                                                        <Edit3 size={18} />
                                                    </Button>
                                                </PermissionGuard>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Edit Dialog */}
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="max-w-md" data-testid="edit-quota-dialog">
                            <DialogHeader>
                                <DialogTitle>Cập nhật Giới hạn Tổ chức</DialogTitle>
                                <DialogDescription>
                                    Thiết lập giới hạn tài nguyên cho <strong>{selectedOrg?.org_name}</strong>.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} className="text-blue-500" /> Max User Seats
                                    </label>
                                    <Input type="number" defaultValue={selectedOrg?.max_users} className="h-11 font-bold" data-testid="input-max-users" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <HardDrive size={14} className="text-blue-500" /> Max Storage (GB)
                                    </label>
                                    <Input type="number" defaultValue={selectedOrg?.max_storage_gb} className="h-11 font-bold" data-testid="input-max-storage" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Layers size={14} className="text-blue-500" /> Số lượng Dự án tối đa
                                    </label>
                                    <Input type="number" defaultValue={selectedOrg?.max_projects} className="h-11 font-bold" data-testid="input-max-projects" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" className="font-bold" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-lg shadow-blue-100"
                                    onClick={handleSaveQuota}
                                    disabled={isSaving}
                                    data-testid="save-quota-btn"
                                >
                                    {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : "Lưu Thay đổi"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Info Panel */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-none shadow-sm bg-slate-900 text-white p-8 rounded-3xl overflow-hidden relative group">
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3 text-blue-400">
                                    <Info size={20} />
                                    <h4 className="text-sm font-black uppercase tracking-widest">Ghi chú Nền tảng</h4>
                                </div>
                                <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                                    Các giới hạn được thực thi ở cấp độ API. Khi một tổ chức đạt mức 90% giới hạn, người dùng sẽ thấy cảnh báo.
                                    Ở mức 100%, các thao tác ghi sẽ bị chặn cho đến khi giới hạn được tăng lên.
                                </p>
                                <Button variant="link" className="p-0 h-auto text-blue-400 text-[10px] font-black uppercase tracking-widest">Xem SLA Nền tảng</Button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
                        </Card>

                        <Card className="border-none shadow-sm bg-white p-8 rounded-3xl">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-600">
                                    <TrendingUp size={20} />
                                    <h4 className="text-sm font-black uppercase tracking-widest">Growth Forecast</h4>
                                </div>
                                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                                    Based on the last 30 days, <strong>Fast Delivery Inc</strong> will exceed their storage limit in 12 days.
                                    Consider proactive outreach for an upgrade plan.
                                </p>
                                <div className="p-3 bg-emerald-50 rounded-xl flex items-center gap-3 text-emerald-700">
                                    <CheckCircle2 size={16} />
                                    <span className="text-[10px] font-bold">Khuyến nghị: Gói Doanh nghiệp (500GB)</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
