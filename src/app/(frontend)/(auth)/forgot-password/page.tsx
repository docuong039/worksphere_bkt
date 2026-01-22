'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Forgot Password Page
 * 
 * User Stories: US-EMP-00-03, US-MNG-00-03, US-CEO-00-03, US-SYS-00-03, US-ORG-00-03
 * Design: Based on src/app/(frontend)/(auth)/forgot-password/forgot-password.md
 * Refactored with Shadcn UI and data-testid for Playwright testing.
 */
export default function ForgotPasswordPage() {
    // Form State
    const [email, setEmail] = useState('');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldError, setFieldError] = useState<string | undefined>(undefined);

    // Resend Timer State
    const [resendTimer, setResendTimer] = useState(0);

    // Timer Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const validateEmail = (value: string) => {
        if (!value) return 'Vui lòng nhập email';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ';
        if (value.length > 320) return 'Email quá dài';
        return undefined;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate
        const err = validateEmail(email);
        if (err) {
            setFieldError(err);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
                }
                throw new Error(data.message || 'Đã có lỗi xảy ra');
            }

            // Success
            setIsSuccess(true);
            setResendTimer(60); // Start 60s countdown for resend

        } catch (err: any) {
            setError(err.message || 'Không thể kết nối đến server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        if (resendTimer === 0) {
            handleSubmit({ preventDefault: () => { } } as React.FormEvent);
        }
    };

    // Mask email for display security (e.g. j***@example.com)
    const getMaskedEmail = (email: string) => {
        const [name, domain] = email.split('@');
        if (!name || !domain) return email;
        const maskedName = name.length > 2 ? `${name.substring(0, 1)}***${name.substring(name.length - 1)}` : `${name}***`;
        return `${maskedName}@${domain}`;
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4"
            data-testid="forgot-password-container"
        >
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm" data-testid="forgot-password-card">
                <CardHeader className="space-y-4 text-center pb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        {isSuccess ? (
                            <CheckCircle className="w-8 h-8 text-white" />
                        ) : (
                            <Mail className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent" data-testid="forgot-password-title">
                        {isSuccess ? 'Kiểm tra email' : 'Quên mật khẩu?'}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {isSuccess ? (
                            <span data-testid="success-message">
                                Chúng tôi đã gửi link khôi phục mật khẩu đến <br />
                                <span className="font-semibold text-slate-700 underline">{getMaskedEmail(email)}</span>
                            </span>
                        ) : (
                            'Nhập email đã đăng ký, chúng tôi sẽ gửi link khôi phục mật khẩu cho bạn.'
                        )}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Global Error Alert */}
                    {error && (
                        <div
                            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
                            data-testid="forgot-password-error-alert"
                        >
                            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Lỗi xảy ra</p>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {!isSuccess ? (
                        /* REQUEST FORM */
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                            noValidate
                            data-testid="forgot-password-form"
                        >
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@company.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (fieldError) setFieldError(undefined);
                                    }}
                                    className={`${fieldError ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                                    data-testid="email-input"
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                                {fieldError && (
                                    <p className="text-sm text-red-600 font-medium" data-testid="email-error">
                                        {fieldError}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                data-testid="forgot-password-submit-button"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    'Gửi link khôi phục'
                                )}
                            </Button>

                            {/* Back to Login */}
                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors group"
                                    data-testid="back-to-login-link"
                                >
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </form>
                    ) : (
                        /* SUCCESS STATE */
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" data-testid="success-state">
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600 text-center leading-relaxed">
                                Link đặt lại mật khẩu có hiệu lực trong vòng <strong>1 giờ</strong>. <br />
                                Nếu không thấy email, hãy kiểm tra vào mục Spam/Junk.
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full h-11"
                                    data-testid="success-back-to-login-button"
                                >
                                    <Link href="/login">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Quay lại đăng nhập
                                    </Link>
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendTimer > 0 || isLoading}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                        data-testid="resend-link"
                                    >
                                        {resendTimer > 0 ? `Gửi lại (${resendTimer}s)` : 'Không nhận được email? Gửi lại'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
