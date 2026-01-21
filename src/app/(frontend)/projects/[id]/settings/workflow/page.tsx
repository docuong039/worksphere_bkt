'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    GitBranch,
    Plus,
    Edit2,
    Save,
    RefreshCw,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface WorkflowStatus {
    id: string;
    name: string;
    color: string;
    is_initial: boolean;
    is_final: boolean;
    order: number;
}

interface WorkflowTransition {
    id: string;
    from_status_id: string;
    to_status_id: string;
    is_enabled: boolean;
}

export default function WorkflowSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [statuses, setStatuses] = useState<WorkflowStatus[]>([]);
    const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            setProjectName('Worksphere Platform');

            // Mock data - US-MNG-06-01/02
            const mockStatuses: WorkflowStatus[] = [
                { id: 's1', name: 'Todo', color: '#64748b', is_initial: true, is_final: false, order: 1 },
                { id: 's2', name: 'In Progress', color: '#3b82f6', is_initial: false, is_final: false, order: 2 },
                { id: 's3', name: 'In Review', color: '#8b5cf6', is_initial: false, is_final: false, order: 3 },
                { id: 's4', name: 'Done', color: '#10b981', is_initial: false, is_final: true, order: 4 },
                { id: 's5', name: 'Cancelled', color: '#ef4444', is_initial: false, is_final: true, order: 5 },
            ];

            // All possible transitions
            const mockTransitions: WorkflowTransition[] = [];
            for (const from of mockStatuses) {
                for (const to of mockStatuses) {
                    if (from.id !== to.id) {
                        // Default enabled transitions
                        const isEnabled =
                            (from.id === 's1' && ['s2', 's5'].includes(to.id)) ||
                            (from.id === 's2' && ['s3', 's1', 's5'].includes(to.id)) ||
                            (from.id === 's3' && ['s4', 's2', 's5'].includes(to.id)) ||
                            (from.id === 's4' && to.id === 's2') ||
                            false;

                        mockTransitions.push({
                            id: `${from.id}-${to.id}`,
                            from_status_id: from.id,
                            to_status_id: to.id,
                            is_enabled: isEnabled,
                        });
                    }
                }
            }

            setStatuses(mockStatuses);
            setTransitions(mockTransitions);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTransition = (transitionId: string) => {
        setTransitions(transitions.map(t =>
            t.id === transitionId ? { ...t, is_enabled: !t.is_enabled } : t
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Save API call
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const getStatusById = (id: string) => statuses.find(s => s.id === id);

    const enabledTransitions = transitions.filter(t => t.is_enabled);

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="workflow-settings-page">
                {/* Header */}
                <div>
                    <Button variant="ghost" asChild className="-ml-4 mb-4 text-slate-500">
                        <Link href={`/projects/${projectId}/overview`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại {projectName}
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                                <GitBranch className="inline-block mr-3 h-8 w-8 text-blue-600" />
                                Workflow Settings
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Cấu hình luồng chuyển trạng thái task (US-MNG-06-01/02)
                            </p>
                        </div>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                            onClick={handleSave}
                            disabled={saving}
                            data-testid="btn-save"
                        >
                            {saving ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4" data-testid="loading-skeleton">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-80 w-full" />
                    </div>
                ) : (
                    <>
                        {/* Statuses Overview */}
                        <Card className="border-none shadow-sm" data-testid="statuses-card">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold">Các trạng thái</CardTitle>
                                <CardDescription>Danh sách trạng thái của task trong dự án</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex flex-wrap items-center gap-4" data-testid="statuses-list">
                                    {statuses.sort((a, b) => a.order - b.order).map((status, index) => (
                                        <React.Fragment key={status.id}>
                                            <div
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2"
                                                style={{ borderColor: status.color, backgroundColor: `${status.color}10` }}
                                                data-testid={`status-${status.id}`}
                                            >
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
                                                <span className="font-medium">{status.name}</span>
                                                {status.is_initial && (
                                                    <Badge variant="outline" className="text-xs ml-1">Start</Badge>
                                                )}
                                                {status.is_final && (
                                                    <Badge variant="outline" className="text-xs ml-1">End</Badge>
                                                )}
                                            </div>
                                            {index < statuses.length - 1 && (
                                                <ArrowRight className="h-4 w-4 text-slate-300" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transition Matrix */}
                        <Card className="border-none shadow-sm" data-testid="transitions-card">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold">Ma trận chuyển trạng thái</CardTitle>
                                <CardDescription>
                                    Bật/tắt các transition được phép giữa các trạng thái.
                                    <strong className="ml-1 text-emerald-600">{enabledTransitions.length}</strong> transitions đang bật.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse" data-testid="transition-matrix">
                                        <thead>
                                            <tr>
                                                <th className="p-3 text-left font-bold text-slate-600 border-b-2 border-r-2">
                                                    Từ ↓ → Đến
                                                </th>
                                                {statuses.map(s => (
                                                    <th
                                                        key={s.id}
                                                        className="p-3 text-center font-bold text-slate-600 border-b-2"
                                                        style={{ minWidth: 100 }}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                                            {s.name}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statuses.map(fromStatus => (
                                                <tr key={fromStatus.id} className="hover:bg-slate-50/50">
                                                    <td className="p-3 font-medium border-r-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: fromStatus.color }} />
                                                            {fromStatus.name}
                                                        </div>
                                                    </td>
                                                    {statuses.map(toStatus => {
                                                        if (fromStatus.id === toStatus.id) {
                                                            return (
                                                                <td key={toStatus.id} className="p-3 text-center bg-slate-100">
                                                                    <span className="text-slate-400">—</span>
                                                                </td>
                                                            );
                                                        }

                                                        const transition = transitions.find(t =>
                                                            t.from_status_id === fromStatus.id && t.to_status_id === toStatus.id
                                                        );

                                                        return (
                                                            <td key={toStatus.id} className="p-3 text-center">
                                                                <Switch
                                                                    checked={transition?.is_enabled || false}
                                                                    onCheckedChange={() => transition && handleToggleTransition(transition.id)}
                                                                    data-testid={`switch-${fromStatus.id}-${toStatus.id}`}
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Visual Flow */}
                        <Card className="border-none shadow-sm" data-testid="visual-flow-card">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold">Xem trước Workflow</CardTitle>
                                <CardDescription>Các transitions đang được bật</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-2" data-testid="enabled-transitions">
                                    {enabledTransitions.length > 0 ? enabledTransitions.map(t => {
                                        const from = getStatusById(t.from_status_id);
                                        const to = getStatusById(t.to_status_id);
                                        if (!from || !to) return null;

                                        return (
                                            <div
                                                key={t.id}
                                                className="flex items-center gap-3 p-2 rounded-lg bg-slate-50"
                                                data-testid={`transition-${t.id}`}
                                            >
                                                <Badge style={{ backgroundColor: from.color }} className="text-white">
                                                    {from.name}
                                                </Badge>
                                                <ArrowRight className="h-4 w-4 text-slate-400" />
                                                <Badge style={{ backgroundColor: to.color }} className="text-white">
                                                    {to.name}
                                                </Badge>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-slate-500">Chưa có transition nào được bật</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
