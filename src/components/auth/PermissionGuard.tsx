'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AppPermission } from '@/lib/permissions';
import { ShieldAlert, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PermissionGuardProps {
    /** Quyền cần thiết để truy cập */
    permission: AppPermission;
    /** Nội dung hiển thị nếu có quyền */
    children: React.ReactNode;
    /** Nội dung hiển thị nếu KHÔNG có quyền (mặc định là null/ẩn) */
    fallback?: React.ReactNode;
    /** Hiển thị giao diện báo lỗi toàn màn hình (dùng cho Page-level) */
    showFullPageError?: boolean;
    /** Class name bổ sung cho wrapper (nếu có) */
    className?: string;
}

/**
 * PermissionGuard Component
 * 
 * Sử dụng để bảo vệ các tính năng hoặc trang dựa trên quyền (RBAC/Policy).
 * Phù hợp cho cả việc gating nhỏ (ẩn nút) và gating lớn (chặn trang).
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    children,
    fallback,
    showFullPageError = false,
    className
}) => {
    const { hasPermission, isAuthenticated } = useAuthStore();
    const hasAccess = hasPermission(permission);

    // Nếu chưa đăng nhập, không trả về gì (để AuthProvider xử lý việc redirect)
    if (!isAuthenticated) return null;

    if (!hasAccess) {
        if (showFullPageError) {
            return (
                <div className={cn(
                    "flex flex-col items-center justify-center min-h-[70vh] text-center p-6 animate-in fade-in zoom-in duration-500",
                    className
                )}>
                    <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mb-8 shadow-xl shadow-rose-100/50 relative">
                        <ShieldAlert size={48} />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-4 border-white flex items-center justify-center">
                            <Lock size={12} className="text-white" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">TRUY CẬP BỊ CHẶN</h2>
                    <p className="text-slate-500 max-w-md mb-10 font-medium leading-relaxed">
                        Bạn không có quyền thực hiện hành động này hoặc truy cập vào khu vực này.
                        Thông tin quyền hạn của bạn đã được ghi nhận.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild variant="outline" className="rounded-xl px-8 h-12 font-bold border-slate-200">
                            <Link href="/dashboard">Về Trang chủ</Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-blue-100">
                            <Link href="/tasks">Xem công việc của tôi</Link>
                        </Button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 w-full max-w-xs">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Yêu cầu mã quyền:</p>
                        <code className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded mt-2 inline-block font-mono border border-slate-100">
                            {permission}
                        </code>
                    </div>
                </div>
            );
        }

        return <div className={className}>{fallback || null}</div>;
    }

    return <div className={className}>{children}</div>;
};
