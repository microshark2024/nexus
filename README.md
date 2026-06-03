# Nexus

**专业级 AI 协作平台**  
使用 Next.js + Python (FastAPI) + Supabase 构建的现代化团队项目管理与智能洞察系统。

> 一个可直接用于生产、可扩展、可学习的完整专业项目示例。

## 核心特性

- ✅ **Supabase 完整集成**：Auth、Postgres、Realtime、RLS 行级安全、Storage 预留
- ✅ **实时协作**：任务看板通过 Supabase Realtime 实时同步
- ✅ **专业 AI 洞察**：Python FastAPI 后端调用 LLM（支持 OpenAI / xAI Grok / 本地模型），生成项目摘要、优先级建议、风险分析
- ✅ **企业级安全**：所有数据访问均受 RLS 严格保护
- ✅ **现代化前端**：Next.js 16 + App Router + Server Components + TypeScript + 精致 UI
- ✅ **干净架构**：前后端清晰分离，易于扩展

## 技术栈

| 部分       | 技术                                      |
|------------|-------------------------------------------|
| 前端       | Next.js 16, TypeScript, Tailwind, Sonner  |
| 后端       | FastAPI (Python), Pydantic, httpx         |
| 数据库/认证| Supabase (Postgres + Auth + Realtime)     |
| AI         | OpenAI 兼容接口（gpt-4o-mini / grok-3 等）|
| 部署建议   | Vercel (前端) + Render/Fly.io (后端)      |

## 项目结构

```
nexus/
├── frontend/                 # Next.js 应用
│   ├── app/
│   │   ├── (landing + login + signup)
│   │   ├── dashboard/        # 受保护页面 + Sidebar 布局
│   │   └── projects/[id]     # 项目详情 + 任务看板 + AI
│   ├── lib/supabase/         # SSR + Browser 客户端
│   └── components/
├── backend/                  # FastAPI Python 服务
│   ├── app/
│   │   ├── main.py
│   │   ├── api/routes/ai.py  # /ai/insights
│   │   └── services/llm.py
│   └── requirements.txt
├── supabase/
│   └── migrations/001_init.sql   # 完整 Schema + RLS + 触发器
└── README.md
```

## 快速开始

### 1. 创建 Supabase 项目

1. 前往 [supabase.com](https://supabase.com) 新建项目
2. 进入 **SQL Editor**，复制并执行 `supabase/migrations/001_init.sql` 中的全部内容
3. 前往 **Authentication → Providers** 开启 Email（开发时可关闭邮箱确认）
4. 复制 **Project URL** 和 **publishable** key

### 2. 配置环境变量

```bash
# 复制示例
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

填写关键变量：

**frontend/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**backend/.env**
```env
SUPABASE_URL=...
SUPABASE_SECRET_KEY=eyJ...   # 注意是 secret，不是 publishable！
LLM_API_KEY=sk-...                 # 或者 xai-...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

### 4. 启动 Python 后端

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt

# 启动
python -m uvicorn app.main:app --reload --port 8000
```

访问 http://localhost:8000/docs 查看 API 文档。

### 5. 使用流程

1. 在首页注册账号（会自动创建默认 Workspace + 示例项目）
2. 进入 Dashboard → 项目
3. 点击「获取 AI 洞察」体验专业分析（需要后端运行 + LLM key）

## AI 配置建议

- **OpenAI**：最稳定
- **xAI Grok**：https://api.x.ai/v1 + `grok-3-mini`（速度快，性价比高）
- **本地模型**：使用 Ollama + OpenAI 兼容端点（`http://localhost:11434/v1`）

没有配置 LLM key 时，系统会返回高质量演示洞察，方便演示。

## 使用 Docker 运行（推荐用于本地完整测试）

本项目提供了生产级的 Dockerfile（前端使用 Next.js standalone 优化构建）。

### 前置条件
1. 确保已配置好环境变量：
   - `frontend/.env.local`
   - `backend/.env`

2. （可选）先在 Supabase 创建好数据库并执行迁移 SQL。

### 启动完整栈

```bash
# 在项目根目录执行
docker compose up --build
```

- 前端访问：http://localhost:3000
- 后端访问：http://localhost:8000/docs

常用命令：

```bash
docker compose up -d              # 后台运行
docker compose logs -f frontend   # 查看前端日志
docker compose down               # 停止并删除容器
docker compose down -v            # 同时清理卷（一般不需要）
```

### 单独构建某个服务

```bash
docker build -t nexus-frontend ./frontend
docker build -t nexus-backend ./backend
```

### 生产部署提示

- 前端 Dockerfile 已针对 `output: 'standalone'` 优化，最终镜像很小。
- 生产环境建议：
  - 在前端容器前放 Nginx / Caddy / Traefik 做反向代理 + HTTPS
  - 使用 Docker secrets 或平台环境变量注入敏感信息（不要提交 .env）
  - 后端健康检查已配置，可用于 orchestration（Kubernetes / Swarm / ECS 等）

## 生产部署建议

- **推荐**：前端部署到 Vercel（对 Next.js 最佳支持），后端部署到 Render / Fly.io / Railway。
- 或者使用上面 Docker 镜像部署到任何支持 Docker 的平台。
- Supabase：使用生产项目，开启 RLS + 邮箱确认 + 强密码策略。
- 后端务必在生产限制 CORS（已在配置中通过 ALLOWED_ORIGINS 控制）。

## 扩展方向（专业路线）

- 工作空间成员邀请 + 角色管理
- 文件上传 + Supabase Storage + Python OCR / 分析
- 更丰富的 AI：RAG 知识库、自动生成周报邮件
- 任务依赖 / 甘特图
- 团队 Activity Log
- 多语言 + 主题

## 许可证

MIT（可商用学习）

---

**Nexus** 是一个展示如何使用现代技术栈构建**专业、可维护、安全**全栈 SaaS 产品的参考项目。
如果你正在寻找 Next.js + Python + Supabase 的高质量起点，这就是它。
