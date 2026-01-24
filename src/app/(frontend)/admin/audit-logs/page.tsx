/**
 * Admin Audit Logs Page
 * 
 * User Stories:
 * - US-SYS-02-02: System Admin truy xuất Audit Log toàn hệ thống
 * 
 * Access:
 * - SYS_ADMIN: Xem toàn bộ audit logs
 * - ORG_ADMIN: Xem logs trong Org của mình
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Calendar,
    Filter,
    ChevronDown,
    Shield,
    Eye,
    Plus,
    RefreshCw,
    Trash2,
    LogIn,
    LogOut,
    Lock,
    Unlock,
    AlertTriangle,
    Loader2,
    Download,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

interface AuditLog {
    id: string;
    occurred_at: string;
    org: { id: string; name: string; code: string } | null;
    actor: { id: string; email: string; full_name: string } | null;
    is_impersonation: boolean;
    impersonation_subject: { id: string; email: string } | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    entity_title: string | null;
    before_data: object | null;
    after_data: object | null;
    ip_address: string | null;
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    CREATE: { icon: <Plus size={14} />, color: 'bg-emerald-100 text-emerald-700', label: 'Tạo mới' },
    UPDATE: { icon: <RefreshCw size={14} />, color: 'bg-amber-100 text-amber-700', label: 'Cập nhật' },
    DELETE: { icon: <Trash2 size={14} />, color: 'bg-red-100 text-red-700', label: 'Xóa' },
    LOGIN: { icon: <LogIn size={14} />, color: 'bg-blue-100 text-blue-700', label: 'Đăng nhập' },
    LOGOUT: { icon: <LogOut size={14} />, color: 'bg-slate-100 text-slate-600', label: 'Đăng xuất' },
    IMPERSONATE: { icon: <Shield size={14} />, color: 'bg-red-100 text-red-700', label: 'Hỗ trợ (Impersonate)' },
    IMPERSONATE_END: { icon: <Unlock size={14} />, color: 'bg-emerald-100 text-emerald-700', label: 'Kết thúc hỗ trợ' },
    LOCK_PERIOD: { icon: <Lock size={14} />, color: 'bg-amber-100 text-amber-700', label: 'Khóa kỳ' },
    UNLOCK_PERIOD: { icon: <Unlock size={14} />, color: 'bg-emerald-100 text-emerald-700', label: 'Mở khóa kỳ' },
    RESTORE: { icon: <RefreshCw size={14} />, color: 'bg-emerald-100 text-emerald-700', label: 'Khôi phục' },
    HARD_DELETE: { icon: <Trash2 size={14} />, color: 'bg-red-100 text-red-700', label: 'Xóa vĩnh viễn' },
};

// Log Item Component
const AuditLogItem = ({ log, onViewDetail }: { log: AuditLog; onViewDetail: () => void }) => {
    const actionConfig = ACTION_CONFIG[log.action] || {
        icon: <Eye size={14} />,
        color: 'bg-slate-100 text-slate-600',
        label: log.action
    };

    const time = new Date(log.occurred_at).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return (
        <Card
            className={cn(
                "border-none shadow-sm hover:shadow-md transition-all cursor-pointer",
                log.is_impersonation && "border-l-4 border-l-red-500"
            )}
            onClick={onViewDetail}
            data-testid={`audit-log-${log.id}`}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                        <Badge className={cn("px-2 py-1 border-none", actionConfig.color)}>
                            {actionConfig.icon}
                        </Badge>
                        {log.is_impersonation && (
                            <Badge className="bg-red-500 text-white text-[10px] border-none">
                                🔐 IMP
                            </Badge>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-400 font-mono">{time}</span>
                            <Badge variant="secondary" className="text-xs">
                                {log.entity_type}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={cn("px-2 py-0.5 text-xs font-bold border-none", actionConfig.color)}>
                                {actionConfig.label}
                            </Badge>
                            {log.entity_title && (
                                <span className="text-sm font-medium text-slate-700">
                                    {log.entity_title}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-[8px]">
                                        {log.actor?.full_name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                {log.actor?.email || 'Không xác định'}
                            </span>

                            {log.is_impersonation && log.impersonation_subject && (
                                <span className="text-red-600">
                                    ↳ dưới danh nghĩa {log.impersonation_subject.email}
                                </span>
                            )}

                            {log.org && (
                                <span>🏢 {log.org.name}</span>
                            )}

                            {log.ip_address && (
                                <span>🌐 {log.ip_address}</span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Main Page Component
export default function AdminAuditLogsPage() {
    const { user, hasPermission } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;

    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');
    const [filterEntity, setFilterEntity] = useState('ALL');
    const [filterOrg, setFilterOrg] = useState('ALL');
    const [filterActor, setFilterActor] = useState('');
    const [impersonationOnly, setImpersonationOnly] = useState(false);
    const [orgs, setOrgs] = useState<{ id: string, name: string }[]>([]);

    // Fetch Orgs
    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const res = await fetch('/api/admin/organizations', {
                    headers: {
                        'x-user-id': user?.id || '',
                        'x-user-role': user?.role || ''
                    }
                });
                const data = await res.json();
                setOrgs(data.data || []);
            } catch (error) {
                console.error('Error fetching orgs:', error);
            }
        };
        if (user?.role === 'SYS_ADMIN') fetchOrgs();
    }, [user]);

    // Detail dialog
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Fetch logs
    const fetchLogs = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (filterAction !== 'ALL') params.append('action', filterAction);
            if (filterEntity !== 'ALL') params.append('entity_type', filterEntity);

            // Scope protection
            if (user.role === 'SYS_ADMIN') {
                if (filterOrg !== 'ALL') params.append('org_id', filterOrg);
            } else {
                params.append('org_id', user.org_id || '');
            }

            if (filterActor) params.append('actor_email', filterActor);
            if (impersonationOnly) params.append('impersonation_only', 'true');
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setLogs(data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchLogs();
    }, [user, page]);

    const handleSearch = () => {
        setPage(1);
        fetchLogs();
    };

    const openDetail = (log: AuditLog) => {
        setSelectedLog(log);
        setDetailOpen(true);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <AppLayout>
            <PermissionGuard permission={PERMISSIONS.SYS_AUDIT_READ} showFullPageError>
                <div className="space-y-6 animate-in fade-in duration-700" data-testid="audit-logs-container">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="audit-logs-title">
                                <FileText className="inline-block mr-2 h-8 w-8 text-blue-600" />
                                Nhật ký Kiểm tra
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Theo dõi tất cả hành động trong hệ thống.
                            </p>
                        </div>

                        <Button variant="outline" data-testid="btn-export">
                            <Download className="mr-2 h-4 w-4" />
                            Xuất dữ liệu
                        </Button>
                    </div>

                    {/* Filters */}
                    <Card className="border-none shadow-sm" data-testid="audit-logs-filters">
                        <CardContent className="p-4 space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* Date Range */}
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-36"
                                        data-testid="input-date-from"
                                    />
                                    <span className="text-slate-400">→</span>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-36"
                                        data-testid="input-date-to"
                                    />
                                </div>

                                <Select value={filterAction} onValueChange={setFilterAction}>
                                    <SelectTrigger className="w-[140px]" data-testid="filter-action">
                                        <SelectValue placeholder="Hành động" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả</SelectItem>
                                        <SelectItem value="CREATE">Tạo mới</SelectItem>
                                        <SelectItem value="UPDATE">Cập nhật</SelectItem>
                                        <SelectItem value="DELETE">Xóa</SelectItem>
                                        <SelectItem value="LOGIN">Đăng nhập</SelectItem>
                                        <SelectItem value="IMPERSONATE">Impersonate</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterEntity} onValueChange={setFilterEntity}>
                                    <SelectTrigger className="w-[140px]" data-testid="filter-entity">
                                        <SelectValue placeholder="Đối tượng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả</SelectItem>
                                        <SelectItem value="USER">Người dùng</SelectItem>
                                        <SelectItem value="PROJECT">Dự án</SelectItem>
                                        <SelectItem value="TASK">Công việc</SelectItem>
                                        <SelectItem value="ORGANIZATION">Tổ chức</SelectItem>
                                    </SelectContent>
                                </Select>

                                {user?.role === 'SYS_ADMIN' && (
                                    <Select value={filterOrg} onValueChange={setFilterOrg}>
                                        <SelectTrigger className="w-[180px]" data-testid="filter-org">
                                            <SelectValue placeholder="Tổ chức" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tất cả tổ chức</SelectItem>
                                            {orgs.map(o => (
                                                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Input
                                    placeholder="Email người thực hiện..."
                                    value={filterActor}
                                    onChange={(e) => setFilterActor(e.target.value)}
                                    className="w-[200px]"
                                    data-testid="filter-actor"
                                />

                                <Button onClick={handleSearch} data-testid="admin-audit-btn-search">
                                    <Search className="mr-2 h-4 w-4" />
                                    Tìm kiếm
                                </Button>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={impersonationOnly}
                                    onCheckedChange={(c) => setImpersonationOnly(!!c)}
                                    data-testid="checkbox-impersonation"
                                />
                                <span className="text-sm text-slate-600">
                                    <Shield size={14} className="inline mr-1 text-red-500" />
                                    Chỉ xem phiên hỗ trợ (Impersonate)
                                </span>
                            </label>
                        </CardContent>
                    </Card>

                    {/* Results Count */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Tìm thấy <span className="font-bold text-slate-900">{total}</span> bản ghi
                        </p>
                    </div>

                    {/* Logs List */}
                    {loading ? (
                        <div className="space-y-3" data-testid="audit-logs-loading">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : logs.length > 0 ? (
                        <div className="space-y-3" data-testid="audit-logs-list">
                            {logs.map((log) => (
                                <AuditLogItem
                                    key={log.id}
                                    log={log}
                                    onViewDetail={() => openDetail(log)}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-none shadow-sm" data-testid="audit-logs-empty">
                            <CardContent className="py-16 text-center">
                                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    Không tìm thấy bản ghi
                                </h3>
                                <p className="text-slate-500">
                                    Thử thay đổi bộ lọc hoặc mở rộng khoảng thời gian.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4" data-testid="pagination">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                data-testid="btn-prev"
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <span className="text-sm text-slate-600">
                                Trang {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                data-testid="btn-next"
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    )}

                    {/* Detail Dialog */}
                    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                        <DialogContent className="sm:max-w-2xl" data-testid="dialog-log-detail">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Chi tiết Audit Log
                                </DialogTitle>
                            </DialogHeader>

                            {selectedLog && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500">Thời gian:</span>
                                            <p className="font-medium">
                                                {new Date(selectedLog.occurred_at).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Hành động:</span>
                                            <p className="font-medium">{selectedLog.action}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Đối tượng:</span>
                                            <p className="font-medium">{selectedLog.entity_type}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">ID:</span>
                                            <p className="font-mono text-xs">{selectedLog.entity_id || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                                        <h4 className="font-bold text-slate-700">Người thực hiện</h4>
                                        <p>{selectedLog.actor?.full_name} ({selectedLog.actor?.email})</p>
                                        <p className="text-xs text-slate-500">IP: {selectedLog.ip_address || 'N/A'}</p>
                                    </div>

                                    {selectedLog.before_data && (
                                        <div>
                                            <h4 className="font-bold text-slate-700 mb-2">Trước (before_data):</h4>
                                            <pre className="p-3 bg-slate-100 rounded text-xs overflow-auto max-h-40">
                                                {JSON.stringify(selectedLog.before_data, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    {selectedLog.after_data && (
                                        <div>
                                            <h4 className="font-bold text-slate-700 mb-2">Sau (after_data):</h4>
                                            <pre className="p-3 bg-slate-100 rounded text-xs overflow-auto max-h-40">
                                                {JSON.stringify(selectedLog.after_data, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
