import { Navbar } from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">{children}</main>
      <footer className="py-4 text-center text-xs text-muted-foreground">
        © 2006 - Good luck
      </footer>
    </div>
  );
}
