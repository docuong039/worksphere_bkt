'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Building2,
    User,
    Mail,
    Lock,
    Globe,
    CheckCircle2,
    ArrowRight,
    Loader2,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function RegisterOrgPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        org_name: '',
        org_slug: '',
        industry: '',
        employee_count: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        plan_requested: 'PROFESSIONAL'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/public/register-org', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setSuccess(true);
            }
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" data-testid="register-org-success-container">
                <Card className="max-w-md w-full border-none shadow-2xl" data-testid="register-org-success-card">
                    <CardContent className="pt-10 pb-10 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Check className="h-8 w-8 text-emerald-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Đăng ký hoàn tất!</CardTitle>
                        <CardDescription className="text-base text-slate-600">
                            Yêu cầu tạo tổ chức <strong>{formData.org_name}</strong> đã được gửi tới Quản trị viên hệ thống.
                            Chúng tôi sẽ gửi email thông báo sau khi yêu cầu được phê duyệt.
                        </CardDescription>
                        <div className="pt-4">
                            <Button asChild className="w-full bg-slate-900" data-testid="btn-back-to-login">
                                <Link href="/login">Quay lại Đăng nhập</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" data-testid="register-org-container">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
                {/* Visual Section */}
                <div className="hidden md:block space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                                W
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-slate-900">WorkSphere</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                            Bắt đầu hành trình <span className="text-indigo-600">quản trị tinh gọn</span> cùng đội ngũ của bạn.
                        </h1>
                        <p className="text-lg text-slate-600 mt-4">
                            Nền tảng quản lý công việc Hybrid RBAC + ABAC đầu tiên tại Việt Nam, thiết kế chuyên biệt cho quy trình Agile và Game Development.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                <CheckCircle2 className="text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Quản lý không giới hạn</h4>
                                <p className="text-sm text-slate-500">Tổ chức dự án, task và nhân sự tập trung.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                                <Globe className="text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Tính năng Impersonate</h4>
                                <p className="text-sm text-slate-500">Hỗ trợ khách hàng trực tiếp và an toàn.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <Card className="border-none shadow-2xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-50 pb-6">
                        <div className="flex justify-between items-center mb-2">
                            <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-indigo-100" data-testid="register-step-badge">
                                Bước {step} / 2
                            </Badge>
                            <Link href="/login" className="text-sm text-slate-500 hover:text-indigo-600 font-medium" data-testid="link-back-to-login">
                                Đã có tài khoản?
                            </Link>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            {step === 1 ? 'Thông tin Tổ chức' : 'Thông tin Người quản trị'}
                        </CardTitle>
                        <CardDescription>
                            {step === 1
                                ? 'Cung cấp thông tin cơ bản về doanh nghiệp của bạn.'
                                : 'Tạo tài khoản Org Admin để quản lý không gian làm việc.'}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit} data-testid="register-org-form">
                        <CardContent className="pt-6 space-y-4">
                            {step === 1 ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="org_name">Tên Tổ chức / Doanh nghiệp *</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="org_name"
                                                placeholder="Công ty TNHH Giải pháp Phần mềm"
                                                className="pl-10"
                                                required
                                                value={formData.org_name}
                                                onChange={e => setFormData({ ...formData, org_name: e.target.value })}
                                                data-testid="input-org-name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="org_slug">Mã định danh (Slug) *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono">/</span>
                                            <Input
                                                id="org_slug"
                                                placeholder="acme-corp"
                                                className="pl-6 font-mono text-sm"
                                                required
                                                value={formData.org_slug}
                                                onChange={e => setFormData({ ...formData, org_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                data-testid="input-org-slug"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400">Dùng làm URL truy cập riêng: worksphere.com/<b>acme-corp</b></p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Ngành nghề</Label>
                                            <Select value={formData.industry} onValueChange={v => setFormData({ ...formData, industry: v })}>
                                                <SelectTrigger data-testid="select-org-industry">
                                                    <SelectValue placeholder="Chọn..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="it">Công nghệ</SelectItem>
                                                    <SelectItem value="design">Thiết kế</SelectItem>
                                                    <SelectItem value="marketing">Marketing</SelectItem>
                                                    <SelectItem value="other">Khác</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Quy mô (nhân sự)</Label>
                                            <Input
                                                type="number"
                                                placeholder="Ví dụ: 50"
                                                value={formData.employee_count}
                                                onChange={e => setFormData({ ...formData, employee_count: e.target.value })}
                                                data-testid="input-employee-count"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin_name">Họ và tên *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="admin_name"
                                                placeholder="Nguyễn Văn A"
                                                className="pl-10"
                                                required
                                                value={formData.admin_name}
                                                onChange={e => setFormData({ ...formData, admin_name: e.target.value })}
                                                data-testid="input-admin-full-name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin_email">Email liên hệ *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="admin_email"
                                                type="email"
                                                placeholder="admin@company.com"
                                                className="pl-10"
                                                required
                                                value={formData.admin_email}
                                                onChange={e => setFormData({ ...formData, admin_email: e.target.value })}
                                                data-testid="input-admin-email"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin_password">Mật khẩu khởi tạo *</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="admin_password"
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-10"
                                                required
                                                value={formData.admin_password}
                                                onChange={e => setFormData({ ...formData, admin_password: e.target.value })}
                                                data-testid="input-admin-password"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium">Tối thiểu 8 ký tự, bao gồm chữ cái và số.</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 pt-6 bg-slate-50/50">
                            {step === 1 ? (
                                <Button
                                    type="button"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-11"
                                    onClick={() => setStep(2)}
                                    data-testid="btn-next-step"
                                >
                                    Tiếp tục
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        data-testid="btn-prev-step"
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                        data-testid="btn-submit-register"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gửi yêu cầu'}
                                    </Button>
                                </div>
                            )}
                            <p className="text-[11px] text-center text-slate-400">
                                Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

function Badge({ children, variant = "default", className = "" }: any) {
    const variants: any = {
        outline: "border border-slate-200 text-slate-600",
        default: "bg-indigo-100 text-indigo-700"
    };
    return (
        <span className={`px-2 py-0.5 rounded-full ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}

