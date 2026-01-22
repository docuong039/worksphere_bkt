'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateReportPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            router.push('/reports');
        }, 1500);
    };

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" data-testid="create-report-container">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/reports">
                                <ArrowLeft className="h-5 w-5 text-slate-500" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900" data-testid="create-report-title">
                                Viết báo cáo định kỳ
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Tổng hợp kết quả làm việc và kế hoạch tiếp theo.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card className="shadow-lg border-slate-200" data-testid="report-form-card">
                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-6 space-y-6">
                            {/* Report Type & Period */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Loại báo cáo</Label>
                                    <Select defaultValue="WEEKLY">
                                        <SelectTrigger id="type" data-testid="select-report-type">
                                            <SelectValue placeholder="Chọn loại báo cáo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAILY">Báo cáo Ngày</SelectItem>
                                            <SelectItem value="WEEKLY">Báo cáo Tuần</SelectItem>
                                            <SelectItem value="MONTHLY">Báo cáo Tháng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Kỳ báo cáo</Label>
                                    <div className="flex items-center gap-2">
                                        <Input type="date" className="w-full" data-testid="input-period-start" />
                                        <span className="text-slate-400">-</span>
                                        <Input type="date" className="w-full" data-testid="input-period-end" />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Tiêu đề báo cáo</Label>
                                <Input
                                    id="title"
                                    placeholder="VD: Báo cáo tuần 4 - Tháng 01/2026"
                                    className="font-medium"
                                    data-testid="input-report-title"
                                />
                            </div>

                            {/* Main Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content">Nội dung chi tiết</Label>
                                <div className="border border-slate-200 rounded-md p-2 bg-slate-50 min-h-[300px]">
                                    <Textarea
                                        id="content"
                                        placeholder="Nhập nội dung báo cáo (Markdown supported)..."
                                        className="min-h-[300px] border-none focus-visible:ring-0 bg-transparent resize-y"
                                        data-testid="input-report-content"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 text-right">Hỗ trợ định dạng Markdown</p>
                            </div>

                            {/* Attachments (Placeholder) */}
                            <div className="space-y-2">
                                <Label>Tài liệu đính kèm</Label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" data-testid="upload-area">
                                    <p className="text-sm text-slate-500">Kéo thả file hoặc click để tải lên</p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                            <Button type="button" variant="ghost" className="text-slate-600" data-testid="btn-cancel">
                                Hủy bỏ
                            </Button>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" data-testid="btn-save-draft">
                                    <Save className="mr-2 h-4 w-4" /> Lưu nháp
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md" disabled={submitting} data-testid="btn-submit-report">
                                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Gửi báo cáo
                                </Button>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
