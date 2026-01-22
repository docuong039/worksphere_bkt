/**
 * Import/Export Page
 * 
 * User Stories:
 * - US-MNG-01-12: PM xuất danh sách task ra file .xlsx với custom fields
 * - US-MNG-01-15: PM import danh sách task từ Excel/CSV
 * 
 * Access: PROJECT_MANAGER only
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect, use } from 'react';
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
    Loader2,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';

interface CustomField {
    id: string;
    name: string;
    field_type: string;
}

// Mock custom fields
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

    // Selected fields for export
    const [selectedStandardFields, setSelectedStandardFields] = useState<string[]>(
        STANDARD_FIELDS.filter(f => f.required).map(f => f.id)
    );
    const [selectedCustomFields, setSelectedCustomFields] = useState<string[]>([]);

    // Fetch custom fields
    useEffect(() => {
        // Mock fetch - in real would call /api/projects/{id}/custom-fields
        setCustomFields(MOCK_CUSTOM_FIELDS);
    }, [id]);

    const toggleStandardField = (fieldId: string) => {
        const field = STANDARD_FIELDS.find(f => f.id === fieldId);
        if (field?.required) return; // Don't allow unchecking required fields

        setSelectedStandardFields(prev =>
            prev.includes(fieldId)
                ? prev.filter(f => f !== fieldId)
                : [...prev, fieldId]
        );
    };

    const toggleCustomField = (fieldId: string) => {
        setSelectedCustomFields(prev =>
            prev.includes(fieldId)
                ? prev.filter(f => f !== fieldId)
                : [...prev, fieldId]
        );
    };

    const selectAllCustomFields = () => {
        setSelectedCustomFields(customFields.map(f => f.id));
    };

    const clearAllCustomFields = () => {
        setSelectedCustomFields([]);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // In real implementation, would call API with selected fields
            const exportData = {
                format: exportFormat,
                standard_fields: selectedStandardFields,
                custom_fields: selectedCustomFields
            };
            console.log('Exporting with:', exportData);

            // Simulate export delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert(`Đã xuất file ${exportFormat.toUpperCase()} thành công với ${selectedStandardFields.length + selectedCustomFields.length} cột!`);
        } finally {
            setIsExporting(false);
        }
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
            <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700" data-testid="import-export-page">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900 mb-2" data-testid="btn-back">
                            <Link href={`/projects/${id}/overview`}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại Dự án
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight" data-testid="project-import-page-title">Import/Export Tasks</h1>
                    </div>
                </div>

                <Tabs defaultValue="export" className="space-y-8" data-testid="import-export-tabs">
                    <TabsList className="bg-slate-100 p-1 rounded-xl w-full max-w-md">
                        <TabsTrigger value="export" className="flex-1 rounded-lg font-bold" data-testid="tab-export">Xuất File (Export)</TabsTrigger>
                        <TabsTrigger value="import" className="flex-1 rounded-lg font-bold" data-testid="tab-import">Nhập File (Import)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="export" data-testid="export-content">
                        <Card className="border-none shadow-lg bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                                <CardTitle className="text-xl font-black flex items-center gap-3">
                                    <Download className="text-blue-600" />
                                    Cấu hình Xuất File
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                {/* Format Selection */}
                                <div className="space-y-4" data-testid="format-section">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Định dạng file</h3>
                                    <div className="flex gap-4">
                                        <div
                                            className={`flex-1 p-4 border-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${exportFormat === 'xlsx'
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            onClick={() => setExportFormat('xlsx')}
                                            data-testid="format-xlsx"
                                        >
                                            <div className={`p-3 rounded-xl shadow-sm ${exportFormat === 'xlsx' ? 'bg-white text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                                <FileSpreadsheet size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 leading-tight">Excel</p>
                                                <p className={`text-xs font-bold ${exportFormat === 'xlsx' ? 'text-blue-600' : 'text-slate-400'}`}>.xlsx</p>
                                            </div>
                                        </div>
                                        <div
                                            className={`flex-1 p-4 border-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${exportFormat === 'csv'
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            onClick={() => setExportFormat('csv')}
                                            data-testid="format-csv"
                                        >
                                            <div className={`p-3 rounded-xl ${exportFormat === 'csv' ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 leading-tight">CSV</p>
                                                <p className={`text-xs font-bold ${exportFormat === 'csv' ? 'text-blue-600' : 'text-slate-400'}`}>.csv</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Standard Fields */}
                                <div className="space-y-4" data-testid="standard-fields-section">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Trường cơ bản</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {STANDARD_FIELDS.map(field => (
                                            <div key={field.id} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`standard-${field.id}`}
                                                    checked={selectedStandardFields.includes(field.id)}
                                                    onCheckedChange={() => toggleStandardField(field.id)}
                                                    disabled={field.required}
                                                    data-testid={`checkbox-standard-${field.id}`}
                                                />
                                                <label
                                                    htmlFor={`standard-${field.id}`}
                                                    className={`text-sm font-bold ${field.required ? 'text-slate-400' : 'text-slate-700'}`}
                                                >
                                                    {field.name}
                                                    {field.required && <span className="text-xs text-slate-400 ml-1">(bắt buộc)</span>}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Fields */}
                                <div className="space-y-4" data-testid="custom-fields-section">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            Trường tùy chỉnh (Custom Fields)
                                        </h3>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs"
                                                onClick={selectAllCustomFields}
                                                data-testid="btn-select-all-custom"
                                            >
                                                Chọn tất cả
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-slate-400"
                                                onClick={clearAllCustomFields}
                                                data-testid="btn-clear-custom"
                                            >
                                                Bỏ chọn
                                            </Button>
                                        </div>
                                    </div>

                                    {customFields.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {customFields.map(field => (
                                                <div
                                                    key={field.id}
                                                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${selectedCustomFields.includes(field.id)
                                                        ? 'bg-purple-50 border-purple-200'
                                                        : 'bg-white border-slate-100'
                                                        }`}
                                                    data-testid={`custom-field-${field.id}`}
                                                >
                                                    <Checkbox
                                                        id={`custom-${field.id}`}
                                                        checked={selectedCustomFields.includes(field.id)}
                                                        onCheckedChange={() => toggleCustomField(field.id)}
                                                        data-testid={`checkbox-custom-${field.id}`}
                                                    />
                                                    <div className="flex-1">
                                                        <label
                                                            htmlFor={`custom-${field.id}`}
                                                            className="text-sm font-bold text-slate-700 cursor-pointer"
                                                        >
                                                            {field.name}
                                                        </label>
                                                        <Badge variant="outline" className="ml-2 text-xs">
                                                            {field.field_type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-slate-50 rounded-xl text-center" data-testid="no-custom-fields">
                                            <p className="text-sm text-slate-500 mb-2">Chưa có Custom Fields nào trong dự án.</p>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/projects/${id}/settings/custom-fields`}>
                                                    <Plus className="mr-1 h-4 w-4" /> Tạo Custom Fields
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Summary */}
                                <div className="p-4 bg-slate-50 rounded-xl" data-testid="export-summary">
                                    <p className="text-sm text-slate-600">
                                        Sẽ xuất <span className="font-bold text-blue-600">{selectedStandardFields.length + selectedCustomFields.length}</span> cột:
                                        <span className="text-slate-400 ml-1">
                                            {selectedStandardFields.length} cơ bản + {selectedCustomFields.length} custom
                                        </span>
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <Button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="bg-blue-600 hover:bg-blue-700 h-12 px-8 font-black shadow-lg shadow-blue-100 rounded-xl"
                                        data-testid="btn-export"
                                    >
                                        {isExporting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Download className="mr-2 h-5 w-5" />}
                                        XUẤT FILE NGAY
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="import" data-testid="import-content">
                        {step === 1 && (
                            <Card className="border-none shadow-lg bg-white overflow-hidden p-12 text-center space-y-8" data-testid="import-step-1">
                                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900">Kéo thả file để nhập Task</h2>
                                    <p className="text-slate-500 font-medium">Hỗ trợ Excel (.xlsx) hoặc CSV (.csv), tối đa 5MB</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                    <Button
                                        className="h-12 px-8 font-bold bg-blue-600 rounded-xl"
                                        onClick={() => setStep(2)}
                                        data-testid="btn-select-file"
                                    >
                                        Chọn file từ máy tính
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-12 px-8 font-bold border-slate-200 rounded-xl"
                                        data-testid="btn-download-template"
                                    >
                                        Tải template mẫu
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card className="border-none shadow-lg bg-white overflow-hidden" data-testid="import-step-2">
                                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                                    <CardTitle className="text-xl font-black">Bước 2: Mapping cột</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4" data-testid="column-mapping">
                                        {['Task Name', 'Mô tả', 'Status', 'Ưu tiên'].map((col, idx) => (
                                            <div
                                                key={col}
                                                className="flex items-center gap-8 p-4 bg-slate-50 rounded-xl border border-slate-100"
                                                data-testid={`mapping-row-${idx}`}
                                            >
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
                                        <Button
                                            variant="ghost"
                                            className="font-bold text-slate-500"
                                            onClick={() => setStep(1)}
                                            data-testid="btn-back-step"
                                        >
                                            Quay lại
                                        </Button>
                                        <Button
                                            className="bg-blue-600 font-black h-12 px-8 rounded-xl"
                                            onClick={handleImport}
                                            disabled={isImporting}
                                            data-testid="btn-import-next"
                                        >
                                            {isImporting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'TIẾP THEO'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card className="border-none shadow-lg bg-white overflow-hidden p-12 text-center space-y-8" data-testid="import-step-3">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900" data-testid="import-success-title">Import Hoàn Tất!</h2>
                                    <p className="text-slate-500 font-medium">Đã thêm thành công <span className="text-emerald-600 font-bold">23/25</span> tasks vào dự án.</p>
                                </div>
                                <div className="pt-4 flex flex-col gap-3 max-w-sm mx-auto">
                                    <Button className="h-12 font-black bg-blue-600 rounded-xl" asChild data-testid="btn-view-tasks">
                                        <Link href={`/projects/${id}/tasks`}>XEM DANH SÁCH TASK</Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="font-bold text-slate-500"
                                        onClick={() => setStep(1)}
                                        data-testid="btn-import-more"
                                    >
                                        Import thêm file khác
                                    </Button>
                                </div>
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-start gap-3 text-left" data-testid="import-errors">
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

