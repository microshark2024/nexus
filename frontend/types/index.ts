/**
 * Shared TypeScript types for Nexus (synced with Supabase schema)
 */

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  job_title: string | null
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  name: string
  slug: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

export interface Project {
  id: string
  workspace_id: string
  name: string
  description: string | null
  status: 'active' | 'archived' | 'completed'
  created_by: string | null
  created_at: string
  updated_at: string
}

export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  assignee_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TaskWithAssignee extends Task {
  assignee?: Profile | null
}

// For AI calls
export interface TaskForAI {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority?: TaskPriority | null
  due_date?: string | null
  assignee_name?: string | null
}

export interface AIInsightResponse {
  insight_type: string
  content: string
  generated_at: string
  model_used: string
  is_demo: boolean
}
