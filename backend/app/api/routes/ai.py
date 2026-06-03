"""
AI Routes - Professional insights powered by LLM.
Called from Next.js frontend (authenticated via Supabase).
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from app.schemas.ai import InsightRequest, InsightResponse
from app.services.llm import llm_service
from app.core.config import settings


router = APIRouter(prefix="/ai", tags=["AI"])


def build_system_prompt() -> str:
    return """You are Nexus AI, an expert professional project management assistant.
You analyze project tasks and provide concise, actionable, professional insights.
Always respond in Chinese when the user context appears Chinese, otherwise English.
Structure output with markdown headings, bullet points, and clear recommendations.
Keep responses under 350 words. Be direct and useful."""


def build_user_prompt(req: InsightRequest) -> str:
    project = req.project
    lines = [
        f"Project: {project.project_name}",
        f"Description: {project.project_description or 'N/A'}",
        f"Total tasks: {len(project.tasks)}",
        "",
        "Tasks:",
    ]
    for t in project.tasks:
        due = t.due_date.isoformat() if t.due_date else "no due date"
        prio = t.priority or "medium"
        assignee = t.assignee_name or "unassigned"
        lines.append(
            f"- [{t.status.upper()}] {t.title} | priority={prio} | due={due} | assignee={assignee}"
            + (f"\n  desc: {t.description}" if t.description else "")
        )

    extra = f"\n\nAdditional instruction: {req.user_prompt}" if req.user_prompt else ""
    focus = {
        "summary": "Provide a professional weekly-style summary: completed work, current blockers, overall health, and 3-4 key recommendations.",
        "priorities": "Re-prioritize the tasks. Output a numbered list from most to least urgent with short rationale for each.",
        "risks": "Identify potential risks, overdue items, scope creep signals, and mitigation suggestions.",
        "next_actions": "List the 5 most important next actions with owners (if known) and suggested deadlines.",
    }.get(req.insight_type, "")

    return f"{focus}{extra}\n\nTasks data:\n" + "\n".join(lines)


@router.post("/insights", response_model=InsightResponse)
async def generate_insights(req: InsightRequest):
    """
    Generate professional AI insights for a project.
    Frontend should pass current project + tasks snapshot.
    """
    if not req.project.tasks:
        raise HTTPException(400, "At least one task is required for meaningful insights.")

    system = build_system_prompt()
    user = build_user_prompt(req)

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

    content = await llm_service.chat_completion(messages, temperature=0.6, max_tokens=1400)

    is_demo = llm_service.is_demo_mode

    return InsightResponse(
        insight_type=req.insight_type,
        content=content,
        generated_at=datetime.utcnow().isoformat() + "Z",
        model_used="demo" if is_demo else settings.LLM_MODEL,
        is_demo=is_demo,
    )


@router.get("/health")
async def ai_health():
    return {
        "status": "ok",
        "llm_configured": bool(settings.LLM_API_KEY),
        "model": settings.LLM_MODEL,
    }
