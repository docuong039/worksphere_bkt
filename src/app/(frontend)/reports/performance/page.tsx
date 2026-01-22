'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Calendar as CalendarIcon, Download, TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TeamPerformancePage() {
    return (
        <AppLayout>
            <div className="space-y-8 animate-in fade-in duration-500" data-testid="performance-dashboard-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="performance-title">
                            Hiệu suất Đội ngũ
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Phân tích năng suất làm việc và chất lượng đầu ra của nhân sự.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select defaultValue="this-month">
                            <SelectTrigger className="w-[180px]" data-testid="select-time-range">
                                <SelectValue placeholder="Chọn thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="this-week">Tuần này</SelectItem>
                                <SelectItem value="this-month">Tháng này</SelectItem>
                                <SelectItem value="last-month">Tháng trước</SelectItem>
                                <SelectItem value="quarter">Quý này</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" data-testid="btn-export-performance">
                            <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card data-testid="stat-tasks-completed">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Task Hoàn thành</CardTitle>
                            <CheckIcon className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,284</div>
                            <p className="text-xs text-muted-foreground">+12% so với tháng trước</p>
                        </CardContent>
                    </Card>
                    <Card data-testid="stat-ontime-rate">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tỷ lệ Đúng hạn</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">94.5%</div>
                            <p className="text-xs text-muted-foreground">+2.1% so với tháng trước</p>
                        </CardContent>
                    </Card>
                    <Card data-testid="stat-total-hours">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng giờ làm</CardTitle>
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3,450h</div>
                            <p className="text-xs text-muted-foreground">Trung bình 168h/người</p>
                        </CardContent>
                    </Card>
                    <Card data-testid="stat-active-members">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nhân sự Active</CardTitle>
                            <Users className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24/25</div>
                            <p className="text-xs text-muted-foreground">1 người nghỉ phép</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="col-span-1" data-testid="chart-productivity-trend">
                        <CardHeader>
                            <CardTitle>Xu hướng năng suất</CardTitle>
                            <CardDescription>Số lượng task hoàn thành theo tuần</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md m-6 border border-dashed border-slate-200">
                            <p className="text-slate-400">Biểu đồ đang được cập nhật...</p>
                        </CardContent>
                    </Card>
                    <Card className="col-span-1" data-testid="chart-workload-distribution">
                        <CardHeader>
                            <CardTitle>Phân bổ khối lượng công việc</CardTitle>
                            <CardDescription>Tỷ lệ task theo trạng thái</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md m-6 border border-dashed border-slate-200">
                            <p className="text-slate-400">Biểu đồ đang được cập nhật...</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Member Ranking Table */}
                <Card data-testid="table-member-performance">
                    <CardHeader>
                        <CardTitle>Bảng xếp hạng thành viên</CardTitle>
                        <CardDescription>Chi tiết key metrics của từng cá nhân</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="font-bold text-slate-400 w-6">#{i}</div>
                                        <Avatar>
                                            <AvatarFallback>U{i}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold text-slate-900">Nhân viên Demo {i}</div>
                                            <div className="text-xs text-slate-500">Frontend Team</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 text-sm">
                                        <div className="text-center w-24">
                                            <div className="font-bold text-slate-900">{95 - i}%</div>
                                            <div className="text-xs text-slate-500">Đúng hạn</div>
                                        </div>
                                        <div className="text-center w-24">
                                            <div className="font-bold text-slate-900">{40 - i * 2}</div>
                                            <div className="text-xs text-slate-500">Task xong</div>
                                        </div>
                                        <div className="text-center w-32 hidden md:block">
                                            <Progress value={90 - i * 5} className="h-2" />
                                            <div className="text-xs text-slate-500 mt-1">Completion Score</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" data-testid={`btn-view-profile-${i}`}>
                                        Chi tiết
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function CheckIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    )
}
