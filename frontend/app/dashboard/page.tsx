import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get workspaces + projects count
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, description, status, workspace_id, created_at, workspaces(name)")
    .order("created_at", { ascending: false })
    .limit(6);

  const { count: totalProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  const { count: totalTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true });

  const { count: openTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .in("status", ["todo", "doing"]);

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">仪表盘</h1>
          <p className="text-zinc-600 mt-1">欢迎回来，祝你今天工作顺利。</p>
        </div>
        <Link href="/dashboard/projects/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 新建项目
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="card p-6">
          <div className="text-sm text-zinc-500">活跃项目</div>
          <div className="text-5xl font-semibold tracking-tighter mt-2">{totalProjects || 0}</div>
          <div className="text-emerald-600 text-sm mt-1">所有工作空间</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-zinc-500">进行中的任务</div>
          <div className="text-5xl font-semibold tracking-tighter mt-2">{openTasks || 0}</div>
          <div className="text-sm mt-1 text-zinc-500">待办 + 进行中</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-zinc-500">总任务数</div>
          <div className="text-5xl font-semibold tracking-tighter mt-2">{totalTasks || 0}</div>
          <Link href="/dashboard/projects" className="text-sm inline-flex items-center gap-1 text-accent mt-1 hover:underline">
            查看所有项目 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold text-xl tracking-tight">最近项目</h2>
        <Link href="/dashboard/projects" className="text-sm text-zinc-500 hover:text-zinc-800 flex items-center gap-1">
          查看全部 <ArrowRight className="w-3.5" />
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="card p-5 group block hover:border-zinc-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold group-hover:text-accent transition">{project.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{project.workspaces?.name}</div>
                </div>
                <div className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 self-start">
                  {project.status}
                </div>
              </div>
              {project.description && (
                <p className="mt-3 text-sm text-zinc-600 line-clamp-2">{project.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <p className="text-zinc-500 mb-4">你还没有创建任何项目</p>
          <Link href="/dashboard/projects/new" className="btn btn-primary inline-flex">创建第一个项目</Link>
        </div>
      )}

      {/* Workspaces teaser */}
      <div className="mt-12">
        <h2 className="font-semibold text-xl tracking-tight mb-4">我的工作空间</h2>
        <div className="flex flex-wrap gap-3">
          {workspaces?.map((ws: any) => (
            <div key={ws.id} className="rounded-2xl border px-5 py-3 text-sm bg-white">
              {ws.name}
            </div>
          ))}
          {(!workspaces || workspaces.length === 0) && (
            <div className="text-sm text-zinc-500">注册后系统会自动为你创建一个默认工作空间。</div>
          )}
        </div>
      </div>
    </div>
  );
}
