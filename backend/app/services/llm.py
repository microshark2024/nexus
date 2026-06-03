"""
LLM Service - OpenAI compatible client for AI features.
Supports OpenAI, Grok (xAI), Together, Ollama (local), etc.
"""
import httpx
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings


class LLMService:
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.base_url = settings.LLM_BASE_URL.rstrip("/")
        self.model = settings.LLM_MODEL
        self.client = httpx.AsyncClient(timeout=60.0)

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1200,
    ) -> str:
        """
        Call chat completions. Returns the assistant message content.
        """
        if not self.api_key:
            # Fallback demo response when no key configured
            return self._demo_response(messages)

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        try:
            resp = await self.client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            # On error, still return something useful
            return f"[AI Error] {str(e)[:200]}. Using demo insights instead.\n\n" + self._demo_response(messages)

    def _demo_response(self, messages: List[Dict[str, str]]) -> str:
        """Professional demo response when LLM not configured."""
        # Try to infer context
        user_msg = ""
        for m in messages:
            if m.get("role") == "user":
                user_msg = m.get("content", "")
                break

        if "summar" in user_msg.lower() or "summary" in user_msg.lower():
            return """**项目周报摘要 (Demo 模式)**

- 本周完成任务 7 项，进行中 4 项。
- 高优先级任务：完成 Q3 路线图设计、修复登录安全问题。
- 风险提示：2 个任务已逾期，建议重新分配负责人。
- 下周建议：优先完成用户反馈模块，安排 1 次团队同步会。

*提示：配置 LLM_API_KEY 可获得真实 AI 洞察。*"""

        if "priorit" in user_msg.lower():
            return """**AI 优先级建议 (Demo)**

1. [高] 修复生产环境支付失败 - 影响收入
2. [高] 完成客户演示文稿
3. [中] 重构任务列表组件
4. [低] 更新文档

建议立即处理前两项。"""

        return """**Nexus AI 洞察 (Demo 模式)**

当前项目健康度良好。团队协作活跃。

建议：
• 增加更多任务描述以提升 AI 分析质量
• 设置截止日期有助于优先级排序
• 考虑为高风险任务添加更多协作者

要启用真实 AI，请在 backend/.env 中设置 LLM_API_KEY 和相关配置。"""


# Singleton
llm_service = LLMService()
