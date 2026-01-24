'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
    Bell,
    Save,
    RefreshCw,
    MessageSquare,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileText,
    Users,
    Calendar,
    ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface NotificationSetting {
    key: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    email_enabled: boolean;
    push_enabled: boolean;
    in_app_enabled: boolean;
}

export default function NotificationSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [settings, setSettings] = useState<NotificationSetting[]>([]);

    useEffect(() => {
        fetchSettings();
    }, [projectId]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // Mock data - US-MNG-07-03
            setProjectName('Worksphere Platform');
            const mockSettings: NotificationSetting[] = [
                {
                    key: 'task_assigned',
                    label: 'Task được giao',
                    description: 'Khi có task mới được phân công',
                    icon: <Users className="h-5 w-5" />,
                    email_enabled: true,
                    push_enabled: true,
                    in_app_enabled: true,
                },
                {
                    key: 'task_status_changed',
                    label: 'Thay đổi trạng thái',
                    description: 'Khi task chuyển trạng thái (TODO, In Progress, Done...)',
                    icon: <CheckCircle2 className="h-5 w-5" />,
                    email_enabled: false,
                    push_enabled: true,
                    in_app_enabled: true,
                },
                {
                    key: 'task_due_soon',
                    label: 'Sắp đến hạn',
                    description: 'Nhắc nhở khi task còn 1 ngày đến deadline',
                    icon: <Clock className="h-5 w-5" />,
                    email_enabled: true,
                    push_enabled: true,
                    in_app_enabled: true,
                },
                {
                    key: 'task_overdue',
                    label: 'Quá hạn',
                    description: 'Cảnh báo khi task bị trễ deadline',
                    icon: <AlertTriangle className="h-5 w-5" />,
                    email_enabled: true,
                    push_enabled: true,
                    in_app_enabled: true,
                },
                {
                    key: 'comment_new',
                    label: 'Bình luận mới',
                    description: 'Khi có người bình luận trên task',
                    icon: <MessageSquare className="h-5 w-5" />,
                    email_enabled: false,
                    push_enabled: false,
                    in_app_enabled: true,
                },
                {
                    key: 'comment_mention',
                    label: 'Được tag (@mention)',
                    description: 'Khi có người tag bạn trong bình luận',
                    icon: <MessageSquare className="h-5 w-5" />,
                    email_enabled: true,
                    push_enabled: true,
                    in_app_enabled: true,
                },
                {
                    key: 'report_submitted',
                    label: 'Báo cáo gửi',
                    description: 'Khi nhân viên gửi báo cáo cần duyệt',
                    icon: <FileText className="h-5 w-5" />,
                    email_enabled: true,
                    push_enabled: true,
                    in_app_enabled: true,
                },
                {
                    key: 'calendar_event',
                    label: 'Sự kiện lịch',
                    description: 'Nhắc nhở sự kiện trong lịch dự án',
                    icon: <Calendar className="h-5 w-5" />,
                    email_enabled: false,
                    push_enabled: true,
                    in_app_enabled: true,
                },
            ];
            setSettings(mockSettings);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: string, type: 'email' | 'push' | 'in_app') => {
        setSettings(settings.map(s => {
            if (s.key === key) {
                return {
                    ...s,
                    [`${type}_enabled`]: !s[`${type}_enabled` as keyof NotificationSetting],
                };
            }
            return s;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Mock save - replace with real API
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Show success message
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const enabledCount = settings.filter(s => s.email_enabled || s.push_enabled || s.in_app_enabled).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" data-testid="notification-settings-page">
            {/* Header - now using shared layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-800 flex items-center gap-2" data-testid="project-notifications-page-title">
                        <Bell className="h-5 w-5 text-amber-500" />
                        Cấu hình Thông báo
                    </h2>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 h-9 font-bold"
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
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

            {/* Summary */}
            <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50" data-testid="summary-card">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Bell className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">
                                <strong className="text-blue-600">{enabledCount}/{settings.length}</strong> loại thông báo đang bật
                            </p>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Cấu hình cho dự án <strong>{projectName}</strong>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Settings Table */}
            <Card className="border-none shadow-sm" data-testid="settings-card">
                <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg font-bold">Các loại thông báo</CardTitle>
                    <CardDescription>Bật/tắt từng loại thông báo theo kênh nhận</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4" data-testid="project-notifications-loading-skeleton">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b text-sm font-bold text-slate-600">
                                <div className="col-span-6">Loại thông báo</div>
                                <div className="col-span-2 text-center">Email</div>
                                <div className="col-span-2 text-center">Push</div>
                                <div className="col-span-2 text-center">In-app</div>
                            </div>

                            {/* Settings Rows */}
                            <div className="divide-y divide-slate-100" data-testid="settings-list">
                                {settings.map(setting => (
                                    <div
                                        key={setting.key}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors"
                                        data-testid={`setting-row-${setting.key}`}
                                    >
                                        <div className="col-span-6 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                                {setting.icon}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{setting.label}</p>
                                                <p className="text-xs text-slate-500">{setting.description}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <Switch
                                                checked={setting.email_enabled}
                                                onCheckedChange={() => handleToggle(setting.key, 'email')}
                                                data-testid={`switch-email-${setting.key}`}
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <Switch
                                                checked={setting.push_enabled}
                                                onCheckedChange={() => handleToggle(setting.key, 'push')}
                                                data-testid={`switch-push-${setting.key}`}
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <Switch
                                                checked={setting.in_app_enabled}
                                                onCheckedChange={() => handleToggle(setting.key, 'in_app')}
                                                data-testid={`switch-inapp-${setting.key}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Help */}
            <Card className="border-none shadow-sm" data-testid="help-card">
                <CardContent className="p-6">
                    <h3 className="font-bold text-slate-900 mb-3">Giải thích các kênh nhận thông báo</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="font-medium text-slate-900 mb-1">📧 Email</p>
                            <p className="text-sm text-slate-500">
                                Gửi email đến địa chỉ đăng ký. Phù hợp cho thông báo quan trọng.
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="font-medium text-slate-900 mb-1">🔔 Push</p>
                            <p className="text-sm text-slate-500">
                                Push notification đến trình duyệt/ứng dụng di động.
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="font-medium text-slate-900 mb-1">🔵 In-app</p>
                            <p className="text-sm text-slate-500">
                                Hiển thị trong trung tâm thông báo khi đang sử dụng app.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
