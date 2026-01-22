'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CheckSquare,
    Briefcase,
    Clock,
    BarChart3,
    Pin,
    Newspaper,
    Trash2,
    LogOut,
    User,
    Settings,
    Shield,
    HardDrive,
    History,
    Activity,
    Building2,
    Lock,
    Users,
    DollarSign,
    FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface MenuItem {
    label: string;
    href: string;
    icon: React.ElementType;
    roles: string[];
}

const MENU_ITEMS: MenuItem[] = [
    { label: 'Bảng điều khiển', href: '/dashboard', icon: LayoutDashboard, roles: ['EMPLOYEE', 'PROJECT_MANAGER', 'CEO', 'ORG_ADMIN', 'SYS_ADMIN'] },
    { label: 'Công việc của tôi', href: '/tasks', icon: CheckSquare, roles: ['EMPLOYEE', 'PROJECT_MANAGER', 'CEO', 'ORG_ADMIN'] },
    { label: 'Dự án', href: '/projects', icon: Briefcase, roles: ['PROJECT_MANAGER', 'CEO', 'ORG_ADMIN'] },
    { label: 'Nhật ký thời gian', href: '/time-logs', icon: Clock, roles: ['EMPLOYEE', 'PROJECT_MANAGER', 'CEO', 'ORG_ADMIN'] },
    { label: 'Báo cáo', href: '/reports', icon: BarChart3, roles: ['EMPLOYEE', 'PROJECT_MANAGER', 'CEO', 'ORG_ADMIN'] },
    { label: 'Bảng cá nhân', href: '/personal-board', icon: Pin, roles: ['EMPLOYEE', 'PROJECT_MANAGER', 'CEO', 'ORG_ADMIN'] },
    { label: 'Hoạt động', href: '/activity', icon: Newspaper, roles: ['EMPLOYEE', 'PROJECT_MANAGER', 'CEO', 'ORG_ADMIN'] },
    { label: 'Thùng rác', href: '/recycle-bin', icon: Trash2, roles: ['EMPLOYEE', 'PROJECT_MANAGER', 'CEO', 'ORG_ADMIN', 'SYS_ADMIN'] },
];

const HR_ITEMS: MenuItem[] = [
    { label: 'Danh sách nhân viên', href: '/hr/employees', icon: Users, roles: ['PROJECT_MANAGER', 'CEO', 'ORG_ADMIN'] },
    { label: 'Lương & Cấp bậc', href: '/hr/salary', icon: DollarSign, roles: ['PROJECT_MANAGER', 'CEO', 'ORG_ADMIN'] },
    { label: 'Hợp đồng', href: '/hr/contracts', icon: FileText, roles: ['CEO', 'ORG_ADMIN'] },
];

const ADMIN_ITEMS: MenuItem[] = [
    { label: 'Tổ chức', href: '/admin/organizations', icon: Building2, roles: ['SYS_ADMIN'] },
    { label: 'Hạn mức hệ thống', href: '/admin/quotas', icon: HardDrive, roles: ['SYS_ADMIN'] },
    { label: 'Người dùng', href: '/admin/users', icon: User, roles: ['ORG_ADMIN', 'SYS_ADMIN'] },
    { label: 'Phân quyền & Vai trò', href: '/admin/roles', icon: Lock, roles: ['ORG_ADMIN', 'SYS_ADMIN'] },
    { label: 'Nhật ký hệ thống', href: '/admin/audit-logs', icon: Activity, roles: ['ORG_ADMIN'] },
    { label: 'Nhật ký hệ thống toàn cầu', href: '/admin/audit-logs', icon: Activity, roles: ['SYS_ADMIN'] },
    { label: 'Giả lập người dùng', href: '/admin/impersonation', icon: Shield, roles: ['SYS_ADMIN'] },
    { label: 'Thùng rác hệ thống', href: '/admin/org-recycle-bin', icon: History, roles: ['SYS_ADMIN'] },
];

const SETTINGS_ITEMS: MenuItem[] = [
    { label: 'Cài đặt không gian', href: '/settings/workspace', icon: Settings, roles: ['ORG_ADMIN', 'SYS_ADMIN'] },
    { label: 'Hồ sơ cá nhân', href: '/settings/profile', icon: User, roles: ['EMPLOYEE', 'PROJECT_MANAGER', 'CEO', 'ORG_ADMIN', 'SYS_ADMIN'] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const userRole = user?.role || 'EMPLOYEE';

    const filterMenuItems = (items: MenuItem[]) => {
        return items.filter(item => item.roles.includes(userRole));
    };

    const mainItems = filterMenuItems(MENU_ITEMS);
    const hrItems = filterMenuItems(HR_ITEMS);
    const adminItems = filterMenuItems(ADMIN_ITEMS);
    const settingsItems = filterMenuItems(SETTINGS_ITEMS);

    return (
        <aside
            className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-slate-800"
            data-testid="main-sidebar"
        >
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
                <span className="text-xl font-bold text-white tracking-tight">WorkSphere</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-8 py-8">
                <div>
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Danh mục chính</p>
                    <ul className="space-y-1">
                        {mainItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white",
                                        pathname === item.href ? "bg-blue-600/10 text-blue-500" : "text-slate-400"
                                    )}
                                    data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {hrItems.length > 0 && (
                    <div>
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Nhân sự</p>
                        <ul className="space-y-1">
                            {hrItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white",
                                            pathname.startsWith(item.href) ? "bg-blue-600/10 text-blue-500" : "text-slate-400"
                                        )}
                                        data-testid={`sidebar-link-hr-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {adminItems.length > 0 && (
                    <div>
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Quản trị hệ thống</p>
                        <ul className="space-y-1">
                            {adminItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white",
                                            pathname.startsWith(item.href) ? "bg-blue-600/10 text-blue-500" : "text-slate-400"
                                        )}
                                        data-testid={`sidebar-link-admin-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div>
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Cài đặt</p>
                    <ul className="space-y-1">
                        {settingsItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white",
                                        pathname === item.href ? "bg-blue-600/10 text-blue-500" : "text-slate-400"
                                    )}
                                    data-testid={`sidebar-link-settings-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-slate-800 space-y-2">
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    data-testid="sidebar-logout-button"
                >
                    <LogOut size={18} />
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
}
