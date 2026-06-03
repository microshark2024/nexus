"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("项目名称不能为空");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("请先登录");
      router.push("/login");
      return;
    }

    // 2. Find or create a default workspace for the user
    let { data: workspaces } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1);

    let workspaceId = workspaces?.[0]?.id;

    if (!workspaceId) {
      // Create a workspace on the fly
      const { data: newWs, error: wsErr } = await supabase
        .from("workspaces")
        .insert({
          name: `${user.email?.split("@")[0] || "我的"}的工作空间`,
          owner_id: user.id,
        })
        .select("id")
        .single();

      if (wsErr) {
        toast.error("创建工作空间失败：" + wsErr.message);
        setLoading(false);
        return;
      }
      workspaceId = newWs.id;

      // Add owner membership
      await supabase.from("workspace_members").insert({
        workspace_id: workspaceId,
        user_id: user.id,
        role: "owner",
      });
    }

    // 3. Create project
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        workspace_id: workspaceId,
        created_by: user.id,
        status: "active",
      })
      .select("id")
      .single();

    if (error) {
      toast.error("创建项目失败：" + error.message);
    } else {
      toast.success("项目创建成功！");
      router.push(`/projects/${project.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg">
      <Link href="/dashboard/projects" className="inline-flex text-sm items-center gap-1 text-zinc-500 mb-6 hover:text-zinc-800">
        <ArrowLeft className="w-4 h-4" /> 返回项目列表
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight mb-1">新建项目</h1>
      <p className="text-zinc-600 mb-8">创建一个新的专业项目，开始协作与 AI 分析。</p>

      <form onSubmit={handleCreate} className="space-y-5 card p-7">
        <div>
          <label className="block text-sm font-medium mb-1.5">项目名称 *</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：Q4 产品发布"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">项目描述（可选）</label>
          <textarea
            className="input min-h-[92px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简要描述项目目标和范围..."
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 mt-2">
          {loading ? "创建中..." : "创建项目"}
        </button>
      </form>

      <p className="text-xs text-zinc-500 mt-4 px-1">
        项目会自动归属到你的默认工作空间。你可以后续邀请团队成员。
      </p>
    </div>
  );
}
