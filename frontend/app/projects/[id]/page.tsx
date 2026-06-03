"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Sparkles, Trash2, Calendar, User } from "lucide-react";
import type { Project, Task, TaskStatus, TaskPriority, AIInsightResponse } from "@/types";
import { formatDate, getDueDateColor, getPriorityColor, getStatusColor, statusLabels, priorityLabels } from "@/lib/utils";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIInsightResponse | null>(null);
  const [insightType, setInsightType] = useState<"summary" | "priorities" | "risks" | "next_actions">("summary");

  const supabase = createClient();

  // Load project + tasks
  const loadData = async () => {
    setLoading(true);

    const [{ data: proj }, { data: taskList }] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase.from("tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    ]);

    if (!proj) {
      toast.error("项目不存在或你没有权限访问");
      router.push("/dashboard");
      return;
    }

    setProject(proj as Project);
    setTasks((taskList || []) as Task[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Realtime subscription for tasks (professional touch)
    const channel = supabase
      .channel(`project-tasks-${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        () => {
          // Refresh on any change
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Create task
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    due_date: "",
  });

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("tasks").insert({
      project_id: projectId,
      title: newTask.title.trim(),
      description: newTask.description.trim() || null,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      status: "todo",
      created_by: user?.id || null,
    });

    if (error) {
      toast.error("创建任务失败: " + error.message);
    } else {
      toast.success("任务已创建");
      setNewTask({ title: "", description: "", priority: "medium", due_date: "" });
      setShowNewTask(false);
      // realtime will refresh
    }
  };

  // Update task status (drag simple buttons)
  const updateTaskStatus = async (task: Task, newStatus: TaskStatus) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id);

    if (error) toast.error("更新失败");
    // realtime handles refresh
  };

  // Delete task
  const deleteTask = async (id: string) => {
    if (!confirm("确定删除这个任务吗？")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) toast.error("删除失败");
  };

  // AI Insights - calls Python backend
  const fetchAIInsights = async () => {
    if (!project || tasks.length === 0) {
      toast.error("至少需要一个任务才能生成洞察");
      return;
    }

    setAiLoading(true);
    setAiResult(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      // Prepare clean payload for Python
      const payload = {
        project: {
          project_id: project.id,
          project_name: project.name,
          project_description: project.description,
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            due_date: t.due_date,
            // assignee_name left empty for simplicity (can join later)
          })),
        },
        insight_type: insightType,
      };

      const res = await fetch(`${apiBase}/ai/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "AI 服务返回错误");
      }

      const data: AIInsightResponse = await res.json();
      setAiResult(data);
      setShowAI(true);
    } catch (err: any) {
      toast.error("调用 AI 失败: " + (err.message || "请确认后端服务正在运行"));
      // Still show a helpful fallback
      setAiResult({
        insight_type: insightType,
        content: "无法连接到 AI 后端服务。\n\n请确认：\n1. Python FastAPI 已启动 (http://localhost:8000)\n2. backend/.env 中配置了 LLM_API_KEY\n\n你仍然可以手动分析任务列表。",
        generated_at: new Date().toISOString(),
        model_used: "error",
        is_demo: true,
      });
      setShowAI(true);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-zinc-500">加载项目中...</div>;
  }

  if (!project) return null;

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
            <span className="text-xs self-start mt-2 px-2.5 py-px rounded bg-zinc-200 text-zinc-600">{project.status}</span>
          </div>
          {project.description && <p className="text-zinc-600">{project.description}</p>}
        </div>

        <div className="ml-auto flex gap-3">
          <button
            onClick={() => {
              setShowAI(false);
              setAiResult(null);
              fetchAIInsights();
            }}
            disabled={aiLoading}
            className="btn btn-primary gap-2 disabled:opacity-70"
          >
            <Sparkles className="w-4 h-4" />
            {aiLoading ? "AI 分析中..." : "获取 AI 洞察"}
          </button>
          <button onClick={() => setShowNewTask(!showNewTask)} className="btn btn-secondary gap-2">
            <Plus className="w-4 h-4" /> 添加任务
          </button>
        </div>
      </div>

      {/* New Task Form */}
      {showNewTask && (
        <form onSubmit={createTask} className="card p-5 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <input
              className="input"
              placeholder="任务标题"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
          </div>
          <div>
            <select
              className="input"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
            >
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              className="input"
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">添加</button>
            <button type="button" onClick={() => setShowNewTask(false)} className="btn btn-secondary">取消</button>
          </div>
          <div className="md:col-span-5">
            <textarea
              className="input"
              placeholder="详细描述（可选）"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>
        </form>
      )}

      {/* AI Result Modal */}
      {showAI && aiResult && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6" onClick={() => setShowAI(false)}>
          <div className="modal max-w-2xl w-full p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-accent font-medium">
                  <Sparkles className="w-5 h-5" /> AI 专业洞察
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {aiResult.is_demo ? "演示模式" : aiResult.model_used} · {new Date(aiResult.generated_at).toLocaleString("zh-CN")}
                </div>
              </div>
              <button onClick={() => setShowAI(false)} className="text-zinc-400 hover:text-zinc-800">关闭</button>
            </div>

            <div className="ai-content whitespace-pre-wrap bg-zinc-50 border border-zinc-100 rounded-2xl p-6 leading-relaxed">
              {aiResult.content}
            </div>

            <div className="mt-4 flex gap-2 text-sm">
              {(["summary", "priorities", "risks", "next_actions"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setInsightType(t);
                    fetchAIInsights();
                  }}
                  className={`px-3 py-1 rounded-full border ${insightType === t ? "bg-zinc-950 text-white border-zinc-950" : "border-zinc-200 hover:bg-zinc-100"}`}
                >
                  {t === "summary" && "项目摘要"}
                  {t === "priorities" && "优先级建议"}
                  {t === "risks" && "风险分析"}
                  {t === "next_actions" && "下一步行动"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kanban-style Task Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[
          { label: "待办", status: "todo" as TaskStatus, items: todoTasks },
          { label: "进行中", status: "doing" as TaskStatus, items: doingTasks },
          { label: "已完成", status: "done" as TaskStatus, items: doneTasks },
        ].map((col) => (
          <div key={col.status} className="card p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="font-semibold flex items-center gap-2">
                {col.label}
                <span className="text-xs font-normal px-2 py-px rounded bg-zinc-100 text-zinc-500">{col.items.length}</span>
              </div>
            </div>

            <div className="space-y-2 flex-1 min-h-[160px]">
              {col.items.length === 0 && (
                <div className="text-xs text-zinc-400 px-2 py-8 text-center border border-dashed rounded-2xl">暂无任务</div>
              )}

              {col.items.map((task) => (
                <div key={task.id} className="bg-white border border-zinc-200 rounded-2xl p-4 group">
                  <div className="flex justify-between gap-2">
                    <div className="font-medium text-[15px] pr-2">{task.title}</div>
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {task.description && (
                    <div className="text-sm text-zinc-600 mt-1 line-clamp-2">{task.description}</div>
                  )}

                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <span className={`badge ${getPriorityColor(task.priority)}`}>
                      {priorityLabels[task.priority]}
                    </span>
                    {task.due_date && (
                      <span className={`flex items-center gap-1 ${getDueDateColor(task.due_date, task.status)}`}>
                        <Calendar className="w-3 h-3" /> {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>

                  {/* Status quick change buttons */}
                  <div className="mt-3 flex gap-1.5">
                    {(["todo", "doing", "done"] as TaskStatus[]).filter((s) => s !== task.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateTaskStatus(task, s)}
                        className="text-[11px] px-2.5 py-px rounded-full border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100"
                      >
                        移至 {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs text-center text-zinc-400">
        任务变更实时同步（Supabase Realtime） • 点击「获取 AI 洞察」调用 Python 后端生成专业分析
      </div>
    </div>
  );
}
