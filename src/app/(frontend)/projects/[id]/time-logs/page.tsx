'use client';

import React, { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Clock,
    Search,
    Filter,
    Calendar,
    Download
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface TimeLog {
    id: string;
    task_title: string;
    subtask_title: string | null;
    user_name: string;
    hours: number;
    minutes: number;
    log_date: string;
    note: string | null;
}

export default function ProjectTimeLogsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<TimeLog[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';

    useEffect(() => {
        const fetchTimeLogs = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${projectId}/time-logs`, {
                    headers: { 'x-user-id': user?.id || '' }
                });
                const data = await res.json();
                setLogs(data.data || []);
            } catch (error) {
                console.error('Error fetching time logs:', error);
                setLogs([
                    { id: '1', task_title: 'API Phân quyền', subtask_title: 'Viết unit test', user_name: 'Nguyễn Văn A', hours: 2, minutes: 30, log_date: '2024-02-15', note: 'Xong phần RBAC' },
                    { id: '2', task_title: 'UI Dashboard', subtask_title: null, user_name: 'Trần Thị B', hours: 4, minutes: 0, log_date: '2024-02-15', note: 'Thiết kế header' },
                    { id: '3', task_title: 'Fix bug Login', subtask_title: null, user_name: 'Lê Văn C', hours: 1, minutes: 15, log_date: '2024-02-14', note: null },
                ]);
            } finally {
                setLoading(false);
            }
        };

        if (user && projectId) {
            fetchTimeLogs();
        }
    }, [projectId, user]);

    const filteredLogs = logs.filter(log =>
        log.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isPM && !loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center h-[70vh]">
                <Clock size={48} className="text-amber-500 mb-6" />
                <h2 className="text-2xl font-black text-slate-900">Truy cập bị hạn chế</h2>
                <p className="text-slate-500 mt-2 max-w-xs font-medium">Bạn không có quyền xem nhật ký thời gian của dự án này.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-10" data-testid="project-time-logs-page">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-800" data-testid="time-logs-title">
                        Nhật ký thời gian
                    </h2>
                </div>
                <Button variant="outline" size="sm" className="h-9 font-bold border-slate-200">
                    <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
                </Button>
            </div>

            <Card className="shadow-sm border-none bg-white p-2">
                <CardContent className="p-2 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm theo tên task hoặc thành viên..."
                            className="pl-9 h-11 w-full bg-slate-50 border-none rounded-xl font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" data-testid="time-logs-table">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Ngày ghi</th>
                                    <th className="px-6 py-4">Thành viên</th>
                                    <th className="px-6 py-4">Công việc / Subtask</th>
                                    <th className="px-6 py-4 text-center">Thời lượng</th>
                                    <th className="px-6 py-4">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {new Date(log.log_date).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-black">
                                                    {log.user_name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-900">{log.user_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-blue-600 line-clamp-1">{log.task_title}</span>
                                                {log.subtask_title && (
                                                    <span className="text-[10px] text-slate-400 font-medium">Subtask: {log.subtask_title}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-xs">
                                                {log.hours}h {log.minutes}m
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium italic">
                                            {log.note || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
