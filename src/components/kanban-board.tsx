"use client";

import { useState, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus, Search, ListTodo, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/task-card";
import { TaskForm } from "@/components/task-form";
import { TaskFiltersBar, type TaskFilters } from "@/components/task-filters";
import { useTasks } from "@/hooks/use-tasks";
import type { Task } from "@/lib/db/schema";
import type { Status } from "@/lib/types";

const COLUMNS: { id: Status; title: string; icon: React.ElementType; iconColor: string; badgeColor: string; bgColor: string }[] = [
  { id: "todo", title: "Công việc cần làm", icon: ListTodo, iconColor: "text-amber-600", badgeColor: "bg-amber-600", bgColor: "bg-amber-50/80 border-amber-200" },
  { id: "in_progress", title: "Đang thực hiện", icon: Clock, iconColor: "text-blue-600", badgeColor: "bg-blue-600", bgColor: "bg-blue-50/80 border-blue-200" },
  { id: "done", title: "Đã hoàn thành", icon: CheckCircle2, iconColor: "text-emerald-600", badgeColor: "bg-emerald-600", bgColor: "bg-emerald-50/80 border-emerald-200" },
];

export function KanbanBoard() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, reorderTask } = useTasks();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    category: "all",
    priority: "all",
    search: "",
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.category !== "all" && t.category !== filters.category)
        return false;
      if (filters.priority !== "all" && t.priority !== filters.priority)
        return false;
      if (
        filters.search &&
        !t.title.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [tasks, filters]);

  const [localOrder, setLocalOrder] = useState<Record<string, Task[]>>({});

  const columns = useMemo(() => {
    return COLUMNS.map((col) => {
      const colTasks = localOrder[col.id] || filteredTasks.filter((t) => t.status === col.id);
      return { ...col, tasks: colTasks };
    });
  }, [filteredTasks, localOrder]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    const srcStatus = source.droppableId as Status;
    const destStatus = destination.droppableId as Status;

    const srcTasks = [...(localOrder[srcStatus] || filteredTasks.filter((t) => t.status === srcStatus))];
    const destTasks = srcStatus === destStatus
      ? srcTasks
      : [...(localOrder[destStatus] || filteredTasks.filter((t) => t.status === destStatus))];

    const [moved] = srcTasks.splice(source.index, 1);
    if (!moved) return;

    const movedTask = { ...moved, status: destStatus };
    destTasks.splice(destination.index, 0, movedTask);

    setLocalOrder((prev) => ({
      ...prev,
      [srcStatus]: srcStatus === destStatus ? destTasks : srcTasks,
      [destStatus]: destTasks,
    }));

    reorderTask(draggableId, destStatus, destTasks.map((t) => t.id)).then(() => {
      setLocalOrder({});
    });
  };

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

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm công việc..."
              className="pl-10 h-10 rounded-xl bg-white border-slate-200"
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
            />
          </div>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 text-white border-0 px-5"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tạo công việc
        </Button>
      </div>

      {/* Filters */}
      <TaskFiltersBar filters={filters} onChange={setFilters} />

      {/* Kanban columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory md:snap-none">
          {columns.map((col) => (
            <div
              key={col.id}
              className={`${col.bgColor} rounded-2xl p-4 border min-w-[280px] md:min-w-0 snap-center`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <col.icon className={`h-4 w-4 ${col.iconColor}`} />
                  <h3 className="font-semibold text-base">{col.title}</h3>
                </div>
                <span className={`text-xs font-semibold text-white ${col.badgeColor} rounded-full px-2.5 py-0.5 shadow-sm`}>
                  {col.tasks.length}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2.5 min-h-[120px] rounded-xl transition-colors p-1 ${snapshot.isDraggingOver ? "bg-blue-50/60" : ""
                      }`}
                  >
                    {col.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={
                              snapshot.isDragging ? "opacity-90 rotate-1 scale-105" : ""
                            }
                          >
                            <TaskCard
                              task={task}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onStatusChange={(id, status) =>
                                updateTask(id, { status })
                              }
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task form dialog */}
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
