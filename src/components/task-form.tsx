"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/lib/db/schema";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string | null;
    category: "work" | "personal";
    priority: "high" | "medium" | "low";
    status?: "todo" | "in_progress" | "done";
    deadline?: string | null;
  }) => Promise<unknown>;
  task?: Task | null;
}

export function TaskForm({ open, onClose, onSubmit, task }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [category, setCategory] = useState<"work" | "personal">(
    (task?.category as "work" | "personal") || "work"
  );
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">(
    (task?.status as "todo" | "in_progress" | "done") || "todo"
  );
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    (task?.priority as "high" | "medium" | "low") || "medium"
  );
  const getDefaultDeadline = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T23:59`;
  };
  const [deadline, setDeadline] = useState(
    task?.deadline
      ? new Date(task.deadline).toISOString().slice(0, 16)
      : getDefaultDeadline()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        category,
        priority,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {task ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc..."
              autoFocus
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết (tuỳ chọn)..."
              rows={6}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Phân loại</Label>
              <Select value={category} onValueChange={(v: string) => setCategory(v as "work" | "personal")}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Cơ quan</SelectItem>
                  <SelectItem value="personal">Cá nhân</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={status} onValueChange={(v: string) => setStatus(v as "todo" | "in_progress" | "done")}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Cần làm</SelectItem>
                  <SelectItem value="in_progress">Đang làm</SelectItem>
                  <SelectItem value="done">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ưu tiên</Label>
              <Select value={priority} onValueChange={(v: string) => setPriority(v as "high" | "medium" | "low")}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Vừa</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Hạn chót</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 px-5">
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim()}
              className="h-10 px-5 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 text-white border-0"
            >
              {loading ? "Đang lưu..." : task ? "Cập nhật" : "Tạo công việc"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
