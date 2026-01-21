/**
 * Create Task Page
 * 
 * User Stories:
 * - US-MNG-01-02: PM tạo task và gán cho nhân sự (có thể gán nhiều người)
 * - US-MNG-01-03: PM gắn thẻ (tags) và độ ưu tiên (priority) cho task
 * 
 * Access: PM/MNG only
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    Calendar,
    Loader2,
    X,
    AlertCircle,
    User,
    Tag,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface Project {
    id: string;
    name: string;
    code: string;
}

interface TeamMember {
    id: string;
    full_name: string;
    email: string;
}

interface TagOption {
    id: string;
    name: string;
    color: string;
}

const STATUSES = [
    { code: 'TODO', label: 'To Do' },
    { code: 'IN_PROGRESS', label: 'In Progress' },
    { code: 'DONE', label: 'Done' },
    { code: 'BLOCKED', label: 'Blocked' },
];

const PRIORITIES = [
    { code: 'LOW', label: 'Low', color: 'bg-slate-100 text-slate-600' },
    { code: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-600' },
    { code: 'HIGH', label: 'High', color: 'bg-amber-100 text-amber-700' },
    { code: 'URGENT', label: 'Urgent', color: 'bg-rose-100 text-rose-700' },
];

const TYPES = [
    { code: 'TASK', label: 'Task' },
    { code: 'BUG', label: 'Bug' },
    { code: 'FEATURE', label: 'Feature' },
];

export default function CreateTaskPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Options data
    const [projects, setProjects] = useState<Project[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [tags, setTags] = useState<TagOption[]>([]);

    // Form fields
    const [projectId, setProjectId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [statusCode, setStatusCode] = useState('TODO');
    const [priorityCode, setPriorityCode] = useState('MEDIUM');
    const [typeCode, setTypeCode] = useState('TASK');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Errors
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch projects
    const fetchProjects = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/projects', {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setProjects(data.data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch team members when project changes
    const fetchTeamMembers = async (projId: string) => {
        if (!user || !projId) return;
        try {
            const res = await fetch(`/api/projects/${projId}/members`, {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setTeamMembers(data.data || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };

    // Fetch tags
    const fetchTags = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/tags', {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setTags(data.data || []);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProjects();
            fetchTags();
        }
    }, [user]);

    useEffect(() => {
        if (projectId) {
            fetchTeamMembers(projectId);
            setSelectedAssignees([]);
        }
    }, [projectId]);

    // Validate form
    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!projectId) errors.project = 'Vui lòng chọn dự án';
        if (!title.trim()) errors.title = 'Vui lòng nhập tiêu đề';
        if (title.length > 500) errors.title = 'Tiêu đề tối đa 500 ký tự';
        if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
            errors.dueDate = 'Hạn chót phải sau ngày bắt đầu';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                project_id: projectId,
                title: title.trim(),
                description: description.trim() || null,
                status_code: statusCode,
                priority_code: priorityCode,
                type_code: typeCode,
                start_date: startDate || null,
                due_date: dueDate || null,
                assignee_ids: selectedAssignees,
                tag_ids: selectedTags
            };

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create task');
            }

            const data = await res.json();
            router.push(`/tasks/${data.data.id}`);
        } catch (error: any) {
            setFormErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle assignee selection
    const toggleAssignee = (userId: string) => {
        setSelectedAssignees(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // Toggle tag selection
    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700" data-testid="create-task-container">
                {/* Back Link */}
                <Link
                    href="/tasks"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    data-testid="link-back-tasks"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách Task
                </Link>

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="create-task-title">
                        📝 Tạo Task Mới
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Tạo và giao việc cho thành viên trong dự án.
                    </p>
                </div>

                {/* Form Card */}
                <Card className="border-none shadow-lg" data-testid="create-task-form">
                    <CardContent className="p-8 space-y-6">
                        {/* Submit Error */}
                        {formErrors.submit && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3" data-testid="form-error">
                                <AlertCircle size={20} className="mt-0.5" />
                                <div>
                                    <p className="font-semibold">Lỗi tạo task</p>
                                    <p className="text-sm">{formErrors.submit}</p>
                                </div>
                            </div>
                        )}

                        {/* Project Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Dự án <span className="text-red-500">*</span>
                            </label>
                            {loading ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <Select value={projectId} onValueChange={setProjectId}>
                                    <SelectTrigger
                                        className={formErrors.project ? 'border-red-300' : ''}
                                        data-testid="select-project"
                                    >
                                        <SelectValue placeholder="Chọn dự án..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                [{p.code}] {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {formErrors.project && (
                                <p className="text-sm text-red-600">{formErrors.project}</p>
                            )}
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Tiêu đề <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Nhập tiêu đề task..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={formErrors.title ? 'border-red-300' : ''}
                                data-testid="input-title"
                            />
                            {formErrors.title && (
                                <p className="text-sm text-red-600">{formErrors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Mô tả
                            </label>
                            <Textarea
                                placeholder="Mô tả chi tiết về task..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                data-testid="input-description"
                            />
                        </div>

                        {/* Status & Priority Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Trạng thái</label>
                                <Select value={statusCode} onValueChange={setStatusCode}>
                                    <SelectTrigger data-testid="select-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map((s) => (
                                            <SelectItem key={s.code} value={s.code}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Độ ưu tiên</label>
                                <Select value={priorityCode} onValueChange={setPriorityCode}>
                                    <SelectTrigger data-testid="select-priority">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map((p) => (
                                            <SelectItem key={p.code} value={p.code}>{p.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Loại</label>
                                <Select value={typeCode} onValueChange={setTypeCode}>
                                    <SelectTrigger data-testid="select-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TYPES.map((t) => (
                                            <SelectItem key={t.code} value={t.code}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dates Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    <Calendar className="inline-block mr-1 h-4 w-4" />
                                    Ngày bắt đầu
                                </label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    data-testid="input-start-date"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    <Calendar className="inline-block mr-1 h-4 w-4" />
                                    Hạn chót
                                </label>
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className={formErrors.dueDate ? 'border-red-300' : ''}
                                    data-testid="input-due-date"
                                />
                                {formErrors.dueDate && (
                                    <p className="text-sm text-red-600">{formErrors.dueDate}</p>
                                )}
                            </div>
                        </div>

                        {/* Assignees */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Giao cho
                            </label>
                            {!projectId ? (
                                <p className="text-sm text-slate-400">Vui lòng chọn dự án để thấy danh sách thành viên</p>
                            ) : teamMembers.length === 0 ? (
                                <p className="text-sm text-slate-400">Dự án chưa có thành viên</p>
                            ) : (
                                <div className="flex flex-wrap gap-2" data-testid="assignees-list">
                                    {teamMembers.map((member) => {
                                        const isSelected = selectedAssignees.includes(member.id);
                                        return (
                                            <button
                                                key={member.id}
                                                type="button"
                                                onClick={() => toggleAssignee(member.id)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                                                    isSelected
                                                        ? "bg-blue-50 border-blue-300 text-blue-700"
                                                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                                                )}
                                                data-testid={`assignee-${member.id}`}
                                            >
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs font-bold">
                                                        {member.full_name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">{member.full_name}</span>
                                                {isSelected && <CheckCircle2 size={14} className="text-blue-600" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Thẻ (Tags)
                            </label>
                            {tags.length === 0 ? (
                                <p className="text-sm text-slate-400">Chưa có thẻ nào</p>
                            ) : (
                                <div className="flex flex-wrap gap-2" data-testid="tags-list">
                                    {tags.map((tag) => {
                                        const isSelected = selectedTags.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => toggleTag(tag.id)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                                                    isSelected
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:border-blue-300"
                                                )}
                                                data-testid={`tag-${tag.id}`}
                                            >
                                                {tag.name}
                                                {isSelected && <X size={12} className="ml-1 inline" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/tasks')}
                                data-testid="btn-cancel"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                                data-testid="btn-submit"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tạo Task
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
