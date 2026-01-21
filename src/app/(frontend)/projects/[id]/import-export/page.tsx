'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Upload,
    Download,
    FileSpreadsheet,
    FileText,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Settings,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';

export default function ImportExportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuthStore();
    const [step, setStep] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        // Simulate export delay
        setTimeout(() => {
            setIsExporting(false);
            alert('Đã xuất file thành công!');
        }, 1500);
    };

    const handleImport = async () => {
        setIsImporting(true);
        setTimeout(() => {
            setIsImporting(false);
            setStep(3);
        }, 2000);
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900 mb-2">
                            <Link href={`/projects/${id}/overview`}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại Dự án
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Import/Export Tasks</h1>
                    </div>
                </div>

                <Tabs defaultValue="export" className="space-y-8">
                    <TabsList className="bg-slate-100 p-1 rounded-xl w-full max-w-md">
                        <TabsTrigger value="export" className="flex-1 rounded-lg font-bold">Xuất File (Export)</TabsTrigger>
                        <TabsTrigger value="import" className="flex-1 rounded-lg font-bold">Nhập File (Import)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="export">
                        <Card className="border-none shadow-lg bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                                <CardTitle className="text-xl font-black flex items-center gap-3">
                                    <Download className="text-blue-600" />
                                    Cấu hình Xuất File
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Định dạng file</h3>
                                    <div className="flex gap-4">
                                        <div className="flex-1 p-4 border-2 border-blue-600 bg-blue-50 rounded-2xl flex items-center gap-4 cursor-pointer">
                                            <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                                                <FileSpreadsheet size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 leading-tight">Excel</p>
                                                <p className="text-xs text-blue-600 font-bold">.xlsx</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-4 border border-slate-200 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-slate-300 transition-colors">
                                            <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 leading-tight">CSV</p>
                                                <p className="text-xs text-slate-400 font-bold">.csv</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Chọn các trường cần xuất</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['Tiêu đề', 'Mô tả', 'Trạng thái', 'Độ ưu tiên', 'Loại', 'Ngày bắt đầu', 'Hạn chót', 'Người thực hiện'].map(field => (
                                            <div key={field} className="flex items-center space-x-3">
                                                <Checkbox id={field} defaultChecked />
                                                <label htmlFor={field} className="text-sm font-bold text-slate-700">{field}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <Button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="bg-blue-600 hover:bg-blue-700 h-12 px-8 font-black shadow-lg shadow-blue-100 rounded-xl"
                                    >
                                        {isExporting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Download className="mr-2 h-5 w-5" />}
                                        XUẤT FILE NGAY
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="import">
                        {step === 1 && (
                            <Card className="border-none shadow-lg bg-white overflow-hidden p-12 text-center space-y-8">
                                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900">Kéo thả file để nhập Task</h2>
                                    <p className="text-slate-500 font-medium">Hỗ trợ Excel (.xlsx) hoặc CSV (.csv), tối đa 5MB</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                    <Button className="h-12 px-8 font-bold bg-blue-600 rounded-xl" onClick={() => setStep(2)}>
                                        Chọn file từ máy tính
                                    </Button>
                                    <Button variant="outline" className="h-12 px-8 font-bold border-slate-200 rounded-xl">
                                        Tải template mẫu
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card className="border-none shadow-lg bg-white overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                                    <CardTitle className="text-xl font-black">Bước 2: Mapping cột</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        {['Task Name', 'Mô tả', 'Status', 'Ưu tiên'].map(col => (
                                            <div key={col} className="flex items-center gap-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="flex-1 font-bold text-slate-600">"{col}"</span>
                                                <ArrowRight className="text-slate-300" />
                                                <div className="flex-1">
                                                    <div className="h-10 px-4 bg-white border border-slate-200 rounded-lg flex items-center text-sm font-bold">
                                                        {col === 'Task Name' ? 'Tiêu đề' : col}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between pt-6 border-t border-slate-100">
                                        <Button variant="ghost" className="font-bold text-slate-500" onClick={() => setStep(1)}>Quay lại</Button>
                                        <Button className="bg-blue-600 font-black h-12 px-8 rounded-xl" onClick={handleImport} disabled={isImporting}>
                                            {isImporting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'TIẾP THEO'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card className="border-none shadow-lg bg-white overflow-hidden p-12 text-center space-y-8">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900">Import Hoàn Tất!</h2>
                                    <p className="text-slate-500 font-medium">Đã thêm thành công <span className="text-emerald-600 font-bold">23/25</span> tasks vào dự án.</p>
                                </div>
                                <div className="pt-4 flex flex-col gap-3 max-w-sm mx-auto">
                                    <Button className="h-12 font-black bg-blue-600 rounded-xl" asChild>
                                        <Link href={`/projects/${id}/tasks`}>XEM DANH SÁCH TASK</Link>
                                    </Button>
                                    <Button variant="ghost" className="font-bold text-slate-500" onClick={() => setStep(1)}>Import thêm file khác</Button>
                                </div>
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-start gap-3 text-left">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>2 tasks bị lỗi dòng 4 và 12 do sai định dạng ngày tháng. [Tải log lỗi]</span>
                                </div>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

