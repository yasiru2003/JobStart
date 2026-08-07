"""
lovable_agent.py — Lovable AI Agent & Supabase Edge Functions Integration Service
Connects WhatsApp & Frontend recruitment agents to Lovable AI via Supabase Deno Edge Functions.
Supports live syncing of candidate conversations, intent processing, and AI recruitment workflows.
"""

import logging
import json
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("hirepth.lovable_agent")


class LovableAIService:
    """
    Service wrapper connecting HirePth to Lovable AI via Supabase Deno Edge Functions.
    Executes edge functions for WhatsApp conversation processing and frontend AI agent queries.
    """

    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.rstrip("/")
        self.service_role_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        self.lovable_key = settings.LOVABLE_API_KEY
        self.function_name = settings.LOVABLE_EDGE_FUNCTION_NAME

    @property
    def is_configured(self) -> bool:
        return bool(self.supabase_url) or bool(self.lovable_key)

    async def invoke_edge_function(
        self,
        action: str,
        payload: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Invoke Supabase Edge Function (Deno) for Lovable AI execution.
        Target URL: https://<project-ref>.supabase.co/functions/v1/lovable-whatsapp-agent
        """
        if not self.supabase_url:
            logger.warning("SUPABASE_URL not configured. Delegating to Gemini 3.6 Flash Lovable Chat.")
            return await self._simulate_lovable_reply(action, payload)

        url = f"{self.supabase_url}/functions/v1/{self.function_name}"
        headers = {
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": "application/json",
            "x-lovable-api-key": self.lovable_key,
        }
        data = {
            "action": action,
            "payload": payload,
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, headers=headers, json=data)
                if resp.status_code in (200, 201):
                    return resp.json()
                logger.warning(f"Supabase Edge Function returned {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.error(f"Error invoking Supabase Edge Function: {e}")

        return await self._simulate_lovable_reply(action, payload)

    async def process_whatsapp_message(
        self,
        phone: str,
        message_text: str,
        candidate_name: str = "Candidate",
        language: str = "en",
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Send WhatsApp message context to Lovable AI via Supabase Edge Function.
        """
        res = await self.invoke_edge_function(
            action="process_whatsapp_message",
            payload={
                "phone": phone,
                "message": message_text,
                "candidate_name": candidate_name,
                "language": language,
                "context": context or {},
            },
        )
        return res or {
            "reply": f"Hello {candidate_name}, Lovable AI Agent has processed your message.",
            "intent": "LOVABLE_PROCESSED",
            "auto_replied": True,
            "engine": "Lovable AI (Supabase Deno Edge)",
        }

    async def process_frontend_query(
        self,
        prompt: str,
        recruiter_id: str = "",
        context_tags: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Process query from Frontend AI Agent drawer/page through Lovable AI system.
        """
        res = await self.invoke_edge_function(
            action="process_frontend_query",
            payload={
                "prompt": prompt,
                "recruiter_id": recruiter_id,
                "tags": context_tags or [],
            },
        )
        return res or {
            "reply": f"Lovable AI Agent: Analyzed request '{prompt}'. Prepared pipeline recommendations.",
            "engine": "Lovable AI System (Supabase Deno Edge)",
        }

    async def _simulate_lovable_reply(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback response querying Gemini 3.6 Flash Sinhala Chat service directly."""
        from app.services.sinhala_chat import sinhala_chat_service
        if action == "process_whatsapp_message":
            msg = payload.get("message", "")
            res = await sinhala_chat_service.ask(msg)
            return {
                "reply": res.get("reply", "ස්තූතියි! ඔබේ පණිවුඩය ලැබිණි."),
                "intent": "LOVABLE_PROCESSED",
                "auto_replied": True,
                "engine": "Lovable AI (Gemini 3.6 Flash)",
            }

        prompt = payload.get("prompt", "")
        res = await sinhala_chat_service.ask(prompt)
        return {
            "reply": res.get("reply", "Lovable AI Agent: Processed request successfully."),
            "engine": "Lovable AI (Gemini 3.6 Flash)",
        }


# Global singleton
lovable_ai_service = LovableAIService()
