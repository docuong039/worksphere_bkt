'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Building2,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowRight,
    Users,
    Lock,
} from 'lucide-react';

interface InviteInfo {
    org_name: string;
    org_slug: string;
    inviter_name: string;
    email_hint: string | null;
    expires_at: string;
    is_valid: boolean;
    error?: string;
}

function JoinPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get('code');

    const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        password: '',
        confirm_password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (code) {
            validateInvite(code);
        } else {
            setLoading(false);
        }
    }, [code]);

    const validateInvite = async (inviteCode: string) => {
        setLoading(true);
        try {
            // Mock validation - replace with real API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate valid invite
            const mockInviteInfo: InviteInfo = {
                org_name: 'TechCorp Vietnam',
                org_slug: 'techcorp-vietnam',
                inviter_name: 'Nguyễn Văn Admin',
                email_hint: null,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                is_valid: true,
            };

            setInviteInfo(mockInviteInfo);
        } catch (error) {
            setInviteInfo({
                org_name: '',
                org_slug: '',
                inviter_name: '',
                email_hint: null,
                expires_at: '',
                is_valid: false,
                error: 'Mã mời không hợp lệ hoặc đã hết hạn',
            });
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Vui lòng nhập họ tên';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
        }

        if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setJoining(true);
        try {
            // Mock join - replace with real API
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Redirect to login after successful join
            router.push('/login?joined=true');
        } catch (error) {
            setErrors({ submit: 'Có lỗi xảy ra, vui lòng thử lại' });
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-none shadow-xl" data-testid="join-loading">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Đang xác thực mã mời...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!code) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-none shadow-xl" data-testid="join-no-code">
                    <CardContent className="p-8 text-center">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Không có mã mời</h2>
                        <p className="text-slate-500 mb-6">
                            Vui lòng sử dụng link mời hợp lệ để gia nhập tổ chức
                        </p>
                        <Button onClick={() => router.push('/login')} data-testid="btn-go-login">
                            Quay về trang đăng nhập
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (inviteInfo && !inviteInfo.is_valid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-none shadow-xl" data-testid="join-invalid">
                    <CardContent className="p-8 text-center">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Mã mời không hợp lệ</h2>
                        <p className="text-slate-500 mb-6">{inviteInfo.error}</p>
                        <Button onClick={() => router.push('/login')} data-testid="btn-go-login">
                            Quay về trang đăng nhập
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" data-testid="join-container">
            <Card className="w-full max-w-lg border-none shadow-xl" data-testid="join-card">
                <CardHeader className="text-center pb-0">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-200">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold" data-testid="join-page-title">Gia nhập tổ chức</CardTitle>
                    <CardDescription className="text-base">
                        Bạn được mời tham gia <strong className="text-blue-600">{inviteInfo?.org_name}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                    {/* Invite Info */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6" data-testid="invite-info">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{inviteInfo?.org_name}</p>
                                <p className="text-xs text-slate-500">Mời bởi: {inviteInfo?.inviter_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Lock className="h-4 w-4" />
                            <span>Mã mời hết hạn: {new Date(inviteInfo?.expires_at || '').toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleJoin} className="space-y-4" data-testid="join-form">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email công việc *</label>
                            <Input
                                type="email"
                                placeholder="you@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={errors.email ? 'border-red-300' : ''}
                                data-testid="input-email"
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Họ và tên *</label>
                            <Input
                                placeholder="Nguyễn Văn A"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className={errors.full_name ? 'border-red-300' : ''}
                                data-testid="input-fullname"
                            />
                            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Mật khẩu *</label>
                            <Input
                                type="password"
                                placeholder="Tối thiểu 8 ký tự"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={errors.password ? 'border-red-300' : ''}
                                data-testid="input-password"
                            />
                            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu *</label>
                            <Input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={formData.confirm_password}
                                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                className={errors.confirm_password ? 'border-red-300' : ''}
                                data-testid="input-confirm-password"
                            />
                            {errors.confirm_password && <p className="text-xs text-red-500">{errors.confirm_password}</p>}
                        </div>

                        {errors.submit && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600" data-testid="error-submit">
                                {errors.submit}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 h-12 text-base"
                            disabled={joining}
                            data-testid="btn-join"
                        >
                            {joining ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Tạo tài khoản và gia nhập
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Đã có tài khoản?{' '}
                        <a href="/login" className="text-blue-600 font-medium hover:underline" data-testid="link-login">
                            Đăng nhập
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-none shadow-xl">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Đang tải...</p>
                    </CardContent>
                </Card>
            </div>
        }>
            <JoinPageContent />
        </Suspense>
    );
}
