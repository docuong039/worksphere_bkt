'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
    Sliders,
    Tag,
    Bell,
    Trash2,
    ShieldCheck,
    ChevronRight,
    Settings2,
    Clock,
    ChevronLeft,
    DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();

    const isCEO = user?.role === 'CEO';
    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';
    const isAuthorized = isPM || isCEO;

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <h2 className="text-2xl font-black text-slate-900">Truy cập bị hạn chế</h2>
                <p className="text-slate-500 mt-2 font-medium">Bạn cần quyền phù hợp để thay đổi cài đặt dự án.</p>
            </div>
        );
    }

    const setttingMenus = [
        {
            title: 'Trường tùy chỉnh',
            description: 'Quản lý các trường dữ liệu riêng cho công việc của dự án.',
            icon: Sliders,
            href: `/projects/${projectId}/settings/custom-fields`,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            hidden: isCEO // CEO cannot manage functional config
        },
        {
            title: 'Trạng thái & Khóa dự án',
            description: 'CEO/Admin có thể khóa dự án để ngăn chặn mọi thay đổi (Lockdown).',
            icon: ShieldCheck,
            href: `/projects/${projectId}/settings/lockdown`,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            hidden: false // CEO is allowed to Lock/Unlock for strategic reasons
        },
        {
            title: 'Nhãn (Tags)',
            description: 'Phân loại công việc bằng hệ thống nhãn màu sắc.',
            icon: Tag,
            href: `/projects/${projectId}/settings/tags`,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            hidden: isCEO // CEO cannot manage tags
        },
        {
            title: 'Phân quyền trường',
            description: 'Giới hạn quyền xem hoặc sửa các trường dữ liệu cụ thể.',
            icon: ShieldCheck,
            href: `/projects/${projectId}/settings/field-permissions`,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            hidden: isCEO // CEO cannot manage field permissions
        },
        {
            title: 'Thông báo',
            description: 'Cấu hình các sự kiện sẽ gửi thông báo cho thành viên.',
            icon: Bell,
            href: `/projects/${projectId}/settings/notifications`,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            hidden: isCEO // CEO cannot manage notification configs
        },
        {
            title: 'Khóa kỳ công',
            description: 'Khóa nhật ký thời gian và thay đổi trạng thái theo chu kỳ tuần/tháng.',
            icon: Clock,
            href: `/projects/${projectId}/time-locks`,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            hidden: isCEO
        },
        {
            title: 'Thùng rác',
            description: 'Khôi phục các công việc hoặc tài liệu đã xóa gần đây.',
            icon: Trash2,
            href: `/projects/${projectId}/settings/recycle-bin`,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            hidden: false // CEO can view and restore data as needed
        },
        {
            title: 'Chi phí Nhân sự',
            description: 'Theo dõi chi phí và quản lý mức lương của nhân sự trong dự án.',
            icon: DollarSign,
            href: `/projects/${projectId}/cost`,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            hidden: !isAuthorized // Accessible to PMs and CEO as per requirements
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20" data-testid="project-settings-container">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100" asChild data-testid="btn-back-to-project">
                    <Link href={`/projects/${projectId}`}>
                        <ChevronLeft size={20} className="text-slate-600" />
                    </Link>
                </Button>
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2" data-testid="project-settings-title">
                        <Settings2 className="h-5 w-5 text-slate-600" />
                        Cài đặt Dự án
                    </h2>
                    <p className="text-sm font-medium text-slate-500">Cấu hình các tham số và quy trình làm việc riêng cho dự án này.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="settings-menu-grid">
                {setttingMenus.filter(m => !m.hidden).map((menu) => (
                    <Link key={menu.href} href={menu.href} data-testid={`settings-menu-${menu.href.split('/').pop()}`}>
                        <Card className="border-none shadow-sm hover:shadow-md hover:ring-1 hover:ring-blue-100 transition-all cursor-pointer group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl ${menu.bg} ${menu.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    <menu.icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 flex items-center justify-between">
                                        {menu.title}
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">{menu.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
