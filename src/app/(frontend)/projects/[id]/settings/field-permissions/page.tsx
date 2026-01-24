'use client';

import React, { useState, useEffect, use } from 'react';
import {
    Shield,
    Users,
    Table as TableIcon,
    Save,
    Search,
    Info,
    CheckCircle2,
    XCircle,
    Loader2,
    Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectMember {
    id: string;
    full_name: string;
    role: string;
}

interface FieldDefinition {
    id: string;
    field_name: string;
    is_custom: boolean;
}

export default function FieldPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user: currentUser } = useAuthStore();
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [fields, setFields] = useState<FieldDefinition[]>([]);
    const [permissions, setPermissions] = useState<Record<string, Set<string>>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'TASK' | 'SUBTASK'>('TASK');

    const isPM = currentUser?.role === 'PROJECT_MANAGER' || currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'SYS_ADMIN';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Mock data since API might not be ready
                setMembers([
                    { id: '1', full_name: 'Nguyễn Văn A', role: 'DEVELOPER' },
                    { id: '2', full_name: 'Trần Thị B', role: 'DESIGNER' },
                    { id: '3', full_name: 'Lê Văn PM', role: 'PROJECT_MANAGER' },
                ]);
                setFields([
                    { id: 'f1', field_name: 'Tiêu đề', is_custom: false },
                    { id: 'f2', field_name: 'Mô tả', is_custom: false },
                    { id: 'f3', field_name: 'Người thực hiện', is_custom: false },
                    { id: 'f4', field_name: 'Độ ưu tiên', is_custom: false },
                    { id: 'f5', field_name: 'Story Points', is_custom: true },
                ]);
                setPermissions({
                    '1': new Set(['f1', 'f2', 'f3', 'f4', 'f5']),
                    '2': new Set(['f1', 'f2']),
                });
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) fetchData();
    }, [id, currentUser]);

    const togglePermission = (userId: string, fieldId: string) => {
        const newPermissions = { ...permissions };
        const userPerms = new Set(newPermissions[userId] || []);
        if (userPerms.has(fieldId)) userPerms.delete(fieldId);
        else userPerms.add(fieldId);
        newPermissions[userId] = userPerms;
        setPermissions(newPermissions);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    if (!isPM) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center h-[70vh]">
                <Lock size={48} className="text-slate-200 mb-6" />
                <h2 className="text-2xl font-black text-slate-900">Truy cập bị hạn chế</h2>
                <p className="text-slate-500 mt-2 max-w-xs font-medium">Chỉ quản lý dự án mới có thể cấu hình phền quyền cho từng trường dữ liệu.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20" data-testid="field-permissions-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2 shrink-0">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        Phân quyền trường dữ liệu
                    </h2>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 h-9 px-6 font-bold shadow-lg shadow-emerald-100" onClick={handleSave} disabled={isSaving} size="sm">
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Lưu Ma trận</>}
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-fit">
                            <TabsList className="bg-white p-1 border border-slate-200 rounded-xl">
                                <TabsTrigger value="TASK" className="rounded-lg px-4 text-xs font-bold transition-all">Công việc</TabsTrigger>
                                <TabsTrigger value="SUBTASK" className="rounded-lg px-4 text-xs font-bold transition-all">Công việc con</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <Input placeholder="Tìm thành viên..." className="pl-9 h-9 w-64 bg-white border-slate-200 rounded-xl text-xs font-semibold" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                                    <TableHead className="w-64 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thành viên</TableHead>
                                    {fields.map(field => (
                                        <TableHead key={field.id} className="text-center p-4">
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{field.field_name}</span>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map(member => (
                                    <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-[10px] font-bold">{member.full_name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900">{member.full_name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{member.role}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {fields.map(field => {
                                            const hasPerm = permissions[member.id]?.has(field.id) || member.role === 'PROJECT_MANAGER';
                                            return (
                                                <TableCell key={field.id} className="text-center p-4">
                                                    <Checkbox
                                                        checked={hasPerm}
                                                        disabled={member.role === 'PROJECT_MANAGER'}
                                                        onCheckedChange={() => togglePermission(member.id, field.id)}
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
