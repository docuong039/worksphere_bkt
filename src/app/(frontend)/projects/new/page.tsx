/**
 * Create Project Page
 * 
 * User Stories:
 * - US-MNG-01-01: PM tạo dự án mới (Name, Code, Dates, Description)
 * - US-MNG-01-02: PM thêm thành viên ban đầu vào dự án
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    FolderPlus,
    Calendar,
    Users,
    Info,
    CheckCircle2,
    Search,
    Loader2,
    X
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface User {
    id: string;
    full_name: string;
    email: string;
}

export default function NewProjectPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    // Form States
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    // Data States
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch Users for member selection
    useEffect(() => {
        const fetchUsers = async () => {
            if (!user) return;
            setLoadingUsers(true);
            try {
                // Fetching users from the Admin Users API
                const res = await fetch('/api/admin/users', {
                    headers: {
                        'x-user-id': user.id,
                        'x-user-role': user.role || ''
                    }
                });
                const data = await res.json();
                setAvailableUsers(data.data || []);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [user]);

    // Validation
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'Tên dự án là bắt buộc';
        if (!code.trim()) newErrors.code = 'Mã dự án (Code) là bắt buộc';
        if (code.trim().length > 10) newErrors.code = 'Mã dự án không được quá 10 ký tự';
        if (!startDate) newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({
                    name: name.trim(),
                    code: code.trim().toUpperCase(),
                    description: description.trim(),
                    start_date: startDate,
                    end_date: endDate,
                    members: selectedMemberIds
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create project');
            }

            // Redirect to projects list on success
            router.push('/projects');
        } catch (error: any) {
            console.error('Error creating project:', error);
            setErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = availableUsers.filter(u =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleMember = (id: string) => {
        setSelectedMemberIds(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700" data-testid="new-project-container">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild className="-ml-4 h-10 w-10 p-0 rounded-full hover:bg-slate-100">
                            <Link href="/projects">
                                <ChevronLeft className="h-6 w-6" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight" data-testid="new-project-title">
                                Tạo Dự Án Mới
                            </h1>
                            <p className="text-sm font-medium text-slate-500">Thiết lập nền móng cho thành công của dự án.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Information */}
                    <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                                <Info className="h-5 w-5 text-blue-600" />
                                Thông tin cơ bản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Tên dự án <span className="text-rose-500">*</span></label>
                                    <Input
                                        placeholder="Ví dụ: Hệ thống Quản trị Worksphere v2.0"
                                        className={cn("h-12 text-base font-semibold rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all", errors.name && "border-rose-300 bg-rose-50")}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        data-testid="input-project-name"
                                    />
                                    {errors.name && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight pl-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mã dự án (Code) <span className="text-rose-500">*</span></label>
                                    <Input
                                        placeholder="Ví dụ: WS-2025"
                                        className={cn("h-12 text-base font-black uppercase rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all", errors.code && "border-rose-300 bg-rose-50")}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        data-testid="input-project-code"
                                    />
                                    {errors.code && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight pl-1">{errors.code}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ngày bắt đầu <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <Input
                                            type="date"
                                            className={cn("h-12 pl-12 text-sm font-bold rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all", errors.startDate && "border-rose-300 bg-rose-50")}
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            data-testid="input-start-date"
                                        />
                                    </div>
                                    {errors.startDate && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight pl-1">{errors.startDate}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ngày kết thúc (Dự kiến)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <Input
                                            type="date"
                                            className={cn("h-12 pl-12 text-sm font-bold rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all", errors.endDate && "border-rose-300 bg-rose-50")}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            data-testid="input-end-date"
                                        />
                                    </div>
                                    {errors.endDate && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight pl-1">{errors.endDate}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mô tả dự án</label>
                                <Textarea
                                    placeholder="Nêu mục tiêu chính và phạm vi của dự án..."
                                    className="min-h-[120px] text-sm font-medium rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all p-4"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    data-testid="project-new-input-description"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Member Selection */}
                    <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                                <Users className="h-5 w-5 text-blue-600" />
                                Thành viên tham gia
                            </CardTitle>
                            <Badge className="bg-blue-100 text-blue-700 border-none font-black px-3 py-1">
                                {selectedMemberIds.length} Đã chọn
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Tìm kiếm theo tên hoặc email nhân viên..."
                                    className="h-12 pl-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-blue-500/30 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    data-testid="search-members"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar" data-testid="members-list">
                                {loadingUsers ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                                    ))
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => (
                                        <div
                                            key={u.id}
                                            onClick={() => toggleMember(u.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer select-none group",
                                                selectedMemberIds.includes(u.id)
                                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                                    : "bg-white border-slate-100 hover:border-blue-100 hover:bg-slate-50/50"
                                            )}
                                            data-testid={`member-item-${u.id}`}
                                        >
                                            <div className="relative">
                                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs uppercase">
                                                        {u.full_name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {selectedMemberIds.includes(u.id) && (
                                                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-sm font-bold truncate", selectedMemberIds.includes(u.id) ? "text-blue-700" : "text-slate-900")}>
                                                    {u.full_name}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter">
                                                    {u.email}
                                                </p>
                                            </div>
                                            <Checkbox
                                                checked={selectedMemberIds.includes(u.id)}
                                                className="rounded-full h-5 w-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <X size={32} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-sm font-bold text-slate-400">Không tìm thấy thành viên phù hợp</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submission Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-2">
                            Luôn kiểm tra kỹ thông tin trước khi tạo
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                asChild
                                className="h-12 px-8 font-bold text-slate-500 hover:text-slate-900 rounded-xl"
                            >
                                <Link href="/projects">Hủy bỏ</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 group"
                                data-testid="btn-submit-project"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Đang khởi tạo...
                                    </>
                                ) : (
                                    <>
                                        <FolderPlus className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                                        Khởi Tạo Dự Án
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
