/**
 * Import/Export Page - Final Optimized & Test-Ready
 */

'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    Upload,
    Download,
    FileSpreadsheet,
    FileText,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Database,
    FileUp,
    FileDown,
    ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

interface CustomField {
    id: string;
    name: string;
    field_type: string;
}

const MOCK_CUSTOM_FIELDS: CustomField[] = [
    { id: 'cf-1', name: 'Sprint', field_type: 'SELECT' },
    { id: 'cf-2', name: 'Story Points', field_type: 'NUMBER' },
    { id: 'cf-3', name: 'Epic Link', field_type: 'TEXT' },
    { id: 'cf-4', name: 'Environment', field_type: 'SELECT' },
];

const STANDARD_FIELDS = [
    { id: 'title', name: 'Tiêu đề', required: true },
    { id: 'description', name: 'Mô tả', required: false },
    { id: 'status', name: 'Trạng thái', required: true },
    { id: 'priority', name: 'Độ ưu tiên', required: false },
    { id: 'type', name: 'Loại task', required: false },
    { id: 'start_date', name: 'Ngày bắt đầu', required: false },
    { id: 'due_date', name: 'Hạn chót', required: false },
    { id: 'assignees', name: 'Người thực hiện', required: false },
];

export default function ImportExportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuthStore();
    const [step, setStep] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
    const [customFields, setCustomFields] = useState<CustomField[]>([]);

    const [selectedStandardFields, setSelectedStandardFields] = useState<string[]>(
        STANDARD_FIELDS.filter(f => f.required).map(f => f.id)
    );
    const [selectedCustomFields, setSelectedCustomFields] = useState<string[]>([]);

    useEffect(() => {
        setCustomFields(MOCK_CUSTOM_FIELDS);
    }, [id]);

    const toggleStandardField = (fieldId: string) => {
        const field = STANDARD_FIELDS.find(f => f.id === fieldId);
        if (field?.required) return;
        setSelectedStandardFields(prev =>
            prev.includes(fieldId) ? prev.filter(f => f !== fieldId) : [...prev, fieldId]
        );
    };

    const toggleCustomField = (fieldId: string) => {
        setSelectedCustomFields(prev =>
            prev.includes(fieldId) ? prev.filter(f => f !== fieldId) : [...prev, fieldId]
        );
    };

    const handleExport = async () => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsExporting(false);
        alert('Đã xuất file thành công!');
    };

    const handleImport = async () => {
        setIsImporting(true);
        setTimeout(() => {
            setIsImporting(false);
            setStep(3);
        }, 2000);
    };

    return (
        <PermissionGuard permission={PERMISSIONS.TASK_IMPORT} showFullPageError>
            <div className="space-y-6 animate-in fade-in duration-500 pb-20" data-testid="import-export-container">
                {/* Context Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100" asChild>
                        <Link href={`/projects/${id}`}>
                            <ChevronLeft size={20} className="text-slate-600" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2" data-testid="page-title">
                            <Database className="h-5 w-5 text-blue-600" />
                            Xử lý Dữ liệu Task
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">Nhập và xuất công việc dự án thông qua file Excel/CSV.</p>
                    </div>
                </div>

                <Tabs defaultValue="export" className="space-y-6" data-testid="import-export-tabs">
                    <TabsList className="bg-white p-1 border border-slate-200 rounded-xl w-fit">
                        <TabsTrigger value="export" className="px-6 py-2 rounded-lg font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600" data-testid="tab-trigger-export">
                            <FileDown className="mr-2 h-4 w-4" /> Xuất File
                        </TabsTrigger>
                        <TabsTrigger value="import" className="px-6 py-2 rounded-lg font-bold data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600" data-testid="tab-trigger-import">
                            <FileUp className="mr-2 h-4 w-4" /> Nhập File
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="export" className="space-y-6 animate-in slide-in-from-left-2 duration-300" data-testid="export-panel">
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold">Cấu hình Export</CardTitle>
                                <CardDescription>Chọn định dạng và các cột thông tin bạn muốn xuất bản.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Format Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        className={cn(
                                            "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4",
                                            exportFormat === 'xlsx' ? "border-blue-600 bg-blue-50/30" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                                        )}
                                        onClick={() => setExportFormat('xlsx')}
                                        data-testid="format-option-xlsx"
                                    >
                                        <div className={cn("p-3 rounded-xl", exportFormat === 'xlsx' ? "bg-white text-blue-600 shadow-sm" : "bg-slate-200 text-slate-400")}>
                                            <FileSpreadsheet size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Microsoft Excel</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">.xlsx format</p>
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4",
                                            exportFormat === 'csv' ? "border-blue-600 bg-blue-50/30" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                                        )}
                                        onClick={() => setExportFormat('csv')}
                                        data-testid="format-option-csv"
                                    >
                                        <div className={cn("p-3 rounded-xl", exportFormat === 'csv' ? "bg-white text-blue-600 shadow-sm" : "bg-slate-200 text-slate-400")}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Comma Separated</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">.csv format</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Fields Selection */}
                                <div className="space-y-6">
                                    <div data-testid="standard-fields-grid">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Các trường dữ liệu cơ bản</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {STANDARD_FIELDS.map(field => (
                                                <div key={field.id} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <Checkbox
                                                        id={`std-${field.id}`}
                                                        checked={selectedStandardFields.includes(field.id)}
                                                        onCheckedChange={() => toggleStandardField(field.id)}
                                                        disabled={field.required}
                                                        data-testid={`checkbox-std-${field.id}`}
                                                    />
                                                    <label htmlFor={`std-${field.id}`} className={cn("text-xs font-bold text-slate-700", field.required && "text-slate-400")}>
                                                        {field.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div data-testid="custom-fields-grid">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Trường tùy chỉnh (Project Custom Fields)</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {customFields.map(field => (
                                                <div key={field.id} className={cn(
                                                    "flex items-center space-x-2 p-3 rounded-xl border transition-all",
                                                    selectedCustomFields.includes(field.id) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-100"
                                                )}>
                                                    <Checkbox
                                                        id={`cust-${field.id}`}
                                                        checked={selectedCustomFields.includes(field.id)}
                                                        onCheckedChange={() => toggleCustomField(field.id)}
                                                        data-testid={`checkbox-cust-${field.id}`}
                                                    />
                                                    <label htmlFor={`cust-${field.id}`} className="text-xs font-bold text-slate-700">
                                                        {field.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <p className="text-xs font-medium text-slate-400 italic">Tổng cộng: {selectedStandardFields.length + selectedCustomFields.length} cột sẽ được xuất.</p>
                                    <Button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="bg-blue-600 hover:bg-blue-700 h-11 px-8 font-bold shadow-lg shadow-blue-100"
                                        data-testid="btn-run-export"
                                    >
                                        {isExporting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                                        Tải file ngay
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="import" className="space-y-6 animate-in slide-in-from-right-2 duration-300" data-testid="import-panel">
                        {step === 1 && (
                            <Card className="border-none shadow-sm bg-white p-12 text-center space-y-6" data-testid="import-step-upload">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                                    <Upload size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-900">Tải lên file dữ liệu công việc</h3>
                                    <p className="text-sm text-slate-500 font-medium">Lưu ý: Bạn phải tạo các Custom Fields trên hệ thống trước khi Import.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                                    <Button className="h-11 px-8 font-bold bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(2)} data-testid="btn-select-import-file">
                                        Chọn file .xlsx / .csv
                                    </Button>
                                    <Button variant="outline" className="h-11 px-8 font-bold border-slate-200" data-testid="btn-download-template">
                                        Tải template mẫu
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card className="border-none shadow-sm bg-white overflow-hidden" data-testid="import-step-mapping">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900">Ánh xạ cột dữ liệu (Column Mapping)</CardTitle>
                                    <CardDescription>Trùng khớp tên cột trong file với các trường dữ liệu của hệ thống.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {['Task Name', 'Mô tả', 'Status', 'Sprint'].map((col, idx) => (
                                        <div key={idx} className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100" data-testid={`mapping-row-${idx}`}>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cột trong file Excel</p>
                                                <p className="font-bold text-slate-700 italic">"{col}"</p>
                                            </div>
                                            <ArrowRight className="text-slate-300" />
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trường trong Worksphere</p>
                                                <Badge className="bg-white text-blue-600 border-slate-200 shadow-sm font-bold text-sm px-3 py-1">
                                                    {col === 'Task Name' ? 'Tiêu đề' : col}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-6 flex justify-between">
                                        <Button variant="ghost" className="font-bold text-slate-500" onClick={() => setStep(1)} data-testid="btn-back-to-upload">Quay lại</Button>
                                        <Button className="bg-blue-600 font-bold h-11 px-10" onClick={handleImport} disabled={isImporting} data-testid="btn-confirm-import">
                                            {isImporting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Bắt đầu Import'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card className="border-none shadow-sm bg-white p-12 text-center space-y-6" data-testid="import-step-result">
                                <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900">Import Hoàn Tất!</h3>
                                    <p className="text-sm text-slate-500 font-medium">Đã thêm thành công <span className="text-emerald-600 font-black">45/45 công việc</span> vào dự án.</p>
                                </div>
                                <div className="pt-4">
                                    <Button className="h-11 px-10 font-bold bg-blue-600" asChild data-testid="btn-go-to-tasks">
                                        <Link href={`/projects/${id}`}>Xem danh sách công việc</Link>
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </PermissionGuard>
    );
}
