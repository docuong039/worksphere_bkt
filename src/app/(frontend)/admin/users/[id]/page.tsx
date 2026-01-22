/**
 * User Detail Profile Page (CEO/Org Admin View)
 * 
 * User Stories:
 * - US-CEO-01-02: Xem lịch sử làm việc trọn đời của nhân sự
 * - US-CEO-02-03: Tra cứu hồ sơ lý lịch và hợp đồng nhân sự
 * 
 * Access:
 * - CEO, ORG_ADMIN
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    FileText,
    Clock,
    Award,
    ChevronLeft,
    TrendingUp,
    Shield,
    Download,
    History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

// Mock Data Types
interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    status: 'ACTIVE' | 'LOCKED' | 'DEACTIVATED';
    joined_at: string;
    department: string;
    avatar_url?: string;
    bio?: string;
}

interface Contract {
    id: string;
    code: string;
    type: 'PROBATION' | 'OFFICIAL' | 'CONSULTANT';
    start_date: string;
    end_date: string | null;
    status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
    file_url?: string;
}

interface WorkHistoryEvent {
    id: string;
    date: string;
    type: 'JOINED' | 'PROMOTION' | 'PROJECT_ASSIGN' | 'AWARD' | 'ROLE_CHANGE';
    title: string;
    description: string;
}

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [history, setHistory] = useState<WorkHistoryEvent[]>([]);

    useEffect(() => {
        // Mock API Call
        setTimeout(() => {
            setProfile({
                id: params.id as string,
                full_name: 'Nguyễn Văn A',
                email: 'nguyen.van.a@company.com',
                phone: '0901234567',
                address: '123 Đường Láng, Hà Nội',
                role: 'PROJECT_MANAGER',
                status: 'ACTIVE',
                joined_at: '2023-01-15',
                department: 'Phát triển Sản phẩm',
                bio: 'Chuyên gia quản lý dự án với 5 năm kinh nghiệm trong lĩnh vực SaaS.'
            });

            setContracts([
                {
                    id: 'c1',
                    code: 'HĐLĐ-2024-001',
                    type: 'OFFICIAL',
                    start_date: '2024-01-15',
                    end_date: null, // Indefinite
                    status: 'ACTIVE'
                },
                {
                    id: 'c0',
                    code: 'HĐTV-2023-001',
                    type: 'PROBATION',
                    start_date: '2023-01-15',
                    end_date: '2024-01-14',
                    status: 'EXPIRED'
                }
            ]);

            setHistory([
                {
                    id: 'h1',
                    date: '2024-01-15',
                    type: 'PROMOTION',
                    title: 'Thăng chức: Project Manager',
                    description: 'Được bổ nhiệm vị trí PM chính thức sau đánh giá cuối năm.'
                },
                {
                    id: 'h2',
                    date: '2023-06-20',
                    type: 'PROJECT_ASSIGN',
                    title: 'Tham gia dự án: E-Commerce Mobile App',
                    description: 'Vai trò: Lead Developer.'
                },
                {
                    id: 'h3',
                    date: '2023-01-15',
                    type: 'JOINED',
                    title: 'Gia nhập công ty',
                    description: 'Vị trí: Senior Developer.'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, [params.id]);

    const handleBack = () => router.push('/admin/users');

    if (loading) {
        return (
            <AppLayout>
                <div className="space-y-6 max-w-5xl mx-auto">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex gap-6">
                        <Skeleton className="h-64 w-1/3 rounded-2xl" />
                        <Skeleton className="h-64 w-2/3 rounded-2xl" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!profile) return null;

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20" data-testid="user-detail-container">
                {/* Navigation */}
                <Button variant="ghost" className="text-slate-500 hover:text-slate-900 pl-0" onClick={handleBack} data-testid="btn-back-to-users">
                    <ChevronLeft size={20} className="mr-1" /> Quay lại danh sách nhân sự
                </Button>

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* ID Card */}
                    <Card className="w-full md:w-1/3 border-none shadow-sm overflow-hidden bg-white" data-testid="user-profile-card">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col items-center pt-8 pb-6">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-md mb-4">
                                <AvatarFallback className="text-3xl font-bold bg-blue-600 text-white">
                                    {profile.full_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl font-bold text-slate-900 text-center">
                                {profile.full_name}
                            </CardTitle>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="secondary" className="font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100">
                                    {profile.role.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className={cn(
                                    "font-semibold",
                                    profile.status === 'ACTIVE' ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-slate-500"
                                )}>
                                    {profile.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail size={16} className="text-slate-400" />
                                    <span>{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone size={16} className="text-slate-400" />
                                    <span>{profile.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin size={16} className="text-slate-400" />
                                    <span>{profile.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Briefcase size={16} className="text-slate-400" />
                                    <span>{profile.department}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span>Gia nhập: {new Date(profile.joined_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 mt-4">
                                <p className="text-xs text-slate-400 italic leading-relaxed">
                                    "{profile.bio}"
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Tabs */}
                    <div className="w-full md:w-2/3">
                        <Tabs defaultValue="history" className="w-full" data-testid="user-detail-tabs">
                            <TabsList className="bg-white border border-slate-100 p-1 rounded-xl mb-6 shadow-sm w-full justify-start">
                                <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-bold px-4 py-2" data-testid="tab-history">
                                    <History size={16} className="mr-2" /> Lịch sử làm việc
                                </TabsTrigger>
                                <TabsTrigger value="contracts" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-bold px-4 py-2" data-testid="tab-contracts">
                                    <FileText size={16} className="mr-2" /> Hợp đồng
                                </TabsTrigger>
                                <TabsTrigger value="performance" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-bold px-4 py-2" data-testid="tab-performance">
                                    <TrendingUp size={16} className="mr-2" /> Hiệu suất
                                </TabsTrigger>
                            </TabsList>

                            {/* Work History Content */}
                            <TabsContent value="history" className="space-y-6">
                                <Card className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <History size={20} className="text-blue-600" /> Hành trình sự nghiệp
                                        </CardTitle>
                                        <CardDescription>
                                            Toàn bộ lịch sử thăng tiến, điều chuyển và ghi nhận thành tích.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 py-2">
                                            {history.map((event) => (
                                                <div key={event.id} className="relative pl-8 group">
                                                    {/* Dot */}
                                                    <div className={cn(
                                                        "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm transition-all group-hover:scale-125",
                                                        event.type === 'PROMOTION' ? "bg-amber-400" :
                                                            event.type === 'AWARD' ? "bg-rose-500" :
                                                                event.type === 'JOINED' ? "bg-emerald-500" : "bg-blue-500"
                                                    )}></div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                            {event.title}
                                                        </h4>
                                                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                            {new Date(event.date).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        {event.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Contracts Content */}
                            <TabsContent value="contracts" className="space-y-6">
                                <Card className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Shield size={20} className="text-blue-600" /> Hồ sơ pháp lý
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {contracts.map((contract) => (
                                                <div key={contract.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-blue-50/30 transition-colors group">
                                                    <div className="flex items-start gap-4">
                                                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-slate-900">{contract.code}</h4>
                                                                <Badge className={cn(
                                                                    "text-[10px] h-5 px-1.5",
                                                                    contract.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-200 text-slate-600 hover:bg-slate-200"
                                                                )}>
                                                                    {contract.status === 'ACTIVE' ? 'Đang hiệu lực' : 'Hết hạn'}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                                                <span>Loại: {contract.type === 'OFFICIAL' ? 'Chính thức' : 'Thử việc'}</span>
                                                                <span>•</span>
                                                                <span>Ngày ký: {new Date(contract.start_date).toLocaleDateString('vi-VN')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="text-slate-600 hover:text-blue-600 group-hover:border-blue-200" data-testid={`btn-download-contract-${contract.id}`}>
                                                        <Download size={14} className="mr-2" /> Tải về
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Performance Placeholder */}
                            <TabsContent value="performance">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="py-12 text-center text-slate-400">
                                        <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                                        <p className="font-medium">Dữ liệu hiệu suất đang được tổng hợp...</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
