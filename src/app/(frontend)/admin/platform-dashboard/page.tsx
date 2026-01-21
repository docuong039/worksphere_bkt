'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    LayoutDashboard,
    Building2,
    Users,
    HardDrive,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Activity,
    RefreshCw,
    ArrowUpRight,
    Server,
    Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface PlatformStats {
    total_orgs: number;
    active_orgs: number;
    suspended_orgs: number;
    pending_orgs: number;
    total_users: number;
    active_users_today: number;
    storage_used_gb: number;
    storage_limit_gb: number;
    total_projects: number;
    total_tasks: number;
}

interface OrgOverview {
    id: string;
    name: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
    user_count: number;
    project_count: number;
    storage_used_gb: number;
    created_at: string;
    last_activity: string;
}

interface AlertItem {
    id: string;
    type: 'WARNING' | 'ERROR' | 'INFO';
    title: string;
    description: string;
    org_name?: string;
    created_at: string;
}

export default function PlatformDashboardPage() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [orgs, setOrgs] = useState<OrgOverview[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Mock data - US-SYS-02-01
            const mockStats: PlatformStats = {
                total_orgs: 45,
                active_orgs: 38,
                suspended_orgs: 5,
                pending_orgs: 2,
                total_users: 1250,
                active_users_today: 320,
                storage_used_gb: 245.8,
                storage_limit_gb: 500,
                total_projects: 156,
                total_tasks: 4580,
            };

            const mockOrgs: OrgOverview[] = [
                { id: 'org-1', name: 'TechCorp Vietnam', status: 'ACTIVE', user_count: 150, project_count: 25, storage_used_gb: 45.2, created_at: '2024-01-15T00:00:00Z', last_activity: '2025-01-20T14:30:00Z' },
                { id: 'org-2', name: 'StartupX', status: 'ACTIVE', user_count: 45, project_count: 8, storage_used_gb: 12.5, created_at: '2024-03-20T00:00:00Z', last_activity: '2025-01-20T12:15:00Z' },
                { id: 'org-3', name: 'Digital Agency', status: 'PENDING', user_count: 0, project_count: 0, storage_used_gb: 0, created_at: '2025-01-18T00:00:00Z', last_activity: '2025-01-18T00:00:00Z' },
                { id: 'org-4', name: 'OldCompany Ltd', status: 'SUSPENDED', user_count: 80, project_count: 15, storage_used_gb: 30.1, created_at: '2023-06-01T00:00:00Z', last_activity: '2024-12-01T00:00:00Z' },
            ];

            const mockAlerts: AlertItem[] = [
                { id: 'a1', type: 'WARNING', title: 'Quota gần đầy', description: 'Đã sử dụng 95% dung lượng lưu trữ', org_name: 'TechCorp Vietnam', created_at: '2025-01-20T10:00:00Z' },
                { id: 'a2', type: 'ERROR', title: 'Đăng nhập thất bại nhiều lần', description: '15 lần đăng nhập thất bại từ IP 192.168.1.100', created_at: '2025-01-20T09:30:00Z' },
                { id: 'a3', type: 'INFO', title: 'Org mới đăng ký', description: 'Digital Agency yêu cầu tạo tài khoản', created_at: '2025-01-18T15:00:00Z' },
            ];

            setStats(mockStats);
            setOrgs(mockOrgs);
            setAlerts(mockAlerts);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'ERROR': return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'WARNING': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'INFO': return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
            default: return <Activity className="h-5 w-5" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <Badge className="bg-emerald-100 text-emerald-700">Hoạt động</Badge>;
            case 'SUSPENDED': return <Badge className="bg-red-100 text-red-700">Tạm ngưng</Badge>;
            case 'PENDING': return <Badge className="bg-amber-100 text-amber-700">Chờ duyệt</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const storagePercentage = stats ? (stats.storage_used_gb / stats.storage_limit_gb) * 100 : 0;

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="platform-dashboard-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                            <LayoutDashboard className="inline-block mr-3 h-8 w-8 text-blue-600" />
                            Platform Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Giám sát toàn bộ hệ thống SaaS (US-SYS-02-01)
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[140px]" data-testid="select-time-range">
                                <SelectValue placeholder="Thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24h">24 giờ qua</SelectItem>
                                <SelectItem value="7d">7 ngày qua</SelectItem>
                                <SelectItem value="30d">30 ngày qua</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={fetchDashboardData} data-testid="btn-refresh">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="loading-skeleton">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                ) : stats && (
                    <>
                        {/* Main Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50" data-testid="stat-orgs">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            <TrendingUp className="h-3 w-3 mr-1" /> +5%
                                        </Badge>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-slate-500 font-medium">Tổng Organizations</p>
                                        <p className="text-3xl font-bold text-slate-900">{stats.total_orgs}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {stats.active_orgs} active • {stats.pending_orgs} pending
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-pink-50" data-testid="stat-users">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            <TrendingUp className="h-3 w-3 mr-1" /> +12%
                                        </Badge>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-slate-500 font-medium">Tổng Users</p>
                                        <p className="text-3xl font-bold text-slate-900">{stats.total_users}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {stats.active_users_today} online hôm nay
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-orange-50" data-testid="stat-storage">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <HardDrive className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-500">
                                            {storagePercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-slate-500 font-medium">Dung lượng</p>
                                        <p className="text-3xl font-bold text-slate-900">{stats.storage_used_gb} GB</p>
                                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${storagePercentage > 80 ? 'bg-red-500' : storagePercentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${storagePercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50" data-testid="stat-projects">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                            <Activity className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            <TrendingUp className="h-3 w-3 mr-1" /> +8%
                                        </Badge>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-slate-500 font-medium">Hoạt động</p>
                                        <p className="text-3xl font-bold text-slate-900">{stats.total_projects}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {stats.total_tasks} tasks đang xử lý
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Alerts + Orgs */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Alerts */}
                            <Card className="border-none shadow-sm lg:col-span-1" data-testid="alerts-card">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                        Cảnh báo
                                    </CardTitle>
                                    <CardDescription>Vấn đề cần chú ý</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {alerts.length > 0 ? (
                                        <div className="divide-y divide-slate-100" data-testid="alerts-list">
                                            {alerts.map(alert => (
                                                <div
                                                    key={alert.id}
                                                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                                    data-testid={`alert-${alert.id}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {getAlertIcon(alert.type)}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm text-slate-900">{alert.title}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{alert.description}</p>
                                                            {alert.org_name && (
                                                                <Badge variant="outline" className="mt-2 text-xs">
                                                                    {alert.org_name}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500">
                                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                                            Không có cảnh báo
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Top Orgs */}
                            <Card className="border-none shadow-sm lg:col-span-2" data-testid="orgs-overview-card">
                                <CardHeader className="border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-bold">Organizations</CardTitle>
                                            <CardDescription>Danh sách tổ chức trên hệ thống</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" data-testid="btn-view-all-orgs">
                                            Xem tất cả <ArrowUpRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table data-testid="orgs-table">
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="font-bold">Tên Org</TableHead>
                                                <TableHead className="font-bold">Trạng thái</TableHead>
                                                <TableHead className="font-bold text-right">Users</TableHead>
                                                <TableHead className="font-bold text-right">Storage</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orgs.map(org => (
                                                <TableRow key={org.id} data-testid={`org-row-${org.id}`}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                                                {org.name.slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium">{org.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(org.status)}</TableCell>
                                                    <TableCell className="text-right">{org.user_count}</TableCell>
                                                    <TableCell className="text-right">{org.storage_used_gb} GB</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        {/* System Health */}
                        <Card className="border-none shadow-sm" data-testid="system-health-card">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Server className="h-5 w-5 text-blue-600" />
                                    Sức khỏe hệ thống
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="text-center" data-testid="health-api">
                                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                        </div>
                                        <p className="font-medium">API Server</p>
                                        <p className="text-sm text-emerald-600">Healthy</p>
                                    </div>
                                    <div className="text-center" data-testid="health-db">
                                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                        </div>
                                        <p className="font-medium">Database</p>
                                        <p className="text-sm text-emerald-600">Healthy</p>
                                    </div>
                                    <div className="text-center" data-testid="health-storage">
                                        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                                            <AlertTriangle className="h-8 w-8 text-amber-600" />
                                        </div>
                                        <p className="font-medium">Storage</p>
                                        <p className="text-sm text-amber-600">Warning</p>
                                    </div>
                                    <div className="text-center" data-testid="health-security">
                                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                                            <Shield className="h-8 w-8 text-emerald-600" />
                                        </div>
                                        <p className="font-medium">Security</p>
                                        <p className="text-sm text-emerald-600">OK</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
