// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Star,
  Clock,
  BarChart2,
  Shield,
  Settings,
  LogOut,
  Sun,
  Moon,
  Layers,
} from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/favorites", icon: Star, label: "Favorites" },
  { href: "/dashboard/recent", icon: Clock, label: "Recently Used" },
  { href: "/dashboard/stats", icon: BarChart2, label: "Statistics" },
];

const adminItems = [
  { href: "/dashboard/audit", icon: Shield, label: "Audit Logs" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
            <Layers size={16} className="text-primary" />
          </div>
          <span className="font-semibold text-foreground">Formium Hub</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          ))}

          {user.role === "ADMIN" && (
            <>
              <p className="px-2 mt-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Admin
              </p>
              {adminItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                />
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-1">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          {/* User info */}
          <div className="px-3 py-2 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-foreground truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {user.role}
            </span>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
