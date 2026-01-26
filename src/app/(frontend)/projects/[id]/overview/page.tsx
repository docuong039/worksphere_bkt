"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Users,
  Layers,
  Calendar,
  Paperclip,
  Settings,
  BarChart3,
  Plus,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  Share2,
  Github,
  Table as TableIcon,
  Globe,
  History,
  Recycle,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/AppLayout";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ProjectDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_by: string;
  stats: {
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
    overdue_tasks: number;
    total_hours_logged: number;
    by_status: { status: string; count: number }[];
    by_member: { name: string; total: number; done: number; overdue: number }[];
  };
  members: any[];
  resources: any[];
  custom_fields: any[];
}

const StatCard = ({ label, value, icon: Icon, colorClass, testId }: any) => (
  <Card
    className="border-none shadow-sm bg-white overflow-hidden"
    data-testid={testId}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
            {label}
          </p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className={cn("p-3 rounded-2xl", colorClass)}>
          <Icon size={24} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const isPM =
    user?.role === "PROJECT_MANAGER" ||
    user?.role === "ORG_ADMIN" ||
    user?.role === "SYS_ADMIN";

  const isLeader =
    user?.role === "CEO" ||
    user?.role === "ORG_ADMIN" ||
    user?.role === "SYS_ADMIN";

  // Member Management States
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSubmittingMembers, setIsSubmittingMembers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Custom Field States
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("TEXT");
  const [entityType, setEntityType] = useState("TASK");
  const [isSubmittingField, setIsSubmittingField] = useState(false);

  const fetchProjectOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/overview/${id}`, {
        headers: {
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "",
        },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setProject(data.data || data); // Handle both wrapped and unwrapped data
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProjectOverview();
  }, [id, user]);

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: {
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "",
        },
      });
      const data = await res.json();
      // Filter out existing members
      const projectMemberIds = project?.members.map((m) => m.user_id) || [];
      setAvailableUsers(
        (data.data || []).filter((u: any) => !projectMemberIds.includes(u.id)),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    setIsSubmittingMembers(true);
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "",
        },
        body: JSON.stringify({ user_ids: selectedUsers }),
      });
      if (res.ok) {
        setIsAddMemberOpen(false);
        setSelectedUsers([]);
        toast({
          title: "Thành công",
          description: `Đã thêm ${selectedUsers.length} thành viên vào dự án.`,
        });
        fetchProjectOverview(); // Refresh
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingMembers(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Bạn có chắc muốn gỡ thành viên này khỏi dự án?")) return;
    try {
      const res = await fetch(`/api/projects/${id}/members/${userId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "",
        },
      });
      if (res.ok) {
        toast({
          title: "Đã gỡ",
          description: "Thành viên đã được gỡ khỏi dự án.",
        });
        fetchProjectOverview(); // Refresh
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCustomField = async () => {
    if (!fieldName) return;
    setIsSubmittingField(true);
    try {
      const res = await fetch(`/api/projects/${id}/custom-fields`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "",
        },
        body: JSON.stringify({
          field_name: fieldName,
          field_type: fieldType,
          entity_type: entityType,
        }),
      });
      if (res.ok) {
        setIsAddFieldOpen(false);
        setFieldName("");
        fetchProjectOverview();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingField(false);
    }
  };

  const filteredUsers = availableUsers.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="max-w-[1800px] mx-auto space-y-8 p-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-[1800px] mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header - now using shared layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            Tổng quan Dự án
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Report removed as per user request (not in documentation) */}
          {isPM && (
            <Button
              size="sm"
              className="h-9 bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md shadow-blue-100"
              onClick={() => {
                setIsAddMemberOpen(true);
                fetchAvailableUsers();
              }}
              data-testid="btn-open-add-member"
            >
              <Plus className="mr-2 h-4 w-4" /> Mời thành viên
            </Button>
          )}
        </div>
      </div>

      {/* Content Area with Animation */}
      <div className="space-y-10 animate-in fade-in slide-in-from-top-2 duration-500">
        {/* Strategic Analytics for Leadership (CEO/Admin) */}
        {isLeader && (
          <div className="space-y-6 mb-10">
            <Card className="border-none shadow-sm bg-white p-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Mô tả Chiến lược</h3>
              <p className="text-lg font-bold text-slate-700 leading-relaxed italic">
                "{project.description || "Dự án chưa có mô tả mục tiêu chiến lược."}"
              </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Monitoring */}
              <Card className="border-rose-100 shadow-sm bg-rose-50/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 text-rose-500/10 pointer-events-none">
                  <AlertCircle size={120} />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-3 text-rose-900">
                    <AlertCircle className="text-rose-600" />
                    Giám sát Rủi ro Dự án
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-rose-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                        <span className="text-sm font-bold text-slate-700">Tắc nghẽn (Blocked)</span>
                      </div>
                      <span className="text-sm font-black text-rose-600">03 Task</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-rose-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-600" />
                        <span className="text-sm font-bold text-slate-700">Quá hạn (Overdue)</span>
                      </div>
                      <span className="text-sm font-black text-rose-600">{project.stats.overdue_tasks} Task</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-rose-700 mt-2 italic">* Cảnh báo: Tỷ lệ task quá hạn đang ở mức trung bình. Cần PM can thiệp tháo gỡ.</p>
                </CardContent>
              </Card>

              {/* Financial Analytics */}
              <Card className="border-emerald-100 shadow-sm bg-emerald-50/30 overflow-hidden relative" data-testid="project-financial-drilldown">
                <div className="absolute top-0 right-0 p-8 text-emerald-500/10 pointer-events-none">
                  <BarChart3 size={120} />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-3 text-emerald-900">
                    <BarChart3 className="text-emerald-600" />
                    Phân tích Tài chính Dự án
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng chi phí thực tế</span>
                      <span className="text-2xl font-black text-emerald-700">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.stats.total_hours_logged * 250000)}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hiệu suất chi phí (CPI)</span>
                      <span className="text-lg font-black text-blue-600">1.25</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="secondary" className="font-bold bg-emerald-600/10 hover:bg-emerald-600/20 border-none text-emerald-700 rounded-xl h-10 px-4 w-full">
                      Xem chi tiết bảng lương dự án
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Governance & Management Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Governance Card - Visible to both PM and CEO */}
          {(isPM || isLeader) && (
            <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                <History size={120} />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <History className="text-blue-400" />
                  Quản trị & Nhật ký
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <p className="text-sm text-slate-400 font-medium">Theo dõi lịch sử thay đổi và quản lý các mục bị xóa trong dự án này.</p>
                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" className="font-bold bg-white/10 hover:bg-white/20 border-none text-white rounded-xl h-10 px-4" asChild>
                    <Link href={`/projects/${id}/activity`}>
                      Xem Nhật ký
                    </Link>
                  </Button>
                  <Button variant="secondary" className="font-bold bg-white/10 hover:bg-white/20 border-none text-white rounded-xl h-10 px-4" asChild>
                    <Link href={`/projects/${id}/settings/recycle-bin`}>
                      Thùng rác
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Infrastructure Settings Card - Strictly PM Only */}
          {isPM && (
            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-900 to-blue-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                <Settings size={120} />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <Settings className="text-blue-300" />
                  Cấu hình Dự án
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <p className="text-sm text-slate-300 font-medium">Thiết lập Custom Fields, quyền chỉnh sửa trường và thông báo.</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button variant="secondary" className="font-bold bg-white/10 hover:bg-white/20 border-none text-white rounded-xl h-10 px-4" asChild>
                    <Link href={`/projects/${id}/settings/custom-fields`}>
                      Custom Fields
                    </Link>
                  </Button>
                  <Button variant="secondary" className="font-bold bg-white/10 hover:bg-white/20 border-none text-white rounded-xl h-10 px-4" asChild>
                    <Link href={`/projects/${id}/settings/notifications`}>
                      Thông báo
                    </Link>
                  </Button>
                  <Button variant="secondary" className="font-bold bg-white/10 hover:bg-white/20 border-none text-white rounded-xl h-10 px-4" asChild>
                    <Link href={`/projects/${id}/settings/tags`}>
                      Gắn thẻ (Tags)
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Stats - Filtered for CEO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {!isLeader && (
            <>
              <StatCard
                label="Tổng số công việc"
                value={project.stats.total_tasks}
                icon={Layers}
                colorClass="bg-blue-50 text-blue-600"
                testId="stat-total-tasks"
              />
              <StatCard
                label="Đã hoàn thành"
                value={project.stats.completed_tasks}
                icon={CheckCircle2}
                colorClass="bg-emerald-50 text-emerald-600"
                testId="stat-completed-tasks"
              />
            </>
          )}
          <StatCard
            label="Quá hạn"
            value={project.stats.overdue_tasks}
            icon={AlertCircle}
            colorClass="bg-rose-50 text-rose-600"
            testId="stat-overdue-tasks"
          />
          <StatCard
            label="Giờ đã ghi nhận"
            value={`${project.stats.total_hours_logged}h`}
            icon={Clock}
            colorClass="bg-amber-50 text-amber-600"
            testId="stat-time-logged"
          />
          {isLeader && (
            <StatCard
              label="Chi phí dự án"
              value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.stats.total_hours_logged * 250000)}
              icon={BarChart3}
              colorClass="bg-emerald-50 text-emerald-600"
              testId="stat-total-cost"
            />
          )}
          {isLeader && (
            <StatCard
              label="Đội ngũ tham gia"
              value={`${project.members.length} người`}
              icon={Users}
              colorClass="bg-blue-50 text-blue-600"
              testId="stat-team-size"
            />
          )}
        </div>

        {/* Progress Section */}
        <Card className="border-none shadow-sm bg-white p-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Tiến độ tổng thể
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  Dựa trên tỷ lệ hoàn thành công việc
                </p>
              </div>
              <span className="text-4xl font-black text-blue-600">
                {project.stats.completion_rate}%
              </span>
            </div>
            <Progress
              value={project.stats.completion_rate}
              className="h-4 rounded-full bg-slate-100 overflow-hidden"
              data-testid="project-overall-progress"
            />
          </div>
        </Card>

        {!isLeader && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Distribution Chart */}
            <Card className="border-none shadow-sm bg-white p-6">
              <CardTitle className="text-base font-bold mb-6">
                Phân bổ công việc
              </CardTitle>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={project.stats.by_status}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {project.stats.by_status.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.status === "DONE"
                              ? "#10b981"
                              : entry.status === "IN_PROGRESS"
                                ? "#2563eb"
                                : entry.status === "BLOCKED"
                                  ? "#e11d48"
                                  : "#64748b"
                          }
                        />
                      ))}
                    </Pie>
                    <ReTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Team Workload Chart */}
            <Card className="border-none shadow-sm bg-white p-6">
              <CardTitle className="text-base font-bold mb-6">
                Khối lượng công việc theo thành viên
              </CardTitle>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={project.stats.by_member}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
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
                    <Legend />
                    <Bar
                      dataKey="done"
                      name="Hoàn thành"
                      stackId="a"
                      fill="#10b981"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="total"
                      name="Đang làm"
                      stackId="a"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Information & Members */}
          <div className="lg:col-span-2 space-y-8">
            {/* Team Performance Table */}
            <Card
              className="border-none shadow-sm bg-white overflow-hidden"
              data-testid="team-performance-table"
            >
              <CardHeader className="pb-2 border-b border-slate-50 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">
                  Hiệu suất thành viên
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Thành viên
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                          Tổng Task
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                          Hoàn thành
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                          Quá hạn
                        </th>
                        {isLeader && (
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                            Chi phí
                          </th>
                        )}
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                          Tỉ lệ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {project.stats.by_member.map((m, idx) => {
                        const rate =
                          m.total > 0
                            ? Math.round((m.done / m.total) * 100)
                            : 0;
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="font-bold text-xs">
                                  {m.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-bold text-slate-700">
                                {m.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-semibold">
                              {m.total}
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-semibold text-emerald-600">
                              {m.done}
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-semibold text-rose-600">
                              {m.overdue}
                            </td>
                            {isLeader && (
                              <td className="px-6 py-4 text-right text-xs font-bold text-slate-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.done * 1200000)}
                              </td>
                            )}
                            <td className="px-6 py-4 text-right">
                              <Badge
                                className={cn(
                                  "font-bold",
                                  rate >= 80
                                    ? "bg-emerald-50 text-emerald-700"
                                    : rate >= 50
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-rose-50 text-rose-700",
                                )}
                              >
                                {rate}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Members List (PM Only) */}
            {!isLeader && (
              <Card
                className="border-none shadow-sm bg-white overflow-hidden"
                data-testid="members-list"
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold">
                    Thành viên đội ngũ ({project.members.length})
                  </CardTitle>
                  {isPM && (
                    <Button
                      variant="ghost"
                      className="h-8 text-blue-600 font-bold text-xs"
                      onClick={() => {
                        setIsAddMemberOpen(true);
                        fetchAvailableUsers();
                      }}
                      data-testid="add-member-link"
                    >
                      <Plus size={14} className="mr-1" /> Thêm
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {project.members.map((member, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                            <AvatarFallback className="bg-slate-100 font-bold text-[10px] text-slate-500 uppercase">
                              {member.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {member.full_name}
                            </h4>
                            <p className="text-[10px] font-semibold text-slate-400">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-extrabold text-[10px] uppercase tracking-tighter px-2",
                              member.role === "PM"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-600",
                            )}
                          >
                            {member.role === "PM"
                              ? "Quản lý dự án"
                              : "Thành viên"}
                          </Badge>
                          {isPM && member.user_id !== user?.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-red-600 font-bold"
                                  onClick={() =>
                                    handleRemoveMember(member.user_id)
                                  }
                                >
                                  <Trash2 size={14} className="mr-2" /> Gỡ
                                  khỏi dự án
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Member Dialog */}
            <Dialog
              open={isAddMemberOpen}
              onOpenChange={setIsAddMemberOpen}
            >
              <DialogContent
                className="sm:max-w-md bg-white rounded-3xl border-none shadow-2xl"
                data-testid="dialog-add-member"
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Thêm Thành Viên Dự Án
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Tìm kiếm nhân viên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-xl"
                    />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {loadingUsers ? (
                      <div className="space-y-2 py-4">
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="h-14 w-full rounded-xl" />
                      </div>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <div
                          key={u.id}
                          onClick={() =>
                            setSelectedUsers((prev) =>
                              prev.includes(u.id)
                                ? prev.filter((id) => id !== u.id)
                                : [...prev, u.id],
                            )
                          }
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                            selectedUsers.includes(u.id)
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-slate-50 hover:border-slate-100",
                          )}
                        >
                          <Checkbox
                            checked={selectedUsers.includes(u.id)}
                            className="rounded-full"
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[10px] font-bold">
                              {u.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {u.full_name}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400 truncate uppercase">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                        Không tìm thấy nhân viên
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      className="font-bold text-slate-500"
                    >
                      Hủy
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleAddMembers}
                    disabled={
                      selectedUsers.length === 0 || isSubmittingMembers
                    }
                    className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md shadow-blue-100"
                  >
                    {isSubmittingMembers ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      `Thêm ${selectedUsers.length} người`
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Custom Field Dialog */}
            <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
              <DialogContent
                className="sm:max-w-md bg-white rounded-3xl"
                data-testid="dialog-add-field"
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                    Thêm trường tùy chỉnh
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Tên trường
                    </label>
                    <Input
                      placeholder="Ví dụ: Jira ID, Link thiết kế..."
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      className="rounded-xl border-slate-200 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Loại dữ liệu
                      </label>
                      <Select
                        value={fieldType}
                        onValueChange={setFieldType}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Văn bản</SelectItem>
                          <SelectItem value="NUMBER">Số học</SelectItem>
                          <SelectItem value="DATE">Ngày tháng</SelectItem>
                          <SelectItem value="SELECT">Lựa chọn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Áp dụng cho
                      </label>
                      <Select
                        value={entityType}
                        onValueChange={setEntityType}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TASK">Công việc</SelectItem>
                          <SelectItem value="SUBTASK">
                            Công việc con
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      className="font-bold text-slate-500"
                    >
                      Hủy
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleAddCustomField}
                    disabled={!fieldName || isSubmittingField}
                    className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md shadow-blue-100"
                  >
                    {isSubmittingField ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Tạo trường"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Resources & Custom Fields Sidebar (PM Only) */}
          {!isLeader ? (
            <div className="space-y-8">
              {/* Resources Card */}
              <Card
                className="border-none shadow-sm bg-white overflow-hidden"
                data-testid="resources-panel"
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Share2 size={18} className="text-blue-600" />
                    Tài nguyên
                  </CardTitle>
                  {isPM && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600"
                      onClick={() => setIsAddFieldOpen(true)}
                      data-testid="add-resource-btn"
                    >
                      <Plus size={18} />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {project.resources.length > 0 ? (
                    project.resources.map((res, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-white hover:ring-1 hover:ring-blue-100 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 border border-slate-100">
                            {res.resource_type === "GIT" ? (
                              <Github size={16} />
                            ) : res.resource_type === "SHEET" ? (
                              <TableIcon size={16} />
                            ) : (
                              <Globe size={16} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">
                              {res.name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {res.resource_type}
                            </span>
                          </div>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-blue-600"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Không có tài nguyên
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom Fields Card */}
              <Card
                className="border-none shadow-sm bg-white overflow-hidden"
                data-testid="custom-fields-panel"
              >
                <CardHeader className="pb-2 border-b border-slate-50">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Tag size={18} className="text-blue-600" />
                    Trường tùy chỉnh
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {project.custom_fields.length > 0 ? (
                    project.custom_fields.map((field, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">
                            {field.field_name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {field.field_type} • {field.entity_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isPM && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-300 hover:text-blue-600"
                              >
                                <Pencil size={12} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-300 hover:text-rose-600"
                              >
                                <Trash2 size={12} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      {isPM ? (
                        <Button
                          variant="outline"
                          className="w-full h-10 border-dashed border-slate-200 text-slate-400 font-bold text-xs"
                          onClick={() => setIsAddFieldOpen(true)}
                          data-testid="add-custom-field-btn"
                        >
                          <Plus size={14} className="mr-1" /> Thêm trường tùy
                          chỉnh
                        </Button>
                      ) : (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Chỉ dùng trường mặc định
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-blue-600 text-white p-6 rounded-3xl overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <BarChart3 size={120} />
                </div>
                <h3 className="text-lg font-black mb-2">Tóm tắt Chiến lược</h3>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Dự án này đang đóng góp 15% vào doanh thu mục tiêu quý 1.
                  Đội ngũ kỹ thuật đang duy trì hiệu suất ổn định.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
