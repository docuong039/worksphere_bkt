'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertTriangle,
    Bell,
    TrendingDown,
    Clock,
    Users,
    FolderKanban,
    RefreshCw,
    ChevronRight,
    XCircle,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface Alert {
    id: string;
    type: 'OVERDUE' | 'BLOCKED' | 'BUDGET_EXCEED' | 'DEADLINE_NEAR';
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    description: string;
    project_id?: string;
    project_name?: string;
    count?: number;
    created_at: string;
}

export default function AlertsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [severityFilter, setSeverityFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            // Mock data - US-CEO-05-02
            const mockAlerts: Alert[] = [
                {
                    id: 'a1', type: 'OVERDUE', severity: 'CRITICAL',
                    title: '15 tasks quá hạn', description: 'Dự án Worksphere có 15 tasks đã quá deadline',
                    project_id: 'p1', project_name: 'Worksphere Platform', count: 15,
                    created_at: '2025-01-21T01:00:00Z'
                },
                {
                    id: 'a2', type: 'BLOCKED', severity: 'CRITICAL',
                    title: '3 tasks đang bị BLOCKED', description: 'Cần PM xử lý ngay để unblock',
                    project_id: 'p1', project_name: 'Worksphere Platform', count: 3,
                    created_at: '2025-01-21T00:30:00Z'
                },
                {
                    id: 'a3', type: 'BUDGET_EXCEED', severity: 'WARNING',
                    title: 'Chi phí vượt 90% ngân sách', description: 'Dự án Mobile App đã sử dụng 92% ngân sách',
                    project_id: 'p2', project_name: 'Mobile App', count: 92,
                    created_at: '2025-01-20T14:00:00Z'
                },
                {
                    id: 'a4', type: 'DEADLINE_NEAR', severity: 'WARNING',
                    title: 'Deadline dự án trong 3 ngày', description: 'Website Redesign deadline: 24/01/2025',
                    project_id: 'p3', project_name: 'Website Redesign',
                    created_at: '2025-01-20T10:00:00Z'
                },
                {
                    id: 'a5', type: 'OVERDUE', severity: 'WARNING',
                    title: '5 tasks quá hạn', description: 'Dự án CRM Integration có tasks cần xử lý',
                    project_id: 'p4', project_name: 'CRM Integration', count: 5,
                    created_at: '2025-01-19T16:00:00Z'
                },
                {
                    id: 'a6', type: 'DEADLINE_NEAR', severity: 'INFO',
                    title: 'Deadline milestone trong 7 ngày', description: 'API Development milestone',
                    project_id: 'p1', project_name: 'Worksphere Platform',
                    created_at: '2025-01-19T09:00:00Z'
                },
            ];
            setAlerts(mockAlerts);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = (alertId: string) => {
        setAlerts(alerts.filter(a => a.id !== alertId));
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'WARNING': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'INFO': return <AlertCircle className="h-5 w-5 text-blue-500" />;
            default: return <Bell className="h-5 w-5 text-slate-500" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <Badge className="bg-red-100 text-red-700 animate-pulse">Nghiêm trọng</Badge>;
            case 'WARNING': return <Badge className="bg-amber-100 text-amber-700">Cảnh báo</Badge>;
            case 'INFO': return <Badge className="bg-blue-100 text-blue-700">Thông tin</Badge>;
            default: return <Badge variant="outline">{severity}</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'OVERDUE': return <Clock className="h-4 w-4" />;
            case 'BLOCKED': return <XCircle className="h-4 w-4" />;
            case 'BUDGET_EXCEED': return <TrendingDown className="h-4 w-4" />;
            case 'DEADLINE_NEAR': return <AlertTriangle className="h-4 w-4" />;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    const filteredAlerts = alerts.filter(a => {
        const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
        const matchTab = activeTab === 'all' ||
            (activeTab === 'critical' && a.severity === 'CRITICAL') ||
            (activeTab === 'warning' && a.severity === 'WARNING');
        return matchSeverity && matchTab;
    });

    const stats = {
        critical: alerts.filter(a => a.severity === 'CRITICAL').length,
        warning: alerts.filter(a => a.severity === 'WARNING').length,
        info: alerts.filter(a => a.severity === 'INFO').length,
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="alerts-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                            <AlertTriangle className="inline-block mr-3 h-8 w-8 text-red-600" />
                            Cảnh báo Hệ thống
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Thông báo "đỏ" cần xử lý ngay (US-CEO-05-02)
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchAlerts} data-testid="btn-refresh">
                        <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${activeTab === 'critical' ? 'ring-2 ring-red-500' : ''}`}
                        onClick={() => setActiveTab('critical')}
                        data-testid="stat-critical"
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-red-600 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Nghiêm trọng</p>
                                <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${activeTab === 'warning' ? 'ring-2 ring-amber-500' : ''}`}
                        onClick={() => setActiveTab('warning')}
                        data-testid="stat-warning"
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Cảnh báo</p>
                                <p className="text-3xl font-bold text-amber-600">{stats.warning}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${activeTab === 'all' ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setActiveTab('all')}
                        data-testid="stat-all"
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Bell className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Tổng cộng</p>
                                <p className="text-3xl font-bold text-blue-600">{alerts.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts List */}
                <Card className="border-none shadow-sm" data-testid="alerts-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách cảnh báo</CardTitle>
                        <CardDescription>Click vào cảnh báo để xem chi tiết</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="loading-skeleton">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : filteredAlerts.length > 0 ? (
                            <div className="divide-y divide-slate-100" data-testid="alerts-list">
                                {filteredAlerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        className={`flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors ${alert.severity === 'CRITICAL' ? 'bg-red-50/30' : ''}`}
                                        data-testid={`alert-row-${alert.id}`}
                                    >
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${alert.severity === 'CRITICAL' ? 'bg-red-100' : alert.severity === 'WARNING' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                                            {getSeverityIcon(alert.severity)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-slate-900" data-testid={`alert-title-${alert.id}`}>
                                                    {alert.title}
                                                </p>
                                                {getSeverityBadge(alert.severity)}
                                            </div>
                                            <p className="text-sm text-slate-500">{alert.description}</p>
                                            {alert.project_name && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                                    <FolderKanban className="h-3 w-3" />
                                                    {alert.project_name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {alert.project_id && (
                                                <Button variant="outline" size="sm" asChild data-testid={`btn-view-${alert.id}`}>
                                                    <Link href={`/projects/${alert.project_id}/overview`}>
                                                        Xem <ChevronRight className="ml-1 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => dismissAlert(alert.id)}
                                                className="text-slate-400 hover:text-slate-600"
                                                data-testid={`btn-dismiss-${alert.id}`}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center" data-testid="empty-state">
                                <CheckCircle2 className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Không có cảnh báo nào</p>
                                <p className="text-slate-400 text-sm mt-1">Hệ thống đang hoạt động bình thường</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
