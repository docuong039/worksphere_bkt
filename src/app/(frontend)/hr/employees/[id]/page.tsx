'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Mail, Phone, MapPin, Briefcase, Calendar, Star, Building,
    Award, ArrowLeft, FileText, Download, User, DollarSign,
    RefreshCw, Save, Clock, History, LayoutPanelLeft
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { PERMISSIONS } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function EmployeeProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const employeeId = params.id as string;
    const { user, hasPermission } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<any>(null);
    const [compensation, setCompensation] = useState<any>(null);
    const [jobLevels, setJobLevels] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Form states for compensation
    const [compForm, setCompForm] = useState({
        monthly_salary: '',
        hourly_cost_rate: '',
        level_id: '',
        effective_from: new Date().toISOString().split('T')[0]
    });

    const isOrgAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';
    const isPM = user?.role === 'PROJECT_MANAGER';
    const canEditCompensation = hasPermission(PERMISSIONS.COMPENSATION_UPDATE);
    const canEditProfile = isOrgAdmin; // PM cannot edit profile info

    useEffect(() => {
        fetchData();
    }, [employeeId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Employee Profile
            const empRes = await fetch(`/api/hr/employees/${employeeId}`);
            if (empRes.status === 403) {
                toast({ variant: 'destructive', title: 'Truy cập bị chặn', description: 'Bạn không có quyền xem nhân sự ngoài dự án của mình.' });
                router.push('/hr/employees');
                return;
            }
            const empData = await empRes.json();
            if (empData.success) {
                setEmployee(empData.data);
            } else {
                toast({ variant: 'destructive', title: 'Lỗi', description: 'Không tìm thấy nhân viên' });
                router.push('/hr/employees');
                return;
            }

            // 2. Fetch Job Levels (for dropdown)
            const levelsRes = await fetch('/api/hr/job-levels');
            const levelsData = await levelsRes.json();
            if (levelsData.success) setJobLevels(levelsData.data);

            // 3. Fetch Compensation (Protected)
            if (hasPermission(PERMISSIONS.COMPENSATION_READ)) {
                const compRes = await fetch('/api/hr/compensations');
                const compData = await compRes.json();
                if (compData.success) {
                    const userComp = compData.data.find((c: any) => c.user_id === employeeId);
                    if (userComp) {
                        setCompensation(userComp);
                        setCompForm({
                            monthly_salary: userComp.monthly_salary.toString(),
                            hourly_cost_rate: userComp.hourly_cost_rate.toString(),
                            level_id: userComp.level_id,
                            effective_from: new Date().toISOString().split('T')[0]
                        });
                    }
                }
            }

            // 4. Fetch Activities (Scoped for PM in managed projects)
            const actRes = await fetch(`/api/activity?userId=${employeeId}`);
            const actData = await actRes.json();
            if (actData.success) {
                setActivities(actData.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCompensation = async () => {
        setIsSaving(true);
        try {
            // US-MNG-03-02: Update salary/level with effective dating logic
            const res = await fetch(`/api/hr/compensations/${compensation?.id || 'new'}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...compForm,
                    user_id: employeeId,
                })
            });
            const result = await res.json();
            if (result.success) {
                toast({ title: 'Thành công', description: 'Đã cập nhật lương & cấp bậc (Lịch sử đã được ghi nhận)' });
                fetchData();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể cập nhật lương' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="p-8 space-y-4">
                    <div className="h-32 w-full bg-slate-100 animate-pulse rounded-2xl" />
                    <div className="grid grid-cols-3 gap-6">
                        <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
                        <div className="col-span-2 h-64 bg-slate-100 animate-pulse rounded-xl" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" data-testid="employee-profile-container">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" className="pl-0 hover:pl-2 transition-all font-bold text-slate-600" asChild>
                        <Link href="/hr/employees">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
                        </Link>
                    </Button>
                </div>

                {/* Profile Header Card */}
                <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-r from-slate-800 to-indigo-900 text-white" data-testid="employee-profile-header">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <Avatar className="h-32 w-32 border-4 border-white/20 shadow-xl">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employeeId}`} />
                                <AvatarFallback className="text-4xl bg-white/10 text-white">EM</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black" data-testid="emp-detail-name">{employee?.full_name}</h1>
                                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-none font-bold" data-testid="emp-detail-status">
                                        {employee?.member_status}
                                    </Badge>
                                </div>
                                <p className="text-indigo-100 text-lg flex items-center gap-2 font-medium" data-testid="emp-detail-position">
                                    <Briefcase className="h-4 w-4" /> {employee?.position}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-indigo-200 mt-4 font-medium">
                                    <div className="flex items-center gap-2" data-testid="emp-detail-email">
                                        <Mail className="h-4 w-4 opacity-70" /> {employee?.email}
                                    </div>
                                    <div className="flex items-center gap-2" data-testid="emp-detail-phone">
                                        <Phone className="h-4 w-4 opacity-70" /> {employee?.phone || '09xx-xxx-xxx'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 opacity-70" /> {employee?.department}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                {canEditProfile && (
                                    <>
                                        <Button variant="secondary" className="bg-white text-indigo-900 hover:bg-slate-100 font-bold" data-testid="btn-edit-profile">
                                            Chỉnh sửa hồ sơ
                                        </Button>
                                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold" asChild data-testid="btn-view-general-timeline">
                                            <Link href={`/hr/employees/${employeeId}/timeline`}>
                                                Xem lịch sử tổng quát
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6" data-testid="profile-tabs">
                    <TabsList className="bg-slate-100 p-1 border border-slate-200 rounded-xl w-full md:w-auto grid grid-cols-3 md:inline-flex shrink-0">
                        <TabsTrigger value="overview" data-testid="tab-trigger-overview" className="font-bold rounded-lg px-6">Hồ sơ</TabsTrigger>
                        <TabsTrigger value="activity" data-testid="tab-trigger-activity" className="font-bold rounded-lg px-6">Hoạt động dự án</TabsTrigger>
                        <PermissionGuard permission={PERMISSIONS.COMPENSATION_READ}>
                            <TabsTrigger value="compensation" data-testid="tab-trigger-compensation" className="font-bold rounded-lg px-6">Lương & Cấp bậc</TabsTrigger>
                        </PermissionGuard>
                    </TabsList>

                    {/* Tab: Overview (Read-only for PM) */}
                    <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-6 col-span-1">
                                <Card data-testid="card-profile-info" className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2 font-black">
                                            <User className="h-4 w-4 text-blue-600" /> Thông tin cơ bản
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</p>
                                            <p className="font-bold text-slate-900" data-testid="display-full-name">{employee?.full_name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phòng ban</p>
                                            <p className="font-bold text-slate-900">{employee?.department}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày gia nhập</p>
                                            <p className="font-bold text-slate-900 flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" /> {employee?.joined_at || '15/01/2024'}
                                            </p>
                                        </div>
                                        {isPM && (
                                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 font-bold leading-tight">
                                                LƯU Ý: Với vai trò PM, bạn chỉ xem được hồ sơ năng lực để phân công công việc. Mọi thay đổi thông tin cá nhân phải thông qua Org Admin.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card data-testid="card-skills" className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2 font-black">
                                            <Star className="h-4 w-4 text-amber-500" /> Kỹ năng & Chuyên môn
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {['ReactJS', 'Next.js', 'PostgreSQL', 'UI/UX Design', 'Agile/Scrum'].map(skill => (
                                                <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold px-3 py-1">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="md:col-span-2 space-y-6">
                                <Card data-testid="card-performance-summary" className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2 font-black">
                                            <Award className="h-4 w-4 text-purple-600" /> Hiệu suất trong dự án
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-3 gap-6">
                                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Tỉ lệ Done</p>
                                            <p className="text-3xl font-black text-blue-900 mt-1">94%</p>
                                        </div>
                                        <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Xếp hạng</p>
                                            <p className="text-3xl font-black text-emerald-900 mt-1">A+</p>
                                        </div>
                                        <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Uy tín</p>
                                            <p className="text-3xl font-black text-amber-900 mt-1">Tier 1</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card data-testid="card-bio" className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base font-black">Bio / Giới thiệu</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Chuyên gia phát triển ứng dụng với thế mạnh về tối ưu hóa hệ thống.
                                            Yêu thích việc giải quyết các bài toán phức tạp và xây dựng đội ngũ làm việc bền bỉ.
                                            Đã đóng góp cho hơn 10 dự án lớn nhỏ trong 3 năm qua.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Project Activity (US-MNG-04-01: Activity Feed scoped for PM) */}
                    <TabsContent value="activity" className="animate-in fade-in duration-300">
                        <Card className="border-none shadow-sm" data-testid="card-activity-history">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-black">
                                    <History className="h-5 w-5 text-indigo-600" /> Nhật ký hoạt động tại dự án của bạn
                                </CardTitle>
                                <CardDescription>Ghi nhận tiến độ và các thay đổi quan trọng của nhân sự này</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                    {activities.length > 0 ? activities.map((act, idx) => (
                                        <div key={idx} className="relative flex items-center justify-between gap-6" data-testid={`activity-item-${idx}`}>
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "absolute left-0 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm",
                                                    act.event_type.includes('DONE') ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                                                )}>
                                                    <LayoutPanelLeft size={16} />
                                                </div>
                                                <div className="ml-12">
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {act.summary.replace(employee?.full_name, 'Đã')}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-1">
                                                        <Clock size={12} /> {act.created_at}
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                        <span className="text-indigo-600 font-bold">{act.project_name}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10">
                                            <p className="text-slate-400 font-bold italic">Chưa có hoạt động nào được ghi nhận trong các dự án bạn quản lý.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Compensation (US-MNG-03-02: Salary & Level management) */}
                    <TabsContent value="compensation" className="animate-in fade-in duration-300">
                        <Card className="border-none shadow-sm" data-testid="card-compensation-details">
                            <CardHeader className="border-b border-slate-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 font-black">
                                            <DollarSign className="h-5 w-5 text-emerald-600" /> Tài chính & Cấp bậc
                                        </CardTitle>
                                        <CardDescription>PM điều chỉnh đơn giá nhân công để quản lý ngân sách dự án (US-MNG-03-02)</CardDescription>
                                    </div>
                                    {canEditCompensation && (
                                        <Button
                                            onClick={handleSaveCompensation}
                                            disabled={isSaving}
                                            className="bg-emerald-600 hover:bg-emerald-700 font-bold h-11 px-6 shadow-lg shadow-emerald-100"
                                            data-testid="btn-save-compensation"
                                        >
                                            {isSaving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Lưu cấu hình chi phí
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chuyên môn (Internal level)</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Cấp bậc chuyên môn</label>
                                            <Select
                                                value={compForm.level_id}
                                                onValueChange={(v) => setCompForm({ ...compForm, level_id: v })}
                                                disabled={!canEditCompensation}
                                            >
                                                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none font-bold" data-testid="select-level-trigger">
                                                    <SelectValue placeholder="Chọn cấp bậc" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {jobLevels.map(lv => (
                                                        <SelectItem key={lv.id} value={lv.id} data-testid={`level-option-${lv.code}`}>
                                                            {lv.name} ({lv.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn giá nhân công (Cost Rate)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Lương tháng tham chiếu</label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={compForm.monthly_salary}
                                                        onChange={(e) => setCompForm({ ...compForm, monthly_salary: e.target.value })}
                                                        disabled={!canEditCompensation}
                                                        className="h-12 rounded-2xl bg-slate-50 border-none pr-12 font-black text-emerald-700"
                                                        data-testid="input-monthly-salary"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VND</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Đơn giá giờ (Cost/h)</label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={compForm.hourly_cost_rate}
                                                        onChange={(e) => setCompForm({ ...compForm, hourly_cost_rate: e.target.value })}
                                                        disabled={!canEditCompensation}
                                                        className="h-12 rounded-2xl bg-slate-50 border-none pr-12 font-black text-blue-700"
                                                        data-testid="input-hourly-rate"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VND</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                                            <Clock className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h5 className="font-black text-blue-900 text-sm">Hiệu lực & Tính minh bạch (Auditability)</h5>
                                            <p className="text-xs text-blue-700 mt-1 leading-relaxed font-medium">
                                                Hệ thống áp dụng **Effective Dating**. Mức lương mới sẽ chỉ áp dụng cho các ghi nhận công việc từ ngày hiệu lực trở đi.
                                                Dữ liệu chi phí của các kỳ làm việc đã chốt lịch sử sẽ không bị ảnh hưởng, đảm bảo báo cáo tài chính dự án luôn chính xác.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Ngày áp dụng</label>
                                            <Input
                                                type="date"
                                                value={compForm.effective_from}
                                                onChange={(e) => setCompForm({ ...compForm, effective_from: e.target.value })}
                                                disabled={!canEditCompensation}
                                                className="h-10 rounded-xl bg-white border-blue-200 text-sm font-black text-blue-900 px-4"
                                                data-testid="input-effective-date"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-dashed border-slate-100 flex justify-center">
                                    <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-300 border-slate-200 tracking-[0.2em] px-4 py-1">
                                        Resource Financial Data Access Point (US-MNG-03-03)
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <div className="h-20" /> {/* Spacer */}
        </AppLayout>
    );
}
