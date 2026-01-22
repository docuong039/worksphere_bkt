'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, MapPin, Briefcase, Calendar, Star, Building, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EmployeeProfilePage() {
    const params = useParams();
    const employeeId = params.id;

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" data-testid="employee-profile-container">
                {/* Back Button */}
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" asChild>
                    <Link href="/hr/employees">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
                    </Link>
                </Button>

                {/* Profile Header Card */}
                <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white" data-testid="employee-profile-header">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <Avatar className="h-32 w-32 border-4 border-white/20 shadow-xl">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employeeId}`} />
                                <AvatarFallback className="text-4xl bg-white/10 text-white">EM</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold">Nguyễn Văn Nhân Viên</h1>
                                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                                        Active
                                    </Badge>
                                </div>
                                <p className="text-blue-100 text-lg flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" /> Senior Frontend Developer
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-blue-100 mt-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 opacity-70" /> nhanvien@worksphere.com
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 opacity-70" /> +84 987 654 321
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 opacity-70" /> Hà Nội, Việt Nam
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50" data-testid="btn-edit-profile">
                                    Chỉnh sửa hồ sơ
                                </Button>
                                <Button variant="outline" className="border-white/30 text-white hover:bg-white/20 hover:text-white" asChild data-testid="btn-view-timeline">
                                    <Link href={`/hr/employees/${employeeId}/timeline`}>
                                        Xem lịch sử làm việc
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6" data-testid="profile-tabs">
                    <TabsList className="bg-white p-1 border border-slate-200 rounded-lg w-full md:w-auto grid grid-cols-3 md:inline-flex">
                        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                        <TabsTrigger value="projects">Dự án tham gia</TabsTrigger>
                        <TabsTrigger value="documents">Hồ sơ & Hợp đồng</TabsTrigger>
                    </TabsList>

                    {/* Tab: Overview */}
                    <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column: Skills & Info */}
                            <div className="space-y-6 col-span-1">
                                <Card data-testid="skills-section">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Star className="h-4 w-4 text-yellow-500" /> Kỹ năng chuyên môn
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {['ReactJS', 'Next.js', 'TypeScript', 'TailwindCSS', 'Node.js', 'PostgreSQL'].map(skill => (
                                                <Badge key={skill} variant="outline" className="bg-slate-50">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card data-testid="department-info">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Building className="h-4 w-4 text-slate-500" /> Phòng ban
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Phòng ban</p>
                                            <p className="text-slate-900 font-medium">Phát triển Sản phẩm (Product)</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Người quản lý trực tiếp</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>PM</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-slate-900">Trần Quản Lý</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Ngày gia nhập</p>
                                            <p className="text-slate-900 font-medium flex items-center gap-2 mt-1">
                                                <Calendar className="h-3 w-3" /> 15/01/2024
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Performance Mini & Recent Activity */}
                            <div className="md:col-span-2 space-y-6">
                                <Card data-testid="performance-mini-stat">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Award className="h-4 w-4 text-purple-500" /> Hiệu suất tháng này
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-900">98%</div>
                                            <div className="text-xs text-slate-500 mt-1">Hoàn thành</div>
                                        </div>
                                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-900">164h</div>
                                            <div className="text-xs text-slate-500 mt-1">Giờ làm việc</div>
                                        </div>
                                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">A</div>
                                            <div className="text-xs text-slate-500 mt-1">Xếp loại</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="projects" className="animate-in fade-in duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dự án đang tham gia</CardTitle>
                                <CardDescription>Danh sách các dự án nhân sự đang đóng góp.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4" data-testid="participating-projects-list">
                                    <div className="flex items-center justify-between p-4 border rounded-lg border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded bg-blue-600 flex items-center justify-center text-white font-bold">WS</div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">Worksphere SaaS</h3>
                                                <p className="text-sm text-slate-500">Vai trò: Frontend Lead</p>
                                            </div>
                                        </div>
                                        <Badge>Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded bg-indigo-600 flex items-center justify-center text-white font-bold">MB</div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">Mobile App Revamp</h3>
                                                <p className="text-sm text-slate-500">Vai trò: Supporter</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">On Hold</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents">
                        <Card className="h-[200px] flex items-center justify-center bg-slate-50">
                            <p className="text-slate-400">Chức năng đang phát triển...</p>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
