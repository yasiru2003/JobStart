import logging
import re
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("jobstart.whatsapp_agent")


# ── Intent Classification ──────────────────────────────────────────────────

CONFIRM_KEYWORDS = ["yes", "confirm", "ok", "okay", "sure", "accept", "agreed", "i will", "i'll", "confirmed", "හා", "ඔව්"]
DECLINE_KEYWORDS = ["no", "cant", "can't", "cannot", "decline", "reject", "nope", "not available", "නෑ", "බෑ"]
RESCHEDULE_KEYWORDS = ["reschedule", "change", "postpone", "another time", "different", "shift", "move"]

def classify_intent(text: str) -> str:
    """Classify the intent of an inbound WhatsApp message."""
    cleaned = text.strip().lower()
    # Check for very short single-word responses first
    if cleaned in ("yes", "no", "ok", "okay", "confirm", "confirmed"):
        if cleaned in ("yes", "ok", "okay", "confirm", "confirmed"):
            return "CONFIRM"
        return "DECLINE"
    if any(kw in cleaned for kw in CONFIRM_KEYWORDS):
        return "CONFIRM"
    if any(kw in cleaned for kw in RESCHEDULE_KEYWORDS):
        return "RESCHEDULE"
    if any(kw in cleaned for kw in DECLINE_KEYWORDS):
        return "DECLINE"
    # Check for question patterns
    if "?" in cleaned or any(w in cleaned for w in ["what", "when", "where", "how", "who", "which"]):
        return "QUESTION"
    return "UNKNOWN"


# ── In-memory conversation store (upgrade to DB in production) ─────────────

class ConversationStore:
    def __init__(self):
        self._conversations: Dict[str, Dict[str, Any]] = {}

    def upsert(self, phone: str, message: str, sender: str = "candidate", metadata: Optional[Dict] = None) -> None:
        if phone not in self._conversations:
            self._conversations[phone] = {
                "phone": phone,
                "candidate_name": metadata.get("candidate_name", "Unknown") if metadata else "Unknown",
                "messages": [],
                "last_intent": None,
                "interview_confirmed": False,
            }
        self._conversations[phone]["messages"].append({
            "sender": sender,
            "text": message,
            "time": __import__("datetime").datetime.utcnow().isoformat(),
        })
        if metadata:
            self._conversations[phone].update({k: v for k, v in metadata.items() if k not in ("messages",)})

    def get(self, phone: str) -> Optional[Dict[str, Any]]:
        return self._conversations.get(phone)

    def all(self) -> List[Dict[str, Any]]:
        return sorted(
            list(self._conversations.values()),
            key=lambda c: c["messages"][-1]["time"] if c["messages"] else "",
            reverse=True,
        )

    def set_intent(self, phone: str, intent: str) -> None:
        if phone in self._conversations:
            self._conversations[phone]["last_intent"] = intent

    def set_confirmed(self, phone: str, confirmed: bool) -> None:
        if phone in self._conversations:
            self._conversations[phone]["interview_confirmed"] = confirmed


conversation_store = ConversationStore()


# ── WhatsApp AI Agent ──────────────────────────────────────────────────────

