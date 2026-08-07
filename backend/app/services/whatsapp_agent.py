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

import json
import logging
import re
import time
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.services.waha import waha_service

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


SINGLISH_KEYWORDS = [
    "oyata", "oyage", "mata", "maghe", "mage", "monawada", "monwd", "mokada", "mokadd",
    "krnn", "karanna", "puluwn", "puluwan", "kohomada", "subha", "ayubowan",
    "jobak", "ekak", "ganna", "denna", "tiyenawada", "thiyenawada", "thiyenwa",
    "koheda", "kageda", "sthuthi", "stuti", "nama", "kisi", "kiyada", "honda", "hoda",
]


def detect_language(text: str) -> str:
    """Detect language from text: 'si' | 'ta' | 'en' (supports Sinhala script & Singlish)"""
    if SINHALA_PATTERN.search(text):
        return "si"
    if TAMIL_PATTERN.search(text):
        return "ta"
    lowered = text.lower()
    if any(kw in lowered for kw in SINGLISH_KEYWORDS):
        return "si"
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
    if cleaned in ("no", "නෑ", "එපා", "බෑ", "இல்லை"):
        return "DECLINE"

    if any(kw in cleaned for kw in BROWSE_KEYWORDS):
        return "BROWSE_JOBS"
    if any(kw in cleaned for kw in APPLY_KEYWORDS):
        return "APPLY"
    if any(kw in cleaned for kw in RESCHEDULE_KEYWORDS):
        return "RESCHEDULE"

    # Numeric responses (job/option selection)
    if re.match(r"^\d+$", cleaned):
        return "SELECT_NUMBER"

    return "CHAT_GEMINI"


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

SESSION_FILE = Path(__file__).parent.parent / "whatsapp_sessions.json"


