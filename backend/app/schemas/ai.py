"""
Pydantic schemas for AI endpoints.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date


class TaskForAI(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: Literal["todo", "doing", "done"]
    priority: Optional[Literal["low", "medium", "high"]] = None
    due_date: Optional[date] = None
    assignee_name: Optional[str] = None


class ProjectContext(BaseModel):
    project_id: str
    project_name: str
    project_description: Optional[str] = None
    tasks: List[TaskForAI] = Field(default_factory=list)


class InsightRequest(BaseModel):
    project: ProjectContext
    insight_type: Literal["summary", "priorities", "risks", "next_actions"] = "summary"
    user_prompt: Optional[str] = None  # Allow additional user instruction


class InsightResponse(BaseModel):
    insight_type: str
    content: str
    generated_at: str
    model_used: str
    is_demo: bool = False
