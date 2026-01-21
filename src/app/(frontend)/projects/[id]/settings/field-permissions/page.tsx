'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
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
import AppLayout from '@/components/layout/AppLayout';
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
    const [permissions, setPermissions] = useState<Record<string, Set<string>>>({}); // userId -> Set of fieldIds
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'TASK' | 'SUBTASK'>('TASK');

    const isPM = currentUser?.role === 'PROJECT_MANAGER' || currentUser?.role === 'ORG_ADMIN' || currentUser?.role === 'SYS_ADMIN';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${id}/field-permissions`, {
                    headers: {
                        'x-user-id': currentUser?.id || '',
                        'x-user-role': currentUser?.role || ''
                    }
                });
                const data = await res.json();

                setMembers(data.members || []);
                setFields(data.fields || []);

                // Transform permissions into Record<string, Set<string>>
                const perms: Record<string, Set<string>> = {};
                if (data.permissions) {
                    Object.entries(data.permissions).forEach(([userId, fieldIds]) => {
                        perms[userId] = new Set(fieldIds as string[]);
                    });
                }
                setPermissions(perms);

            } catch (error) {
                console.error(error);
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
        try {
            // Transform permissions back to arrays for API
            const permsToSave: Record<string, string[]> = {};
            Object.entries(permissions).forEach(([userId, fieldSet]) => {
                permsToSave[userId] = Array.from(fieldSet);
            });

            const res = await fetch(`/api/projects/${id}/field-permissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': currentUser?.id || '',
                    'x-user-role': currentUser?.role || ''
                },
                body: JSON.stringify({ permissions: permsToSave })
            });

            if (res.ok) {
                // Show success state if needed
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isPM) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-32 text-center h-[70vh]">
                    <Lock size={48} className="text-slate-200 mb-6" />
                    <h2 className="text-2xl font-black text-slate-900">Truy cập bị hạn chế</h2>
                    <p className="text-slate-500 mt-2 max-w-xs font-medium">Chỉ quản lý dự án mới có thể cấu hình phền quyền cho từng trường dữ liệu.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700" data-testid="field-permissions-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                    <div className="space-y-2">
                        <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900 mb-2">
                            <Link href={`/projects/${id}/overview`}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại Dự án
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight" data-testid="field-permissions-title">
                            Phân quyền trường dữ liệu
                        </h1>
                        <p className="text-slate-500 font-medium">Kiểm soát xem thành viên nào có thể chỉnh sửa các trường cụ thể của Công việc và Công việc con.</p>
                    </div>

                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 font-bold shadow-lg shadow-emerald-100"
                        onClick={handleSave}
                        disabled={isSaving}
                        data-testid="save-permissions-btn"
                    >
                        {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Lưu Ma trận Phân quyền</>}
                    </Button>
                </div>

                {/* Matrix Content */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-fit">
                                <TabsList className="bg-white p-1 border border-slate-200 rounded-xl">
                                    <TabsTrigger value="TASK" className="rounded-lg px-6 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Công việc</TabsTrigger>
                                    <TabsTrigger value="SUBTASK" className="rounded-lg px-6 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Công việc con</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <Input placeholder="Tìm kiếm thành viên..." className="pl-10 h-10 w-64 bg-white border-slate-200 rounded-xl text-sm font-semibold shadow-sm focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : (
                            <Table data-testid="permissions-matrix">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                                        <TableHead className="w-72 sticky left-0 bg-slate-50/30 z-20 px-8 py-6">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Users size={14} /> Thành viên đội ngũ
                                            </div>
                                        </TableHead>
                                        {fields.map(field => (
                                            <TableHead key={field.id} className="min-w-[120px] text-center p-4">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-xs font-black text-slate-900">{field.field_name}</span>
                                                    {field.is_custom && <Badge variant="outline" className="text-[8px] h-4 px-1 leading-none bg-blue-50 text-blue-600 border-blue-100">Tùy chỉnh</Badge>}
                                                </div>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map(member => (
                                        <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="sticky left-0 bg-white group-hover:bg-slate-50/50 z-20 px-8 py-4 border-r border-slate-50 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-9 w-9 border-2 border-slate-50 ring-1 ring-slate-100">
                                                        <AvatarFallback className="bg-slate-100 text-slate-500 text-[10px] font-bold">
                                                            {member.full_name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">{member.full_name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{member.role}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {fields.map(field => {
                                                const hasPerm = permissions[member.id]?.has(field.id) || member.role === 'PROJECT_MANAGER';
                                                const isDisabled = member.role === 'PROJECT_MANAGER'; // PM has all perms by default

                                                return (
                                                    <TableCell key={field.id} className="text-center p-4">
                                                        <div className="flex justify-center">
                                                            <Checkbox
                                                                checked={hasPerm}
                                                                disabled={isDisabled}
                                                                onCheckedChange={() => togglePermission(member.id, field.id)}
                                                                className={cn(
                                                                    "h-6 w-6 rounded-lg transition-all",
                                                                    hasPerm ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200",
                                                                    isDisabled && "opacity-50 cursor-not-allowed bg-slate-100 border-slate-200"
                                                                )}
                                                                data-testid={`perm-${member.id}-${field.id}`}
                                                            />
                                                        </div>
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

                {/* Legend & Help */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-4">
                        <div className="flex items-center gap-3 text-blue-900">
                            <Info size={20} />
                            <h4 className="text-sm font-black uppercase tracking-widest">Cơ chế hoạt động</h4>
                        </div>
                        <p className="text-xs font-semibold text-blue-700/80 leading-relaxed">
                            Quyền hạn được xác định tại đây được <span className="text-blue-900 font-black italic">cộng dồn</span> vào vai trò của người dùng.
                            Quản lý Dự án luôn có quyền truy cập đầy đủ vào tất cả các trường.
                            Các vai trò Thành viên chỉ có thể chỉnh sửa các trường đã được đánh dấu trong ma trận này.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-600 uppercase">Cho phép sửa</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <XCircle size={14} className="text-rose-500" />
                                <span className="text-[10px] font-bold text-slate-600 uppercase">Chỉ đọc</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 text-white">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-blue-500" />
                            <h4 className="text-sm font-black uppercase tracking-widest">Quy tắc quản trị</h4>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                            Việc thay đổi quyền đối với trường sẽ kích hoạt bản ghi nhật ký kiểm định và ảnh hưởng đến tất cả các công việc trong dự án này ngay lập tức.
                            Các trường mặc định như 'Tiêu đề' và 'Ngày hết hạn' được bảo vệ và có thể yêu cầu năng lực vai trò cụ thể ngay cả khi đã được chọn ở đây.
                        </p>
                        <Button variant="link" className="text-blue-400 font-bold p-0 h-auto text-[10px] uppercase tracking-widest hover:text-blue-300">Xem Nhật ký kiểm định của dự án này</Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

