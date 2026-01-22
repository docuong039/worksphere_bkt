'use client';

import React, { useState, useEffect } from 'react';
import {
    Building2,
    Clock,
    Tag,
    Save,
    Plus,
    Trash2,
    Shield,
    Upload,
    Globe,
    Calendar,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Infinity,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorkspaceSettingsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [orgName, setOrgName] = useState('My Awesome Company');
    const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
    const [autoLockEnabled, setAutoLockEnabled] = useState(true);
    const [lockDay, setLockDay] = useState('SUNDAY');

    // Dynamic Categories State
    const [projectTypes, setProjectTypes] = useState(['Software', 'Marketing', 'Legal']);
    const [skillGroups, setSkillGroups] = useState(['Frontend', 'Backend', 'DevOps', 'Design']);

    // Schedule State (US-ORG-03-02)
    const [workDays, setWorkDays] = useState(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('17:30');
    const [dailyHours, setDailyHours] = useState(8);

    // Upload State
    const [logo, setLogo] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const isOrgAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';

    useEffect(() => {
        // Mock loading
        setTimeout(() => setLoading(false), 800);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/workspace/settings', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({
                    orgName,
                    timezone,
                    autoLockEnabled,
                    lockDay,
                    projectTypes,
                    skillGroups,
                    logo,
                    // Schedule
                    workDays,
                    startTime,
                    endTime,
                    dailyHours
                })
            });
            if (res.ok) {
                // Show success toast or similar
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        // Mock upload logic
        setTimeout(() => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
                setUploading(false);
            };
            reader.readAsDataURL(file);
        }, 1500);
    };

    const addCategory = (type: 'PROJECT' | 'SKILL') => {
        const name = prompt(`Nhập tên ${type === 'PROJECT' ? 'loại dự án' : 'nhóm kỹ năng'} mới:`);
        if (!name) return;
        if (type === 'PROJECT') setProjectTypes([...projectTypes, name]);
        else setSkillGroups([...skillGroups, name]);
    };

    const removeCategory = (type: 'PROJECT' | 'SKILL', index: number) => {
        if (type === 'PROJECT') setProjectTypes(projectTypes.filter((_, i) => i !== index));
        else setSkillGroups(skillGroups.filter((_, i) => i !== index));
    };

    const toggleWorkDay = (day: string) => {
        if (workDays.includes(day)) {
            setWorkDays(workDays.filter(d => d !== day));
        } else {
            setWorkDays([...workDays, day]);
        }
    };

    if (!isOrgAdmin) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-32 text-center h-[70vh]">
                    <Shield size={48} className="text-slate-200 mb-6" />
                    <h2 className="text-2xl font-black text-slate-900">Truy cập bị hạn chế</h2>
                    <p className="text-slate-500 mt-2 max-w-xs font-medium">Cài đặt không gian làm việc chỉ có thể được quản lý bởi Quản trị viên tổ chức.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-700" data-testid="workspace-settings-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight" data-testid="workspace-settings-title">
                            Cấu hình không gian làm việc
                        </h1>
                        <p className="text-slate-500 font-medium">Tùy chỉnh hệ thống theo quy trình làm việc và thương hiệu riêng của tổ chức bạn.</p>
                    </div>

                    <Button
                        className="bg-blue-600 hover:bg-blue-700 h-11 px-8 font-bold shadow-lg shadow-blue-100"
                        onClick={handleSave}
                        disabled={isSaving}
                        data-testid="save-workspace-btn"
                    >
                        {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Lưu tất cả thay đổi</>}
                    </Button>
                </div>

                <Tabs defaultValue="general" className="space-y-8">
                    <TabsList className="bg-slate-100/50 p-1 h-12 rounded-xl border border-slate-100 w-full md:w-auto" data-testid="settings-tabs">
                        <TabsTrigger value="general" className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Chung</TabsTrigger>
                        <TabsTrigger value="schedule" className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Lịch làm việc</TabsTrigger>
                        <TabsTrigger value="automation" className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Tự động hóa</TabsTrigger>
                        <TabsTrigger value="customization" className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Tùy chỉnh</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-8 animate-in fade-in duration-500">
                        {/* Branding Card */}
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="pb-2 border-b border-slate-50">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Building2 size={18} className="text-blue-600" /> Thương hiệu & Nhận diện
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-8">
                                <div className="flex flex-col md:flex-row gap-12">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logo Không gian</label>
                                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('logo-upload')?.click()}>
                                            <div className="w-32 h-32 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all overflow-hidden">
                                                {uploading ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : logo ? (
                                                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Upload size={32} />
                                                )}
                                            </div>
                                            <input
                                                id="logo-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                            />
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-blue-600 border border-slate-100">
                                                <Plus size={20} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Tên hiển thị tổ chức</label>
                                            <Input
                                                value={orgName}
                                                onChange={(e) => setOrgName(e.target.value)}
                                                className="h-11 font-bold border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500"
                                                data-testid="input-org-name"
                                            />
                                            <p className="text-[10px] text-slate-400 font-medium italic">Tên này sẽ xuất hiện trên các báo cáo và thông báo.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                                                <Globe size={14} className="text-slate-400" /> Múi giờ khu vực
                                            </label>
                                            <Select value={timezone} onValueChange={setTimezone}>
                                                <SelectTrigger className="h-11 font-bold border-slate-200 rounded-xl" data-testid="select-timezone">
                                                    <SelectValue placeholder="Chọn múi giờ" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</SelectItem>
                                                    <SelectItem value="America/New_York">Eastern Time (GMT-5)</SelectItem>
                                                    <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                                                    <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-8 animate-in fade-in duration-500">
                        <Card className="border-none shadow-sm bg-white overflow-hidden" data-testid="card-working-schedule">
                            <CardHeader className="pb-2 border-b border-slate-50">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Calendar size={18} className="text-blue-600" /> Cấu hình ngày & giờ làm việc (US-ORG-03-02)
                                </CardTitle>
                                <CardDescription className="text-slate-500">
                                    Thiết lập này ảnh hưởng đến việc tính công, KPI năng suất và cảnh báo trễ hạn.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-8">
                                {/* Working Days */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Ngày làm việc trong tuần</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { key: 'MONDAY', label: 'T2' },
                                            { key: 'TUESDAY', label: 'T3' },
                                            { key: 'WEDNESDAY', label: 'T4' },
                                            { key: 'THURSDAY', label: 'T5' },
                                            { key: 'FRIDAY', label: 'T6' },
                                            { key: 'SATURDAY', label: 'T7' },
                                            { key: 'SUNDAY', label: 'CN' },
                                        ].map((day) => {
                                            const isActive = workDays.includes(day.key);
                                            return (
                                                <div
                                                    key={day.key}
                                                    onClick={() => toggleWorkDay(day.key)}
                                                    className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm cursor-pointer transition-all border-2",
                                                        isActive
                                                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                                                            : "bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200"
                                                    )}
                                                    data-testid={`day-${day.key}`}
                                                >
                                                    {day.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic">
                                        Các ngày không được chọn sẽ được tính là ngày nghỉ (không tính vào công chuẩn).
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-50 pt-8">
                                    {/* Daily Hours */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                                            <Clock size={14} className="text-slate-400" /> Giờ công chuẩn / ngày
                                        </label>
                                        <Input
                                            type="number"
                                            value={dailyHours}
                                            onChange={(e) => setDailyHours(Number(e.target.value))}
                                            className="h-11 font-bold border-slate-200 rounded-xl"
                                        />
                                    </div>

                                    {/* Start Time */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Giờ bắt đầu</label>
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="h-11 font-bold border-slate-200 rounded-xl"
                                        />
                                    </div>

                                    {/* End Time */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Giờ kết thúc</label>
                                        <Input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="h-11 font-bold border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="automation" className="space-y-8 animate-in fade-in duration-500">
                        {/* Auto-Lock Settings */}
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="pb-2 border-b border-slate-50">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Clock size={18} className="text-blue-600" /> Quản trị thời gian (Khóa tự động)
                                </CardTitle>
                                <CardDescription className="text-slate-500">Tự động chốt nhật ký thời gian để đảm bảo tính toàn vẹn của dữ liệu lương.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-8">
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900">Kích hoạt khóa tự động định kỳ</p>
                                        <p className="text-xs font-medium text-slate-500">Tự động khóa nhật ký của tuần trước vào mỗi tuần.</p>
                                    </div>
                                    <Switch
                                        checked={autoLockEnabled}
                                        onCheckedChange={setAutoLockEnabled}
                                        data-testid="toggle-autolock"
                                    />
                                </div>

                                {autoLockEnabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" /> Khóa vào mỗi
                                            </label>
                                            <Select value={lockDay} onValueChange={setLockDay}>
                                                <SelectTrigger className="h-11 font-bold border-slate-200 rounded-xl" data-testid="select-lock-day">
                                                    <SelectValue placeholder="Chọn ngày" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SUNDAY">Tối Chủ Nhật</SelectItem>
                                                    <SelectItem value="MONDAY">Sáng Thứ Hai</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-4">
                                            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                                            <p className="text-[11px] font-semibold text-blue-800 leading-relaxed">
                                                Lần khóa tự động tiếp theo dự kiến vào <span className="font-black italic underline">Chủ Nhật tới, nửa đêm</span>.
                                                Đảm bảo tất cả nhân viên đã gửi báo cáo trước thời điểm này.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="customization" className="space-y-8 animate-in fade-in duration-500">
                        {/* Custom Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border-none shadow-sm bg-white overflow-hidden">
                                <CardHeader className="pb-4 border-b border-slate-50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-md font-bold flex items-center gap-2">
                                        <Tag size={18} className="text-blue-600" /> Loại dự án
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-600"
                                        data-testid="add-project-type"
                                        onClick={() => addCategory('PROJECT')}
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {projectTypes.map((type, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl group transition-all">
                                            <span className="text-sm font-bold text-slate-700">{type}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-all"
                                                onClick={() => removeCategory('PROJECT', i)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white overflow-hidden">
                                <CardHeader className="pb-4 border-b border-slate-50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-md font-bold flex items-center gap-2">
                                        <Users size={18} className="text-blue-600" /> Nhóm kỹ năng
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-600"
                                        data-testid="add-skill-group"
                                        onClick={() => addCategory('SKILL')}
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {skillGroups.map((skill, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl group transition-all">
                                            <span className="text-sm font-bold text-slate-700">{skill}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-all"
                                                onClick={() => removeCategory('SKILL', i)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Note */}
                        <div className="p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3 text-amber-400">
                                    <Infinity size={24} />
                                    <h4 className="text-lg font-black uppercase tracking-widest">Tính linh hoạt của Doanh nghiệp</h4>
                                </div>
                                <p className="text-sm font-semibold text-slate-400 max-w-2xl leading-relaxed">
                                    Các danh mục này sẽ xuất hiện trên toàn bộ không gian làm việc trong các bộ lọc, báo cáo và khi tạo tài nguyên mới.
                                    Việc tiêu chuẩn hóa các danh mục ngay bây giờ sẽ đảm bảo việc trực quan hóa dữ liệu sạch hơn ở cấp độ CEO sau này.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-1000"></div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
