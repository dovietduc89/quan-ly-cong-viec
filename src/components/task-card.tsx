"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  ListTodo,
} from "lucide-react";
import type { Task } from "@/lib/db/schema";
import {
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  type Priority,
  type Category,
} from "@/lib/types";
import { format, isPast, isToday } from "date-fns";
import { vi } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "todo" | "in_progress" | "done") => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [deleting, setDeleting] = useState(false);

  const isOverdue =
    task.deadline && isPast(new Date(task.deadline)) && task.status !== "done";
  const isDueToday =
    task.deadline && isToday(new Date(task.deadline)) && task.status !== "done";

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card
      className={`p-3.5 hover:shadow-md transition-all duration-200 cursor-pointer group border-0 shadow-sm ${
        isOverdue ? "ring-1 ring-rose-200 bg-rose-50/40" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-sm leading-snug ${
              task.status === "done" ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[task.category as Category]}`}
            >
              {CATEGORY_LABELS[task.category as Category]}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority as Priority]}`}
            >
              {PRIORITY_LABELS[task.priority as Priority]}
            </Badge>
          </div>

          {task.deadline && (
            <div
              className={`flex items-center gap-1.5 mt-2.5 text-[11px] ${
                isOverdue
                  ? "text-rose-600 font-semibold"
                  : isDueToday
                    ? "text-amber-600 font-semibold"
                    : "text-muted-foreground"
              }`}
            >
              {isOverdue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {format(new Date(task.deadline), "dd/MM/yyyy HH:mm", { locale: vi })}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-1.5">
            {task.status !== "todo" && (
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, "todo")}
                className="rounded-lg"
              >
                <ListTodo className="mr-2 h-4 w-4 text-slate-500" />
                Chuyển → Cần làm
              </DropdownMenuItem>
            )}
            {task.status !== "in_progress" && (
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, "in_progress")}
                className="rounded-lg"
              >
                <Play className="mr-2 h-4 w-4 text-blue-500" />
                Chuyển → Đang làm
              </DropdownMenuItem>
            )}
            {task.status !== "done" && (
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, "done")}
                className="rounded-lg"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                Chuyển → Hoàn thành
              </DropdownMenuItem>
            )}
            <div className="my-1 h-px bg-slate-100" />
            <DropdownMenuItem onClick={() => onEdit(task)} className="rounded-lg">
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={deleting}
              className="text-rose-600 rounded-lg"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xoá
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
