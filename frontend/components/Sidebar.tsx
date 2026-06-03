"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, Settings, LogOut, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  userName?: string | null;
}

export default function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
    { href: "/dashboard/projects", label: "所有项目", icon: FolderOpen },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="w-64 border-r border-zinc-200 bg-white h-screen flex flex-col">
      <div className="h-16 px-5 flex items-center gap-3 border-b">
        <div className="w-8 h-8 rounded-2xl bg-zinc-950 flex items-center justify-center">
          <span className="text-white font-semibold tracking-[-1.5px] text-[21px]">N</span>
        </div>
        <div>
          <div className="font-semibold tracking-tight">Nexus</div>
          <div className="text-[10px] text-zinc-400 -mt-0.5">PROFESSIONAL</div>
        </div>
      </div>

      <div className="px-3 pt-4 flex-1">
        <div className="text-[10px] uppercase tracking-[1px] text-zinc-400 px-3 mb-2 font-medium">工作区</div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-[9px] rounded-xl text-sm mb-0.5 transition ${
                active ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/dashboard/projects/new"
          className="mt-4 flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 text-zinc-600 hover:text-zinc-950 transition w-full justify-center"
        >
          <Plus className="w-4 h-4" /> 新建项目
        </Link>
      </div>

      <div className="p-3 border-t mt-auto">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-50 mb-1 text-sm">
          <div className="w-7 h-7 rounded-full bg-zinc-200 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-sm">{userName || "用户"}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </div>
  );
}
