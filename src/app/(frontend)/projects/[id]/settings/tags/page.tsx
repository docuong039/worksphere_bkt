'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tags,
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    ArrowLeft,
    Hash,
    RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface Tag {
    id: string;
    name: string;
    color_code: string;
    usage_count: number;
    created_at: string;
    created_by_name: string;
}

export default function TagManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [projectName, setProjectName] = useState('');

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [formData, setFormData] = useState({ name: '', color_code: '#3B82F6' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTags();
    }, [projectId]);

    const fetchTags = async () => {
        setLoading(true);
        try {
            setProjectName('Worksphere Platform');
            // Mock data based on Database Design - task_tags table
            const mockTags: Tag[] = [
                { id: 't1', name: 'frontend', color_code: '#3B82F6', usage_count: 25, created_at: '2024-01-10', created_by_name: 'Lê Văn PM' },
                { id: 't2', name: 'backend', color_code: '#10B981', usage_count: 32, created_at: '2024-01-10', created_by_name: 'Lê Văn PM' },
                { id: 't3', name: 'urgent', color_code: '#EF4444', usage_count: 8, created_at: '2024-01-15', created_by_name: 'Lê Văn PM' },
                { id: 't4', name: 'design', color_code: '#8B5CF6', usage_count: 15, created_at: '2024-02-01', created_by_name: 'Trần Thị Designer' },
                { id: 't5', name: 'bug', color_code: '#F59E0B', usage_count: 45, created_at: '2024-01-12', created_by_name: 'Lê Văn PM' },
                { id: 't6', name: 'documentation', color_code: '#6366F1', usage_count: 12, created_at: '2024-03-01', created_by_name: 'Lê Văn PM' },
                { id: 't7', name: 'testing', color_code: '#EC4899', usage_count: 20, created_at: '2024-02-15', created_by_name: 'QA Team' },
                { id: 't8', name: 'performance', color_code: '#14B8A6', usage_count: 5, created_at: '2024-04-01', created_by_name: 'Lê Văn PM' },
            ];
            setTags(mockTags);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setEditingTag(null);
        setFormData({ name: '', color_code: '#3B82F6' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (tag: Tag) => {
        setEditingTag(tag);
        setFormData({ name: tag.name, color_code: tag.color_code });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;
        setIsSubmitting(true);
        try {
            if (editingTag) {
                // Update
                setTags(tags.map(t =>
                    t.id === editingTag.id
                        ? { ...t, name: formData.name.toLowerCase().replace(/\s+/g, '-'), color_code: formData.color_code }
                        : t
                ));
            } else {
                // Create
                const newTag: Tag = {
                    id: `t${Date.now()}`,
                    name: formData.name.toLowerCase().replace(/\s+/g, '-'),
                    color_code: formData.color_code,
                    usage_count: 0,
                    created_at: new Date().toISOString().split('T')[0],
                    created_by_name: user?.full_name || 'Admin',
                };
                setTags([...tags, newTag]);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (tagId: string) => {
        const tag = tags.find(t => t.id === tagId);
        if (!tag) return;
        if (tag.usage_count > 0) {
            if (!confirm(`Tag "${tag.name}" đang được sử dụng bởi ${tag.usage_count} task. Bạn có chắc muốn xóa?`)) return;
        } else {
            if (!confirm(`Bạn có chắc muốn xóa tag "${tag.name}"?`)) return;
        }
        setTags(tags.filter(t => t.id !== tagId));
    };

    const filteredTags = tags.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const predefinedColors = [
        '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
        '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16',
    ];

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="tag-management-page">
                {/* Header */}
                <div>
                    <Button variant="ghost" asChild className="-ml-4 mb-4 text-slate-500">
                        <Link href={`/projects/${projectId}/overview`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại {projectName}
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="project-tags-page-title">
                                <Tags className="inline-block mr-3 h-8 w-8 text-blue-600" />
                                Quản lý Tags
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Tạo và quản lý tags cho dự án (US-MNG-01-03)
                            </p>
                        </div>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                            onClick={openCreateDialog}
                            data-testid="btn-create-tag"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tạo tag mới
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <Card className="border-none shadow-sm" data-testid="project-tags-search-card">
                    <CardContent className="p-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                                data-testid="project-tags-input-search"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Tags Grid */}
                <Card className="border-none shadow-sm" data-testid="tags-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách Tags ({filteredTags.length})</CardTitle>
                        <CardDescription>Click vào tag để xem các task đang sử dụng</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="project-tags-loading-skeleton">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        ) : filteredTags.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="tags-grid">
                                {filteredTags.map(tag => (
                                    <div
                                        key={tag.id}
                                        className="relative group p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
                                        data-testid={`tag-card-${tag.id}`}
                                    >
                                        {/* Color bar */}
                                        <div
                                            className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                                            style={{ backgroundColor: tag.color_code }}
                                        />

                                        {/* Actions */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`tag-actions-${tag.id}`}>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(tag)} data-testid={`btn-edit-${tag.id}`}>
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(tag.id)}
                                                        className="text-red-600"
                                                        data-testid={`btn-delete-${tag.id}`}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Content */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <Hash className="h-4 w-4" style={{ color: tag.color_code }} />
                                            <span className="font-bold text-slate-900" data-testid={`tag-name-${tag.id}`}>
                                                {tag.name}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <Badge variant="outline" className="text-xs" data-testid={`tag-count-${tag.id}`}>
                                                {tag.usage_count} tasks
                                            </Badge>
                                            <div
                                                className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                                                style={{ backgroundColor: tag.color_code }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12" data-testid="project-tags-empty-state">
                                <Tags className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Chưa có tag nào</p>
                                <p className="text-slate-400 text-sm mt-1">Tạo tag để phân loại tasks</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="tag-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingTag ? 'Chỉnh sửa Tag' : 'Tạo Tag mới'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingTag ? 'Cập nhật thông tin tag' : 'Tạo tag mới để phân loại tasks'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Tên tag</label>
                                <Input
                                    placeholder="vd: frontend, urgent, design..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    data-testid="input-tag-name"
                                />
                                <p className="text-xs text-slate-500">
                                    Sẽ được chuyển thành chữ thường và thay khoảng trắng bằng dấu gạch
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Màu sắc</label>
                                <div className="flex gap-2 flex-wrap">
                                    {predefinedColors.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`h-8 w-8 rounded-full transition-transform ${formData.color_code === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setFormData({ ...formData, color_code: color })}
                                            data-testid={`color-${color}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Input
                                        type="color"
                                        value={formData.color_code}
                                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                        data-testid="input-custom-color"
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

                            {/* Preview */}
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 mb-2">Xem trước:</p>
                                <Badge
                                    className="text-white"
                                    style={{ backgroundColor: formData.color_code }}
                                >
                                    <Hash className="h-3 w-3 mr-1" />
                                    {formData.name || 'tag-name'}
                                </Badge>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="project-tags-btn-cancel">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.name.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="project-tags-btn-submit"
                            >
                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                {editingTag ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
