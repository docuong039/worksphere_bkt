"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Bug,
  Shield,
  Activity,
  TrendingUp,
  XCircle,
  CheckCircle2,
  ExternalLink,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

interface BugStats {
  total: number;
  open: number;
  in_fix: number;
  testing: number;
  fixed: number;
  by_severity?: { severity: string; count: number }[];
}

interface ProjectQuality {
  id: string;
  code: string;
  name: string;
  bugs: BugStats;
  total_tasks: number;
  by_type: { type: string; count: number }[];
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
  testId?: string;
}

const StatCard = ({
  label,
  value,
  icon: Icon,
  colorClass,
  testId,
}: StatCardProps) => {
  return (
    <Card
      className="border-none shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
      data-testid={testId}
    >
      <CardContent className="p-6 flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorClass}`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
            {label}
          </p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function QualityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<ProjectQuality | null>(null);

  useEffect(() => {
    const fetchQualityData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/quality/${id}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error("Error fetching quality data:", error);
        // Mock data for development
        setProject({
          id,
          code: "PRJ-001",
          name: "Dự án Mock",
          bugs: {
            total: 12,
            open: 3,
            in_fix: 5,
            testing: 2,
            fixed: 2,
          },
          total_tasks: 45,
          by_type: [
            { type: "TASK", count: 33 },
            { type: "BUG", count: 12 },
            { type: "FEATURE", count: 0 },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQualityData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-[1800px] mx-auto space-y-8 p-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  const bugFixRate = project.bugs.total
    ? Math.round((project.bugs.fixed / project.bugs.total) * 100)
    : 0;

  const bugDensity =
    project.total_tasks > 0
      ? ((project.bugs.total / project.total_tasks) * 100).toFixed(1)
      : "0.0";

  const statusData = [
    { name: "Đang mở", value: project.bugs.open },
    { name: "Đang fix", value: project.bugs.in_fix },
    { name: "Testing", value: project.bugs.testing },
    { name: "Đã fix", value: project.bugs.fixed },
  ].filter((item) => item.value > 0);

  return (
    <div className="max-w-[1800px] mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header - now using shared layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            Theo dõi Chất lượng & QA
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 font-bold gap-2">
            <Filter size={14} />
            Lọc
          </Button>
          <Button variant="outline" size="sm" className="h-9 font-bold gap-2">
            <Download size={14} />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* QA Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Tổng số Bug"
          value={project.bugs.total}
          icon={Bug}
          colorClass="bg-rose-50 text-rose-600"
          testId="stat-total-bugs"
        />
        <StatCard
          label="Đang mở"
          value={project.bugs.open}
          icon={XCircle}
          colorClass="bg-amber-50 text-amber-600"
          testId="stat-open-bugs"
        />
        <StatCard
          label="Đang fix"
          value={project.bugs.in_fix}
          icon={Activity}
          colorClass="bg-blue-50 text-blue-600"
          testId="stat-fixing-bugs"
        />
        <StatCard
          label="Đã fix"
          value={project.bugs.fixed}
          icon={CheckCircle2}
          colorClass="bg-emerald-50 text-emerald-600"
          testId="stat-fixed-bugs"
        />
      </div>

      {/* Bug Fix Rate */}
      <Card className="border-none shadow-sm bg-white p-8">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Tỉ lệ sửa lỗi
              </h3>
              <p className="text-sm font-medium text-slate-500">
                Bug được giải quyết so với tổng số bug phát hiện
              </p>
            </div>
            <span className="text-4xl font-black text-emerald-600">
              {bugFixRate}%
            </span>
          </div>
          <Progress
            value={bugFixRate}
            className="h-4 rounded-full bg-slate-100 overflow-hidden"
            data-testid="bug-fix-rate-progress"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bug Status Distribution */}
        <Card className="border-none shadow-sm bg-white p-6">
          <CardTitle className="text-base font-bold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-rose-600" />
            Trạng thái Bug
          </CardTitle>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#8b5cf6" />
                  <Cell fill="#10b981" />
                </Pie>
                <ReTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Task Type Distribution */}
        <Card className="border-none shadow-sm bg-white p-6">
          <CardTitle className="text-base font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Phân loại công việc
          </CardTitle>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={project.by_type}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="type"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tick={{ fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tick={{ fill: "#64748b" }}
                />
                <ReTooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bug List Table */}
      <Card
        className="border-none shadow-sm bg-white overflow-hidden"
        data-testid="bug-list-table"
      >
        <CardHeader className="pb-4 border-b border-slate-50 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Bug className="h-5 w-5 text-rose-600" />
            Danh sách Bug ({project.bugs.total})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-9 font-bold"
            asChild
          >
            <Link href={`/projects/${id}?type=BUG`}>
              Xem tất cả <ExternalLink size={14} className="ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    ID
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Độ nghiêm trọng
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Người xử lý
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Hạn chót
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* Mock Bug Data - sẽ được thay thế bằng API call */}
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      BUG-001
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/tasks/task-3`}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600"
                    >
                      Fix bug Login UI
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-rose-50 text-rose-700 border-none font-bold text-[10px]">
                      URGENT
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px]">
                      FIXED
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] font-bold">
                          AF
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-slate-600">
                        Alice Frontend
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    2025-01-17
                  </td>
                </tr>
                {/* Empty state if no bugs */}
                {project.bugs.total === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle2
                          size={48}
                          className="text-emerald-200 mb-4"
                        />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                          Không có bug nào
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Dự án đang chạy tốt!
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Chỉ số chất lượng
            </h3>
            <p className="text-sm font-medium text-slate-600">
              Đánh giá tổng thể dựa trên tiến độ và lỗi
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Test Coverage
            </p>
            <p className="text-3xl font-black text-slate-900">N/A</p>
            <p className="text-xs text-slate-500 mt-1">Chưa có dữ liệu</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Bug Density
            </p>
            <p className="text-3xl font-black text-slate-900">
              {bugDensity}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Bug/Task ratio</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Avg Fix Time
            </p>
            <p className="text-3xl font-black text-slate-900">N/A</p>
            <p className="text-xs text-slate-500 mt-1">Chưa có dữ liệu</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