class WhatsAppAgentService:
    """
    AI-powered WhatsApp recruitment agent.
    Handles inbound messages, classifies intent, and auto-replies via WAHA.
    Integrates with OpenRouter LLM for intelligent, contextual responses.
    """

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.OPENROUTER_MODEL
        self.base_url = settings.OPENROUTER_BASE_URL
        self.auto_reply_enabled = True
        self.agent_name = "JobStart Recruitment Team"

    async def _llm_reply(self, system_prompt: str, user_message: str) -> Optional[str]:
        """Call OpenRouter LLM to generate a contextual WhatsApp reply."""
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "HTTP-Referer": "https://jobstart.lk",
                        "X-Title": "JobStart WhatsApp Agent",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message},
                        ],
                        "temperature": 0.4,
                        "max_tokens": 300,
                    },
                )
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.warning(f"LLM call failed: {e}")
        return None

    async def process_inbound_message(
        self,
        phone: str,
        message_text: str,
        candidate_name: str = "Candidate",
        job_title: str = "",
        interview_date: str = "",
        interview_time: str = "",
    ) -> Dict[str, Any]:
        """
        Process an inbound WhatsApp message and generate an AI reply.
        Returns the reply text and detected intent.
        """
        if not self.auto_reply_enabled:
            conversation_store.upsert(phone, message_text, "candidate")
            return {"intent": "SKIPPED", "reply": None, "auto_replied": False}

        intent = classify_intent(message_text)
        conversation_store.upsert(phone, message_text, "candidate", {
            "candidate_name": candidate_name,
            "job_title": job_title,
        })
        conversation_store.set_intent(phone, intent)

        reply = await self._generate_reply(
            intent=intent,
            candidate_name=candidate_name,
            job_title=job_title,
            interview_date=interview_date,
            interview_time=interview_time,
            message_text=message_text,
        )

        if reply:
            conversation_store.upsert(phone, reply, "agent")
            if intent == "CONFIRM":
                conversation_store.set_confirmed(phone, True)

        return {"intent": intent, "reply": reply, "auto_replied": bool(reply)}

    async def _generate_reply(
        self,
        intent: str,
        candidate_name: str,
        job_title: str,
        interview_date: str,
        interview_time: str,
        message_text: str,
    ) -> Optional[str]:
        """Generate a context-aware reply based on classified intent."""

        if intent == "CONFIRM":
            return (
                f"✅ Great news, *{candidate_name}*!\n\n"
                f"Your interview for *{job_title or 'the position'}* has been *confirmed*.\n"
                + (f"📅 *Date*: {interview_date}\n⏰ *Time*: {interview_time}\n\n" if interview_date else "\n")
                + f"Please join 5 minutes early. A Google Meet link will be sent shortly.\n\n"
                f"Thank you! — *{self.agent_name}*"
            )

        elif intent == "DECLINE":
            return (
                f"We understand, *{candidate_name}*.\n\n"
                f"If you'd like to *reschedule* your interview for *{job_title or 'the position'}*, "
                f"please reply with your preferred date and time and we'll arrange a new slot.\n\n"
                f"Thank you! — *{self.agent_name}*"
            )

        elif intent == "RESCHEDULE":
            return (
                f"Of course, *{candidate_name}*! We'll arrange a new interview slot for you.\n\n"
                f"Please reply with your *preferred date and time* and our team will confirm within 24 hours.\n\n"
                f"Thank you for letting us know! — *{self.agent_name}*"
            )

        elif intent == "QUESTION":
            # Use LLM for Q&A
            system_prompt = (
                f"You are a professional WhatsApp recruitment assistant for JobStart Sri Lanka. "
                f"Keep responses short (under 100 words), friendly, and professional. "
                f"The candidate {candidate_name} has applied for {job_title or 'a position'} and is asking a question. "
                f"Answer helpfully. Sign off as '— {self.agent_name}'"
            )
            llm_reply = await self._llm_reply(system_prompt, message_text)
            return llm_reply or (
                f"Thank you for your message, *{candidate_name}*!\n\n"
                f"Our recruitment team will get back to you shortly regarding your enquiry.\n\n"
                f"— *{self.agent_name}*"
            )

        else:
            # Generic acknowledgement
            return (
                f"Thank you for your message, *{candidate_name}*! "
                f"Our team will review and respond shortly.\n\n"
                f"— *{self.agent_name}*"
            )

    async def send_interview_invite(
        self,
        phone: str,
        candidate_name: str,
        job_title: str,
        employer_name: str,
        date: str,
        time_slot: str,
        mode: str = "Google Meet",
    ) -> Dict[str, Any]:
        """Send a structured interview invitation via WhatsApp."""
        from app.services.waha import waha_service

        message = (
            f"👋 Hello *{candidate_name}*,\n\n"
            f"Congratulations! You have been shortlisted for an interview with *{employer_name}* "
            f"for the position of *{job_title}*.\n\n"
            f"📅 *Date*: {date}\n"
            f"⏰ *Time*: {time_slot}\n"
            f"📍 *Mode*: {mode}\n\n"
            f"Please reply:\n"
            f"✅ *YES* — to confirm your attendance\n"
            f"❌ *NO* — if you need to reschedule\n\n"
            f"We look forward to meeting you!\n"
            f"— *{self.agent_name}*"
        )
        result = await waha_service.send_text(phone, message)

        # Track in conversation store
        conversation_store.upsert(phone, message, "agent", {
            "candidate_name": candidate_name,
            "job_title": job_title,
            "interview_date": date,
            "interview_time": time_slot,
        })

        return result


# Global singleton
whatsapp_agent = WhatsAppAgentService()
