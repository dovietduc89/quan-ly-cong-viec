"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  KanbanSquare,
  List,
  Calendar,
  LogOut,
  Menu,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/tasks", label: "Bảng công việc", icon: KanbanSquare },
  { href: "/tasks/list", label: "Danh sách", icon: List },
  { href: "/tasks/calendar", label: "Lịch", icon: Calendar },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-6">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">Quản Lý Công Việc</span>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                    pathname === link.href
                      ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mr-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shadow-sm">
            <CheckSquare className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:block text-blue-600">
            Quản Lý Công Việc
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-all duration-200",
                pathname === link.href
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User menu */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-blue-100 hover:ring-blue-200 transition-all">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                  />
                  <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-2">
              <div className="px-2 py-2 mb-1">
                <p className="text-sm font-semibold">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-rose-600 cursor-pointer rounded-lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
