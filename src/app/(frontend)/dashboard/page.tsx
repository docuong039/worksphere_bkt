'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3, Users, CheckSquare, Clock, Activity, Briefcase, ChevronRight, Layout, Plus,
    Calendar, Target, ArrowUpRight, ArrowDownRight,
    Shield, HardDrive, Settings, Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { cn } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { PERMISSIONS } from '@/lib/permissions';

/**
 * Dashboard Page - Refactored to align with Docs and Technical Stack
 * US-MNG-02-01, US-MNG-02-02, US-CEO-01-01, US-SYS-02-01, US-EMP-01-01
 */

// --- SUB-COMPONENTS ---

const StatCard = ({ label, value, change, trend = 'up', type = 'primary', icon: Icon, testId }: any) => {
    const colors: any = {
        primary: 'bg-blue-50 text-blue-600',
        success: 'bg-emerald-50 text-emerald-600',
        warning: 'bg-amber-50 text-amber-600',
        danger: 'bg-rose-50 text-rose-600',
        info: 'bg-indigo-50 text-indigo-600',
    };

    const style = colors[type] || colors.primary;

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm group" data-testid={testId || `stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${style} group-hover:scale-110 transition-transform duration-300`}>
                        {Icon ? <Icon size={22} /> : <Activity size={22} />}
                    </div>
                    {change && (
                        <Badge variant="secondary" className={cn(
                            "flex items-center gap-1 border-none",
                            trend === 'up' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        )}>
                            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {change}
                        </Badge>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</h3>
                </div>
            </CardContent>
        </Card>
    );
};

// --- MAIN PAGE ---

export default function DashboardPage() {
    const { user, hasPermission } = useAuthStore();
    const role = user?.role || 'EMPLOYEE';
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/dashboard', {
                    headers: {
                        'x-mock-role': role,
                        'x-user-id': user?.id || ''
                    }
                });
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [role, user?.id]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Skeleton className="lg:col-span-2 h-[450px] rounded-2xl" />
                        <Skeleton className="h-[450px] rounded-2xl" />
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="dashboard-title">
                            {role === 'SYS_ADMIN' ? 'Hệ thống Quản trị & Điều khiển' : role === 'ORG_ADMIN' ? `Không gian ${data?.org_name || 'Tổ chức'}` : role === 'CEO' ? 'Insights Tổ chức' : `Chào buổi sáng, ${user?.full_name?.split(' ')[0] || 'bạn'}!`}
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">
                            {role === 'SYS_ADMIN'
                                ? 'Giám sát hiệu suất nền tảng và sức khỏe của các tổ chức.'
                                : role === 'ORG_ADMIN'
                                    ? 'Quản lý thành viên và theo dõi hoạt động toàn tổ chức.'
                                    : role === 'CEO'
                                        ? 'Cái nhìn tổng thể về hiệu suất và sức khỏe dự án của doanh nghiệp.'
                                        : 'Dưới đây là những gì đang diễn ra trong '}<span className="text-blue-600 font-semibold">{role === 'SYS_ADMIN' ? 'toàn hệ thống' : role === 'ORG_ADMIN' || role === 'CEO' ? 'không gian của bạn' : 'Worksphere'}</span> {role === 'SYS_ADMIN' ? '' : 'hôm nay.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-10 text-slate-600" data-testid="date-range-trigger">
                            <Calendar className="mr-2 h-4 w-4" /> 30 ngày qua
                        </Button>
                        <Button className="h-10 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200" data-testid="dashboard-refresh-btn" onClick={() => window.location.reload()}>
                            Làm mới
                        </Button>
                    </div>
                </div>

                {/* 1. Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-grid">
                    {data?.stats?.map((stat: any, index: number) => (
                        <StatCard
                            key={index}
                            {...stat}
                            testId={`dashboard-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                            icon={
                                role === 'SYS_ADMIN' ? (
                                    stat.label.includes('Tổ chức') ? Building2 :
                                        stat.label.includes('người dùng') || stat.label.includes('Người dùng') ? Users :
                                            stat.label.includes('dự án') || stat.label.includes('Dự án') ? Briefcase : HardDrive
                                ) : (
                                    stat.label.includes('Thành viên') || stat.label.includes('người dùng') ? Users :
                                        stat.label.includes('Dự án') ? Briefcase :
                                            stat.label.includes('Báo cáo') ? BarChart3 :
                                                stat.label.includes('Công việc') || stat.label.includes('Việc') ? CheckSquare :
                                                    stat.label.includes('Sức khỏe') || stat.label.includes('Hiệu suất') ? Activity :
                                                        stat.label.includes('Giờ') ? Clock : Target
                                )
                            }
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 2. Main Area (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* PROJECT_MANAGER: Project Performance */}
                        {role === 'PROJECT_MANAGER' && (
                            <Card className="border-none shadow-sm overflow-hidden" data-testid="pm-project-overview">
                                <CardHeader className="flex flex-row items-center justify-between pb-6">
                                    <div>
                                        <CardTitle className="text-xl font-bold text-slate-900">Hiệu quả dự án</CardTitle>
                                        <CardDescription>Theo dõi tiến độ và thời hạn của các dự án đang hoạt động.</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">Xem tất cả dự án</Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {data?.projects?.map((p: any) => (
                                            <div key={p.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        {p.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{p.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-medium hover:bg-emerald-100">
                                                                {p.status}
                                                            </Badge>
                                                            <span className="text-xs text-slate-400 font-medium">Hạn chót: {p.deadline}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="hidden sm:flex flex-col items-end gap-1.5">
                                                        <span className="text-sm font-bold text-slate-900">{p.progress}%</span>
                                                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                            <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${p.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="text-slate-300 group-hover:text-slate-900 transition-colors" size={20} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* EMPLOYEE: Task Focus */}
                        {role === 'EMPLOYEE' && (
                            <Card className="border-none shadow-sm overflow-hidden" data-testid="emp-tasks-focus">
                                <CardHeader className="flex flex-row items-center justify-between pb-6">
                                    <div>
                                        <CardTitle className="text-xl font-bold text-slate-900">Công việc trọng tâm</CardTitle>
                                        <CardDescription>Các ưu tiên và thời hạn sắp tới của bạn.</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => window.location.href = '/tasks'}>Xem tất cả</Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="px-6 pb-6 space-y-4">
                                        {data?.my_tasks?.map((t: any) => (
                                            <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all group" data-testid={`task-item-${t.id}`}>
                                                <div className={cn(
                                                    "w-6 h-6 rounded-md border flex items-center justify-center transition-all",
                                                    t.status === 'DONE' ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-transparent hover:border-blue-500"
                                                )}>
                                                    <CheckSquare size={14} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className={cn(
                                                            "font-bold text-sm tracking-tight",
                                                            t.status === 'DONE' ? "text-slate-400 line-through" : "text-slate-900"
                                                        )}>
                                                            {t.title}
                                                        </h4>
                                                        <Badge variant="outline" className={cn(
                                                            "text-[10px] font-bold px-2 py-0",
                                                            t.priority === 'HIGH' ? "text-rose-600 bg-rose-50 border-rose-100" :
                                                                t.priority === 'MEDIUM' ? "text-amber-600 bg-amber-50 border-amber-100" : "text-blue-600 bg-blue-50 border-blue-100"
                                                        )}>
                                                            {t.priority}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1.5">
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                            <Calendar size={12} />
                                                            {t.due_date}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                            <Activity size={12} />
                                                            {t.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!data?.my_tasks || data.my_tasks.length === 0) && (
                                            <div className="p-10 text-center text-slate-400 text-sm italic">
                                                Bạn không có công việc nào đang chờ xử lý.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* CEO: Detailed Charts & Analytics */}
                        {role === 'CEO' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-none shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-bold">Tiến độ Dự án (%)</CardTitle>
                                            <CardDescription>Tỷ lệ hoàn thành công việc theo từng dự án trọng điểm.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-[300px] w-full mt-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={data?.project_overview || []}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                                        <Tooltip
                                                            cursor={{ fill: '#f8fafc' }}
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Bar dataKey="progress" radius={[4, 4, 0, 0]} barSize={32}>
                                                            {(data?.project_overview || []).map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={entry.progress > 70 ? '#10b981' : entry.progress > 30 ? '#3b82f6' : '#f59e0b'} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-bold">Phân bổ Nguồn lực</CardTitle>
                                            <CardDescription>Tỷ lệ tập trung nhân sự vào các dự án hiện tại.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-[300px] w-full mt-4 flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={data?.project_overview || []}
                                                            dataKey="progress"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={70}
                                                            outerRadius={100}
                                                            paddingAngle={8}
                                                        >
                                                            {(data?.project_overview || []).map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'][index % 5]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="border-none shadow-sm overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-bold text-slate-900">Sức khỏe Dự án</CardTitle>
                                            <CardDescription>Báo cáo tình trạng vận hành của doanh nghiệp.</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">Xem báo cáo chi tiết</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tên dự án</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {data?.project_overview?.map((p: any, idx: number) => (
                                                    <tr key={idx} className="group hover:bg-blue-50/10 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Badge className={cn(
                                                                "border-none font-bold",
                                                                p.status === 'An toàn' ? "bg-emerald-50 text-emerald-700" :
                                                                    p.status === 'Ổn định' ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                                                            )}>
                                                                {p.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* SYS_ADMIN: Recent Organizations */}
                        {role === 'SYS_ADMIN' && (
                            <Card className="border-none shadow-sm" data-testid="sys-recent-orgs">
                                <CardHeader className="flex flex-row items-center justify-between pb-6">
                                    <div>
                                        <CardTitle className="text-xl font-bold text-slate-900">Tổ chức mới</CardTitle>
                                        <CardDescription>Các doanh nghiệp vừa gia nhập nền tảng.</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">Quản lý tất cả</Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {data?.recent_orgs?.map((org: any) => (
                                            <div key={org.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase">
                                                        {org.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">{org.name}</h3>
                                                        <p className="text-xs text-slate-400 font-medium font-mono">{org.code}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={cn(
                                                        "border-none",
                                                        org.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                                    )}>
                                                        {org.status}
                                                    </Badge>
                                                    <ChevronRight className="text-slate-300 group-hover:text-slate-900 transition-colors" size={16} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* 3. Sidebar Widgets (1/3 width) */}
                    <div className="space-y-8">
                        {/* Activity Widget */}
                        <Card className="border-none shadow-sm" data-testid="dashboard-activity-feed">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Activity size={18} className="text-blue-600" />
                                    Hoạt động gần đây
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-2">
                                {data?.recent_activities?.map((activity: any, i: number) => (
                                    <div key={activity.id} className="flex gap-4 relative">
                                        {i !== (data?.recent_activities?.length - 1) && <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-slate-100"></div>}
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center z-10 overflow-hidden">
                                            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                                                {activity.user?.charAt(0) || '?'}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 leading-snug">
                                                <span className="font-bold text-slate-900">{activity.user}</span>
                                                <span className="text-slate-500"> {activity.action} </span>
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1.5 block">
                                                {new Date(activity.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(activity.time).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {(!data?.recent_activities || data.recent_activities.length === 0) && (
                                    <div className="text-center py-6 text-slate-400 text-sm italic">
                                        Chưa có hoạt động nào được ghi nhận.
                                    </div>
                                )}
                            </CardContent>
                            <div className="p-4 border-t border-slate-100 text-center">
                                <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600">Xem tất cả hoạt động</Button>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="bg-slate-900 border-none shadow-xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                                <Layout size={120} className="text-white" />
                            </div>
                            <CardContent className="p-8 relative z-10">
                                <h3 className="font-bold text-xl text-white mb-2">Công cụ nhanh</h3>
                                <p className="text-slate-400 text-sm mb-6">Truy cập nhanh các hành động quan trọng.</p>
                                <div className="space-y-4">
                                    {hasPermission(PERMISSIONS.REPORT_READ) && (
                                        <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-500 text-white border-0 h-11" onClick={() => (window.location.href = '/reports')}>
                                            <BarChart3 className="mr-2 h-4 w-4" /> Xem báo cáo chiến lược
                                        </Button>
                                    )}
                                    {hasPermission(PERMISSIONS.ORG_USER_CREATE) && (
                                        <Button className="w-full justify-start bg-blue-600 hover:bg-blue-500 text-white border-0 h-11" onClick={() => (window.location.href = '/admin/users')}>
                                            <Plus className="mr-2 h-4 w-4" /> Mời thành viên mới
                                        </Button>
                                    )}
                                    {hasPermission(PERMISSIONS.ROLE_PERM_UPDATE) && (
                                        <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 border-0 h-11" onClick={() => (window.location.href = '/admin/roles')}>
                                            <Shield className="mr-2 h-4 w-4" /> Quản trị phân quyền
                                        </Button>
                                    )}
                                    {hasPermission(PERMISSIONS.TIME_LOG_LOG) && (
                                        <Button className="w-full justify-start bg-blue-600 hover:bg-blue-500 text-white border-0 h-11" onClick={() => (window.location.href = '/tasks')}>
                                            <Clock className="mr-2 h-4 w-4" /> Ghi nhận giờ làm
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <div data-testid="dashboard-container">
                {renderContent()}
            </div>
        </AppLayout>
    );
}
