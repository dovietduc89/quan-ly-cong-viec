"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "@/lib/db/schema";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Không thể tải danh sách công việc");
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: {
    title: string;
    description?: string | null;
    category: "work" | "personal";
    priority: "high" | "medium" | "low";
    status?: "todo" | "in_progress" | "done";
    deadline?: string | null;
  }) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      alert("Không thể tạo công việc. Vui lòng thử lại.");
      return null;
    }
    const task = await res.json();
    setTasks((prev) => [task, ...prev]);
    return task;
  };

  const updateTask = async (
    id: string,
    data: Partial<{
      title: string;
      description: string | null;
      category: "work" | "personal";
      priority: "high" | "medium" | "low";
      status: "todo" | "in_progress" | "done";
      deadline: string | null;
    }>
  ) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (!res.ok) {
      alert("Không thể cập nhật công việc. Vui lòng thử lại.");
      return null;
    }
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTask = async (id: string) => {
    const res = await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      alert("Không thể xoá công việc. Vui lòng thử lại.");
      return false;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  const reorderTask = async (taskId: string, status: string, orderedIds: string[]) => {
    const res = await fetch("/api/tasks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status, orderedIds }),
    });
    if (!res.ok) return false;
    await fetchTasks();
    return true;
  };

  return { tasks, loading, error, createTask, updateTask, deleteTask, reorderTask, refetch: fetchTasks };
}
