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
    CheckCircle2,
    Sliders,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { PERMISSIONS, AppPermission } from '@/lib/permissions';

interface MenuItem {
    label: string;
    href: string;
    icon: React.ElementType;
    requiredPermission?: AppPermission;
    roles?: string[]; // Fallback or for legacy
}

const MENU_ITEMS: MenuItem[] = [
    { label: 'Bảng điều khiển', href: '/dashboard', icon: LayoutDashboard }, // Dashboard usually everyone has it
    { label: 'Công việc của tôi', href: '/tasks', icon: CheckSquare, requiredPermission: PERMISSIONS.MY_TASK_ALL },
    { label: 'Dự án', href: '/projects', icon: Briefcase, requiredPermission: PERMISSIONS.PROJECT_READ },
    { label: 'Nhật ký thời gian', href: '/time-logs', icon: Clock, requiredPermission: PERMISSIONS.TIME_LOG_READ },
    { label: 'Báo cáo', href: '/reports', icon: BarChart3, requiredPermission: PERMISSIONS.REPORT_READ },
    { label: 'Bảng cá nhân', href: '/personal-board', icon: Pin, requiredPermission: PERMISSIONS.MY_TASK_ALL },
    { label: 'Hoạt động', href: '/activity', icon: Newspaper, requiredPermission: PERMISSIONS.ACTIVITY_READ },
    { label: 'Thùng rác', href: '/recycle-bin', icon: Trash2, requiredPermission: PERMISSIONS.RECYCLE_BIN_READ },
];

const HR_ITEMS: MenuItem[] = [
    { label: 'Danh sách nhân viên', href: '/hr/employees', icon: Users, requiredPermission: PERMISSIONS.ORG_USER_READ },
    { label: 'Lương & Cấp bậc', href: '/hr/salary', icon: DollarSign, requiredPermission: PERMISSIONS.COMPENSATION_READ },
    { label: 'Hợp đồng', href: '/hr/contracts', icon: FileText, requiredPermission: PERMISSIONS.JOB_CONTRACT_READ },
];

const ADMIN_ITEMS: MenuItem[] = [
    { label: 'Hệ thống Tổ chức', href: '/admin/organizations', icon: Building2, requiredPermission: PERMISSIONS.PLATFORM_ORG_READ },
    { label: 'Duyệt đơn đăng ký', href: '/admin/org-approvals', icon: CheckCircle2, requiredPermission: PERMISSIONS.PLATFORM_ORG_APPROVE },
    { label: 'Cấu hình Quota', href: '/admin/quotas', icon: HardDrive, requiredPermission: PERMISSIONS.PLATFORM_ORG_READ },
    { label: 'Người dùng toàn cục', href: '/admin/users', icon: User, requiredPermission: PERMISSIONS.ORG_USER_READ },
    { label: 'Vai trò Hệ thống', href: '/admin/roles', icon: Lock, requiredPermission: PERMISSIONS.ROLE_PERM_READ },
    { label: 'Trường tùy chỉnh', href: '/admin/custom-fields', icon: Sliders, requiredPermission: PERMISSIONS.TENANT_ORG_UPDATE },
    { label: 'Nhật ký toàn cục', href: '/admin/audit-logs', icon: Activity, requiredPermission: PERMISSIONS.SYS_AUDIT_READ },
    { label: 'Truy cập ủy quyền', href: '/admin/impersonation', icon: Shield, requiredPermission: PERMISSIONS.SESSION_IMPERSONATE },
    { label: 'Thùng rác Nền tảng', href: '/admin/org-recycle-bin', icon: History, requiredPermission: PERMISSIONS.PLATFORM_ORG_READ },
];

const SETTINGS_ITEMS: MenuItem[] = [
    { label: 'Cài đặt không gian', href: '/settings/workspace', icon: Settings, requiredPermission: PERMISSIONS.TENANT_ORG_UPDATE },
    { label: 'Hồ sơ cá nhân', href: '/settings/profile', icon: User }, // Specific to self
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout, hasPermission } = useAuthStore();
    const userRole = user?.role || 'EMPLOYEE';

    const filterMenuItems = (items: MenuItem[]) => {
        return items.filter(item => {
            // SysAdmin should not see tenant-specific items in their global context
            if (userRole === 'SYS_ADMIN') {
                const tenantSpecificHrefs = [
                    '/tasks', '/projects', '/time-logs', '/personal-board',
                    '/hr/employees', '/hr/salary', '/hr/contracts',
                    '/reports', '/activity', '/recycle-bin', '/settings/workspace'
                ];
                if (tenantSpecificHrefs.includes(item.href)) return false;
            }

            if (!item.requiredPermission) return true;
            return hasPermission(item.requiredPermission);
        });
    };

    const mainItems = filterMenuItems(MENU_ITEMS).map(item => {
        if (item.href === '/dashboard' && (userRole === 'CEO' || userRole === 'ORG_ADMIN')) {
            return { ...item, label: 'Bảng điều hành', href: '/executive/dashboard' };
        }
        if (item.href === '/dashboard' && userRole === 'SYS_ADMIN') {
            return { ...item, label: 'Bảng quản trị', href: '/admin/platform-dashboard' };
        }
        return item;
    });
    const hrItems = filterMenuItems(HR_ITEMS);
    const adminItems = filterMenuItems(ADMIN_ITEMS).map(item => {
        if (userRole === 'SYS_ADMIN') return item;

        // Custom labels for Tenant Admins in the same hrefs
        if (item.href === '/admin/users') return { ...item, label: 'Quản lý Nhân sự' };
        if (item.href === '/admin/roles') return { ...item, label: 'Vai trò nội bộ' };
        if (item.href === '/admin/audit-logs') return { ...item, label: 'Nhật ký hoạt động' };
        return item;
    });
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
                {userRole === 'SYS_ADMIN' ? (
                    <div>
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
                ) : (
                    <div>
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Danh mục chính</p>
                        <ul className="space-y-1">
                            {mainItems.map((item) => {
                                // Hide Formal Project Tasks for CEO, they only use Personal Board
                                if (item.href === '/tasks' && userRole === 'CEO') return null;

                                return (
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
                                );
                            })}
                        </ul>
                    </div>
                )}

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

            {/* Removed Logout from Sidebar as it already exists in the Navbar user menu */}
        </aside>
    );
}
