'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertTriangle, CheckCircle, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Reset Password Page
 * 
 * User Stories: US-EMP-00-03
 * Design: Based on src/app/(frontend)/(auth)/reset-password/reset-password.md
 * 
 * Refactored with Shadcn UI and data-testid for Playwright testing.
 */

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    // State
    const [status, setStatus] = useState<'LOADING' | 'VALID' | 'INVALID' | 'SUCCESS'>('LOADING');
    const [userData, setUserData] = useState<{ email?: string } | null>(null);

    // Form State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Submitting State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});

    // 1. Verify Token on Mount
    useEffect(() => {
        if (!token) {
            setStatus('INVALID');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch(`/api/auth/verify-reset-token?token=${token}`);
                const data = await res.json();

                if (data.valid) {
                    setUserData(data);
                    setStatus('VALID');
                } else {
                    setStatus('INVALID');
                }
            } catch (e) {
                setStatus('INVALID');
            }
        };

        verifyToken();
    }, [token]);

    // 2. Validate Form
    const validateForm = () => {
        const errors: typeof fieldErrors = {};
        let isValid = true;

        if (password.length < 8) {
            errors.password = 'Mật khẩu tối thiểu 8 ký tự';
            isValid = false;
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    // 3. Submit Reset
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    new_password: password,
                    confirm_password: confirmPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
            }

            // Success Step
            setStatus('SUCCESS');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER STATES ---

    if (status === 'LOADING') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]" data-testid="reset-loading">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600 font-medium">Đang xác thực liên kết...</p>
            </div>
        );
    }

    if (status === 'INVALID') {
        return (
            <div className="text-center animate-in fade-in zoom-in-95 duration-300" data-testid="reset-invalid-state">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 rounded-2xl text-red-600 shadow-sm">
                        <AlertTriangle size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Link đã hết hạn</h2>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
                    Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới.
                </p>
                <div className="flex flex-col gap-3">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-11">
                        <Link href="/forgot-password" data-testid="request-new-link">
                            Yêu cầu link mới
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full h-11 text-slate-600">
                        <Link href="/login" data-testid="back-to-login-invalid">
                            Quay lại Đăng nhập
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (status === 'SUCCESS') {
        return (
            <div className="text-center animate-in fade-in zoom-in-95 duration-300" data-testid="reset-success-state">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-green-100 rounded-2xl text-green-600 shadow-sm">
                        <CheckCircle size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Đặt lại thành công</h2>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
                    Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
                </p>
                <Button asChild className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/20" data-testid="success-login-button">
                    <Link href="/login">
                        Đăng nhập ngay
                    </Link>
                </Button>
            </div>
        );
    }

    // VALID STATE -> Show Reset Form
    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500" data-testid="reset-form-container">
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100/50 shadow-sm">
                        <Lock size={28} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2" data-testid="reset-password-title">Đặt lại mật khẩu</h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Đặt mật khẩu mới cho tài khoản <br />
                    <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded ml-1">{userData?.email}</span>
                </p>
            </div>

            {error && (
                <div
                    className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-3"
                    data-testid="reset-error-alert"
                >
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold">Lỗi xảy ra</p>
                        <p className="mt-0.5 opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="reset-form">
                {/* New Password */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Mật khẩu mới <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                            }}
                            className={`h-11 pl-3 pr-10 transition-all ${fieldErrors.password ? 'border-red-300' : 'border-slate-200'}`}
                            placeholder="Mật khẩu ít nhất 8 ký tự"
                            data-testid="new-password-input"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {fieldErrors.password && <p className="text-xs text-red-500 font-medium ml-1" data-testid="password-error">{fieldErrors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                            }}
                            className={`h-11 pl-3 pr-10 transition-all ${fieldErrors.confirmPassword ? 'border-red-300' : 'border-slate-200'}`}
                            placeholder="Nhập lại mật khẩu mới"
                            data-testid="confirm-password-input"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className="text-xs text-red-500 font-medium ml-1" data-testid="confirm-error">{fieldErrors.confirmPassword}</p>}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 mt-2"
                    data-testid="reset-submit-button"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Đang xử lý...
                        </>
                    ) : (
                        'Cập nhật mật khẩu'
                    )}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
                    data-testid="back-to-login-link"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Quay lại đăng nhập
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4" data-testid="reset-password-container">
            <Card className="w-full max-w-[440px] shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden" data-testid="reset-password-card">
                <CardContent className="p-8 pt-10">
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center p-10 min-h-[300px]">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                            <p className="text-slate-500 font-medium animate-pulse">Đang tải...</p>
                        </div>
                    }>
                        <ResetPasswordContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