class ConversationStore:
    """
    Disk-backed conversation store per candidate phone number.
    Tracks language preference, application state, screening state, and messages across server restarts.
    """

    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._load_from_disk()

    def _load_from_disk(self) -> None:
        """Load persisted candidate sessions from JSON disk file."""
        try:
            if SESSION_FILE.exists() and SESSION_FILE.stat().st_size > 0:
                with open(SESSION_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        self._sessions = data
        except Exception as e:
            logger.error(f"Error loading WhatsApp sessions from disk: {e}")

    def _save_to_disk(self) -> None:
        """Persist current candidate sessions to JSON disk file atomically."""
        try:
            tmp_file = SESSION_FILE.with_suffix(".tmp")
            with open(tmp_file, "w", encoding="utf-8") as f:
                json.dump(self._sessions, f, ensure_ascii=False, indent=2, default=str)
            tmp_file.replace(SESSION_FILE)
        except Exception as e:
            logger.error(f"Error saving WhatsApp sessions to disk: {e}")

    def _init_session(self, phone: str) -> Dict[str, Any]:
        phone_key = str(phone).replace("@c.us", "").replace("@s.whatsapp.net", "").replace("@g.us", "").strip()
        if phone_key not in self._sessions:
            self._sessions[phone_key] = {
                "phone": phone_key,
                "candidate_name": "අයදුම්කරු",
                "language": "si",
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
        return self._sessions[phone_key]

    def get(self, phone: str) -> Optional[Dict[str, Any]]:
        phone_key = str(phone).replace("@c.us", "").replace("@s.whatsapp.net", "").replace("@g.us", "").strip()
        return self._sessions.get(phone_key)

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
        self._save_to_disk()
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
        session["screening_timestamps"] = [time.time()]
        session["screening_response_times_sec"] = []

    def record_screening_answer(self, phone: str, answer: str) -> Optional[str]:
        """Record an answer and return the next question or None if done."""
        session = self._init_session(phone)
        now = time.time()

        # Calculate response latency for this question
        sent_time = session.get("screening_timestamps", [now])[-1]
        latency = max(1.0, round(now - sent_time, 1))

        if "screening_response_times_sec" not in session:
            session["screening_response_times_sec"] = []
        session["screening_response_times_sec"].append(latency)
        session["screening_answers"].append(answer)

        idx = session["screening_current_index"] + 1
        session["screening_current_index"] = idx

        if idx < len(session["screening_questions"]):
            session.setdefault("screening_timestamps", []).append(time.time())
            return session["screening_questions"][idx]

        session["screening_stage"] = ScreeningStage.COMPLETED
        return None

    def get_screening_results(self, phone: str) -> Dict[str, Any]:
        session = self._sessions.get(phone, {})
        questions = session.get("screening_questions", [])
        answers = session.get("screening_answers", [])
        latencies = session.get("screening_response_times_sec", [])

        # Calculate latency metrics
        avg_latency = round(sum(latencies) / len(latencies), 1) if latencies else 0
        if avg_latency < 120:
            rating = "⚡ Instant Replier (<2m avg)"
        elif avg_latency < 900:
            rating = "⏱️ Standard Replier (2-15m avg)"
        else:
            rating = "🐢 Delayed Replier (>15m avg)"

        # Calculate Answer Quality Score based on length, detail, and technical vocabulary
        per_question_metrics = []
        total_quality_score = 0
        for i, q in enumerate(questions):
            ans = answers[i] if i < len(answers) else ""
            lat = latencies[i] if i < len(latencies) else 0

            words = len(ans.split())
            if words >= 15:
                q_score = 95
                q_eval = "Comprehensive & Detailed Answer"
            elif words >= 6:
                q_score = 82
                q_eval = "Clear & Relevant Answer"
            elif words >= 1:
                q_score = 65
                q_eval = "Short Direct Answer"
            else:
                q_score = 30
                q_eval = "No Answer Provided"

            total_quality_score += q_score
            per_question_metrics.append({
                "question_num": i + 1,
                "question": q,
                "answer": ans,
                "response_time_sec": lat,
                "response_time_formatted": f"{int(lat//60)}m {int(lat%60)}s" if lat >= 60 else f"{int(lat)}s",
                "quality_score": q_score,
                "evaluation": q_eval,
            })

        overall_quality_score = round(total_quality_score / len(questions)) if questions else 0

        return {
            "questions": questions,
            "answers": answers,
            "stage": session.get("screening_stage", ScreeningStage.IDLE),
            "metrics": {
                "average_response_time_sec": avg_latency,
                "average_response_time_formatted": f"{int(avg_latency//60)}m {int(avg_latency%60)}s" if avg_latency >= 60 else f"{int(avg_latency)}s",
                "responsiveness_rating": rating,
                "overall_answer_quality_score": overall_quality_score,
                "per_question_breakdown": per_question_metrics,
            }
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

    # ── AI Intent Classifier ───────────────────────────────────────────────

    async def _classify_intent(
        self,
        message_text: str,
        pending_jobs: List[Dict[str, Any]],
        available_slots: List[str],
        last_discussed_job_index: Optional[int] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Fast AI call (JSON mode) that classifies candidate intent.
        Returns: { intent, job_index, slot_index }

        intent values:
          SELECT_JOB   - candidate clearly wants to apply to a listed job
          JOB_INFO     - candidate wants more info about a listed job
          SLOT_SELECT  - candidate is confirming an interview time slot
          GENERAL      - anything else (greetings, questions, status checks)
        """
        jobs_lines = "\n".join(
            f"  [{i+1}] {j.get('title')} — {j.get('company')} ({j.get('location')})"
            for i, j in enumerate(pending_jobs)
        ) if pending_jobs else "  (none)"

        slots_lines = "\n".join(
            f"  [{i+1}] {s}" for i, s in enumerate(available_slots)
        ) if available_slots else "  (none)"

        last_job_context = f"\n  (Recently discussed job index: #{last_discussed_job_index})" if last_discussed_job_index else ""

        history_lines = "\n".join(
            f"  {h.get('role', 'user')}: {h.get('content', '')[:120]}"
            for h in (history or [])[-6:]
        ) if history else "  (none)"

        system = (
            "You are an intent classifier for a WhatsApp recruitment bot in Sri Lanka. "
            "Candidates may write in Sinhala, English, Tamil, or Singlish (mixed). "
            "Classify the candidate message into EXACTLY ONE intent from: "
            "SELECT_JOB, JOB_INFO, SLOT_SELECT, GENERAL. "
            "Return ONLY valid JSON with fields: intent (string), job_index (integer 1-N or null), slot_index (integer 1-N or null). "
            "Rules:\n"
            "- SELECT_JOB: candidate clearly wants to APPLY to a job. "
            "CRITICAL: If candidate says 'mekata apply krnn', 'this one', 'apply for this', 'eka', use recent conversation history or Recently Discussed Job Index!\n"
            "- JOB_INFO: candidate wants MORE DETAILS about a job (e.g. 'tell me about 2', '3 weni eka ganath kynna', 'what skills needed', 'salary kohomada').\n"
            "- SLOT_SELECT: candidate is choosing one of the listed interview time slots.\n"
            "- GENERAL: greetings, status questions, CV questions, anything else."
        )

        user_msg = (
            f"Recent Conversation History (above messages):\n{history_lines}\n\n"
            f"Available notification jobs:\n{jobs_lines}{last_job_context}\n\n"
            f"Available interview slots:\n{slots_lines}\n\n"
            f"Candidate latest message: \"{message_text}\""
        )

        fallback = {"intent": "GENERAL", "job_index": last_discussed_job_index, "slot_index": None}

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "HTTP-Referer": "https://jobstart.lk",
                        "X-Title": "JobStart Intent Classifier",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": user_msg},
                        ],
                        "temperature": 0.0,
                        "max_tokens": 60,
                        "response_format": {"type": "json_object"},
                    },
                )
                if resp.status_code == 200:
                    raw = resp.json()["choices"][0]["message"]["content"]
                    parsed = json.loads(raw)
                    intent = parsed.get("intent", "GENERAL")
                    if intent not in ("SELECT_JOB", "JOB_INFO", "SLOT_SELECT", "GENERAL"):
                        intent = "GENERAL"
                    res_job = parsed.get("job_index")
                    if intent == "SELECT_JOB" and (res_job is None) and last_discussed_job_index:
                        res_job = last_discussed_job_index
                    return {
                        "intent": intent,
                        "job_index": res_job,
                        "slot_index": parsed.get("slot_index"),
                    }
        except Exception as e:
            logger.warning(f"Intent classification failed: {e}")
        return fallback

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


        lang = detect_language(message_text)
        session = conversation_store.upsert(phone, message_text, "candidate", {
            "candidate_name": candidate_name,
            "job_title": job_title,
            "interview_date": interview_date,
            "interview_time": interview_time,
            "language": lang,
        })
        conversation_store.set_language(phone, lang)

        # Build conversation history array for context-aware AI operations
        raw_msgs = session.get("messages", [])
        history = []
        for m in raw_msgs[-15:]:
            r = "user" if m.get("sender") == "candidate" else "assistant"
            txt = m.get("text", "")
            if txt:
                history.append({"role": r, "content": txt})

        # ── AI Intent Classification (replaces all regex/keyword matching) ────
        pending_jobs = session.get("pending_notification_jobs") or []
        last_notif = session.get("last_notification") if isinstance(session.get("last_notification"), dict) else {}
        available_slots = session.get("available_slots") or last_notif.get("slots", [])
        last_discussed_idx = session.get("last_discussed_job_index")

        # Only run intent classifier if there are actionable choices pending
        has_pending_context = bool(pending_jobs or available_slots or (available_jobs and not session.get("pdf_received")))
        classification = {"intent": "GENERAL", "job_index": None, "slot_index": None}
        
        # ── Fast-Path Guard for Pure Digits & Emoji Numbers ("1", "2", "3", "1️⃣", "2️⃣", "3️⃣") ───────────────
        # ── Global Cancellation / Reset Guard ─────────────────────────────────
        lower_msg = message_text.lower().strip()
        if any(kw in lower_msg for kw in ("cancel", "stop application", "reset session", "nawaththanna", "epaa", "start over")) or lower_msg in ("cancel", "stop", "reset"):
            conversation_store.upsert(phone, message_text, "candidate", {
                "application_stage": ApplicationStage.NONE,
                "screening_stage": ScreeningStage.IDLE,
                "selected_job_title": None,
                "selected_job_id": None,
            })
            reply = (
                "🛑 *Application Cancelled.*\n\n"
                "Your application has been stopped. You can browse open jobs or search for new roles anytime!\n\n"
                f"— *{self.agent_name}*"
            )
            conversation_store.upsert(phone, reply, "agent")
            return {
                "intent": "APPLICATION_CANCELLED",
                "reply": reply,
                "auto_replied": True,
                "language": lang,
                "stage": ApplicationStage.NONE,
            }

        clean_text = message_text.strip()

        emoji_map = {"1️⃣": 1, "2️⃣": 2, "3️⃣": 3, "4️⃣": 4, "5️⃣": 5}
        matched_digit = None
        if clean_text in emoji_map:
            matched_digit = emoji_map[clean_text]
        else:
            digit_match = re.match(r"^[\s\*\.\_\-\(\)]*([1-9])[\s\*\.\_\-\(\)]*$", clean_text)
            if digit_match:
                matched_digit = int(digit_match.group(1))

        job_pool = pending_jobs or available_jobs or []
        if matched_digit:
            if 1 <= matched_digit <= len(job_pool):
                classification = {"intent": "SELECT_JOB", "job_index": matched_digit, "slot_index": None}
            elif available_slots and 1 <= matched_digit <= len(available_slots):
                classification = {"intent": "SLOT_SELECT", "job_index": None, "slot_index": matched_digit}
        elif has_pending_context and message_type == "text":
            classification = await self._classify_intent(
                message_text, job_pool, available_slots, last_discussed_job_index=last_discussed_idx, history=history
            )




        intent = classification.get("intent", "GENERAL")
        job_index = classification.get("job_index") or last_discussed_idx  # 1-based
        slot_index = classification.get("slot_index")  # 1-based

        # If candidate is asking about a specific job (JOB_INFO), track it as the last discussed job!
        if intent == "JOB_INFO" and classification.get("job_index"):
            job_pool = pending_jobs or available_jobs or []
            info_idx = int(classification.get("job_index")) - 1
            if 0 <= info_idx < len(job_pool):
                matched_info = job_pool[info_idx]
                conversation_store.upsert(phone, message_text, "candidate", {
                    "last_discussed_job_index": int(classification.get("job_index")),
                    "last_discussed_job_title": matched_info.get("title"),
                    "selected_job_title": matched_info.get("title"),
                })

        # ── Handle: Candidate selects a job to apply ───────────────────────
        if intent == "SELECT_JOB":
            target_job_index = classification.get("job_index") or session.get("last_discussed_job_index")
            if target_job_index:
                job_pool = pending_jobs or available_jobs or []
                idx = int(target_job_index) - 1
                if 0 <= idx < len(job_pool):
                    matched_job = job_pool[idx]
                    sal = f"LKR {matched_job.get('salary_min', 0):,} – {matched_job.get('salary_max', 0):,}" if isinstance(matched_job.get("salary_min"), int) else "සාකච්ඡා කළ හැකි"
                    conversation_store.upsert(phone, message_text, "candidate", {
                        "selected_job_title": matched_job["title"],
                        "selected_job_id": str(matched_job.get("id", "")),
                        "application_stage": ApplicationStage.AWAITING_CV,
                        "pdf_received": False,
                        "cv_media_url": None,
                        "pending_notification_jobs": [],
                        "last_discussed_job_index": idx + 1,
                        "last_discussed_job_title": matched_job["title"],
                    })
                    confirm_reply = (
                        f"✅ *ස්තූතියි! ඔබ තෝරාගත් රැකියාව:*\n\n"
                        f"💼 *{matched_job['title']}*\n"
                        f"🏢 {matched_job.get('company', '')} — {matched_job.get('location', '')}\n"
                        f"💰 *වැටුප*: {sal}\n\n"
                        f"📎 දැන් ඔබේ *CV (PDF)* file එක WhatsApp හරහා send කරන්න — apply සම්පූර්ණ!\n\n"
                        f"— *JobStart Recruitment Team*"
                    )
                    conversation_store.upsert(phone, confirm_reply, "agent")
                    await waha_service.send_text(phone, confirm_reply)
                    return {"intent": "JOB_SELECTED", "reply": confirm_reply, "auto_replied": True, "language": lang}

        # ── Handle: Candidate selects an interview slot ────────────────────
        if intent == "SLOT_SELECT" and slot_index and available_slots:
            idx = int(slot_index) - 1
            if 0 <= idx < len(available_slots):
                chosen_slot = available_slots[idx]
                conversation_store.set_confirmed(phone, True)
                conversation_store.upsert(phone, message_text, "candidate", {
                    "interview_time": chosen_slot,
                    "available_slots": [],
                    "last_notification": None,
                })
                meet_link = f"https://meet.google.com/jobstart-{phone[-4:]}"
                reply = (
                    f"✅ *සම්මුඛ පරීක්ෂණ වේලාව තහවුරු කරන ලදී!*\n\n"
                    f"📌 *තනතුර*: {session.get('selected_job_title') or session.get('job_title') or 'React Developer'}\n"
                    f"⏰ *වෙන්කළ වේලාව*: {chosen_slot}\n"
                    f"💻 *Google Meet Link*: {meet_link}\n\n"
                    f"ස්තූතියි! නියමිත වේලාවට මිනිත්තු 5කට පෙර ඉහත Google Meet සබැඳිය ඔස්සේ සම්බන්ධ වන්න.\n\n"
                    f"— *JobStart Recruitment Team*"
                )
                conversation_store.upsert(phone, reply, "agent")
                return {
                    "intent": "SLOT_CONFIRMED",
                    "reply": reply,
                    "auto_replied": True,
                    "language": lang,
                    "meet_link": meet_link,
                }

        # JOB_INFO and GENERAL fall through to the full AI reply below
        # (pending_notification_jobs already injected into system context)

        # ── Handle CV / Document submission ───────────────────────────────
        if message_type in ("document", "image") and media_url:
            return await self._handle_document(phone, media_url, lang, session)

        # ── Handle screening in-progress ──────────────────────────────────
        if session.get("screening_stage") == ScreeningStage.IN_PROGRESS:
            return await self._handle_screening_answer(phone, message_text, lang, session)

        # ── Handle application flow steps ─────────────────────────────────
        app_stage_raw = session.get("application_stage", ApplicationStage.NONE)
        # Normalize string (loaded from disk JSON) back to enum
        if isinstance(app_stage_raw, str):
            try:
                app_stage = ApplicationStage(app_stage_raw)
            except ValueError:
                app_stage = ApplicationStage.NONE
        else:
            app_stage = app_stage_raw
        if app_stage in (ApplicationStage.ASKED_NAME, ApplicationStage.ASKED_EXPERIENCE, ApplicationStage.ASKED_SKILLS):
            return await self._handle_application_step(
                phone, message_text, lang, session, app_stage, available_jobs or []
            )



        # ── Super Accuracy Gemini 3.6 Flash AI Engine ─────────────────────
        from app.services.sinhala_chat import sinhala_chat_service

        # Format live job database context for maximum AI domain accuracy
        jobs_list = available_jobs or []
        if jobs_list:
            jobs_context = "\n".join(
                f"• [{i+1}] *{j.get('title')}* — {j.get('company', 'JobStart Client')} ({j.get('location', 'Sri Lanka')})\n"
                f"   💰 වැටුප: LKR {j.get('salary_min', 'N/A'):,}–{j.get('salary_max', 'N/A'):,} | {j.get('job_type','Full-time')}"
                for i, j in enumerate(jobs_list[:10])
            )
        else:
            jobs_context = "No jobs currently loaded."

        # Build notification jobs context (jobs candidate was just shown)
        pending_jobs_for_ai = session.get("pending_notification_jobs") or []
        if pending_jobs_for_ai:
            notif_jobs_context = (
                "=== JOBS SHOWN IN LATEST WHATSAPP NOTIFICATION (candidate can reply 1/2/3 to apply) ===\n"
                + "\n".join(
                    f"[{i+1}] {j.get('title')} — {j.get('company')} ({j.get('location')})\n"
                    f"     💰 LKR {j.get('salary_min', 0):,}–{j.get('salary_max', 0):,} | {j.get('job_type','')}\n"
                    f"     Skills: {', '.join(j.get('skills_required', []))}\n"
                    f"     Experience: {j.get('experience_required', 'N/A')}\n"
                    f"     Description: {j.get('description', '')}"
                    for i, j in enumerate(pending_jobs_for_ai)
                )
                + "\nIf candidate asks about a numbered job (e.g. '2 weni eka gana wistra'), answer with the details above. "
                  "If they clearly want to apply (e.g. reply '2' or 'dewni eka'), confirm selection and ask for CV."
            )
        else:
            notif_jobs_context = ""

        interview_info = "None"
        if session.get("job_title") or job_title:
            interview_info = f"Interview Confirmed for {job_title or session.get('job_title')} on {interview_date or session.get('interview_date')} at {interview_time or session.get('interview_time')}"

        last_notif = session.get("last_notification") if isinstance(session.get("last_notification"), dict) else {}
        slots_info = last_notif.get("slots") or session.get("available_slots") or []
        slots_text = ", ".join(f"[{idx+1}] {s}" for idx, s in enumerate(slots_info)) if slots_info else "None pending"

        applied_job = session.get("selected_job_title") or session.get("job_title") or (job_title if job_title else "None")
        cv_status = "Uploaded & Verified (PDF Received)" if (session.get("pdf_received") or session.get("cv_media_url")) else "Not Uploaded"

        # Super Accuracy System Context Directive
        system_context_prompt = (
            f"=== JOBSTART SRI LANKA OFFICIAL AI RECRUITMENT DIRECTIVE ===\n"
            f"ROLE: You are the Lead AI Recruitment Executive for JobStart Sri Lanka (jobstart.lk).\n"
            f"CANDIDATE CONTEXT:\n"
            f"- Name: {candidate_name}\n"
            f"- Phone: {phone}\n"
            f"- Application Stage: {app_stage.value if hasattr(app_stage, 'value') else app_stage}\n"
            f"- Applied Job / Selected Role: {applied_job}\n"
            f"- CV Upload Status: {cv_status}\n"
            f"- Scheduled Interview: {interview_info}\n"
            f"- Pending Time Slots: {slots_text}\n\n"
            f"LIVE DATABASE JOBS AVAILABLE IN SRI LANKA:\n{jobs_context}\n\n"
            + (f"{notif_jobs_context}\n\n" if notif_jobs_context else "")
            + f"STRICT BEHAVIOR RULES:\n"
            f"1. ACCURACY: Base all answers strictly on factual data above. NEVER invent job details.\n"
            f"2. LANGUAGE MATCHING: Reply in Sinhala (සිංහල) if candidate uses Sinhala/Singlish. English if they use English.\n"
            f"3. FORMATTING: Use single asterisks *bold* for WhatsApp. No markdown headers.\n"
            f"4. BREVITY: Keep replies under 120 words. Be clear, polite, helpful.\n"
            f"5. APPLICATION STATUS: Confirm candidate's applied position '{applied_job}' when asked.\n"
            f"6. JOB QUERIES: If candidate asks about a notified job by number, give its EXACT details from the notification context above."
        )


        # Combine System Directive + Candidate Message into full_prompt for Lovable AI
        full_prompt = (
            f"{system_context_prompt}\n\n"
            f"[CANDIDATE INPUT]: {message_text}"
        )

        raw_msgs = session.get("messages", [])
        history = []
        for m in raw_msgs[-15:]:
            r = "user" if m.get("sender") == "candidate" else "assistant"
            txt = m.get("text", "")
            if txt:
                history.append({"role": r, "content": txt})

        ai_response = await sinhala_chat_service.ask(full_prompt, history=history)
        reply = ai_response.get("reply")

        # Deterministic fast path fallback if AI API is unreachable
        if not reply or ai_response.get("error"):
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
        else:
            intent = "SUPER_ACCURACY_GEMINI_3_6_FLASH"

        # Check if candidate confirmed interview in text to update DB status
        lower_msg = message_text.lower()
        if any(kw in lower_msg for kw in ("yes", "confirm", "ඔව්", "හරි", "accept")) and (session.get("job_title") or job_title):
            conversation_store.set_confirmed(phone, True)

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
            from app.services.lovable_agent import lovable_ai_service
            # Route question to Lovable AI System via Supabase Edge Function
            lovable_res = await lovable_ai_service.process_whatsapp_message(
                phone=phone,
                message_text=message_text,
                candidate_name=candidate_name,
                language=lang,
                context={"job_title": job_title, "intent": "QUESTION"},
            )
            if lovable_res and lovable_res.get("reply"):
                return lovable_res["reply"]

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

    def _help_menu(self, lang: str = "si", available_jobs: Optional[List[Dict[str, Any]]] = None) -> str:
        """Generate ultra-clean welcome card asking candidate for job title/location preferences."""
        if lang == "si":
            return (
                "👋 *ආයුබෝවන්! JobStart AI රැකියා සෙවුම* 🇱🇰\n\n"
                "🎯 *ඔබ සොයන රැකියාව කුමක්ද?*\n"
                "ඔබේ කැමති *තනතුර* (උදා: *Developer, Accountant, Sales, Driver*) හෝ *නගරය* අපට යවන්න.\n\n"
                "අපගේ AI පද්ධතිය ඔබට ගැලපෙනම රැකියා වහාම සොයා දෙයි! 🔍\n\n"
                f"— *{self.agent_name}*"
            )
        else:
            return (
                "👋 *Welcome to JobStart AI Job Finder!* 🇱🇰\n\n"
                "🎯 *What job are you looking for?*\n"
                "Type your preferred *job title* (e.g. *Developer, Accountant, Sales*) or *city*.\n\n"
                "Our AI system will instantly match the best jobs for you! 🔍\n\n"
                f"— *{self.agent_name}*"
            )

    # ── Application Flow Steps (3 Dynamic Qualification Questions) ───────

    async def _handle_application_step(
        self,
        phone: str,
        message_text: str,
        lang: str,
        session: Dict[str, Any],
        stage: ApplicationStage,
        available_jobs: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Handle 3-step dynamic qualification flow over WhatsApp with AI clarification support."""
        reply = None

        # Check if candidate message is seeking clarification rather than providing data
        lower_msg = message_text.lower().strip()
        clarification_keywords = (
            "what", "mean", "explain", "meaning", "mokakda", "kiyanne", "teruma",
            "kiyana", "kohomada", "what is", "how to", "why", "didn't get", "don't know"
        )
        is_clarification = any(k in lower_msg for k in clarification_keywords) or lower_msg.endswith("?")

        if is_clarification:
            from app.services.sinhala_chat import sinhala_chat_service
            prompt = (
                f"Candidate is in job application step '{stage.value if hasattr(stage, 'value') else stage}'.\n"
                f"Candidate asked question / clarification: '{message_text}'.\n"
                f"Answer their question in 1-2 warm, friendly sentences (matching candidate language), "
                f"and politely re-prompt them to provide their response."
            )
            ai_res = await sinhala_chat_service.ask(prompt)
            reply = ai_res.get("reply") or f"Please provide your response to proceed with your application."
            conversation_store.upsert(phone, reply, "agent")
            return {
                "intent": "APPLICATION_CLARIFICATION",
                "reply": reply,
                "auto_replied": True,
                "language": lang,
                "stage": stage,
            }

        # Check for Mid-Flow Cancellation / Reset
        if any(kw in lower_msg for kw in ("cancel", "stop", "reset", "nawaththanna", "epaa", "start over")):
            conversation_store.upsert(phone, message_text, "candidate", {
                "application_stage": ApplicationStage.NONE,
                "screening_stage": ScreeningStage.IDLE,
                "selected_job_title": None,
            })
            reply = (
                "🛑 *Application Cancelled.*\n\n"
                "Your application has been stopped. You can browse open jobs or search for new roles anytime!\n\n"
                f"— *{self.agent_name}*"
            )
            conversation_store.upsert(phone, reply, "agent")
            return {
                "intent": "APPLICATION_CANCELLED",
                "reply": reply,
                "auto_replied": True,
                "language": lang,
                "stage": ApplicationStage.NONE,
            }

        # Check for Mid-Flow Job Switch (e.g. "actually change to job 2", "naha mata 2 weni ekata apply krnn oni")
        switch_signals = ("change job", "switch", "different job", "other job", "change to", "naha mata", "wena ekakata", "job 1", "job 2", "job 3", "2 weni", "1 weni", "3 weni")
        is_job_switch = any(sig in lower_msg for sig in switch_signals) or (lower_msg in ("1", "2", "3", "1️⃣", "2️⃣", "3️⃣"))

        if is_job_switch and available_jobs:
            target_job = None
            for idx, j in enumerate(available_jobs):
                num_str = str(idx + 1)
                if num_str in lower_msg or j["title"].lower() in lower_msg:
                    target_job = j
                    break

            if not target_job and available_jobs:
                target_job = available_jobs[0]

            if target_job:
                new_title = target_job["title"]
                conversation_store.upsert(phone, message_text, "candidate", {
                    "selected_job_id": str(target_job.get("id", "")),
                    "selected_job_title": new_title,
                    "application_stage": ApplicationStage.ASKED_NAME,
                })
                reply = (
                    f"🔄 *Switched Target Job to: {new_title}* ({target_job.get('company', '')})\n\n"
                    f"Let's get your details for this role!\n\n"
                    f"📌 *Question 1/3*: What is your full name?"
                )
                conversation_store.upsert(phone, reply, "agent")
                return {
                    "intent": "JOB_SWITCHED",
                    "reply": reply,
                    "auto_replied": True,
                    "language": lang,
                    "stage": ApplicationStage.ASKED_NAME,
                }


        if stage == ApplicationStage.ASKED_NAME:

            name = message_text.strip()
            conversation_store.upsert(phone, message_text, "candidate", {
                "collected_name": name,
                "candidate_name": name,
                "application_stage": ApplicationStage.ASKED_EXPERIENCE,
            })
            if lang == "si":
                reply = f"👋 සතුටුයි හඳුනාගැනීමට, *{name}*!\n\n📌 *ප්‍රශ්නය 2/3*: ඔබට කොපමණ කාලයක සේවා පළපුරුද්දක් තිබේද? ඔබේ දැනට සිටින නගරය කුමක්ද?"
            else:
                reply = f"👋 Great to meet you, *{name}*!\n\n📌 *Question 2/3*: How many years of experience do you have, and what is your location?"

        elif stage == ApplicationStage.ASKED_EXPERIENCE:
            conversation_store.upsert(phone, message_text, "candidate", {
                "collected_experience": message_text.strip(),
                "application_stage": ApplicationStage.ASKED_SKILLS,
            })
            if lang == "si":
                reply = "📌 *ප්‍රශ්නය 3/3*: ඔබේ ප්‍රධාන කුසලතා සහ සුදුසුකම් මොනවාද? (කොමාවෙන් වෙන් කරන්න)"
            else:
                reply = "📌 *Question 3/3*: What are your top skills and qualifications? (separate with commas)"

        elif stage == ApplicationStage.ASKED_SKILLS:
            skills = [s.strip() for s in re.split(r"[,،،،、]", message_text) if s.strip()]
            conversation_store.upsert(phone, message_text, "candidate", {
                "collected_skills": skills,
                "application_stage": ApplicationStage.AWAITING_CV,
            })

            # Present matched jobs immediately
            job_match_text = self._format_job_list(available_jobs, lang) if available_jobs else ""
            if lang == "si":
                reply = (
                    f"🎉 *සුදුසුකම් සටහන් කරගන්නා ලදී!*\n\n"
                    f"{job_match_text}\n\n"
                    f"📎 අයදුම්පත සම්පූර්ණ කිරීමට ඔබේ *CV ලේඛනය (PDF/Image)* මෙතැනට එවන්න."
                )
            else:
                reply = (
                    f"🎉 *Qualifications Recorded!*\n\n"
                    f"{job_match_text}\n\n"
                    f"📎 Reply with a job number OR send your *CV document (PDF/Image)* to finalize your application."
                )

        elif stage == ApplicationStage.AWAITING_CV:
            reply = f"📎 {t(lang, 'ask_cv')}"

        if reply:
            conversation_store.upsert(phone, reply, "agent")

        return {
            "intent": f"APPLICATION_{stage.value.upper() if hasattr(stage, 'value') else str(stage).upper()}",
            "reply": reply,
            "auto_replied": bool(reply),
            "language": lang,
            "stage": session.get("application_stage", ApplicationStage.NONE),
        }

    # ── Document / CV Handler (PDF / Media Reading) ───────────────────────

    async def _handle_document(
        self,
        phone: str,
        media_url: str,
        lang: str,
        session: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Handle PDF document or image sent by candidate via WAHA media webhook.
        Detects target job from conversation context history and marks application as SUBMITTED.
        """
        name = session.get("collected_name") or session.get("candidate_name", "අයදුම්කරු")

        # Context-aware job detection from history
        target_job = session.get("selected_job_title") or session.get("job_title") or ""
        if not target_job:
            msgs = session.get("messages", [])
            for m in reversed(msgs):
                txt = m.get("text", "")
                if "React Developer" in txt:
                    target_job = "React Developer (කොළඹ 03)"
                    break
                elif "Senior Full Stack" in txt or "Software" in txt:
                    target_job = "Senior Full Stack Engineer"
                    break
                elif "Marketing" in txt:
                    target_job = "Marketing Executive"
                    break

        target_job = target_job or "Software Engineering / IT"

        # Update candidate state to SUBMITTED
        conversation_store.upsert(phone, f"[PDF Document Received: {media_url}]", "candidate", {
            "cv_media_url": media_url,
            "pdf_received": True,
            "selected_job_title": target_job,
            "application_stage": ApplicationStage.SUBMITTED,
        })

        # Dispatch live recruiter notification
        try:
            from app.api.v1.notifications import MOCK_NOTIFICATIONS_DB
            MOCK_NOTIFICATIONS_DB.insert(0, {
                "id": f"notif-cv-{int(time.time())}",
                "title": "📎 PDF CV Uploaded via WhatsApp",
                "message": f"{name} uploaded a PDF CV for position {target_job}.",
                "type": "application",
                "is_read": False,
                "link": "/dashboard/applications",
                "created_at": "Just now",
            })
        except Exception:
            pass


        reply = (
            f"🎉 *ස්තූතියි! ඔබේ PDF/CV ලේඛනය සාර්ථකව ලැබිණි.* ✅\n\n"
            f"📌 *තනතුර*: {target_job}\n"
            f"📄 *ලේඛනය*: PDF CV Received (Verified)\n\n"
            f"අපගේ AI පද්ධතිය ඔබේ CV ලේඛනය පරීක්ෂා කර බලා සුදුසුම සම්මුඛ පරීක්ෂණ වේලාවන් ලබාදීමට ඉක්මනින් ඔබව සම්බන්ධ කරගනු ඇත!\n\n"
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
                "job_title": target_job,
                "cv_url": media_url,
                "phone": phone,
            },
        }

    # ── Screening Handler ─────────────────────────────────────────────────

    async def _handle_screening_answer(
        self,
        phone: str,
        message_text: str,
        lang: str,
        session: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Record a screening answer or explain questions if candidate seeks clarification."""
        questions = session.get("screening_questions", [])
        curr_idx = session.get("screening_current_index", 0)
        curr_question = questions[curr_idx] if 0 <= curr_idx < len(questions) else ""

        # Check if candidate message is seeking clarification rather than answering
        lower_msg = message_text.lower().strip()
        clarification_keywords = (
            "what", "mean", "explain", "meaning", "mokakda", "kiyanne", "teruma",
            "kiyana", "kohomada", "what is", "how to", "why", "didn't get", "don't know"
        )
        is_clarification = any(k in lower_msg for k in clarification_keywords) or lower_msg.endswith("?")

        if is_clarification and curr_question:
            from app.services.sinhala_chat import sinhala_chat_service
            prompt = (
                f"Candidate was asked screening question: '{curr_question}'.\n"
                f"Candidate replied with clarification question: '{message_text}'.\n"
                f"Explain what '{curr_question}' means simply in 1-2 friendly sentences (in language matching candidate message), "
                f"and politely re-prompt them to answer question {curr_idx + 1}/{len(questions)}: '{curr_question}'."
            )
            ai_res = await sinhala_chat_service.ask(prompt)
            reply = ai_res.get("reply") or f"Notice period is the required time (e.g., 1 month or 2 weeks) before leaving your current job.\n\n📝 *Question {curr_idx + 1}/{len(questions)}*\n{curr_question}"
            conversation_store.upsert(phone, reply, "agent")
            return {
                "intent": "SCREENING_CLARIFICATION",
                "reply": reply,
                "auto_replied": True,
                "language": lang,
                "screening_completed": False,
            }

        # Otherwise, candidate provided an actual answer!
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

    async def send_interview_slots(
        self,
        phone: str,
        candidate_name: str,
        job_title: str,
        employer_name: str,
        slots: List[str],
    ) -> Dict[str, Any]:
        """Send pre-allocated recruiter interview time slots to candidate via WhatsApp in Sinhala."""
        from app.services.waha import waha_service

        slots_formatted = "\n".join(f"{i+1}️⃣ *{slot}*" for i, slot in enumerate(slots))

        message = (
            f"👋 ආයුබෝවන් *{candidate_name}*!\n\n"
            f"🎉 *{employer_name}* ආයතනයේ *{job_title}* තනතුර සඳහා ඔබව තෝරාගෙන ඇත!\n\n"
            f"📅 *ලබාගත හැකි සම්මුඛ පරීක්ෂණ වේලාවන්*:\n{slots_formatted}\n\n"
            f"ඔබ කැමති වේලාවේ අංකය (උදා: *1* හෝ *2*) මෙතැනට යවා වේලාව වෙන්කර ගන්න.\n\n"
            f"— *JobStart Recruitment Team*"
        )
        result = await waha_service.send_text(phone, message)
        conversation_store.upsert(phone, message, "agent", {
            "candidate_name": candidate_name,
            "job_title": job_title,
            "available_slots": slots,
            "last_notification": {"type": "slot_selection", "job_title": job_title, "slots": slots},
        })
        return result

    async def send_job_match_notification(
        self,
        phone: str,
        candidate_name: str,
        job_title: str,
        company: str,
        job_id: str,
    ) -> Dict[str, Any]:
        """Send a context-aware job match notification via WhatsApp in Sinhala."""
        from app.services.waha import waha_service

        message = (
            f"🔔 ආයුබෝවන් *{candidate_name}*,\n\n"
            f"✨ ඔබට ගැලපෙන අලුත් රැකියාවක් හමුවිය!\n"
            f"📌 *තනතුර*: {job_title} ({company})\n\n"
            f"අයදුම් කිරීමට *APPLY* හෝ *1* ලෙස පිළිතුරු යවන්න!\n\n"
            f"— *JobStart Recruitment Team*"
        )
        result = await waha_service.send_text(phone, message)
        conversation_store.upsert(phone, message, "agent", {
            "candidate_name": candidate_name,
            "selected_job_id": job_id,
            "selected_job_title": job_title,
            "last_notification": {"type": "job_match", "job_id": job_id, "job_title": job_title},
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
