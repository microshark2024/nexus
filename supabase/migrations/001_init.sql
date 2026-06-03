-- =====================================================
-- Nexus Professional Platform - Initial Schema
-- Run this in Supabase SQL Editor (or via Supabase CLI)
-- =====================================================

-- Enable useful extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================
-- PROFILES (extends auth.users)
-- =====================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  job_title text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- WORKSPACES (teams / organizations)
-- =====================================================
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Workspace members
create table if not exists public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now() not null,
  primary key (workspace_id, user_id)
);

-- =====================================================
-- PROJECTS
-- =====================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  status text default 'active' check (status in ('active', 'archived', 'completed')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================================================
-- TASKS (core collaborative entity)
-- =====================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  assignee_id uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Useful indexes
create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_assignee on public.tasks(assignee_id);
create index if not exists idx_projects_workspace on public.projects(workspace_id);

-- =====================================================
-- UPDATED_AT trigger helper
-- =====================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at before update on public.workspaces
  for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - CRITICAL FOR SECURITY
-- =====================================================

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- Profiles: users can read/update own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Workspaces: owner or members can access
create policy "Users can view workspaces they belong to"
  on public.workspaces for select
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.workspace_members
      where workspace_id = workspaces.id and user_id = auth.uid()
    )
  );

create policy "Owners can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update own workspaces"
  on public.workspaces for update
  using (auth.uid() = owner_id);

-- Workspace members policies
create policy "Members can view workspace membership"
  on public.workspace_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.workspace_members m2
      where m2.workspace_id = workspace_members.workspace_id
        and m2.user_id = auth.uid()
    )
  );

create policy "Owners/admins can manage members"
  on public.workspace_members for all
  using (
    exists (
      select 1 from public.workspace_members m
      where m.workspace_id = workspace_members.workspace_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

-- Projects: visible to workspace members
create policy "Workspace members can view projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = projects.workspace_id and wm.user_id = auth.uid()
    )
    or exists (
      select 1 from public.workspaces w
      where w.id = projects.workspace_id and w.owner_id = auth.uid()
    )
  );

create policy "Workspace members can create projects"
  on public.projects for insert
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = projects.workspace_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can update projects in their workspace"
  on public.projects for update
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = projects.workspace_id and wm.user_id = auth.uid()
    )
  );

-- Tasks: same visibility as project
create policy "Workspace members can view tasks"
  on public.tasks for select
  using (
    exists (
      select 1
      from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = tasks.project_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can insert tasks"
  on public.tasks for insert
  with check (
    exists (
      select 1
      from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = tasks.project_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can update tasks"
  on public.tasks for update
  using (
    exists (
      select 1
      from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = tasks.project_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can delete tasks"
  on public.tasks for delete
  using (
    exists (
      select 1
      from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = tasks.project_id and wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTIONS (optional but useful)
-- =====================================================

-- Create a default workspace + project for new users (callable from app)
create or replace function public.create_default_workspace_for_user(user_id uuid, user_email text)
returns uuid
language plpgsql
security definer
as $$
declare
  ws_id uuid;
  proj_id uuid;
begin
  -- Create workspace
  insert into public.workspaces (name, owner_id, slug)
  values (split_part(user_email, '@', 1) || '''s Workspace', user_id, 'ws-' || substr(gen_random_uuid()::text, 1, 8))
  returning id into ws_id;

  -- Add owner as member
  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws_id, user_id, 'owner');

  -- Create a starter project
  insert into public.projects (workspace_id, name, description, created_by)
  values (ws_id, 'Welcome Project', 'Your first project in Nexus. Start adding tasks!', user_id)
  returning id into proj_id;

  -- Add 3 example tasks
  insert into public.tasks (project_id, title, status, priority, created_by)
  values
    (proj_id, 'Explore the Nexus dashboard', 'todo', 'high', user_id),
    (proj_id, 'Invite your teammates', 'todo', 'medium', user_id),
    (proj_id, 'Try the AI Insights feature', 'todo', 'medium', user_id);

  return ws_id;
end;
$$;

-- Grant permissions (Supabase usually handles, but explicit is good)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;  -- RLS will still apply

-- Done.
-- =====================================================
-- After running:
-- 1. Enable Email + Google (Auth providers) in Supabase Dashboard
-- 2. (Optional) Turn on "Confirm email" off for faster local testing
-- 3. Add your frontend URL to Redirect URLs in Auth settings
-- =====================================================
