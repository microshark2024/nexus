import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProjectsListPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id, name, description, status, created_at,
      workspaces ( name, id )
    `)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">所有项目</h1>
          <p className="text-zinc-600">管理你有权限访问的所有项目</p>
        </div>
        <Link href="/dashboard/projects/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 新建项目
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto">
          <p className="mb-6 text-zinc-600">目前还没有项目</p>
          <Link href="/dashboard/projects/new" className="btn btn-primary">创建第一个项目</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p: any) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="card p-6 group hover:border-zinc-300 flex flex-col"
            >
              <div className="flex-1">
                <div className="font-semibold text-lg tracking-tight group-hover:text-accent transition">{p.name}</div>
                <div className="text-xs text-zinc-500 mt-px">{p.workspaces?.name}</div>
                {p.description && (
                  <p className="mt-4 text-sm text-zinc-600 line-clamp-3">{p.description}</p>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between text-xs">
                <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600">{p.status}</span>
                <span className="text-zinc-400">{new Date(p.created_at).toLocaleDateString("zh-CN")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
