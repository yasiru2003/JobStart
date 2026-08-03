"""
whatsapp_agent.py — Full-featured WhatsApp AI Recruitment Agent
Handles the complete candidate journey entirely over WhatsApp:
  - Multilingual (English / Sinhala / Tamil) auto-detection
  - Job browsing via chat
  - Guided application flow (NLP-based)
  - CV / document reception
  - Interview scheduling & confirmation
  - Recruiter-triggered screening conversations
"""

import logging
import re
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger("jobstart.whatsapp_agent")


# ─────────────────────────────────────────────────────────────────────────────
# Language Detection
# ─────────────────────────────────────────────────────────────────────────────

SINHALA_PATTERN = re.compile(r"[\u0D80-\u0DFF]")
TAMIL_PATTERN = re.compile(r"[\u0B80-\u0BFF]")

LANG_TEMPLATES = {
    "si": {
        "greeting":         "ආයුබෝවන්! 👋 JobStart වෙත සාදරයෙන් පිළිගනිමු.",
        "show_jobs":        "🔍 ලබාගත හැකි රැකියා ලැයිස්තුව:",
        "ask_name":         "ඔබේ සම්පූර්ණ නම කුමක්ද?",
        "ask_experience":   "ඔබට කොපමණ කාලයක් සේවා පළපුරුද්ද ඇත්ද? (වර්ෂ ගණනින්)",
        "ask_skills":       "ඔබේ ප්‍රධාන කුසලතා මොනවාද? (කොමාවෙන් වෙන් කරන්න)",
        "ask_cv":           "📎 කරුණාකර ඔබේ CV ලේඛනය WhatsApp හරහා යවන්න.",
        "applied":          "✅ ඔබේ ඉල්ලුම් පත්‍රය සාර්ථකව ලැබිණ! අපි ඉක්මනින් ඔබව සම්බන්ධ කරගන්නෙමු.",
        "no_jobs":          "දැනට ලබාගත හැකි රැකියා නොමැත. නැවත පරීක්ෂා කරන්න.",
        "select_job":       "රැකියාව තෝරා ගැනීමට අංකය ටයිප් කරන්න.",
        "interview_confirm":"✅ ඔබේ සාකච්ඡාව තහවුරු කරන ලදී!",
        "interview_decline":"ඔබට නැවත කාලසටහන් ගත කළ හැකිය. ඔබේ කැමති දිනය සහ වේලාව දන්වන්න.",
        "question_fallback":"ස්තූතියි! අපගේ කණ්ඩායම ඉක්මනින් ඔබව සම්බන්ධ කරගන්නෙමු.",
    },
    "ta": {
        "greeting":         "வணக்கம்! 👋 JobStart-ல் உங்களை வரவேற்கிறோம்.",
        "show_jobs":        "🔍 கிடைக்கும் வேலை வாய்ப்புகள்:",
        "ask_name":         "உங்கள் முழு பெயர் என்ன?",
        "ask_experience":   "உங்களுக்கு எத்தனை ஆண்டுகள் அனுபவம் உள்ளது?",
        "ask_skills":       "உங்கள் முக்கிய திறன்கள் என்ன? (கமாவால் பிரிக்கவும்)",
        "ask_cv":           "📎 உங்கள் CV ஆவணத்தை WhatsApp மூலம் அனுப்பவும்.",
        "applied":          "✅ உங்கள் விண்ணப்பம் வெற்றிகரமாக பெறப்பட்டது! விரைவில் தொடர்பு கொள்கிறோம்.",
        "no_jobs":          "தற்போது வேலை வாய்ப்புகள் இல்லை. மீண்டும் சரிபார்க்கவும்.",
        "select_job":       "வேலையை தேர்ந்தெடுக்க எண்ணை தட்டச்சு செய்யவும்.",
        "interview_confirm":"✅ உங்கள் நேர்காணல் உறுதிப்படுத்தப்பட்டது!",
        "interview_decline":"நேர்காணலை மறுதாவல் செய்யலாம். விருப்பமான தேதி மற்றும் நேரம் தெரிவிக்கவும்.",
        "question_fallback":"நன்றி! எங்கள் குழு விரைவில் உங்களை தொடர்பு கொள்ளும்.",
    },
    "en": {
        "greeting":         "Hello! 👋 Welcome to JobStart — Sri Lanka's AI Recruitment Platform.",
        "show_jobs":        "🔍 Available Job Listings:",
        "ask_name":         "What is your full name?",
        "ask_experience":   "How many years of work experience do you have?",
        "ask_skills":       "What are your main skills? (separate with commas)",
        "ask_cv":           "📎 Please send your CV as a document in this chat.",
        "applied":          "✅ Your application has been received! We'll be in touch soon.",
        "no_jobs":          "No active jobs available right now. Please check back later.",
        "select_job":       "Reply with the number to select a job.",
        "interview_confirm":"✅ Your interview has been confirmed!",
        "interview_decline":"No problem! Reply with your preferred date and time to reschedule.",
        "question_fallback":"Thank you! Our team will get back to you shortly.",
    },
}


