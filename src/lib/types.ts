export type Category = "work" | "personal";
export type Priority = "high" | "medium" | "low";
export type Status = "todo" | "in_progress" | "done";

export const CATEGORY_LABELS: Record<Category, string> = {
  work: "Cơ quan",
  personal: "Cá nhân",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "Cao",
  medium: "Vừa",
  low: "Thấp",
};

export const STATUS_LABELS: Record<Status, string> = {
  todo: "Cần làm",
  in_progress: "Đang làm",
  done: "Hoàn thành",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-600 border-slate-200",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  work: "bg-sky-50 text-sky-700 border-sky-200",
  personal: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const STATUS_COLORS: Record<Status, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
};
