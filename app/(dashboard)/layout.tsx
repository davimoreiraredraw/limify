"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { SidebarProvider, useSidebar } from "@/lib/hooks/use-sidebar";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isMobile ? "" : isCollapsed ? "ml-[80px]" : "ml-[240px]"
        }`}
      >
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <footer className="py-4 px-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Limify. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
