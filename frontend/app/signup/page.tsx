"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast.error("请完整填写信息");
      return;
    }
    if (password.length < 6) {
      toast.error("密码长度至少 6 位");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error(error.message || "注册失败");
    } else {
      // Supabase may require email confirmation.
      // For local dev we often disable it.
      toast.success("注册成功！正在为你创建默认工作空间...");

      // Optionally create a default workspace immediately (if trigger didn't or for extra projects)
      if (data.user) {
        try {
          // Call a lightweight RPC or just let the user go to dashboard
          // The SQL function exists but we can also create on first dashboard load
        } catch (_) {}
      }

      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-[400px]">
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
          <h1 className="text-3xl font-semibold tracking-tight">创建专业账号</h1>
          <p className="text-zinc-600 mt-1.5">几秒钟开始使用 AI 增强的项目协作平台</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5 text-zinc-700">姓名</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              placeholder="张三"
              required
            />
          </div>

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
            <label className="text-sm font-medium block mb-1.5 text-zinc-700">密码（至少 6 位）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 mt-2 disabled:opacity-70"
          >
            {loading ? "创建账号中..." : "创建账号并开始"}
          </button>
        </form>

        <div className="text-center text-sm mt-6 text-zinc-600">
          已有账号？{" "}
          <Link href="/login" className="font-medium text-zinc-950 hover:underline">
            直接登录
          </Link>
        </div>

        <p className="text-[11px] text-center text-zinc-400 mt-8">
          注册即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
