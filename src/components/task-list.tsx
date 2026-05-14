"use client";

import { useState, useMemo } from "react";
import { Plus, Search, ArrowUpDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TaskForm } from "@/components/task-form";
import { TaskFiltersBar, type TaskFilters } from "@/components/task-filters";
import { useTasks } from "@/hooks/use-tasks";
import type { Task } from "@/lib/db/schema";
import {
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  type Priority,
  type Category,
  type Status,
} from "@/lib/types";
import { format, isPast } from "date-fns";
import { vi } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type SortBy = "deadline" | "priority" | "created";

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function TaskListView() {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("deadline");
  const [filters, setFilters] = useState<TaskFilters>({
    category: "all",
    priority: "all",
    search: "",
  });

  const sortedTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (filters.category !== "all" && t.category !== filters.category) return false;
      if (filters.priority !== "all" && t.priority !== filters.priority) return false;
      if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "deadline") {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "priority") {
        return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
      }
      return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
    });
  }, [tasks, filters, sortBy]);

  const handleSubmit = async (data: {
    title: string;
    description?: string | null;
    category: "work" | "personal";
    priority: "high" | "medium" | "low";
    status?: "todo" | "in_progress" | "done";
    deadline?: string | null;
  }) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xoá công việc này?")) {
      deleteTask(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-rose-600 font-medium">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm công việc..."
              className="pl-10 h-10 rounded-xl bg-white border-slate-200"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 rounded-xl px-4">
                <ArrowUpDown className="h-4 w-4 mr-1.5" />
                Sắp xếp
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1.5">
              <DropdownMenuItem onClick={() => setSortBy("deadline")} className="rounded-lg">Hạn chót</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("priority")} className="rounded-lg">Ưu tiên</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("created")} className="rounded-lg">Ngày tạo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 text-white border-0 px-5"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tạo công việc
        </Button>
      </div>

      <TaskFiltersBar filters={filters} onChange={setFilters} />

      <div className="space-y-2">
        {sortedTasks.map((task) => {
          const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== "done";
          return (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3.5 bg-white rounded-xl border hover:shadow-md transition-all duration-200 ${
                isOverdue ? "border-rose-200 bg-rose-50/30" : "border-slate-100"
              }`}
            >
              <button
                onClick={() =>
                  updateTask(task.id, {
                    status: task.status === "done" ? "todo" : "done",
                  })
                }
                className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  task.status === "done"
                    ? "bg-emerald-500 border-emerald-500 text-white scale-110"
                    : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                {task.status === "done" && <CheckCircle2 className="h-3 w-3" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[task.category as Category]}`}>
                    {CATEGORY_LABELS[task.category as Category]}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority as Priority]}`}>
                    {PRIORITY_LABELS[task.priority as Priority]}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status as Status]}`}>
                    {STATUS_LABELS[task.status as Status]}
                  </Badge>
                </div>
              </div>

              {task.deadline && (
                <span className={`text-xs flex-shrink-0 ${isOverdue ? "text-rose-600 font-semibold" : "text-muted-foreground"}`}>
                  {format(new Date(task.deadline), "dd/MM/yyyy", { locale: vi })}
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 rounded-lg">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-1.5">
                  <DropdownMenuItem onClick={() => { setEditingTask(task); setFormOpen(true); }} className="rounded-lg">
                    <Pencil className="mr-2 h-4 w-4" />Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-rose-600 rounded-lg">
                    <Trash2 className="mr-2 h-4 w-4" />Xoá
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        {sortedTasks.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-base">Không có công việc nào.</p>
            <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo công việc mới.</p>
          </div>
        )}
      </div>

      {formOpen && (
        <TaskForm open={formOpen} onClose={handleClose} onSubmit={handleSubmit} task={editingTask} />
      )}
    </div>
  );
}
