"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { TaskForm } from "@/components/task-form";
import { useTasks } from "@/hooks/use-tasks";
import type { Task } from "@/lib/db/schema";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { vi } from "date-fns/locale";

export function TaskCalendarView() {
  const { tasks, loading, error, createTask, updateTask } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (task.deadline) {
        const key = format(new Date(task.deadline), "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const handleSubmit = async (data: {
    title: string;
    description?: string;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-rose-600 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-indigo-600 underline">Thử lại</button>
      </div>
    );
  }

  const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-bold min-w-[180px] text-center capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: vi })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 ml-2 rounded-xl"
            onClick={() => setCurrentMonth(new Date())}
          >
            Hôm nay
          </Button>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-md shadow-indigo-200 text-white border-0 px-5"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tạo công việc
        </Button>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-7 bg-slate-50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDay.get(key) || [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={key}
                className={`min-h-[110px] border-t border-l p-1.5 transition-colors ${
                  !inMonth ? "bg-slate-50/50" : "bg-white hover:bg-slate-50/50"
                }`}
              >
                <div
                  className={`text-xs font-semibold mb-1 h-7 w-7 flex items-center justify-center rounded-lg ${
                    today
                      ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm"
                      : !inMonth
                        ? "text-muted-foreground/40"
                        : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setEditingTask(task);
                        setFormOpen(true);
                      }}
                      className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium transition-opacity hover:opacity-80 ${
                        task.status === "done"
                          ? "bg-emerald-100 text-emerald-700 line-through"
                          : task.priority === "high"
                            ? "bg-rose-100 text-rose-700"
                            : task.priority === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-muted-foreground px-1.5 font-medium">
                      +{dayTasks.length - 3} khác
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {formOpen && (
        <TaskForm
          open={formOpen}
          onClose={handleClose}
          onSubmit={handleSubmit}
          task={editingTask}
        />
      )}
    </div>
  );
}