def detect_language(text: str) -> str:
    """Detect language from text: 'si' | 'ta' | 'en'"""
    if SINHALA_PATTERN.search(text):
        return "si"
    if TAMIL_PATTERN.search(text):
        return "ta"
    return "en"


def t(lang: str, key: str) -> str:
    """Get a translated template string for a given language key."""
    return LANG_TEMPLATES.get(lang, LANG_TEMPLATES["en"]).get(key, LANG_TEMPLATES["en"].get(key, ""))


# ─────────────────────────────────────────────────────────────────────────────
# Intent Classification
# ─────────────────────────────────────────────────────────────────────────────

CONFIRM_KEYWORDS = [
    "yes", "confirm", "ok", "okay", "sure", "accept", "agreed", "i will", "i'll",
    "confirmed", "හා", "ඔව්", "ඔව", "හරි", "சரி", "ஆம்", "உறுதி",
]
DECLINE_KEYWORDS = [
    "no", "cant", "can't", "cannot", "decline", "reject", "nope", "not available",
    "නෑ", "බෑ", "එපා", "இல்லை", "வேண்டாம்",
]
RESCHEDULE_KEYWORDS = [
    "reschedule", "change", "postpone", "another time", "different", "shift", "move",
    "වෙනස්", "மாற்று",
]
BROWSE_KEYWORDS = [
    "jobs", "job", "work", "vacancy", "vacancies", "show jobs", "list jobs",
    "find job", "රැකියා", "රැකියාව", "வேலை", "வேலைகள்", "வாய்ப்பு",
]
APPLY_KEYWORDS = [
    "apply", "application", "i want to apply", "apply now", "ඉල්ලුම්", "apply කරන්න",
    "விண்ணப்பி", "விண்ணப்பம்",
]
HELP_KEYWORDS = [
    "help", "menu", "start", "hi", "hello", "hey", "ආයුබෝ", "හෙලෝ", "வணக்கம்", "ஹலோ",
]


def classify_intent(text: str) -> str:
    """Classify intent of an inbound WhatsApp message."""
    cleaned = text.strip().lower()

    # Exact short responses first
    if cleaned in ("yes", "ok", "okay", "confirm", "confirmed", "හා", "ඔව්", "ஆம்", "சரி"):
        return "CONFIRM"
    if cleaned in ("no", "නෑ", "இல்லை"):
        return "DECLINE"

    if any(kw in cleaned for kw in HELP_KEYWORDS):
        return "HELP"
    if any(kw in cleaned for kw in BROWSE_KEYWORDS):
        return "BROWSE_JOBS"
    if any(kw in cleaned for kw in APPLY_KEYWORDS):
        return "APPLY"
    if any(kw in cleaned for kw in CONFIRM_KEYWORDS):
        return "CONFIRM"
    if any(kw in cleaned for kw in RESCHEDULE_KEYWORDS):
        return "RESCHEDULE"
    if any(kw in cleaned for kw in DECLINE_KEYWORDS):
        return "DECLINE"
    if "?" in cleaned or any(w in cleaned for w in ["what", "when", "where", "how", "who", "which"]):
        return "QUESTION"

    # Numeric responses (job/option selection)
    if re.match(r"^\d+$", cleaned):
        return "SELECT_NUMBER"

    return "UNKNOWN"


# ─────────────────────────────────────────────────────────────────────────────
# Candidate Session / Application State
# ─────────────────────────────────────────────────────────────────────────────

