'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertTriangle, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

/**
 * Login Page - Refactored with Shadcn UI
 * 
 * User Stories: US-EMP-00-01, US-MNG-00-01, US-CEO-00-01, US-SYS-00-01, US-ORG-00-01
 * Design: Based on src/app/(frontend)/(auth)/login/login.md
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, Prisma
 */

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = () => {
        const errors: typeof fieldErrors = {};
        let isValid = true;

        if (!email) {
            errors.email = 'Email không được để trống';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Email không hợp lệ';
            isValid = false;
        }

        if (!password) {
            errors.password = 'Mật khẩu không được để trống';
            isValid = false;
        } else if (password.length < 6) {
            errors.password = 'Mật khẩu tối thiểu 6 ký tự';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            // Save to Zustand store
            login(data.user, data.token);

            // Redirect to dashboard
            router.push('/dashboard');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4"
            data-testid="login-container"
        >
            <Card className="w-full max-w-md shadow-2xl border-0" data-testid="login-card">
                <CardHeader className="space-y-3 text-center pb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Đăng nhập
                    </CardTitle>
                    <CardDescription className="text-base">
                        Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">

                        {/* Global Error Alert */}
                        {error && (
                            <div
                                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
                                data-testid="login-error-message"
                            >
                                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Lỗi đăng nhập</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        )}

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
                                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                                }}
                                className={fieldErrors.email ? 'border-red-300 focus-visible:ring-red-500' : ''}
                                data-testid="login-email-input"
                            />
                            {fieldErrors.email && (
                                <p className="text-sm text-red-600" data-testid="email-error">{fieldErrors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                Mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                                    }}
                                    className={`pr-10 ${fieldErrors.password ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                                    data-testid="login-password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    data-testid="toggle-password-visibility"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-sm text-red-600" data-testid="password-error">{fieldErrors.password}</p>
                            )}
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                            data-testid="login-submit-button"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
