/**
 * Notifications Page
 * 
 * User Stories:
 * - US-EMP-05-01: Nhận thông báo khi được gán Task
 * - US-EMP-05-02: Nhận thông báo khi Task Done hoặc khóa/mở kỳ
 * - US-EMP-05-03: Nhận thông báo khi có comment
 * - US-EMP-05-04: Xem danh sách thông báo theo trạng thái chưa đọc/đã đọc
 * - US-MNG-07-01: PM nhận thông báo khi EMP hoàn thành Subtask/Log time
 * - US-MNG-07-02: PM nhận thông báo khi EMP comment/báo vấn đề
 * 
 * Access: All authenticated users
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Bell,
    CheckCircle2,
    CheckSquare,
    Clock,
    MessageSquare,
    UserPlus,
    Lock,
    Unlock,
    FileText,
    CheckCheck,
    Loader2,
    ExternalLink,
    AtSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface NotificationItem {
    id: string;
    notification_type: string;
    title: string;
    body: string;
    entity_type: string;
    entity_id: string;
    actor: { id: string; full_name: string } | null;
    project: { id: string; name: string } | null;
    is_read: boolean;
    created_at: string;
}

const NOTIFICATION_TYPES = {
    TASK_ASSIGNED: { label: 'Gán task', icon: UserPlus, color: 'text-blue-600' },
    TASK_DONE: { label: 'Task hoàn thành', icon: CheckCircle2, color: 'text-emerald-600' },
    SUBTASK_DONE: { label: 'Subtask hoàn thành', icon: CheckSquare, color: 'text-green-600' },
    LOG_TIME: { label: 'Log time', icon: Clock, color: 'text-amber-600' },
    COMMENT: { label: 'Bình luận', icon: MessageSquare, color: 'text-purple-600' },
    MENTION: { label: 'Được nhắc đến', icon: AtSign, color: 'text-pink-600' },
    LOCK_UNLOCK: { label: 'Khóa/mở kỳ', icon: Lock, color: 'text-slate-600' },
    REPORT_SUBMITTED: { label: 'Báo cáo mới', icon: FileText, color: 'text-indigo-600' },
};

// Time ago helper
const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN');
};

// Get date group label
const getDateGroup = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
};

// Notification Item Component
const NotificationCard = ({
    notification,
    onRead
}: {
    notification: NotificationItem;
    onRead: () => void;
}) => {
    const typeConfig = NOTIFICATION_TYPES[notification.notification_type as keyof typeof NOTIFICATION_TYPES] || {
        label: notification.notification_type,
        icon: Bell,
        color: 'text-slate-600'
    };
    const Icon = typeConfig.icon;

    // Determine link based on entity_type
    const getEntityLink = () => {
        if (notification.entity_type === 'TASK') return `/tasks/${notification.entity_id}`;
        if (notification.entity_type === 'SUBTASK') return `/tasks/${notification.entity_id}`;
        if (notification.entity_type === 'REPORT') return `/reports/${notification.entity_id}`;
        return null;
    };

    const entityLink = getEntityLink();

    const handleClick = () => {
        if (!notification.is_read) {
            onRead();
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer group",
                notification.is_read
                    ? "bg-white border-slate-100 hover:shadow-sm"
                    : "bg-blue-50/50 border-blue-100 hover:bg-blue-50"
            )}
            data-testid={`notification-item-${notification.id}`}
        >
            <div className="flex items-start gap-4">
                {/* Unread indicator */}
                <div className="mt-2">
                    {!notification.is_read ? (
                        <span className="w-2 h-2 rounded-full bg-blue-600 block" data-testid={`unread-dot-${notification.id}`}></span>
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-200 block"></span>
                    )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm shrink-0">
                    <AvatarFallback className="text-sm font-bold bg-slate-100 text-slate-600">
                        {notification.actor?.full_name?.charAt(0) || 'S'}
                    </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">
                            {notification.actor?.full_name || 'Hệ thống'}
                        </span>
                        <span className="text-xs font-medium text-slate-400 shrink-0">
                            {timeAgo(notification.created_at)}
                        </span>
                    </div>

                    {/* Notification Content */}
                    <div className="flex items-start gap-2 mt-1">
                        <Icon size={16} className={cn("mt-0.5 shrink-0", typeConfig.color)} />
                        <div>
                            <p className="text-sm font-medium text-slate-700">
                                {notification.title}
                            </p>
                            {notification.body && (
                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                                    {notification.body}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Project & Link */}
                    <div className="flex items-center justify-between mt-2">
                        {notification.project && (
                            <span className="text-xs text-slate-400">
                                📁 {notification.project.name}
                            </span>
                        )}
                        {entityLink && (
                            <Link
                                href={entityLink}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                data-testid={`link-entity-${notification.id}`}
                            >
                                Xem chi tiết <ExternalLink size={12} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Page Component
export default function NotificationsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter === 'unread') params.append('is_read', 'false');

            const res = await fetch(`/api/notifications?${params.toString()}`, {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setNotifications(data.data || []);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user, filter]);

    // Mark single as read
    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        setIsMarkingAll(true);
        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'PUT',
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setIsMarkingAll(false);
        }
    };

    // Group notifications by date
    const notificationsByDate = notifications.reduce((acc, item) => {
        const group = getDateGroup(item.created_at);
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {} as Record<string, NotificationItem[]>);

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-700" data-testid="notifications-page-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3" data-testid="notifications-page-title">
                            <Bell className="h-8 w-8 text-blue-600" />
                            Thông báo
                            {unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white font-bold" data-testid="unread-badge">
                                    {unreadCount} mới
                                </Badge>
                            )}
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Cập nhật các hoạt động liên quan đến bạn.
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={markAllAsRead}
                            disabled={isMarkingAll}
                            data-testid="btn-mark-all-read"
                        >
                            {isMarkingAll ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCheck className="mr-2 h-4 w-4" />
                            )}
                            Đánh dấu tất cả đã đọc
                        </Button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2" data-testid="notification-tabs">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'bg-blue-600' : ''}
                        data-testid="tab-all"
                    >
                        Tất cả
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('unread')}
                        className={filter === 'unread' ? 'bg-blue-600' : ''}
                        data-testid="tab-unread"
                    >
                        Chưa đọc
                        {unreadCount > 0 && (
                            <Badge className="ml-2 bg-white text-blue-600 font-bold" variant="secondary">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="space-y-4" data-testid="notifications-loading">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="space-y-6" data-testid="notifications-list">
                        {Object.entries(notificationsByDate).map(([group, items]) => (
                            <div key={group} className="space-y-3" data-testid={`date-group-${group}`}>
                                <div className="flex items-center gap-4">
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                        {group}
                                    </span>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>
                                <div className="space-y-2">
                                    {items
                                        .filter(n => filter === 'all' || !n.is_read)
                                        .map((notification) => (
                                            <NotificationCard
                                                key={notification.id}
                                                notification={notification}
                                                onRead={() => markAsRead(notification.id)}
                                            />
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card className="border-none shadow-sm" data-testid="notifications-empty">
                        <CardContent className="py-16 text-center">
                            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo'}
                            </h3>
                            <p className="text-slate-500">
                                Bạn sẽ nhận được thông báo khi có hoạt động liên quan.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
