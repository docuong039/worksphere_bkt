'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Settings,
    Plus,
    Edit2,
    Trash2,
    MoreVertical,
    ListChecks,
    AlertTriangle,
    Flag,
    GripVertical,
    CheckCircle2,
    Clock,
    PlayCircle,
    XCircle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface LookupItem {
    code: string;
    name: string;
    color_code?: string;
    sort_order: number;
    is_terminal?: boolean;
    is_default?: boolean;
}

type TabType = 'statuses' | 'priorities' | 'types';

export default function LookupManagementPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('statuses');
    const [loading, setLoading] = useState(true);
    const [statuses, setStatuses] = useState<LookupItem[]>([]);
    const [priorities, setPriorities] = useState<LookupItem[]>([]);
    const [types, setTypes] = useState<LookupItem[]>([]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LookupItem | null>(null);
    const [formData, setFormData] = useState({ code: '', name: '', color_code: '#3B82F6' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchLookups();
    }, []);

    const fetchLookups = async () => {
        setLoading(true);
        try {
            // Mock data based on Database Design document
            const mockStatuses: LookupItem[] = [
                { code: 'TODO', name: 'Cần làm', color_code: '#94A3B8', sort_order: 1, is_terminal: false },
                { code: 'IN_PROGRESS', name: 'Đang làm', color_code: '#3B82F6', sort_order: 2, is_terminal: false },
                { code: 'BLOCKED', name: 'Bị chặn', color_code: '#EF4444', sort_order: 3, is_terminal: false },
                { code: 'DONE', name: 'Hoàn thành', color_code: '#22C55E', sort_order: 4, is_terminal: true },
            ];
            const mockPriorities: LookupItem[] = [
                { code: 'LOW', name: 'Thấp', color_code: '#94A3B8', sort_order: 1 },
                { code: 'MEDIUM', name: 'Trung bình', color_code: '#F59E0B', sort_order: 2, is_default: true },
                { code: 'HIGH', name: 'Cao', color_code: '#F97316', sort_order: 3 },
                { code: 'URGENT', name: 'Khẩn cấp', color_code: '#EF4444', sort_order: 4 },
            ];
            const mockTypes: LookupItem[] = [
                { code: 'TASK', name: 'Công việc', color_code: '#3B82F6', sort_order: 1, is_default: true },
                { code: 'BUG', name: 'Lỗi', color_code: '#EF4444', sort_order: 2 },
                { code: 'FEATURE', name: 'Tính năng', color_code: '#8B5CF6', sort_order: 3 },
            ];
            setStatuses(mockStatuses);
            setPriorities(mockPriorities);
            setTypes(mockTypes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentItems = () => {
        switch (activeTab) {
            case 'statuses': return statuses;
            case 'priorities': return priorities;
            case 'types': return types;
        }
    };

    const setCurrentItems = (items: LookupItem[]) => {
        switch (activeTab) {
            case 'statuses': setStatuses(items); break;
            case 'priorities': setPriorities(items); break;
            case 'types': setTypes(items); break;
        }
    };

    const openCreateDialog = () => {
        setEditingItem(null);
        setFormData({ code: '', name: '', color_code: '#3B82F6' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (item: LookupItem) => {
        setEditingItem(item);
        setFormData({ code: item.code, name: item.name, color_code: item.color_code || '#3B82F6' });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.code.trim() || !formData.name.trim()) return;
        setIsSubmitting(true);
        try {
            const items = getCurrentItems();
            if (editingItem) {
                // Update
                setCurrentItems(items.map(item =>
                    item.code === editingItem.code
                        ? { ...item, name: formData.name, color_code: formData.color_code }
                        : item
                ));
            } else {
                // Create
                const newItem: LookupItem = {
                    code: formData.code.toUpperCase().replace(/\s+/g, '_'),
                    name: formData.name,
                    color_code: formData.color_code,
                    sort_order: items.length + 1,
                };
                setCurrentItems([...items, newItem]);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (code: string) => {
        if (!confirm('Bạn có chắc muốn xóa mục này?')) return;
        setCurrentItems(getCurrentItems().filter(item => item.code !== code));
    };

    const getTabLabel = () => {
        switch (activeTab) {
            case 'statuses': return 'Trạng thái';
            case 'priorities': return 'Độ ưu tiên';
            case 'types': return 'Loại công việc';
        }
    };

    const getStatusIcon = (code: string) => {
        switch (code) {
            case 'TODO': return <Clock className="h-4 w-4" />;
            case 'IN_PROGRESS': return <PlayCircle className="h-4 w-4" />;
            case 'BLOCKED': return <XCircle className="h-4 w-4" />;
            case 'DONE': return <CheckCircle2 className="h-4 w-4" />;
            default: return <ListChecks className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="lookup-management-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="settings-lookups-page-title">
                            <Settings className="inline-block mr-3 h-8 w-8 text-blue-600" />
                            Quản lý Danh mục
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Thiết lập trạng thái, độ ưu tiên và loại công việc (US-ORG-03-03)
                        </p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={openCreateDialog}
                        data-testid="btn-create-lookup"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm {getTabLabel()}
                    </Button>
                </div>

                {/* Tabs */}
                <Card className="border-none shadow-sm" data-testid="lookup-tabs-card">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
                        <CardHeader className="border-b border-slate-100 pb-0">
                            <TabsList className="bg-slate-100/50 p-1" data-testid="lookup-tabs">
                                <TabsTrigger
                                    value="statuses"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    data-testid="tab-statuses"
                                >
                                    <ListChecks className="mr-2 h-4 w-4" />
                                    Trạng thái
                                </TabsTrigger>
                                <TabsTrigger
                                    value="priorities"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    data-testid="tab-priorities"
                                >
                                    <Flag className="mr-2 h-4 w-4" />
                                    Độ ưu tiên
                                </TabsTrigger>
                                <TabsTrigger
                                    value="types"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                    data-testid="tab-types"
                                >
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Loại công việc
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-6 space-y-4" data-testid="settings-lookups-loading-skeleton">
                                    {[1, 2, 3, 4].map(i => (
                                        <Skeleton key={i} className="h-14 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="statuses" className="m-0">
                                        <LookupTable
                                            items={statuses}
                                            onEdit={openEditDialog}
                                            onDelete={handleDelete}
                                            showTerminal
                                            getIcon={getStatusIcon}
                                        />
                                    </TabsContent>
                                    <TabsContent value="priorities" className="m-0">
                                        <LookupTable
                                            items={priorities}
                                            onEdit={openEditDialog}
                                            onDelete={handleDelete}
                                            showDefault
                                        />
                                    </TabsContent>
                                    <TabsContent value="types" className="m-0">
                                        <LookupTable
                                            items={types}
                                            onEdit={openEditDialog}
                                            onDelete={handleDelete}
                                            showDefault
                                        />
                                    </TabsContent>
                                </>
                            )}
                        </CardContent>
                    </Tabs>
                </Card>

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="lookup-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingItem ? `Sửa ${getTabLabel()}` : `Thêm ${getTabLabel()}`}
                            </DialogTitle>
                            <DialogDescription>
                                {editingItem ? 'Chỉnh sửa thông tin danh mục' : 'Thêm mục mới vào danh mục'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Mã (Code)</label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="VD: IN_REVIEW"
                                    disabled={!!editingItem}
                                    className="uppercase"
                                    data-testid="input-code"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Tên hiển thị</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Đang duyệt"
                                    data-testid="settings-lookups-input-name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Màu sắc</label>
                                <div className="flex gap-3 items-center">
                                    <Input
                                        type="color"
                                        value={formData.color_code}
                                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                                        className="w-14 h-10 p-1 cursor-pointer"
                                        data-testid="input-color"
                                    />
                                    <Input
                                        value={formData.color_code}
                                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                                        placeholder="#3B82F6"
                                        className="flex-1 font-mono"
                                        data-testid="input-color-hex"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                data-testid="settings-lookups-btn-cancel"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.code || !formData.name}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="settings-lookups-btn-submit"
                            >
                                {editingItem ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

// Lookup Table Component
function LookupTable({
    items,
    onEdit,
    onDelete,
    showTerminal = false,
    showDefault = false,
    getIcon,
}: {
    items: LookupItem[];
    onEdit: (item: LookupItem) => void;
    onDelete: (code: string) => void;
    showTerminal?: boolean;
    showDefault?: boolean;
    getIcon?: (code: string) => React.ReactNode;
}) {
    if (items.length === 0) {
        return (
            <div className="p-12 text-center" data-testid="settings-lookups-empty-state">
                <ListChecks className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Chưa có mục nào</p>
            </div>
        );
    }

    return (
        <Table data-testid="lookup-table">
            <TableHeader>
                <TableRow className="bg-slate-50/50">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="font-bold">Mã</TableHead>
                    <TableHead className="font-bold">Tên hiển thị</TableHead>
                    <TableHead className="font-bold">Màu sắc</TableHead>
                    {showTerminal && <TableHead className="font-bold">Kết thúc</TableHead>}
                    {showDefault && <TableHead className="font-bold">Mặc định</TableHead>}
                    <TableHead className="text-right font-bold">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.sort((a, b) => a.sort_order - b.sort_order).map((item) => (
                    <TableRow key={item.code} className="group" data-testid={`lookup-row-${item.code}`}>
                        <TableCell>
                            <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {getIcon && (
                                    <span style={{ color: item.color_code }}>{getIcon(item.code)}</span>
                                )}
                                <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono" data-testid={`lookup-code-${item.code}`}>
                                    {item.code}
                                </code>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`lookup-name-${item.code}`}>
                            {item.name}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: item.color_code }}
                                    data-testid={`lookup-color-${item.code}`}
                                />
                                <span className="text-xs font-mono text-slate-500">{item.color_code}</span>
                            </div>
                        </TableCell>
                        {showTerminal && (
                            <TableCell>
                                {item.is_terminal ? (
                                    <Badge className="bg-emerald-100 text-emerald-700">Có</Badge>
                                ) : (
                                    <span className="text-slate-400">-</span>
                                )}
                            </TableCell>
                        )}
                        {showDefault && (
                            <TableCell>
                                {item.is_default ? (
                                    <Badge className="bg-blue-100 text-blue-700">Mặc định</Badge>
                                ) : (
                                    <span className="text-slate-400">-</span>
                                )}
                            </TableCell>
                        )}
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        data-testid={`lookup-actions-${item.code}`}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(item)} data-testid={`btn-edit-${item.code}`}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onDelete(item.code)}
                                        className="text-red-600"
                                        data-testid={`btn-delete-${item.code}`}
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
    );
}
