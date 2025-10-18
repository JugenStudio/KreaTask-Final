
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ListTodo, 
  PenSquare, 
  Settings,
  Trophy,
  User as UserIcon,
  LogOut,
  FileText,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import type { User } from "@/lib/types";
import Image from "next/image";
import { isEmployee } from "@/lib/roles";

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isLvl1 = isEmployee(user.role);

  const navItems = [
    { href: "/dashboard", icon: Home, label: t('sidebar.home') },
    { href: "/tasks", icon: ListTodo, label: t('sidebar.all_tasks') },
    { href: "/submit", icon: PenSquare, label: t('sidebar.submit_task') },
    { href: "/leaderboard", icon: Trophy, label: t('sidebar.leaderboard') },
    { 
      href: "/performance-report", 
      icon: isLvl1 ? History : FileText, 
      label: t('sidebar.performance_report') 
    },
  ];

  return (
    <aside className="w-64 flex-col border-r border-border bg-card p-4">
      <div className="flex items-center gap-2 px-2 py-4">
        <Image src="/images/logo2.png" alt="KreaTask Logo" width={32} height={32} />
        <h1 className="text-2xl font-headline font-bold text-foreground">KreaTask</h1>
      </div>
      <nav className="mt-8 flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          // Special case for dashboard to match root and /dashboard
          const isActive = item.href === "/dashboard" 
            ? pathname === "/" || pathname.startsWith(item.href)
            : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-muted-foreground transition-colors hover:text-foreground",
                isActive && "bg-primary text-primary-foreground font-semibold shadow-lg"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* User menu is now in the header for all screen sizes */}
    </aside>
  );
}
