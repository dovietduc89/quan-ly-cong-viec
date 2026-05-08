import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  Briefcase,
  User,
  ArrowRight,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const now = new Date();
  const threeDaysLater = addDays(now, 3);

  const allTasks = await db
    .select()
    .from(tasks)
    .where(isNull(tasks.deletedAt));

  const todoCount = allTasks.filter((t) => t.status === "todo").length;
  const inProgressCount = allTasks.filter((t) => t.status === "in_progress").length;
  const doneCount = allTasks.filter((t) => t.status === "done").length;

  const overdue = allTasks.filter(
    (t) => t.deadline && t.deadline < now && t.status !== "done"
  );

  const upcoming = allTasks.filter(
    (t) =>
      t.deadline &&
      t.deadline >= now &&
      t.deadline <= threeDaysLater &&
      t.status !== "done"
  );

  const workCount = allTasks.filter(
    (t) => t.category === "work" && t.status !== "done"
  ).length;
  const personalCount = allTasks.filter(
    (t) => t.category === "personal" && t.status !== "done"
  ).length;

  const firstName = session?.user?.name?.split(" ").pop() || "bạn";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Xin chào {firstName}, chúc bạn một ngày tốt lành! 🌟
        </h1>
        <p className="text-muted-foreground mt-0.5">
          Tổng quan công việc của bạn hôm nay — {format(now, "EEEE, dd/MM/yyyy", { locale: vi })}.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cần làm</CardTitle>
            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <ListTodo className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todoCount}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đang làm</CardTitle>
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{inProgressCount}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hoàn thành</CardTitle>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{doneCount}</div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow ${overdue.length > 0 ? "bg-rose-50 ring-1 ring-rose-200" : "bg-white"}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quá hạn</CardTitle>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${overdue.length > 0 ? "bg-rose-100" : "bg-slate-100"}`}>
              <AlertTriangle className={`h-4 w-4 ${overdue.length > 0 ? "text-rose-500" : "text-slate-400"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${overdue.length > 0 ? "text-rose-600" : ""}`}>
              {overdue.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-sky-50 to-blue-50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sky-700">Cơ quan</CardTitle>
            <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-700">{workCount}</div>
            <p className="text-xs text-sky-600/70 mt-1">
              công việc chưa hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Cá nhân</CardTitle>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{personalCount}</div>
            <p className="text-xs text-emerald-600/70 mt-1">
              công việc chưa hoàn thành
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue & Upcoming */}
      {overdue.length > 0 && (
        <Card className="border-0 shadow-sm ring-1 ring-rose-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
              Công việc quá hạn ({overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdue.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-50 text-sm"
                >
                  <span className="font-medium text-rose-800">{t.title}</span>
                  <span className="text-rose-600 text-xs font-semibold">
                    {t.deadline ? format(new Date(t.deadline), "dd/MM/yyyy", { locale: vi }) : ""}
                  </span>
                </div>
              ))}
              {overdue.length > 5 && (
                <Link
                  href="/tasks/list"
                  className="inline-flex items-center gap-1 text-sm text-rose-600 hover:underline font-medium"
                >
                  Xem tất cả {overdue.length} công việc quá hạn
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {upcoming.length > 0 && (
        <Card className="border-0 shadow-sm ring-1 ring-amber-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-700">
              <Clock className="h-4 w-4" />
              Sắp đến hạn ({upcoming.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50 text-sm"
                >
                  <span className="font-medium text-amber-800">{t.title}</span>
                  <span className="text-amber-600 text-xs font-semibold">
                    {t.deadline ? format(new Date(t.deadline), "dd/MM/yyyy", { locale: vi }) : ""}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {allTasks.length === 0 && (
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <ListTodo className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Chưa có công việc nào</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Bắt đầu thêm công việc đầu tiên của bạn.
            </p>
            <Link href="/tasks">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-indigo-600 hover:to-violet-600 transition-all shadow-md shadow-indigo-200">
                Tạo công việc mới
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
