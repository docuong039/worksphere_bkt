/**
 * Global Custom Fields Management (Org Admin)
 * 
 * User Stories:
 * - US-ORG-04-01: Định nghĩa Custom Fields cho toàn bộ tổ chức
 * - US-ORG-04-02: Các trường này tự động áp dụng cho Task/Subtask mới
 * 
 * Access: ORG_ADMIN, SYS_ADMIN
 */

'use client';

import React, { useState, useEffect } from 'react';
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
    RefreshCw,
    Type,
    Hash,
    Calendar,
    List,
    CheckSquare,
    GripVertical,
    Globe,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

interface GlobalCustomField {
    id: string;
    field_name: string;
    field_type: 'TEXT' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX';
    is_required: boolean;
    default_value: string | null;
    options: string[];
    scope: 'GLOBAL';
}

export default function GlobalCustomFieldsPage() {
    const { user } = useAuthStore();
    const [fields, setFields] = useState<GlobalCustomField[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<GlobalCustomField | null>(null);
    const [formData, setFormData] = useState({
        field_name: '',
        field_type: 'TEXT' as GlobalCustomField['field_type'],
        is_required: false,
        default_value: '',
        options: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        setLoading(true);
        try {
            // Mock data representing standard organization fields
            const mockFields: GlobalCustomField[] = [
                {
                    id: 'gcf1', field_name: 'Story Points', field_type: 'NUMBER',
                    is_required: false, default_value: '0', options: [], scope: 'GLOBAL'
                },
                {
                    id: 'gcf2', field_name: 'Phòng ban liên quan', field_type: 'DROPDOWN',
                    is_required: false, default_value: '', options: ['IT', 'HR', 'Finance', 'Sales'], scope: 'GLOBAL'
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

    const openEditDialog = (field: GlobalCustomField) => {
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
                const newField: GlobalCustomField = {
                    id: `gcf${Date.now()}`,
                    field_name: formData.field_name,
                    field_type: formData.field_type,
                    is_required: formData.is_required,
                    default_value: formData.default_value || null,
                    options: optionsArray,
                    scope: 'GLOBAL',
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
        if (!confirm('Bạn có chắc muốn xóa trường toàn cục này? Các dự án đang sử dụng trường này có thể bị ảnh hưởng.')) return;
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

    return (
        <AppLayout>
            <PermissionGuard permission={PERMISSIONS.TENANT_ORG_UPDATE} showFullPageError>
                <div className="space-y-6 animate-in fade-in duration-700 pb-20" data-testid="global-custom-fields-container">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="global-custom-fields-title">
                                <Globe className="inline-block mr-3 h-8 w-8 text-indigo-600" />
                                Trường tùy chỉnh Toàn cục
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Định nghĩa các trường dữ liệu dùng chung cho mọi dự án trong tổ chức.
                            </p>
                        </div>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 h-11 font-bold"
                            onClick={openCreateDialog}
                            data-testid="btn-add-global-field"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Thêm trường toàn cục
                        </Button>
                    </div>

                    {/* Warning Notice */}
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4 text-amber-800">
                        <Sliders className="h-6 w-6 shrink-0" />
                        <div className="text-sm">
                            <p className="font-bold">Lưu ý quan trọng</p>
                            <p className="font-medium opacity-80">Các trường toàn cục sẽ tự động hiển thị trong tất cả Task và Subtask mới được tạo ở mọi dự án. Thay đổi tại đây sẽ ảnh hưởng đến cấu trúc dữ liệu toàn tổ chức.</p>
                        </div>
                    </div>

                    {/* fields Table */}
                    <Card className="border-none shadow-sm" data-testid="global-fields-card">
                        <CardHeader className="border-b border-slate-50">
                            <CardTitle className="text-lg font-bold">Danh sách trường dữ liệu dùng chung</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-6 space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-14 w-full" />
                                    ))}
                                </div>
                            ) : fields.length > 0 ? (
                                <Table>
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
                                        {fields.map(field => (
                                            <TableRow key={field.id} className="group">
                                                <TableCell>
                                                    <GripVertical className="h-4 w-4 text-slate-300" />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500">{getFieldTypeIcon(field.field_type)}</span>
                                                        <span className="font-bold text-slate-700">{field.field_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-bold">
                                                        {field.field_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {field.is_required ? (
                                                        <Badge className="bg-red-100 text-red-700 border-none font-bold">Bắt buộc</Badge>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium text-slate-600">
                                                    {field.default_value || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openEditDialog(field)}>
                                                                <Edit2 className="mr-2 h-4 w-4" /> Chỉnh sửa
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(field.id)} className="text-red-600">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-12 text-center">
                                    <Sliders className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold">Chưa có trường toàn cục nào</p>
                                    <p className="text-slate-400 text-sm mt-1">Sử dụng trường toàn cục để chuẩn hóa dữ liệu cho toàn công ty.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">
                                    {editingField ? 'Cập nhật trường toàn cục' : 'Thêm trường toàn cục mới'}
                                </DialogTitle>
                                <DialogDescription>
                                    Trường này sẽ xuất hiện ở mọi Task trong tổ chức.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase">Tên trường *</label>
                                    <Input
                                        placeholder="vd: Story Points, Sprint..."
                                        value={formData.field_name}
                                        onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                                        data-testid="input-global-field-name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase">Loại dữ liệu</label>
                                    <Select
                                        value={formData.field_type}
                                        onValueChange={(v) => setFormData({ ...formData, field_type: v as any })}
                                    >
                                        <SelectTrigger data-testid="select-global-field-type">
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
                                        <label className="text-sm font-bold text-slate-700 uppercase">Các lựa chọn (mỗi dòng một option)</label>
                                        <Textarea
                                            placeholder="Option 1&#10;Option 2"
                                            value={formData.options}
                                            onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                                            rows={4}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase">Giá trị mặc định</label>
                                    <Input
                                        placeholder="Giá trị mặc định"
                                        value={formData.default_value}
                                        onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <CheckSquare className="h-4 w-4 text-indigo-600" />
                                    <label className="text-sm font-bold text-slate-700 cursor-pointer flex-1">
                                        Bắt buộc nhập khi tạo task
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_required}
                                        onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                                        className="h-5 w-5 rounded-lg border-slate-300"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !formData.field_name.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                    data-testid="btn-save-global-field"
                                >
                                    {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    {editingField ? 'Cập nhật' : 'Thêm mới'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
