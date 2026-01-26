'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sliders,
    Plus,
    Edit2,
    Trash2,
    MoreVertical,
    ArrowLeft,
    RefreshCw,
    Type,
    Hash,
    Calendar,
    List,
    CheckSquare,
    GripVertical,
    AlertTriangle,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { PERMISSIONS } from '@/lib/permissions';

interface CustomField {
    id: string;
    field_name: string;
    field_type: 'TEXT' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX';
    is_required: boolean;
    default_value: string | null;
    options: string[];
    sort_order: number;
    created_at: string;
}

export default function CustomFieldsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user, hasPermission } = useAuthStore();
    const [fields, setFields] = useState<CustomField[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState('');
    const isAuthorized = hasPermission(PERMISSIONS.PROJECT_UPDATE);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<CustomField | null>(null);
    const [formData, setFormData] = useState({
        field_name: '',
        field_type: 'TEXT' as CustomField['field_type'],
        is_required: false,
        default_value: '',
        options: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchFields();
    }, [projectId]);

    const fetchFields = async () => {
        setLoading(true);
        try {
            setProjectName('Worksphere Platform');
            // Mock data based on Database Design - project_custom_fields table
            const mockFields: CustomField[] = [
                {
                    id: 'cf1', field_name: 'Ghi chú thêm', field_type: 'TEXT',
                    is_required: false, default_value: '', options: [], sort_order: 1,
                    created_at: '2024-01-10'
                }
            ];
            setFields(mockFields);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setEditingField(null);
        setFormData({ field_name: '', field_type: 'TEXT', is_required: false, default_value: '', options: '' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (field: CustomField) => {
        setEditingField(field);
        setFormData({
            field_name: field.field_name,
            field_type: field.field_type,
            is_required: field.is_required,
            default_value: field.default_value || '',
            options: field.options.join('\n'),
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.field_name.trim()) return;
        setIsSubmitting(true);
        try {
            const optionsArray = formData.options.split('\n').map(o => o.trim()).filter(Boolean);

            if (editingField) {
                setFields(fields.map(f =>
                    f.id === editingField.id
                        ? {
                            ...f,
                            field_name: formData.field_name,
                            field_type: formData.field_type,
                            is_required: formData.is_required,
                            default_value: formData.default_value || null,
                            options: optionsArray,
                        }
                        : f
                ));
            } else {
                const newField: CustomField = {
                    id: `cf${Date.now()}`,
                    field_name: formData.field_name,
                    field_type: formData.field_type,
                    is_required: formData.is_required,
                    default_value: formData.default_value || null,
                    options: optionsArray,
                    sort_order: fields.length + 1,
                    created_at: new Date().toISOString().split('T')[0],
                };
                setFields([...fields, newField]);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (fieldId: string) => {
        if (!confirm('Bạn có chắc muốn xóa trường này? Dữ liệu đã nhập sẽ không thể khôi phục.')) return;
        setFields(fields.filter(f => f.id !== fieldId));
    };

    const getFieldTypeIcon = (type: string) => {
        switch (type) {
            case 'TEXT': return <Type className="h-4 w-4" />;
            case 'NUMBER': return <Hash className="h-4 w-4" />;
            case 'DATE': return <Calendar className="h-4 w-4" />;
            case 'DROPDOWN': return <List className="h-4 w-4" />;
            case 'CHECKBOX': return <CheckSquare className="h-4 w-4" />;
            default: return <Sliders className="h-4 w-4" />;
        }
    };

    const getFieldTypeName = (type: string) => {
        switch (type) {
            case 'TEXT': return 'Văn bản';
            case 'NUMBER': return 'Số';
            case 'DATE': return 'Ngày tháng';
            case 'DROPDOWN': return 'Danh sách chọn';
            case 'CHECKBOX': return 'Checkbox';
            default: return type;
        }
    };

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center h-[70vh]">
                <AlertTriangle size={48} className="text-amber-500 mb-6" />
                <h2 className="text-2xl font-black text-slate-900">Truy cập bị từ chối</h2>
                <p className="text-slate-500 mt-2 max-w-xs font-medium">Chỉ Quản lý dự án mới có quyền cấu hình trường tùy chỉnh.</p>
                <Button className="mt-6 bg-blue-600" asChild>
                    <Link href={`/projects/${projectId}/overview`}>Quay lại Dự án</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" data-testid="custom-fields-page">
            {/* Header - now using shared layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100" asChild data-testid="btn-back-to-settings">
                        <Link href={`/projects/${projectId}/settings`}>
                            <ChevronLeft size={20} className="text-slate-600" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-800 flex items-center gap-2" data-testid="project-custom-fields-page-title">
                            <Sliders className="h-5 w-5 text-indigo-600" />
                            Trường tùy chỉnh
                        </h2>
                    </div>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 h-9 font-bold"
                    onClick={openCreateDialog}
                    size="sm"
                    data-testid="btn-create-field"
                >
                    <Plus className="mr-2 h-4 w-4" /> Thêm trường
                </Button>
            </div>

            {/* Fields Table */}
            <Card className="border-none shadow-sm" data-testid="fields-card">
                <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg font-bold">Danh sách trường tùy chỉnh</CardTitle>
                    <CardDescription>Các trường này sẽ xuất hiện trong form tạo/sửa task</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4" data-testid="project-custom-fields-loading-skeleton">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-14 w-full" />
                            ))}
                        </div>
                    ) : fields.length > 0 ? (
                        <Table data-testid="fields-table">
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead className="font-bold">Tên trường</TableHead>
                                    <TableHead className="font-bold">Loại</TableHead>
                                    <TableHead className="font-bold">Bắt buộc</TableHead>
                                    <TableHead className="font-bold">Mặc định</TableHead>
                                    <TableHead className="text-right font-bold">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.sort((a, b) => a.sort_order - b.sort_order).map(field => (
                                    <TableRow key={field.id} className="group" data-testid={`field-row-${field.id}`}>
                                        <TableCell>
                                            <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500">{getFieldTypeIcon(field.field_type)}</span>
                                                <span className="font-medium" data-testid={`field-name-${field.id}`}>
                                                    {field.field_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" data-testid={`field-type-${field.id}`}>
                                                {getFieldTypeName(field.field_type)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {field.is_required ? (
                                                <Badge className="bg-red-100 text-red-700">Bắt buộc</Badge>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600">
                                            {field.default_value || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        data-testid={`field-actions-${field.id}`}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(field)} data-testid={`btn-edit-${field.id}`}>
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(field.id)}
                                                        className="text-red-600"
                                                        data-testid={`btn-delete-${field.id}`}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-12 text-center" data-testid="project-custom-fields-empty-state">
                            <Sliders className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Chưa có trường tùy chỉnh</p>
                            <p className="text-slate-400 text-sm mt-1">Thêm trường để thu thập thông tin riêng cho dự án</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg" data-testid="field-dialog">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingField ? 'Chỉnh sửa trường' : 'Thêm trường mới'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingField ? 'Cập nhật thông tin trường' : 'Tạo trường dữ liệu tùy chỉnh cho task'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Tên trường *</label>
                            <Input
                                placeholder="vd: Story Points, Sprint..."
                                value={formData.field_name}
                                onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                                data-testid="input-field-name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Loại dữ liệu</label>
                            <Select
                                value={formData.field_type}
                                onValueChange={(v) => setFormData({ ...formData, field_type: v as any })}
                            >
                                <SelectTrigger data-testid="select-field-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TEXT">Văn bản</SelectItem>
                                    <SelectItem value="NUMBER">Số</SelectItem>
                                    <SelectItem value="DATE">Ngày tháng</SelectItem>
                                    <SelectItem value="DROPDOWN">Danh sách chọn</SelectItem>
                                    <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.field_type === 'DROPDOWN' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Các lựa chọn (mỗi dòng một option)</label>
                                <Textarea
                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                    value={formData.options}
                                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                                    rows={4}
                                    data-testid="input-options"
                                />
                            </div>
                        )}

                        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700">Giá trị mặc định</label>
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-white">Gợi ý dữ liệu</Badge>
                            </div>

                            {formData.field_type === 'CHECKBOX' ? (
                                <div className="flex items-center gap-3 py-2">
                                    <Switch
                                        checked={formData.default_value === 'true'}
                                        onCheckedChange={(checked) => setFormData({ ...formData, default_value: checked ? 'true' : 'false' })}
                                        data-testid="input-default-value-checkbox"
                                    />
                                    <span className="text-sm font-medium text-slate-600">
                                        {formData.default_value === 'true' ? 'Được chọn sẵn' : 'Không chọn sẵn'}
                                    </span>
                                </div>
                            ) : formData.field_type === 'DROPDOWN' ? (
                                <Select
                                    value={formData.default_value}
                                    onValueChange={(v) => setFormData({ ...formData, default_value: v })}
                                >
                                    <SelectTrigger className="bg-white" data-testid="input-default-value-dropdown">
                                        <SelectValue placeholder="Chọn một giá trị từ danh sách trên" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formData.options.split('\n').filter(o => o.trim()).map((opt, i) => (
                                            <SelectItem key={i} value={opt.trim()}>{opt.trim()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    type={formData.field_type === 'NUMBER' ? 'number' : formData.field_type === 'DATE' ? 'date' : 'text'}
                                    placeholder={formData.field_type === 'DATE' ? 'Chọn ngày mặc định' : "Nhập giá trị khi tạo task mới..."}
                                    value={formData.default_value}
                                    onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
                                    className="bg-white border-slate-200"
                                    data-testid="input-default-value"
                                />
                            )}
                            <p className="text-[10px] font-medium text-slate-400 italic">
                                * Giá trị này sẽ được điền sẵn vào Task mới mỗi khi thành viên tạo việc.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_required"
                                checked={formData.is_required}
                                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-300"
                                data-testid="checkbox-required"
                            />
                            <label htmlFor="is_required" className="text-sm font-medium text-slate-700">
                                Bắt buộc nhập khi tạo task
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="project-custom-fields-btn-cancel">
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.field_name.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                            data-testid="project-custom-fields-btn-submit"
                        >
                            {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                            {editingField ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
