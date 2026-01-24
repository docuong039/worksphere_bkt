'use client';

import React, { useState, useEffect, use } from 'react';
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
    AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

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
    const [typeFilter, setTypeFilter] = useState<ResourceType | 'ALL'>('ALL');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<ProjectResource | null>(null);
    const [formData, setFormData] = useState({
        type: 'GIT' as ResourceType,
        name: '',
        url: '',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canManage = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                // Mock data
                setResources([
                    { id: '1', type: 'GIT', name: 'Frontend Repository', url: 'https://github.com/worksphere/frontend', description: 'Next.js application', created_by: 'PM', created_at: '2026-01-01' },
                    { id: '2', type: 'DEPLOY', name: 'Staging Environment', url: 'https://staging.worksphere.io', description: 'Staging server for testing', created_by: 'Dev', created_at: '2026-01-05' },
                    { id: '3', type: 'API', name: 'API Docs', url: 'https://api.worksphere.io/docs', description: 'Swagger documentation', created_by: 'Architect', created_at: '2026-01-10' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchResources();
    }, [projectId, user]);

    if (!canManage) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="p-4 bg-rose-100 text-rose-600 rounded-full shadow-sm">
                    <AlertTriangle size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Truy cập bị từ chối</h2>
                <p className="text-slate-500 max-w-md font-medium">Chỉ Quản lý dự án mới được truy cập Tài nguyên kỹ thuật.</p>
            </div>
        );
    }

    const openCreateDialog = () => {
        setEditingResource(null);
        setFormData({ type: 'GIT', name: '', url: '', description: '' });
        setDialogOpen(true);
    };

    const openEditDialog = (resource: ProjectResource) => {
        setEditingResource(resource);
        setFormData({ type: resource.type, name: resource.name, url: resource.url, description: resource.description });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.url.trim()) return;
        setIsSubmitting(true);
        try {
            if (editingResource) {
                setResources(resources.map(r => r.id === editingResource.id ? { ...r, ...formData } : r));
            } else {
                setResources([...resources, { id: `r${Date.now()}`, ...formData, created_by: user?.full_name || 'User', created_at: new Date().toISOString().split('T')[0] }]);
            }
            setDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
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

    const filteredResources = resources.filter(r => typeFilter === 'ALL' || r.type === typeFilter);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" data-testid="project-resources-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-800 flex items-center gap-2" data-testid="project-resources-title">
                        <FolderGit2 className="h-6 w-6 text-indigo-600" /> Tài nguyên Dự án
                    </h2>
                </div>
                <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-700 font-bold h-9 shadow-lg shadow-indigo-100" size="sm" data-testid="btn-add-resource">
                    <Plus className="mr-2 h-4 w-4" /> Thêm Resource
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="resource-type-filters">
                {(['GIT', 'DEPLOY', 'DOC', 'API'] as ResourceType[]).map(type => (
                    <Card
                        key={type}
                        className={cn("border-none shadow-sm cursor-pointer transition-all", typeFilter === type ? "ring-2 ring-indigo-500" : "")}
                        onClick={() => setTypeFilter(typeFilter === type ? 'ALL' : type)}
                        data-testid={`resource-filter-${type.toLowerCase()}`}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                {getTypeIcon(type)}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type}</p>
                                <p className="text-xl font-black text-slate-900" data-testid={`resource-count-${type.toLowerCase()}`}>{resources.filter(r => r.type === type).length}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden" data-testid="resources-list-card">
                <CardHeader className="border-b border-slate-50">
                    <CardTitle className="text-base font-bold">Danh sách Resources</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4" data-testid="resources-loading-skeleton">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                        <Table data-testid="resources-table">
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resource</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loại</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredResources.map(resource => (
                                    <TableRow key={resource.id} className="hover:bg-slate-50 transition-colors" data-testid={`resource-row-${resource.id}`}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                    {getTypeIcon(resource.type)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900" data-testid={`resource-name-${resource.id}`}>{resource.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{resource.description}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-[10px] font-black uppercase" data-testid={`resource-type-${resource.id}`}>{resource.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <code className="text-[10px] bg-slate-100 px-2 py-1 rounded max-w-[150px] truncate" data-testid={`resource-url-${resource.id}`}>{resource.url}</code>
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(resource.url)} data-testid={`btn-copy-${resource.id}`}>
                                                    <Copy size={12} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" data-testid={`resource-actions-${resource.id}`}><MoreVertical size={14} /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild><a href={resource.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Mở link</a></DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditDialog(resource)} data-testid={`btn-edit-${resource.id}`}><Edit2 className="mr-2 h-4 w-4" /> Sửa</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { }} className="text-rose-600" data-testid={`btn-delete-${resource.id}`}><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent data-testid="resource-dialog">
                    <DialogHeader>
                        <DialogTitle>{editingResource ? 'Sửa Resource' : 'Thêm Resource'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Loại</label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as ResourceType })}>
                                <SelectTrigger data-testid="input-resource-type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GIT">Git Repository</SelectItem>
                                    <SelectItem value="DEPLOY">Deployment</SelectItem>
                                    <SelectItem value="DOC">Document</SelectItem>
                                    <SelectItem value="API">API</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Tên</label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} data-testid="input-resource-name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">URL</label>
                            <Input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} data-testid="input-resource-url" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Mô tả</label>
                            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} data-testid="input-resource-desc" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} data-testid="btn-cancel">Hủy</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold" onClick={handleSubmit} disabled={isSubmitting} data-testid="btn-submit">Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
