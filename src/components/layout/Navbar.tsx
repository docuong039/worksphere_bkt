'use client';

import React from 'react';
import { Bell, Search, User as UserIcon, Globe, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications', {
                headers: { 'x-user-id': user?.id || '' }
            });
            const data = await res.json();
            setNotifications(data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    React.useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <header
            className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30"
            data-testid="main-navbar"
        >
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <Input
                    type="text"
                    placeholder="Tìm kiếm công việc, dự án..."
                    className="pl-10 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                    data-testid="navbar-search-input"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Language / Region */}
                <Button variant="ghost" size="icon" className="text-slate-500 hidden sm:flex" data-testid="navbar-language-btn">
                    <Globe size={20} />
                </Button>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="relative">
                            <Button variant="ghost" size="icon" className="text-slate-500" data-testid="navbar-notifications-btn">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </Button>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0" data-testid="notifications-dropdown">
                        <DropdownMenuLabel className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <span className="font-black text-slate-900">Thông báo {unreadCount > 0 && `(${unreadCount})`}</span>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-blue-600 uppercase tracking-widest px-2" onClick={() => setNotifications(n => n.map(x => ({ ...x, is_read: true })))}>
                                Đánh dấu tất cả
                            </Button>
                        </DropdownMenuLabel>
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="p-4 space-y-3">
                                    <div className="h-10 bg-slate-100 animate-pulse rounded-lg"></div>
                                    <div className="h-10 bg-slate-100 animate-pulse rounded-lg"></div>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <DropdownMenuItem
                                        key={notif.id}
                                        className={cn(
                                            "p-4 border-b border-slate-50 cursor-pointer focus:bg-slate-50 transition-colors flex gap-3 items-start",
                                            !notif.is_read && "bg-blue-50/30"
                                        )}
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-xs uppercase",
                                            notif.type === 'TASK' ? "bg-blue-100 text-blue-600" :
                                                notif.type === 'REPORT' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                                        )}>
                                            {notif.type === 'TASK' ? 'T' : notif.type === 'REPORT' ? 'R' : 'M'}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-xs leading-relaxed", !notif.is_read ? "font-bold text-slate-900" : "text-slate-500")}>
                                                {notif.content}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {!notif.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 font-medium italic text-sm">
                                    Không có thông báo mới.
                                </div>
                            )}
                        </div>
                        <div className="p-2 border-t border-slate-100">
                            <Button variant="ghost" className="w-full text-xs font-bold text-slate-500 hover:text-blue-600">
                                Xem tất cả thông báo
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-6 bg-slate-200 mx-1"></div>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 h-10 hover:bg-slate-50" data-testid="navbar-user-dropdown-trigger">
                            <Avatar className="h-8 w-8 border border-slate-200">
                                <AvatarImage src="" alt={user?.full_name} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                                    {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start text-left">
                                <span className="text-sm font-semibold text-slate-900 leading-tight">{user?.full_name || 'Người dùng'}</span>
                                <span className="text-xs text-slate-500 leading-tight">
                                    {user?.role === 'SYS_ADMIN' ? 'Quản trị hệ thống' :
                                        user?.role === 'ORG_ADMIN' ? 'Quản trị tổ chức' :
                                            user?.role === 'CEO' ? 'CEO' :
                                                user?.role === 'PROJECT_MANAGER' ? 'Quản lý dự án' : 'Nhân viên'}
                                </span>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56" data-testid="navbar-user-menu-content">
                        <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" data-testid="navbar-profile-item">
                            <UserIcon className="mr-2 h-4 w-4" /> Hồ sơ cá nhân
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" data-testid="navbar-settings-item">
                            <Globe className="mr-2 h-4 w-4" /> Cài đặt không gian
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 cursor-pointer focus:text-red-600"
                            onClick={() => logout()}
                            data-testid="navbar-logout-item"
                        >
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
