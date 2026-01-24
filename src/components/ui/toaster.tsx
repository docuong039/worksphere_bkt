'use client';

import { useToast, ToastVariant } from '@/hooks/use-toast';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

const variantConfig: Record<ToastVariant, { icon: any; className: string; iconClass: string }> = {
    default: {
        icon: Info,
        className: 'bg-white text-slate-900 border-slate-200',
        iconClass: 'text-blue-500',
    },
    success: {
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        iconClass: 'text-emerald-500',
    },
    destructive: {
        icon: AlertCircle,
        className: 'bg-rose-50 text-rose-900 border-rose-200',
        iconClass: 'text-rose-500',
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-amber-50 text-amber-900 border-amber-200',
        iconClass: 'text-amber-500',
    },
};

export function Toaster() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-0 right-0 z-[100] flex flex-col p-4 gap-2 w-full max-w-[420px] pointer-events-none">
            {toasts.map((toast) => {
                const config = variantConfig[toast.variant || 'default'];
                const Icon = config.icon;

                return (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border p-4 pr-8 shadow-lg transition-all animate-in slide-in-from-right-4 duration-300",
                            config.className
                        )}
                        data-testid={`toast-${toast.id}`}
                        data-variant={toast.variant}
                    >
                        <div className="flex gap-3">
                            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconClass)} />
                            <div className="grid gap-1">
                                {toast.title && <div className="text-sm font-bold">{toast.title}</div>}
                                {toast.description && (
                                    <div className="text-xs opacity-90 font-medium leading-relaxed">
                                        {toast.description}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="absolute right-2 top-2 rounded-md p-1 text-slate-500/50 opacity-0 transition-opacity hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
                            data-testid={`toast-close-${toast.id}`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
