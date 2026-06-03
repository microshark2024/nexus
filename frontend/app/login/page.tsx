"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("请填写邮箱和密码");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "登录失败，请检查邮箱和密码");
    } else {
      toast.success("登录成功，欢迎回来！");
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-[380px]">
        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-950 mb-8 gap-1.5">
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-zinc-950 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-semibold tracking-[-2px]">N</span>
            </div>
            <span className="font-semibold text-3xl tracking-tighter">Nexus</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">欢迎回来</h1>
          <p className="text-zinc-600 mt-1.5">登录以继续管理您的专业项目</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5 text-zinc-700">工作邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5 text-zinc-700">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 mt-2 disabled:opacity-70"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="text-center text-sm mt-6 text-zinc-600">
          还没有账号？{" "}
          <Link href="/signup" className="font-medium text-zinc-950 hover:underline">
            立即注册
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t text-[11px] text-center text-zinc-400">
          演示环境 • 生产环境请务必开启邮箱确认 + 强密码策略
        </div>
      </div>
    </div>
  );
}
