import Link from "next/link";
import { ArrowRight, Check, Users, Zap, Shield, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center">
              <span className="text-white font-semibold text-lg tracking-[-1.5px]">N</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">Nexus</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-medium ml-1">PRO</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="#features" className="text-zinc-600 hover:text-zinc-950 px-3 py-1.5 transition">功能</Link>
            <Link href="#tech" className="text-zinc-600 hover:text-zinc-950 px-3 py-1.5 transition">技术栈</Link>
            <Link href="/login" className="text-zinc-600 hover:text-zinc-950 px-3 py-1.5 transition">登录</Link>
            <Link
              href="/signup"
              className="btn btn-primary text-sm px-5 py-2"
            >
              免费开始使用
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 mb-6">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          基于 Next.js 16 + Python + Supabase 构建
        </div>

        <h1 className="text-6xl font-semibold tracking-tighter text-balance leading-none mb-6">
          专业团队的<br />AI 驱动协作平台
        </h1>
        <p className="max-w-xl mx-auto text-xl text-zinc-600 mb-10">
          管理项目、跟踪任务、与团队实时协作，并通过智能 AI 获得深度洞察。
          安全、专业、开箱即用。
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="btn btn-primary px-8 py-3.5 text-base">
            立即开始免费试用 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="btn btn-secondary px-7 py-3.5 text-base">
            已有账号？登录
          </Link>
        </div>
        <p className="text-xs text-zinc-500 mt-4">无需信用卡 • 5 分钟即可部署完成</p>
      </div>

      {/* Trust bar / Tech */}
      <div className="border-y border-zinc-100 bg-zinc-50 py-5">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-zinc-500">
          <div>Next.js 16</div>
          <div>Python FastAPI</div>
          <div>Supabase (Postgres + Auth + Realtime)</div>
          <div>TypeScript</div>
          <div>Row Level Security</div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-accent text-sm font-semibold tracking-[1px] mb-3">WHY NEXUS</div>
          <h2 className="text-4xl font-semibold tracking-tight">专为专业团队打造</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Users className="w-5 h-5" />,
              title: "实时团队协作",
              desc: "任务状态实时同步，Supabase Realtime 驱动。多人同时编辑无冲突。",
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: "AI 智能洞察",
              desc: "Python 后端 + LLM 自动生成周报、优先级排序、风险预警和下一步行动建议。",
            },
            {
              icon: <Shield className="w-5 h-5" />,
              title: "企业级安全",
              desc: "Supabase RLS 行级安全策略 + 服务端密钥隔离。你的数据只属于你的团队。",
            },
          ].map((f, i) => (
            <div key={i} className="card p-7">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="font-semibold text-xl mb-2.5 tracking-tight">{f.title}</h3>
              <p className="text-zinc-600 leading-relaxed text-[15px]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-zinc-950 text-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="uppercase tracking-[2px] text-xs text-zinc-400 mb-3">30 秒了解</div>
              <h2 className="text-4xl font-semibold tracking-tight">如何工作</h2>
            </div>
            <div className="flex-1 space-y-6 text-zinc-400 text-[15px]">
              <div className="flex gap-4">
                <div className="font-mono text-xs text-white/40 mt-1 w-5">01</div>
                <div>使用 Supabase Auth 安全登录（支持邮箱 + 未来 OAuth）</div>
              </div>
              <div className="flex gap-4">
                <div className="font-mono text-xs text-white/40 mt-1 w-5">02</div>
                <div>创建 Workspace 与项目，添加结构化任务（状态、优先级、截止日期）</div>
              </div>
              <div className="flex gap-4">
                <div className="font-mono text-xs text-white/40 mt-1 w-5">03</div>
                <div>点击「AI 洞察」按钮，Python 服务使用 LLM 分析项目并输出专业建议</div>
              </div>
              <div className="flex gap-4">
                <div className="font-mono text-xs text-white/40 mt-1 w-5">04</div>
                <div>所有操作均受 RLS 保护，团队成员只能访问自己所在的工作空间</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div id="tech" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h3 className="font-semibold text-2xl tracking-tight mb-2">专业的技术架构</h3>
          <p className="text-zinc-600">现代、可扩展、可直接用于生产环境</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            ["前端", "Next.js 16 App Router + Server Components + TypeScript"],
            ["UI", "Tailwind CSS + 专业设计系统（无重度组件库依赖）"],
            ["数据与认证", "Supabase (Postgres, Auth, Realtime, Storage, RLS)"],
            ["后端 AI", "FastAPI + OpenAI 兼容接口（支持 Grok / OpenAI / 本地 Ollama）"],
          ].map(([title, desc], idx) => (
            <div key={idx} className="rounded-2xl border border-zinc-200 p-5">
              <div className="font-medium text-zinc-950 mb-2">{title}</div>
              <div className="text-zinc-600 leading-snug text-[13.5px]">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-zinc-100 bg-white py-14">
        <div className="max-w-md mx-auto text-center px-6">
          <h3 className="text-2xl font-semibold tracking-tight mb-3">准备好提升团队效率了吗？</h3>
          <p className="text-zinc-600 mb-6">立即创建一个免费账号，体验专业级 AI 协作平台。</p>
          <Link href="/signup" className="btn btn-primary px-10 py-3 inline-flex">
            免费创建账号 <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="text-[11px] text-zinc-400 mt-4">开源友好 • 可私有部署</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs text-zinc-400">
        Nexus — Professional AI Collaboration Platform &nbsp;·&nbsp; Built with Next.js + Python + Supabase
      </footer>
    </div>
  );
}
