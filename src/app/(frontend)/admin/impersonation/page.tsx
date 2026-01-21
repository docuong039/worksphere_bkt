/**
 * Admin Impersonation Page
 * 
 * User Stories:
 * - US-SYS-01-06: System Admin đăng nhập vào Tổ chức dưới quyền hỗ trợ
 * 
 * Access: SYS_ADMIN only
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Search,
    AlertTriangle,
    Building2,
    User,
    Play,
    XCircle,
    Clock,
    FileText,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Alert,
    AlertDescription,
    AlertTitle
} from '@/components/ui/alert';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';

interface Organization {
    id: string;
    code: string;
    name: string;
    member_count: number;
}

interface OrgUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
}

interface ImpersonationSession {
    id: string;
    org_name: string;
    subject_email: string;
    started_at: string;
    reason: string;
}

export default function AdminImpersonationPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [users, setUsers] = useState<OrgUser[]>([]);
    const [activeSessions, setActiveSessions] = useState<ImpersonationSession[]>([]);

    // Form state
    const [selectedOrg, setSelectedOrg] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [reason, setReason] = useState('');
    const [ticketId, setTicketId] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [starting, setStarting] = useState(false);

    // Fetch orgs
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
        if (user) fetchOrgs();
    }, [user]);

    // Fetch users when org selected
    useEffect(() => {
        const fetchUsers = async () => {
            if (!selectedOrg) {
                setUsers([]);
                return;
            }
            try {
                const res = await fetch(`/api/admin/organizations/${selectedOrg}/users`, {
                    headers: {
                        'x-user-id': user?.id || '',
                        'x-user-role': user?.role || ''
                    }
                });
                const data = await res.json();
                // Filter out SYS_ADMINs
                const filtered = (data.data || []).filter((u: OrgUser) => u.role !== 'SYS_ADMIN');
                setUsers(filtered);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [selectedOrg, user]);

    // Validate form
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!selectedOrg) newErrors.org = 'Chọn tổ chức';
        if (!selectedUser) newErrors.user = 'Chọn user';
        if (!reason.trim()) newErrors.reason = 'Lý do là bắt buộc';
        if (reason.length < 10) newErrors.reason = 'Lý do phải có ít nhất 10 ký tự';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Start impersonation
    const handleStartImpersonation = async () => {
        if (!validateForm()) return;
        setStarting(true);
        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({
                    org_id: selectedOrg,
                    subject_user_id: selectedUser,
                    reason: reason.trim(),
                    request_id: ticketId.trim() || null
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Redirect or show success
                window.location.href = '/dashboard';
            } else {
                const data = await res.json();
                setErrors({ form: data.message || 'Không thể bắt đầu phiên impersonate' });
            }
        } catch (error) {
            console.error('Error starting impersonation:', error);
            setErrors({ form: 'Có lỗi xảy ra' });
        } finally {
            setStarting(false);
        }
    };

    const selectedOrgData = orgs.find(o => o.id === selectedOrg);
    const selectedUserData = users.find(u => u.id === selectedUser);

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700" data-testid="impersonation-container">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="impersonation-title">
                        <Shield className="inline-block mr-2 h-8 w-8 text-red-600" />
                        Đăng nhập Hỗ trợ
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Impersonate một user để hỗ trợ khách hàng.
                    </p>
                </div>

                {/* Warning */}
                <Alert variant="destructive" className="border-red-200 bg-red-50" data-testid="impersonation-warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Cảnh báo</AlertTitle>
                    <AlertDescription>
                        Mọi thao tác trong phiên impersonate sẽ được ghi log đầy đủ.
                        Phiên tự động kết thúc sau 2 giờ.
                    </AlertDescription>
                </Alert>

                {/* Form */}
                <Card className="border-none shadow-lg" data-testid="impersonation-form">
                    <CardHeader>
                        <CardTitle className="text-lg">Thông tin Impersonation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {errors.form && (
                            <Alert variant="destructive">
                                <AlertDescription>{errors.form}</AlertDescription>
                            </Alert>
                        )}

                        {/* Select Org */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                <Building2 size={14} className="inline mr-1" />
                                Chọn Tổ chức <span className="text-red-500">*</span>
                            </label>
                            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                                <SelectTrigger
                                    className={errors.org ? 'border-red-300' : ''}
                                    data-testid="select-org"
                                >
                                    <SelectValue placeholder="Chọn tổ chức..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {orgs.map(org => (
                                        <SelectItem key={org.id} value={org.id}>
                                            <span className="font-medium">{org.name}</span>
                                            <span className="text-slate-400 ml-2">({org.code})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.org && <p className="text-sm text-red-600">{errors.org}</p>}
                        </div>

                        {/* Select User */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                <User size={14} className="inline mr-1" />
                                Đăng nhập với vai trò <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={selectedUser}
                                onValueChange={setSelectedUser}
                                disabled={!selectedOrg}
                            >
                                <SelectTrigger
                                    className={errors.user ? 'border-red-300' : ''}
                                    data-testid="select-user"
                                >
                                    <SelectValue placeholder="Chọn user trong org..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>
                                            <span className="font-medium">{u.full_name}</span>
                                            <span className="text-slate-400 ml-2">({u.email})</span>
                                            <Badge className="ml-2 text-xs">{u.role}</Badge>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.user && <p className="text-sm text-red-600">{errors.user}</p>}
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                <FileText size={14} className="inline mr-1" />
                                Lý do Impersonate <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                placeholder="Hỗ trợ cấu hình dự án theo yêu cầu ticket #1234..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className={errors.reason ? 'border-red-300' : ''}
                                data-testid="input-reason"
                            />
                            {errors.reason && <p className="text-sm text-red-600">{errors.reason}</p>}
                        </div>

                        {/* Ticket ID */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Mã Ticket (Tùy chọn)
                            </label>
                            <Input
                                placeholder="TICKET-1234"
                                value={ticketId}
                                onChange={(e) => setTicketId(e.target.value)}
                                data-testid="input-ticket"
                            />
                        </div>

                        {/* Preview */}
                        {selectedOrgData && selectedUserData && (
                            <div className="p-4 bg-slate-50 rounded-lg" data-testid="impersonation-preview">
                                <p className="text-sm text-slate-600 mb-2">Sẽ đăng nhập với:</p>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                            {selectedUserData.full_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-slate-900">{selectedUserData.full_name}</p>
                                        <p className="text-sm text-slate-500">{selectedUserData.email}</p>
                                    </div>
                                    <Badge className="ml-auto">{selectedOrgData.name}</Badge>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" data-testid="btn-cancel">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleStartImpersonation}
                                disabled={starting}
                                className="bg-red-600 hover:bg-red-700"
                                data-testid="btn-start-impersonate"
                            >
                                {starting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="mr-2 h-4 w-4" />
                                )}
                                Bắt đầu Impersonate
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
