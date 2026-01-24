import { create } from 'zustand';

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status_code: string;
    priority_code: string;
    type_code: string;
    start_date: string | null;
    due_date: string | null;
    project?: { id: string; name: string; code: string };
    assignees?: { user: { id: string; full_name: string } }[];
    subtasks?: {
        id: string;
        title: string;
        status_code: string;
        end_date: string | null;
        created_by: string;
        creator_name?: string;
        order_index?: number;
        has_logs?: boolean;
        logged_minutes?: number;
    }[];
    total_logged_minutes?: number;
    comments?: {
        id: string;
        content: string;
        created_at: string;
        created_by: string;
        creator_name?: string;
    }[];
    attachments?: {
        id: string;
        name: string;
        mime_type: string;
        url: string;
        created_at: string;
        creator_name?: string;
    }[];
    tags?: { id: string; name: string; color?: string }[];
    assignee_ids?: string[];
    tag_ids?: string[];
    is_locked?: boolean;
    row_version?: number;
    capabilities?: {
        can_update: boolean;
        can_delete: boolean;
        can_log_time: boolean;
        allowed_fields: string[];
    };
}

export interface HistoryItem {
    id: string;
    user_name: string;
    action_text: string;
    details: string | null;
    created_at: string;
}

interface TaskState {
    tasks: Task[];
    currentTask: Task | null;
    history: HistoryItem[];
    loading: boolean;
    loadingHistory: boolean;
    error: string | null;

    // Basic Setters
    setTasks: (tasks: Task[]) => void;
    setCurrentTask: (task: Task | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    fetchProjectTasks: (projectId: string, userId: string) => Promise<void>;

    // Core Task Actions
    fetchTaskDetail: (id: string, userId: string) => Promise<void>;
    updateTask: (id: string, userId: string, data: Partial<Task>) => Promise<boolean>;
    deleteTask: (id: string, userId: string) => Promise<boolean>;
    updateTaskFieldStore: (id: string, userId: string, field: string, value: any) => Promise<void>;
    reorderTask: (taskId: string, userId: string, direction: 'UP' | 'DOWN') => Promise<void>;

    // Subtask Actions
    addSubtask: (taskId: string, userId: string, data: { title: string; end_date: string }) => Promise<void>;
    updateSubtask: (subId: string, userId: string, data: Partial<any>) => Promise<void>;
    deleteSubtask: (subId: string, userId: string) => Promise<void>;
    reorderSubtask: (subId: string, userId: string, direction: 'UP' | 'DOWN') => Promise<void>;
    toggleSubtask: (subId: string, userId: string, currentStatus: string) => Promise<void>;

    // Comment Actions
    addComment: (taskId: string, userId: string, content: string) => Promise<void>;

    // Time Log Actions
    addTimeLog: (taskId: string, userId: string, data: any) => Promise<void>;

    // History Actions
    fetchHistory: (taskId: string, userId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    currentTask: null,
    history: [],
    loading: false,
    loadingHistory: false,
    error: null,

    setTasks: (tasks) => set({ tasks }),
    setCurrentTask: (task) => set({ currentTask: task }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    fetchProjectTasks: async (projectId, userId) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/projects/${projectId}/tasks`, {
                headers: { 'x-user-id': userId }
            });
            const data = await res.json();
            set({ tasks: data.data || [], loading: false });
        } catch (error) {
            set({ error: 'Không thể tải danh sách công việc', loading: false });
        }
    },

    fetchTaskDetail: async (id, userId) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                headers: { 'x-user-id': userId }
            });
            const data = await res.json();
            set({ currentTask: data, loading: false });
        } catch (error) {
            set({ error: 'Không thể tải chi tiết công việc', loading: false });
        }
    },

    updateTask: async (id, userId, data) => {
        const currentTask = get().currentTask;
        const payload: any = { ...data };
        if (currentTask && currentTask.id === id) {
            payload.row_version = currentTask.row_version;
        }

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify(payload)
            });

            if (res.status === 409) {
                const errorData = await res.json();
                set({ error: errorData.message || 'Xung đột dữ liệu. Vui lòng tải lại trang.' });
                return false;
            }

            if (res.ok) {
                await get().fetchTaskDetail(id, userId);
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    deleteTask: async (id, userId) => {
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': userId }
            });
            return res.ok;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    updateTaskFieldStore: async (id, userId, field, value) => {
        const currentTask = get().currentTask;
        const payload: any = { [field]: value };
        if (currentTask && currentTask.id === id) {
            payload.row_version = currentTask.row_version;
        }

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify(payload)
            });

            if (res.status === 409) {
                const errorData = await res.json();
                set({ error: errorData.message || 'Xung đột dữ liệu. Vui lòng tải lại trang.' });
                alert(errorData.message || 'Xung đột dữ liệu. Vui lòng tải lại trang.');
                return;
            }

            await get().fetchTaskDetail(id, userId);
        } catch (error) {
            set({ error: 'Không thể cập nhật công việc' });
        }
    },

    reorderTask: async (taskId, userId, direction) => {
        try {
            await fetch(`/api/tasks/${taskId}/reorder`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify({ direction })
            });
            // Note: Since this affects the task list, the component should handle re-fetching the list
        } catch (error) {
            console.error(error);
        }
    },

    addSubtask: async (taskId, userId, data) => {
        try {
            await fetch(`/api/tasks/${taskId}/subtasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify(data)
            });
            await get().fetchTaskDetail(taskId, userId);
        } catch (error) {
            console.error(error);
        }
    },

    updateSubtask: async (subId, userId, data) => {
        try {
            await fetch(`/api/subtasks/${subId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify(data)
            });
            const currentTask = get().currentTask;
            if (currentTask) await get().fetchTaskDetail(currentTask.id, userId);
        } catch (error) {
            console.error(error);
        }
    },

    deleteSubtask: async (subId, userId) => {
        try {
            await fetch(`/api/subtasks/${subId}`, {
                method: 'DELETE',
                headers: { 'x-user-id': userId }
            });
            const currentTask = get().currentTask;
            if (currentTask) await get().fetchTaskDetail(currentTask.id, userId);
        } catch (error) {
            console.error(error);
        }
    },

    reorderSubtask: async (subId, userId, direction) => {
        try {
            await fetch(`/api/subtasks/${subId}/reorder`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify({ direction })
            });
            const currentTask = get().currentTask;
            if (currentTask) await get().fetchTaskDetail(currentTask.id, userId);
        } catch (error) {
            console.error(error);
        }
    },

    toggleSubtask: async (subId, userId, currentStatus) => {
        const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
        await get().updateSubtask(subId, userId, { status_code: newStatus });
    },

    addComment: async (taskId, userId, content) => {
        try {
            await fetch(`/api/tasks/${taskId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify({ content })
            });
            await get().fetchTaskDetail(taskId, userId);
        } catch (error) {
            console.error(error);
        }
    },

    addTimeLog: async (taskId, userId, data) => {
        try {
            await fetch(`/api/tasks/${taskId}/time-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify(data)
            });
            await get().fetchTaskDetail(taskId, userId);
        } catch (error) {
            console.error(error);
        }
    },

    fetchHistory: async (taskId, userId) => {
        set({ loadingHistory: true });
        try {
            const res = await fetch(`/api/tasks/${taskId}/history`, {
                headers: { 'x-user-id': userId }
            });
            const data = await res.json();
            set({ history: data.data || [], loadingHistory: false });
        } catch (error) {
            set({ loadingHistory: false });
            console.error(error);
        }
    }
}));