class ApplicationStage(str, Enum):
    NONE = "none"
    ASKED_NAME = "asked_name"
    ASKED_EXPERIENCE = "asked_experience"
    ASKED_SKILLS = "asked_skills"
    AWAITING_CV = "awaiting_cv"
    SUBMITTED = "submitted"


class ScreeningStage(str, Enum):
    IDLE = "idle"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# ─────────────────────────────────────────────────────────────────────────────
# Conversation Store
# ─────────────────────────────────────────────────────────────────────────────

class ConversationStore:
    """
    In-memory conversation store per candidate phone number.
    Tracks language preference, application state, screening state, and messages.
    (Upgrade to Redis/DB in production for multi-instance deployments.)
    """

    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}

    def _init_session(self, phone: str) -> Dict[str, Any]:
        if phone not in self._sessions:
            self._sessions[phone] = {
                "phone": phone,
                "candidate_name": "Candidate",
                "language": "en",
                "messages": [],
                "last_intent": None,
                "interview_confirmed": False,
                # Application flow state
                "application_stage": ApplicationStage.NONE,
                "selected_job_id": None,
                "selected_job_title": None,
                "collected_name": None,
                "collected_experience": None,
                "collected_skills": [],
                "cv_media_url": None,
                # Screening state
                "screening_stage": ScreeningStage.IDLE,
                "screening_questions": [],
                "screening_answers": [],
                "screening_current_index": 0,
                # Interview state
                "job_title": "",
                "interview_date": "",
                "interview_time": "",
            }
        return self._sessions[phone]

    def get(self, phone: str) -> Optional[Dict[str, Any]]:
        return self._sessions.get(phone)

    def upsert(
        self,
        phone: str,
        message: str,
        sender: str = "candidate",
        metadata: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        session = self._init_session(phone)
        session["messages"].append({
            "sender": sender,
            "text": message,
            "time": datetime.utcnow().isoformat(),
        })
        if metadata:
            for k, v in metadata.items():
                if k != "messages":
                    session[k] = v
        return session

    def set_language(self, phone: str, lang: str) -> None:
        session = self._init_session(phone)
        session["language"] = lang

    def set_intent(self, phone: str, intent: str) -> None:
        session = self._init_session(phone)
        session["last_intent"] = intent

    def set_confirmed(self, phone: str, confirmed: bool) -> None:
        session = self._init_session(phone)
        session["interview_confirmed"] = confirmed

    def set_application_stage(self, phone: str, stage: ApplicationStage) -> None:
        session = self._init_session(phone)
        session["application_stage"] = stage

    def set_screening(self, phone: str, questions: List[str]) -> None:
        session = self._init_session(phone)
        session["screening_stage"] = ScreeningStage.IN_PROGRESS
        session["screening_questions"] = questions
        session["screening_answers"] = []
        session["screening_current_index"] = 0

    def record_screening_answer(self, phone: str, answer: str) -> Optional[str]:
        """Record an answer and return the next question or None if done."""
        session = self._init_session(phone)
        session["screening_answers"].append(answer)
        idx = session["screening_current_index"] + 1
        session["screening_current_index"] = idx
        if idx < len(session["screening_questions"]):
            return session["screening_questions"][idx]
        session["screening_stage"] = ScreeningStage.COMPLETED
        return None

    def get_screening_results(self, phone: str) -> Dict[str, Any]:
        session = self._sessions.get(phone, {})
        return {
            "questions": session.get("screening_questions", []),
            "answers": session.get("screening_answers", []),
            "stage": session.get("screening_stage", ScreeningStage.IDLE),
        }

    def all(self) -> List[Dict[str, Any]]:
        return sorted(
            list(self._sessions.values()),
            key=lambda c: c["messages"][-1]["time"] if c["messages"] else "",
            reverse=True,
        )

    def reset_application(self, phone: str) -> None:
        session = self._init_session(phone)
        session.update({
            "application_stage": ApplicationStage.NONE,
            "selected_job_id": None,
            "selected_job_title": None,
            "collected_name": None,
            "collected_experience": None,
            "collected_skills": [],
            "cv_media_url": None,
        })


conversation_store = ConversationStore()


# ─────────────────────────────────────────────────────────────────────────────
# WhatsApp AI Agent Service
# ─────────────────────────────────────────────────────────────────────────────

class WhatsAppAgentService:
    """
    Full-featured AI-powered WhatsApp recruitment agent for JobStart.

    Handles:
    - Multilingual communication (EN / Sinhala / Tamil)
    - Job browsing & guided application flow
    - CV document reception
    - Interview scheduling & confirmation
    - Recruiter-triggered screening conversations
    """

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.OPENROUTER_MODEL
        self.base_url = settings.OPENROUTER_BASE_URL
        self.auto_reply_enabled = True
        self.agent_name = "JobStart Recruitment Team"

    # ── LLM ───────────────────────────────────────────────────────────────

    async def _llm_reply(self, system_prompt: str, user_message: str, lang: str = "en") -> Optional[str]:
        """Call OpenRouter LLM for a contextual WhatsApp reply."""
        lang_instruction = {
            "si": "Always reply in Sinhala language (සිංහල). Keep it brief and friendly.",
            "ta": "Always reply in Tamil language (தமிழ்). Keep it brief and friendly.",
            "en": "Reply in clear, friendly English. Keep it brief.",
        }.get(lang, "Reply in English.")

        full_system = f"{system_prompt}\n\n{lang_instruction}"

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
                            {"role": "system", "content": full_system},
                            {"role": "user", "content": user_message},
                        ],
                        "temperature": 0.4,
                        "max_tokens": 350,
                    },
                )
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.warning(f"LLM call failed: {e}")
        return None

    # ── Job Listings Formatter ─────────────────────────────────────────────

    def _format_job_list(self, jobs: List[Dict[str, Any]], lang: str) -> str:
        """Format active job listings into a WhatsApp-friendly message."""
        if not jobs:
            return t(lang, "no_jobs")

        header = t(lang, "show_jobs") + "\n\n"
        lines = []
        for i, job in enumerate(jobs[:10], 1):
            salary = ""
            if job.get("salary_min") and job.get("salary_max"):
                salary = f" | LKR {job['salary_min']:,}–{job['salary_max']:,}"
            location = f" 📍 {job['location']}" if job.get("location") else ""
            lines.append(
                f"*{i}.* {job['title']}{location}{salary}\n"
                f"    {job.get('job_type', 'full_time').replace('_', ' ').title()}"
            )

        footer = f"\n\n{t(lang, 'select_job')}"
        return header + "\n".join(lines) + footer

    # ── Main Message Processor ─────────────────────────────────────────────

    async def process_inbound_message(
        self,
        phone: str,
        message_text: str,
        message_type: str = "text",
        media_url: Optional[str] = None,
        candidate_name: str = "Candidate",
        job_title: str = "",
        interview_date: str = "",
        interview_time: str = "",
        available_jobs: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Process an inbound WhatsApp message and generate an appropriate AI reply.
        Handles text messages, documents (CVs), and images.

        Returns: { intent, reply, auto_replied, language, stage }
        """
        if not self.auto_reply_enabled:
            conversation_store.upsert(phone, message_text, "candidate")
            return {"intent": "SKIPPED", "reply": None, "auto_replied": False, "language": "en"}

        # Detect language from incoming message
        lang = detect_language(message_text)
        session = conversation_store.upsert(phone, message_text, "candidate", {
            "candidate_name": candidate_name,
            "job_title": job_title,
            "interview_date": interview_date,
            "interview_time": interview_time,
            "language": lang,
        })
        conversation_store.set_language(phone, lang)

        # ── Handle CV / Document submission ───────────────────────────────
        if message_type in ("document", "image") and media_url:
            return await self._handle_document(phone, media_url, lang, session)

        # ── Handle screening in-progress ──────────────────────────────────
        if session.get("screening_stage") == ScreeningStage.IN_PROGRESS:
            return await self._handle_screening_answer(phone, message_text, lang, session)

        # ── Handle application flow steps ─────────────────────────────────
        app_stage = session.get("application_stage", ApplicationStage.NONE)
        if app_stage not in (ApplicationStage.NONE, ApplicationStage.SUBMITTED):
            return await self._handle_application_step(
                phone, message_text, lang, session, app_stage, available_jobs or []
            )

        # ── Standard intent classification ────────────────────────────────
        intent = classify_intent(message_text)
        conversation_store.set_intent(phone, intent)

        reply = await self._route_intent(
            phone=phone,
            intent=intent,
            message_text=message_text,
            lang=lang,
            session=session,
            available_jobs=available_jobs or [],
            candidate_name=candidate_name,
            job_title=job_title,
            interview_date=interview_date,
            interview_time=interview_time,
        )

        if reply:
            conversation_store.upsert(phone, reply, "agent")

        return {
            "intent": intent,
            "reply": reply,
            "auto_replied": bool(reply),
            "language": lang,
            "stage": session.get("application_stage", ApplicationStage.NONE),
        }

    # ── Intent Router ─────────────────────────────────────────────────────

    async def _route_intent(
        self,
        phone: str,
        intent: str,
        message_text: str,
        lang: str,
        session: Dict[str, Any],
        available_jobs: List[Dict[str, Any]],
        candidate_name: str,
        job_title: str,
        interview_date: str,
        interview_time: str,
    ) -> Optional[str]:

        if intent == "HELP":
            return self._help_menu(lang)

        elif intent == "BROWSE_JOBS":
            return self._format_job_list(available_jobs, lang)

        elif intent == "APPLY":
            if not available_jobs:
                return t(lang, "no_jobs")
            # Start apply flow — show job list first
            job_list = self._format_job_list(available_jobs, lang)
            conversation_store.set_application_stage(phone, ApplicationStage.NONE)
            # Next step: user selects a number
            session["_pending_apply"] = True
            return job_list

        elif intent == "SELECT_NUMBER":
            # Could be job selection during apply flow
            if available_jobs:
                num = int(message_text.strip()) - 1
                if 0 <= num < len(available_jobs):
                    job = available_jobs[num]
                    conversation_store.upsert(phone, message_text, "candidate", {
                        "selected_job_id": str(job.get("id", "")),
                        "selected_job_title": job["title"],
                        "application_stage": ApplicationStage.ASKED_NAME,
                    })
                    return (
                        f"✨ *{job['title']}*\n\n"
                        f"{t(lang, 'ask_name')}"
                    )

        elif intent == "CONFIRM":
            if job_title or session.get("job_title"):
                conversation_store.set_confirmed(phone, True)
                return (
                    f"{t(lang, 'interview_confirm')}\n\n"
                    f"📅 *{interview_date or session.get('interview_date', '')}*\n"
                    f"⏰ *{interview_time or session.get('interview_time', '')}*\n\n"
                    f"Please join 5 minutes early. A Google Meet link will be shared.\n\n"
                    f"— *{self.agent_name}*"
                )

        elif intent == "DECLINE":
            return (
                f"{t(lang, 'interview_decline')}\n\n"
                f"— *{self.agent_name}*"
            )

        elif intent == "RESCHEDULE":
            return (
                f"{t(lang, 'interview_decline')}\n\n"
                f"— *{self.agent_name}*"
            )

        elif intent == "QUESTION":
            system_prompt = (
                f"You are a professional WhatsApp recruitment assistant for JobStart Sri Lanka. "
                f"Keep responses short (under 100 words), friendly, and professional. "
                f"Candidate {candidate_name} has applied for {job_title or 'a position'} and is asking a question. "
                f"Sign off as '— {self.agent_name}'"
            )
            llm_reply = await self._llm_reply(system_prompt, message_text, lang)
            return llm_reply or f"{t(lang, 'question_fallback')}\n\n— *{self.agent_name}*"

        # Default
        return (
            f"{t(lang, 'greeting')}\n\n"
            + self._help_menu(lang)
        )

    # ── Help Menu ─────────────────────────────────────────────────────────

    def _help_menu(self, lang: str) -> str:
        menus = {
            "en": (
                "📋 *What can I help you with?*\n\n"
                "1️⃣  *Jobs* — Browse available positions\n"
                "2️⃣  *Apply* — Apply for a job\n"
                "3️⃣  *Status* — Check your application status\n"
                "❓  Ask me anything about a job!\n\n"
                f"— *{self.agent_name}*"
            ),
            "si": (
                "📋 *ඔබට කෙසේ සහාය කළ හැකිද?*\n\n"
                "1️⃣  *රැකියා* — ලබාගත හැකි රැකියා බලන්න\n"
                "2️⃣  *ඉල්ලීම* — රැකියාවකට ඉල්ලුම් කරන්න\n"
                "3️⃣  *තත්ත්වය* — ඔබේ ඉල්ලුම් පත්‍ර තත්ත්වය\n"
                "❓  රැකියා ගැන ඕනෑම දෙයක් අසන්න!\n\n"
                f"— *{self.agent_name}*"
            ),
            "ta": (
                "📋 *நான் உங்களுக்கு எப்படி உதவலாம்?*\n\n"
                "1️⃣  *வேலைகள்* — கிடைக்கும் பதவிகளை காண்க\n"
                "2️⃣  *விண்ணப்பி* — வேலைக்கு விண்ணப்பிக்கவும்\n"
                "3️⃣  *நிலை* — உங்கள் விண்ணப்ப நிலையை சரிபார்க்கவும்\n"
                "❓  வேலை பற்றி எதையும் கேளுங்கள்!\n\n"
                f"— *{self.agent_name}*"
            ),
        }
        return menus.get(lang, menus["en"])

    # ── Application Flow Steps ─────────────────────────────────────────────

    async def _handle_application_step(
        self,
        phone: str,
        message_text: str,
        lang: str,
        session: Dict[str, Any],
        stage: ApplicationStage,
        available_jobs: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Handle step-by-step application form over WhatsApp."""
        reply = None

        if stage == ApplicationStage.ASKED_NAME:
            name = message_text.strip()
            conversation_store.upsert(phone, message_text, "candidate", {
                "collected_name": name,
                "candidate_name": name,
                "application_stage": ApplicationStage.ASKED_EXPERIENCE,
            })
            reply = f"👋 Nice to meet you, *{name}*!\n\n{t(lang, 'ask_experience')}"

        elif stage == ApplicationStage.ASKED_EXPERIENCE:
            # Extract number from text
            nums = re.findall(r"\d+", message_text)
            exp = int(nums[0]) if nums else 0
            conversation_store.upsert(phone, message_text, "candidate", {
                "collected_experience": exp,
                "application_stage": ApplicationStage.ASKED_SKILLS,
            })
            reply = t(lang, "ask_skills")

        elif stage == ApplicationStage.ASKED_SKILLS:
            skills = [s.strip() for s in re.split(r"[,،،،、]", message_text) if s.strip()]
            conversation_store.upsert(phone, message_text, "candidate", {
                "collected_skills": skills,
                "application_stage": ApplicationStage.AWAITING_CV,
            })
            reply = t(lang, "ask_cv")

        elif stage == ApplicationStage.AWAITING_CV:
            # Candidate sent text instead of document — remind them
            reply = f"📎 {t(lang, 'ask_cv')}"

        if reply:
            conversation_store.upsert(phone, reply, "agent")

        return {
            "intent": f"APPLICATION_{stage.value.upper()}",
            "reply": reply,
            "auto_replied": bool(reply),
            "language": lang,
            "stage": session.get("application_stage", ApplicationStage.NONE),
        }

    # ── Document / CV Handler ─────────────────────────────────────────────

    async def _handle_document(
        self,
        phone: str,
        media_url: str,
        lang: str,
        session: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Handle a document or image sent by the candidate.
        If we're in AWAITING_CV stage, treat it as a CV submission.
        """
        stage = session.get("application_stage", ApplicationStage.NONE)

        if stage == ApplicationStage.AWAITING_CV:
            # Store the CV media URL and mark application as submitted
            conversation_store.upsert(phone, f"[CV Document: {media_url}]", "candidate", {
                "cv_media_url": media_url,
                "application_stage": ApplicationStage.SUBMITTED,
            })

            job_title = session.get("selected_job_title", "the position")
            name = session.get("collected_name") or session.get("candidate_name", "Candidate")

            reply = (
                f"🎉 *{name}*, {t(lang, 'applied')}\n\n"
                f"📌 *Position*: {job_title}\n"
                f"📄 *CV*: Received ✅\n\n"
                f"Our recruitment team will review your application and be in touch within 3-5 business days.\n\n"
                f"— *{self.agent_name}*"
            )
            conversation_store.upsert(phone, reply, "agent")
            return {
                "intent": "CV_SUBMITTED",
                "reply": reply,
                "auto_replied": True,
                "language": lang,
                "stage": ApplicationStage.SUBMITTED,
                "cv_media_url": media_url,
                "application_data": {
                    "name": name,
                    "job_id": session.get("selected_job_id"),
                    "job_title": job_title,
                    "experience": session.get("collected_experience", 0),
                    "skills": session.get("collected_skills", []),
                    "cv_url": media_url,
                    "phone": phone,
                },
            }

        # Unsolicited document — acknowledge
        reply = (
            f"📄 We've received your document, *{session.get('candidate_name', 'Candidate')}*!\n\n"
            f"If you'd like to apply for a job, type *apply* or *jobs* to see available positions.\n\n"
            f"— *{self.agent_name}*"
        )
        conversation_store.upsert(phone, reply, "agent")
        return {"intent": "DOCUMENT_RECEIVED", "reply": reply, "auto_replied": True, "language": lang}

    # ── Screening Handler ─────────────────────────────────────────────────

    async def _handle_screening_answer(
        self,
        phone: str,
        message_text: str,
        lang: str,
        session: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Record a screening answer and send the next question or completion message."""
        next_question = conversation_store.record_screening_answer(phone, message_text)
        name = session.get("candidate_name", "Candidate")

        if next_question:
            q_num = session.get("screening_current_index", 1)
            total = len(session.get("screening_questions", []))
            reply = f"📝 *Question {q_num + 1}/{total}*\n\n{next_question}"
        else:
            reply = (
                f"✅ *Thank you, {name}!*\n\n"
                f"You've completed the screening. Our team will review your responses "
                f"and get back to you shortly.\n\n"
                f"— *{self.agent_name}*"
            )

        conversation_store.upsert(phone, reply, "agent")
        return {
            "intent": "SCREENING_ANSWER",
            "reply": reply,
            "auto_replied": True,
            "language": lang,
            "screening_completed": next_question is None,
        }

    # ── Outbound Messages ─────────────────────────────────────────────────

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

        lang = conversation_store.get(phone)
        lang = lang.get("language", "en") if lang else "en"

        message = (
            f"👋 Hello *{candidate_name}*,\n\n"
            f"🎉 Congratulations! You've been *shortlisted* for an interview with *{employer_name}* "
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
        conversation_store.upsert(phone, message, "agent", {
            "candidate_name": candidate_name,
            "job_title": job_title,
            "interview_date": date,
            "interview_time": time_slot,
        })
        return result

    async def send_job_match_notification(
        self,
        phone: str,
        candidate_name: str,
        matched_jobs: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Send a proactive WhatsApp notification to a candidate about jobs matching their profile.
        Called automatically when new jobs are posted that match a candidate.
        """
        from app.services.waha import waha_service

        lang = conversation_store.get(phone)
        lang = lang.get("language", "en") if lang else "en"

        if not matched_jobs:
            return {"status": "skipped", "reason": "no matches"}

        job_lines = "\n".join(
            f"  {i+1}. *{j['job_title']}* — {j.get('score', 0)}% match"
            for i, j in enumerate(matched_jobs[:5])
        )

        message = (
            f"🔔 Hi *{candidate_name}*!\n\n"
            f"We found *{len(matched_jobs)}* job(s) that match your profile:\n\n"
            f"{job_lines}\n\n"
            f"Reply *apply* to start your application right here in WhatsApp, "
            f"or reply *jobs* to see all available positions.\n\n"
            f"— *{self.agent_name}*"
        )

        result = await waha_service.send_text(phone, message)
        conversation_store.upsert(phone, message, "agent", {"candidate_name": candidate_name})
        return result

    async def start_screening(
        self,
        phone: str,
        candidate_name: str,
        questions: List[str],
        job_title: str = "",
    ) -> Dict[str, Any]:
        """
        Initiate a recruiter-defined screening conversation with a candidate.
        The agent will ask questions one by one and collect answers.
        """
        from app.services.waha import waha_service

        if not questions:
            return {"status": "error", "reason": "no questions provided"}

        lang = conversation_store.get(phone)
        lang = lang.get("language", "en") if lang else "en"

        conversation_store.upsert(phone, "", "system", {"candidate_name": candidate_name})
        conversation_store.set_screening(phone, questions)

        intro = (
            f"👋 Hi *{candidate_name}*!\n\n"
            f"{'For the *' + job_title + '* position, our' if job_title else 'Our'} "
            f"recruitment team has a few questions for you.\n\n"
            f"📝 *Question 1/{len(questions)}*\n\n{questions[0]}"
        )

        result = await waha_service.send_text(phone, intro)
        conversation_store.upsert(phone, intro, "agent")
        return {"status": "started", "total_questions": len(questions), "detail": result}


# Global singleton
whatsapp_agent = WhatsAppAgentService()
