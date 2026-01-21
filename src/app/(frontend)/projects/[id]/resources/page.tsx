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
    ArrowLeft,
    FolderGit2,
    Plus,
    ExternalLink,
    GitBranch,
    Globe,
    FileText,
    Package,
    MoreVertical,
    Edit2,
    Trash2,
    RefreshCw,
    Link as LinkIcon,
    Copy,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

type ResourceType = 'GIT' | 'DEPLOY' | 'DOC' | 'API' | 'OTHER';

interface ProjectResource {
    id: string;
    type: ResourceType;
    name: string;
    url: string;
    description: string;
    created_by: string;
    created_at: string;
}

export default function ProjectResourcesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState<ProjectResource[]>([]);
    const [projectName, setProjectName] = useState('');
    const [typeFilter, setTypeFilter] = useState<ResourceType | 'ALL'>('ALL');

    // Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<ProjectResource | null>(null);
    const [formData, setFormData] = useState({
        type: 'GIT' as ResourceType,
        name: '',
        url: '',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchResources();
    }, [projectId]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            setProjectName('Worksphere Platform');

            // Mock data - US-MNG-05-01/02/03/04
            const mockResources: ProjectResource[] = [
                { id: 'r1', type: 'GIT', name: 'Frontend Repository', url: 'https://github.com/company/worksphere-fe', description: 'Main frontend codebase', created_by: 'Admin', created_at: '2024-01-15' },
                { id: 'r2', type: 'GIT', name: 'Backend Repository', url: 'https://github.com/company/worksphere-be', description: 'Backend API codebase', created_by: 'Admin', created_at: '2024-01-15' },
                { id: 'r3', type: 'DEPLOY', name: 'Production', url: 'https://app.worksphere.com', description: 'Production deployment', created_by: 'DevOps', created_at: '2024-02-01' },
                { id: 'r4', type: 'DEPLOY', name: 'Staging', url: 'https://staging.worksphere.com', description: 'Staging environment', created_by: 'DevOps', created_at: '2024-02-01' },
                { id: 'r5', type: 'DOC', name: 'API Documentation', url: 'https://docs.worksphere.com/api', description: 'Swagger API docs', created_by: 'Dev Lead', created_at: '2024-03-10' },
                { id: 'r6', type: 'DOC', name: 'Design System', url: 'https://figma.com/file/xyz', description: 'Figma design files', created_by: 'Designer', created_at: '2024-01-20' },
                { id: 'r7', type: 'API', name: 'REST API Base', url: 'https://api.worksphere.com/v1', description: 'API base URL', created_by: 'Dev Lead', created_at: '2024-02-15' },
            ];

            setResources(mockResources);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setEditingResource(null);
        setFormData({ type: 'GIT', name: '', url: '', description: '' });
        setDialogOpen(true);
    };

    const openEditDialog = (resource: ProjectResource) => {
        setEditingResource(resource);
        setFormData({
            type: resource.type,
            name: resource.name,
            url: resource.url,
            description: resource.description,
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.url.trim()) return;
        setIsSubmitting(true);
        try {
            if (editingResource) {
                setResources(resources.map(r =>
                    r.id === editingResource.id
                        ? { ...r, ...formData }
                        : r
                ));
            } else {
                const newResource: ProjectResource = {
                    id: `r${Date.now()}`,
                    ...formData,
                    created_by: user?.full_name || 'User',
                    created_at: new Date().toISOString().split('T')[0],
                };
                setResources([...resources, newResource]);
            }
            setDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (resourceId: string) => {
        if (!confirm('Bạn có chắc muốn xóa resource này?')) return;
        setResources(resources.filter(r => r.id !== resourceId));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getTypeIcon = (type: ResourceType) => {
        switch (type) {
            case 'GIT': return <GitBranch className="h-4 w-4 text-orange-500" />;
            case 'DEPLOY': return <Globe className="h-4 w-4 text-blue-500" />;
            case 'DOC': return <FileText className="h-4 w-4 text-purple-500" />;
            case 'API': return <Package className="h-4 w-4 text-emerald-500" />;
            default: return <LinkIcon className="h-4 w-4 text-slate-500" />;
        }
    };

    const getTypeBadge = (type: ResourceType) => {
        switch (type) {
            case 'GIT': return <Badge className="bg-orange-100 text-orange-700">GIT</Badge>;
            case 'DEPLOY': return <Badge className="bg-blue-100 text-blue-700">Deploy</Badge>;
            case 'DOC': return <Badge className="bg-purple-100 text-purple-700">Document</Badge>;
            case 'API': return <Badge className="bg-emerald-100 text-emerald-700">API</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    const filteredResources = resources.filter(r =>
        typeFilter === 'ALL' || r.type === typeFilter
    );

    const stats = {
        git: resources.filter(r => r.type === 'GIT').length,
        deploy: resources.filter(r => r.type === 'DEPLOY').length,
        doc: resources.filter(r => r.type === 'DOC').length,
        api: resources.filter(r => r.type === 'API').length,
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="project-resources-page">
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
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                                <FolderGit2 className="inline-block mr-3 h-8 w-8 text-blue-600" />
                                Tài nguyên Dự án
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Quản lý Git, Deploy, Documents (US-MNG-05-01/02/03/04)
                            </p>
                        </div>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                            onClick={openCreateDialog}
                            data-testid="btn-add-resource"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Thêm Resource
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${typeFilter === 'GIT' ? 'ring-2 ring-orange-500' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'GIT' ? 'ALL' : 'GIT')}
                        data-testid="stat-git"
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                <GitBranch className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Git Repos</p>
                                <p className="text-xl font-bold">{stats.git}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${typeFilter === 'DEPLOY' ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'DEPLOY' ? 'ALL' : 'DEPLOY')}
                        data-testid="stat-deploy"
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Globe className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Deployments</p>
                                <p className="text-xl font-bold">{stats.deploy}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${typeFilter === 'DOC' ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'DOC' ? 'ALL' : 'DOC')}
                        data-testid="stat-doc"
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Documents</p>
                                <p className="text-xl font-bold">{stats.doc}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-none shadow-sm cursor-pointer transition-all ${typeFilter === 'API' ? 'ring-2 ring-emerald-500' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'API' ? 'ALL' : 'API')}
                        data-testid="stat-api"
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">APIs</p>
                                <p className="text-xl font-bold">{stats.api}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Resources Table */}
                <Card className="border-none shadow-sm" data-testid="resources-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách Resources</CardTitle>
                        <CardDescription>
                            {typeFilter !== 'ALL' && (
                                <Button variant="ghost" size="sm" onClick={() => setTypeFilter('ALL')} className="ml-2">
                                    Xóa filter
                                </Button>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="loading-skeleton">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : filteredResources.length > 0 ? (
                            <Table data-testid="resources-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold">Tên</TableHead>
                                        <TableHead className="font-bold">Loại</TableHead>
                                        <TableHead className="font-bold">URL</TableHead>
                                        <TableHead className="text-right font-bold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredResources.map(resource => (
                                        <TableRow key={resource.id} data-testid={`resource-row-${resource.id}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                        {getTypeIcon(resource.type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium" data-testid={`resource-name-${resource.id}`}>
                                                            {resource.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{resource.description}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getTypeBadge(resource.type)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs bg-slate-100 px-2 py-1 rounded max-w-[200px] truncate">
                                                        {resource.url}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => copyToClipboard(resource.url)}
                                                        data-testid={`btn-copy-${resource.id}`}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" data-testid={`resource-actions-${resource.id}`}>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <a href={resource.url} target="_blank" rel="noopener noreferrer" data-testid={`btn-open-${resource.id}`}>
                                                                <ExternalLink className="mr-2 h-4 w-4" /> Mở
                                                            </a>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEditDialog(resource)} data-testid={`btn-edit-${resource.id}`}>
                                                            <Edit2 className="mr-2 h-4 w-4" /> Sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(resource.id)} className="text-red-600" data-testid={`btn-delete-${resource.id}`}>
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
                            <div className="p-12 text-center" data-testid="empty-state">
                                <FolderGit2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Chưa có resource nào</p>
                                <Button className="mt-4" onClick={openCreateDialog} data-testid="btn-add-first">
                                    <Plus className="mr-2 h-4 w-4" /> Thêm Resource đầu tiên
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add/Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="resource-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingResource ? 'Chỉnh sửa Resource' : 'Thêm Resource mới'}
                            </DialogTitle>
                            <DialogDescription>
                                Nhập thông tin resource cho dự án
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Loại *</label>
                                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as ResourceType })}>
                                    <SelectTrigger data-testid="select-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GIT">Git Repository</SelectItem>
                                        <SelectItem value="DEPLOY">Deployment URL</SelectItem>
                                        <SelectItem value="DOC">Documentation</SelectItem>
                                        <SelectItem value="API">API Endpoint</SelectItem>
                                        <SelectItem value="OTHER">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Tên *</label>
                                <Input
                                    placeholder="vd: Frontend Repository"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    data-testid="input-name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">URL *</label>
                                <Input
                                    placeholder="https://..."
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    data-testid="input-url"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Mô tả</label>
                                <Textarea
                                    placeholder="Mô tả ngắn về resource"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    data-testid="input-description"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="btn-cancel">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.name.trim() || !formData.url.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="btn-submit"
                            >
                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                {editingResource ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
