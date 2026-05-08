import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckSquare, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await auth();
  if (session) redirect("/");

  const error = searchParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-violet-100 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-60" />
      <Card className="w-full max-w-sm shadow-xl border-0 shadow-indigo-100/50 relative">
        <CardHeader className="text-center space-y-4 pb-2 pt-8">
          <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-200">
            <CheckSquare className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Quản Lý Công Việc
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Quản lý công việc cá nhân & cơ quan
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700 flex items-center gap-2">
              <span className="text-rose-500">&#9888;</span>
              {error === "AccessDenied"
                ? "Email của bạn không được phép truy cập ứng dụng này."
                : "Đã có lỗi xảy ra. Vui lòng thử lại."}
            </div>
          )}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full h-12 gap-3 text-sm font-semibold inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 px-4 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Đăng nhập bằng Google
            </button>
          </form>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Chỉ cho phép tài khoản được ủy quyền</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
