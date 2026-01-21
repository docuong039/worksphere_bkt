'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    ArrowLeft,
    User,
    Briefcase,
    TrendingUp,
    Calendar,
    DollarSign,
    Award,
    Star,
    LogIn,
    LogOut,
    FileText,
    Clock,
    CheckCircle2,
    MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface TimelineEvent {
    id: string;
    type: 'JOIN' | 'PROMOTION' | 'SALARY_CHANGE' | 'PROJECT_JOIN' | 'PROJECT_LEAVE' | 'AWARD' | 'CONTRACT' | 'LEAVE';
    title: string;
    description: string;
    date: string;
    metadata?: Record<string, any>;
}

interface EmployeeProfile {
    id: string;
    full_name: string;
    email: string;
    position: string;
    department: string;
    level: string;
    join_date: string;
    status: 'ACTIVE' | 'DEACTIVATED';
    current_salary: number;
    total_projects: number;
    years_of_service: number;
}

export default function EmployeeTimelinePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: employeeId } = use(params);
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

    useEffect(() => {
        fetchData();
    }, [employeeId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Mock data - US-CEO-01-02
            const mockProfile: EmployeeProfile = {
                id: employeeId,
                full_name: 'Nguyễn Văn A',
                email: 'nguyen.a@company.com',
                position: 'Senior Developer',
                department: 'Engineering',
                level: 'Senior',
                join_date: '2022-03-15',
                status: 'ACTIVE',
                current_salary: 35000000,
                total_projects: 8,
                years_of_service: 2.8,
            };

            const mockTimeline: TimelineEvent[] = [
                {
                    id: 't1', type: 'JOIN', title: 'Gia nhập công ty',
                    description: 'Bắt đầu làm việc với vị trí Junior Developer',
                    date: '2022-03-15', metadata: { position: 'Junior Developer', level: 'Junior' }
                },
                {
                    id: 't2', type: 'PROJECT_JOIN', title: 'Tham gia dự án Website Redesign',
                    description: 'Được phân công vào dự án đầu tiên',
                    date: '2022-04-01', metadata: { project_name: 'Website Redesign' }
                },
                {
                    id: 't3', type: 'SALARY_CHANGE', title: 'Điều chỉnh lương sau thử việc',
                    description: 'Tăng lương từ 12M lên 15M/tháng',
                    date: '2022-06-15', metadata: { old_salary: 12000000, new_salary: 15000000, change: 25 }
                },
                {
                    id: 't4', type: 'PROMOTION', title: 'Thăng chức lên Middle Developer',
                    description: 'Hoàn thành xuất sắc các mục tiêu 6 tháng đầu',
                    date: '2023-01-10', metadata: { old_level: 'Junior', new_level: 'Middle' }
                },
                {
                    id: 't5', type: 'SALARY_CHANGE', title: 'Điều chỉnh lương năm 2023',
                    description: 'Tăng lương từ 15M lên 25M/tháng (+67%)',
                    date: '2023-01-10', metadata: { old_salary: 15000000, new_salary: 25000000, change: 67 }
                },
                {
                    id: 't6', type: 'PROJECT_JOIN', title: 'Tham gia dự án Worksphere Platform',
                    description: 'Được chuyển sang dự án chiến lược của công ty',
                    date: '2023-06-01', metadata: { project_name: 'Worksphere Platform' }
                },
                {
                    id: 't7', type: 'AWARD', title: 'Nhân viên xuất sắc Q3/2023',
                    description: 'Được vinh danh nhân viên xuất sắc quý',
                    date: '2023-10-15', metadata: { award_name: 'Employee of the Quarter' }
                },
                {
                    id: 't8', type: 'PROMOTION', title: 'Thăng chức lên Senior Developer',
                    description: 'Đạt được các tiêu chí Senior sau 1.5 năm',
                    date: '2024-01-15', metadata: { old_level: 'Middle', new_level: 'Senior' }
                },
                {
                    id: 't9', type: 'SALARY_CHANGE', title: 'Điều chỉnh lương năm 2024',
                    description: 'Tăng lương lên 35M/tháng (+40%)',
                    date: '2024-01-15', metadata: { old_salary: 25000000, new_salary: 35000000, change: 40 }
                },
                {
                    id: 't10', type: 'CONTRACT', title: 'Ký hợp đồng không thời hạn',
                    description: 'Chuyển từ hợp đồng 1 năm sang không thời hạn',
                    date: '2024-03-15', metadata: { contract_type: 'UNLIMITED' }
                },
            ];

            setProfile(mockProfile);
            setTimeline(mockTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'JOIN': return <LogIn className="h-5 w-5 text-emerald-600" />;
            case 'LEAVE': return <LogOut className="h-5 w-5 text-red-600" />;
            case 'PROMOTION': return <TrendingUp className="h-5 w-5 text-purple-600" />;
            case 'SALARY_CHANGE': return <DollarSign className="h-5 w-5 text-green-600" />;
            case 'PROJECT_JOIN': return <Briefcase className="h-5 w-5 text-blue-600" />;
            case 'PROJECT_LEAVE': return <Briefcase className="h-5 w-5 text-slate-400" />;
            case 'AWARD': return <Award className="h-5 w-5 text-amber-500" />;
            case 'CONTRACT': return <FileText className="h-5 w-5 text-indigo-600" />;
            default: return <Calendar className="h-5 w-5 text-slate-400" />;
        }
    };

    const getEventBgColor = (type: string) => {
        switch (type) {
            case 'JOIN': return 'bg-emerald-100';
            case 'LEAVE': return 'bg-red-100';
            case 'PROMOTION': return 'bg-purple-100';
            case 'SALARY_CHANGE': return 'bg-green-100';
            case 'PROJECT_JOIN': case 'PROJECT_LEAVE': return 'bg-blue-100';
            case 'AWARD': return 'bg-amber-100';
            case 'CONTRACT': return 'bg-indigo-100';
            default: return 'bg-slate-100';
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="employee-timeline-page">
                {/* Header */}
                <div>
                    <Button variant="ghost" asChild className="-ml-4 mb-4 text-slate-500">
                        <Link href="/hr-management">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại Quản lý nhân sự
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                        <User className="inline-block mr-3 h-8 w-8 text-blue-600" />
                        Lịch sử làm việc
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Timeline career path của nhân sự (US-CEO-01-02)
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-4" data-testid="loading-skeleton">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                ) : profile && (
                    <>
                        {/* Profile Card */}
                        <Card className="border-none shadow-sm" data-testid="profile-card">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <Avatar className="h-20 w-20">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                                            {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold text-slate-900" data-testid="profile-name">
                                                {profile.full_name}
                                            </h2>
                                            <Badge className={profile.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                                {profile.status === 'ACTIVE' ? 'Đang làm' : 'Đã nghỉ'}
                                            </Badge>
                                        </div>
                                        <p className="text-slate-600 mb-4">{profile.position} • {profile.department}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500">Ngày vào</p>
                                                <p className="font-medium">{formatDate(profile.join_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Thâm niên</p>
                                                <p className="font-medium">{profile.years_of_service} năm</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Lương hiện tại</p>
                                                <p className="font-medium text-emerald-600">{formatCurrency(profile.current_salary)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Số dự án</p>
                                                <p className="font-medium">{profile.total_projects}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card className="border-none shadow-sm" data-testid="timeline-card">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    Timeline sự nghiệp
                                </CardTitle>
                                <CardDescription>Lịch sử thăng tiến và thay đổi trong quá trình làm việc</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="relative" data-testid="timeline-list">
                                    {/* Timeline line */}
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

                                    {/* Events */}
                                    <div className="space-y-6">
                                        {timeline.map((event, index) => (
                                            <div key={event.id} className="relative flex gap-4" data-testid={`timeline-event-${event.id}`}>
                                                {/* Icon */}
                                                <div className={`relative z-10 h-12 w-12 rounded-full ${getEventBgColor(event.type)} flex items-center justify-center shrink-0`}>
                                                    {getEventIcon(event.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 pt-1.5 pb-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="font-bold text-slate-900" data-testid={`event-title-${event.id}`}>
                                                                {event.title}
                                                            </p>
                                                            <p className="text-sm text-slate-600 mt-0.5">{event.description}</p>

                                                            {/* Metadata badges */}
                                                            {event.metadata && (
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {event.type === 'SALARY_CHANGE' && (
                                                                        <Badge className="bg-green-100 text-green-700">
                                                                            +{event.metadata.change}%
                                                                        </Badge>
                                                                    )}
                                                                    {event.type === 'PROMOTION' && (
                                                                        <Badge className="bg-purple-100 text-purple-700">
                                                                            {event.metadata.old_level} → {event.metadata.new_level}
                                                                        </Badge>
                                                                    )}
                                                                    {event.type === 'PROJECT_JOIN' && (
                                                                        <Badge variant="outline">
                                                                            {event.metadata.project_name}
                                                                        </Badge>
                                                                    )}
                                                                    {event.type === 'AWARD' && (
                                                                        <Badge className="bg-amber-100 text-amber-700">
                                                                            <Star className="h-3 w-3 mr-1" />
                                                                            {event.metadata.award_name}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-400 whitespace-nowrap">
                                                            {formatDate(event.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
