"use client";

import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import type { Category, Priority } from "@/lib/types";

export interface TaskFilters {
  category: Category | "all";
  priority: Priority | "all";
  search: string;
}

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export function TaskFiltersBar({ filters, onChange }: TaskFiltersBarProps) {
  const hasFilters =
    filters.category !== "all" || filters.priority !== "all" || filters.search;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />

      {/* Category */}
      <div className="flex gap-1">
        {(["all", "work", "personal"] as const).map((cat) => (
          <Button
            key={cat}
            variant={filters.category === cat ? "default" : "outline"}
            size="sm"
            className={`h-8 text-xs rounded-full px-3.5 ${
              filters.category === cat
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-0 shadow-sm"
                : "hover:bg-slate-50"
            }`}
            onClick={() => onChange({ ...filters, category: cat })}
          >
            {cat === "all" ? "Tất cả" : cat === "work" ? "Cơ quan" : "Cá nhân"}
          </Button>
        ))}
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Priority */}
      <div className="flex gap-1">
        {(["all", "high", "medium", "low"] as const).map((p) => (
          <Button
            key={p}
            variant={filters.priority === p ? "default" : "outline"}
            size="sm"
            className={`h-8 text-xs rounded-full px-3.5 ${
              filters.priority === p
                ? p === "high"
                  ? "bg-rose-500 text-white border-0 shadow-sm"
                  : p === "medium"
                    ? "bg-amber-500 text-white border-0 shadow-sm"
                    : p === "low"
                      ? "bg-slate-500 text-white border-0 shadow-sm"
                      : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-0 shadow-sm"
                : "hover:bg-slate-50"
            }`}
            onClick={() => onChange({ ...filters, priority: p })}
          >
            {p === "all" ? "Tất cả" : p === "high" ? "Cao" : p === "medium" ? "Vừa" : "Thấp"}
          </Button>
        ))}
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground hover:text-rose-600 rounded-full"
          onClick={() =>
            onChange({ category: "all", priority: "all", search: "" })
          }
        >
          <X className="h-3 w-3 mr-1" />
          Xoá bộ lọc
        </Button>
      )}
    </div>
  );
}
