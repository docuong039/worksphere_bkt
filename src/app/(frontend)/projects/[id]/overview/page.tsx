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
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const isPM =
    user?.role === "PROJECT_MANAGER" ||
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
      <AppLayout>
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) return null;

  return (
    <AppLayout>
      <div
        className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700"
        data-testid="project-overview-container"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <Button
              variant="ghost"
              asChild
              className="-ml-4 text-slate-500 hover:text-slate-900 mb-2"
            >
              <Link href="/projects">
                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại danh sách Dự
                án
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <h1
                className="text-3xl font-black text-slate-900 tracking-tight"
                data-testid="project-title"
              >
                {project.name}
              </h1>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3 font-bold uppercase tracking-widest text-[10px]">
                {project.code}
              </Badge>
            </div>
          </div>
          {isPM && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-11 px-6 font-bold border-slate-200"
                asChild
              >
                <Link href={`/projects/${id}/settings/field-permissions`}>
                  <Settings className="mr-2 h-4 w-4" /> Phân quyền trường dữ
                  liệu
                </Link>
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 h-11 px-6 font-bold shadow-lg shadow-blue-100"
                onClick={() => {
                  setIsAddMemberOpen(true);
                  fetchAvailableUsers();
                }}
                data-testid="btn-open-add-member"
              >
                <Plus className="mr-2 h-4 w-4" /> Mời thành viên
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList
            className="bg-slate-100/50 p-1 h-12 rounded-xl border border-slate-100 w-full md:w-auto overflow-x-auto justify-start flex-nowrap mb-8"
            data-testid="project-tabs"
          >
            <TabsTrigger
              value="overview"
              className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              asChild
            >
              <Link href={`/projects/${id}`}>Công việc</Link>
            </TabsTrigger>
            <TabsTrigger
              value="gantt"
              className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              asChild
            >
              <Link href={`/projects/${id}/gantt`}>Biểu đồ Gantt</Link>
            </TabsTrigger>
            {isPM && (
              <TabsTrigger
                value="time-locks"
                className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                asChild
              >
                <Link href={`/projects/${id}/time-locks`}>Khóa kỳ công</Link>
              </TabsTrigger>
            )}
            {isPM && (
              <TabsTrigger
                value="time-logs"
                className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                asChild
              >
                <Link href={`/projects/${id}/time-logs`}>Nhật ký thời gian</Link>
              </TabsTrigger>
            )}
            {isPM && (
              <TabsTrigger
                value="quality"
                className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                asChild
              >
                <Link href={`/projects/${id}/quality`}>Chất lượng & QA</Link>
              </TabsTrigger>
            )}
            {isPM && (
              <TabsTrigger
                value="import-export"
                className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                asChild
              >
                <Link href={`/projects/${id}/import-export`}>Xuất/Nhập</Link>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="documents"
              className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              asChild
            >
              <Link href={`/projects/${id}/documents`}>Tài liệu</Link>
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="rounded-lg font-bold text-sm h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Tài nguyên
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="space-y-10 animate-in fade-in slide-in-from-top-2 duration-500"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

                {/* Project Info */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                  <CardHeader className="pb-2 border-b border-slate-50">
                    <CardTitle className="text-lg font-bold flex items-center justify-between">
                      Thông tin Dự án
                      {isPM && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                        >
                          <Pencil size={16} />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Trạng thái
                        </span>
                        <Badge className="w-fit bg-emerald-50 text-emerald-700 border-none font-bold">
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Người tạo
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {project.created_by}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Thời gian
                        </span>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          <Calendar size={14} className="text-slate-400" />
                          {project.start_date
                            ? new Date(project.start_date).toLocaleDateString(
                              "vi-VN",
                            )
                            : "N/A"}{" "}
                          -
                          {project.end_date
                            ? new Date(project.end_date).toLocaleDateString(
                              "vi-VN",
                            )
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-full">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Mô tả
                      </span>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {project.description || "Chưa có mô tả dự án."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Members List */}
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

              {/* Resources & Custom Fields Sidebar */}
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
            </div>
          </TabsContent>

          <TabsContent
            value="tasks"
            className="animate-in fade-in duration-500"
          >
            {/* This would ideally route to /projects/[id]/tasks or show tasks component */}
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl shadow-sm border border-slate-100 px-6">
              <Layers size={48} className="text-slate-200 mb-6" />
              <h3 className="text-2xl font-black text-slate-900">
                Công việc dự án
              </h3>
              <p className="text-slate-500 mt-2 max-w-xs font-medium">
                Truy cập trang Công việc chính hoặc triển khai danh sách tại
                đây.
              </p>
              <Button className="mt-6 bg-blue-600" asChild>
                <Link href="/tasks">Xem tất cả công việc</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
