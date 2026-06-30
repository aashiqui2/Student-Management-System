import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  PencilRuler,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const items = [
  { text: "Dashboard", icon: LayoutDashboard, path: "/dashboard" as const },
  { text: "Students", icon: Users, path: "/students" as const },
  { text: "Assessments", icon: ClipboardList, path: "/assessments" as const },
  { text: "Marks Entry", icon: PencilRuler, path: "/marks" as const },
];

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/login" });
  };

  return (
    <aside
      className={cn(
        "relative shrink-0 border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[72px]" : "w-60",
      )}
    >
      <div className="sticky top-0 flex h-full flex-col">
        <div
          className={cn(
            "flex h-[72px] items-center px-4",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.72_0.15_200)] p-1.5 text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">EduTrack</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <div className="border-t border-border" />

        <nav className="flex flex-col gap-1 p-2 pt-4">
          {items.map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/" && pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.text}
                to={item.path}
                title={collapsed ? item.text : undefined}
                className={cn(
                  "relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed ? "justify-center" : "gap-3",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-3/5 w-1 -translate-y-1/2 rounded-r bg-primary" />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.text}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto p-4">
          <button
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
            className={cn(
              "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
