import re
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.core.security import require_roles
from app.services.waha import waha_service
from app.services.whatsapp_agent import whatsapp_agent, conversation_store
from app.services.ai_ranking import ai_ranking_service, CandidateProfile, JobRequirements
from app.api.v1.jobs import JOBS_DB

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp (WAHA)"])

# Only admin users can manage the WhatsApp integration
require_admin = require_roles("admin")


# ── Schemas ────────────────────────────────────────────────────────────────

class WAHAConfigRequest(BaseModel):
    host: str = Field(..., example="http://178.104.127.220:3000", description="WAHA server base URL (host + port)")
    api_key: str = Field(..., example="your_waha_api_key_here", description="WAHA API key (X-Api-Key header)")
    session: Optional[str] = Field(default=None, example="default", description="Session name (defaults to 'default')")


class WAHATestRequest(BaseModel):
    phone: str = Field(..., example="94771234567", description="Phone number to send test message to")


class WAHAStatusResponse(BaseModel):
    name: str
    status: str
    engine: dict = {}
    is_configured: bool
    host: str
    error: Optional[str] = None


class WAHAQRResponse(BaseModel):
    qr_code: Optional[str] = None
    format: Optional[str] = None
    status: Optional[str] = None
    error: Optional[str] = None


class SendInviteRequest(BaseModel):
    phone: str = Field(..., example="94771234567")
    candidate_name: str = Field(..., example="Kasun Perera")
    job_title: str = Field(..., example="Senior React Developer")
    employer_name: str = Field(default="JobStart Sri Lanka", example="WSO2 Lanka")
    date: str = Field(..., example="2026-08-05")
    time_slot: str = Field(..., example="10:00 AM")
    mode: str = Field(default="Google Meet", example="Google Meet / Onsite")


class NotifyMatchRequest(BaseModel):
    phone: str = Field(..., example="94771234567")
    candidate_name: str = Field(..., example="Kasun Perera")
    matched_jobs: List[Dict[str, Any]] = Field(..., example=[{"job_title": "Senior React Developer", "score": 92}])


class StartScreeningRequest(BaseModel):
    phone: str = Field(..., example="94771234567")
    candidate_name: str = Field(..., example="Kasun Perera")
    job_title: Optional[str] = Field(default="", example="Senior React Developer")
    questions: List[str] = Field(..., example=["What experience do you have with Next.js?", "What is your notice period?"])


class RankCandidatesRequest(BaseModel):
    job: Dict[str, Any]
    candidates: List[Dict[str, Any]]


class CompareCandidatesRequest(BaseModel):
    job: Dict[str, Any]
    candidate_a: Dict[str, Any]
    candidate_b: Dict[str, Any]


class AgentToggleRequest(BaseModel):
    enabled: bool = Field(..., description="Enable or disable auto-reply agent")


class NewJobNotificationRequest(BaseModel):
    phones: List[str] = Field(..., example=["94765225044", "94771234567"], description="List of candidate phone numbers to notify")
    jobs: Optional[List[Dict[str, Any]]] = Field(default=None, description="Override jobs to send (defaults to JOBS_DB)")


# ── Session endpoints ──────────────────────────────────────────────────────

@router.get(
    "/status",
    response_model=WAHAStatusResponse,
    summary="Get WhatsApp session status",
)
async def get_whatsapp_status(_: None = Depends(require_admin)):
    result = await waha_service.get_session_status()
    return WAHAStatusResponse(
        name=result.get("name", waha_service.session),
        status=result.get("status", "UNKNOWN"),
        engine=result.get("engine", {}),
        is_configured=waha_service.is_configured,
        host=waha_service.base_url,
        error=result.get("error"),
    )


@router.get(
    "/qr",
    response_model=WAHAQRResponse,
    summary="Get WhatsApp QR code",
)
async def get_qr_code(_: None = Depends(require_admin)):
    result = await waha_service.get_qr_code()
    return WAHAQRResponse(**result)


@router.post("/session/start", summary="Start WhatsApp session")
async def start_session(_: None = Depends(require_admin)):
    if not waha_service.is_configured:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="WAHA is not configured. Set host and API key first via PUT /whatsapp/config",
        )
    result = await waha_service.start_session()
    if result.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=result.get("error", "Failed to start session"))
    return {"message": "Session start initiated", "detail": result}


@router.post("/session/stop", summary="Stop WhatsApp session")
async def stop_session(_: None = Depends(require_admin)):
    if not waha_service.is_configured:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WAHA is not configured")
    result = await waha_service.stop_session()
    if result.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=result.get("error", "Failed to stop session"))
    return {"message": "Session stopped successfully", "detail": result}


@router.post("/test", summary="Send a test WhatsApp message")
async def send_test_message(payload: WAHATestRequest, _: None = Depends(require_admin)):
    if not waha_service.is_configured:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WAHA is not configured")

    result = await waha_service.send_text(
        phone=payload.phone,
        text=(
            "✅ *JobStart WAHA Test*\n\n"
            "This is a test message from the JobStart recruitment platform. "
            "If you received this, your WhatsApp integration is working correctly!\n\n"
            "— *JobStart Admin*"
        ),
    )
    if result.get("status") == "error" or result.get("simulated"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get("message", "Failed to send message"),
        )
    return {"message": "Test message sent successfully", "detail": result}


@router.get("/health", summary="Check WAHA server connectivity")
async def health_check(_: None = Depends(require_admin)):
    result = await waha_service.check_health()
    if result.get("status") == "not_configured":
        return {"status": "not_configured", "message": "WAHA host is not set. Configure via PUT /whatsapp/config"}
    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get("error", "WAHA host unreachable"),
        )
    return result


@router.put("/config", summary="Update WAHA connection settings")
async def update_waha_config(payload: WAHAConfigRequest, _: None = Depends(require_admin)):
    try:
        waha_service.reconfigure(
            base_url=payload.host,
            api_key=payload.api_key,
            session=payload.session,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    health = await waha_service.check_health()
    connectivity = health.get("status", "unknown")

    return {
        "message": "WAHA configuration updated successfully",
        "host": waha_service.base_url,
        "session": waha_service.session,
        "connectivity": connectivity,
    }


# ── AI Agent & Ranking endpoints ──────────────────────────────────────────

@router.post("/agent/send-invite", summary="Send WhatsApp interview invitation via AI Agent")
async def send_interview_invite(payload: SendInviteRequest, _: None = Depends(require_admin)):
    if not waha_service.is_configured:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WAHA is not configured")

    result = await whatsapp_agent.send_interview_invite(
        phone=payload.phone,
        candidate_name=payload.candidate_name,
        job_title=payload.job_title,
        employer_name=payload.employer_name,
        date=payload.date,
        time_slot=payload.time_slot,
        mode=payload.mode,
    )

    if result.get("status") == "error" or result.get("simulated"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get("message", "Failed to send invitation"),
        )
    return {"message": f"Interview invitation sent to {payload.candidate_name}", "detail": result}


class SendSlotsRequest(BaseModel):
    phone: str = Field(..., example="94771234567")
    candidate_name: str = Field(..., example="Kasun Perera")
    job_title: str = Field(..., example="Senior Developer")
    employer_name: str = Field(default="JobStart Client", example="TechCorp")
    slots: List[str] = Field(..., example=["Mon 10:00 AM", "Tue 2:00 PM", "Wed 11:30 AM"])


@router.post("/agent/slots/send", summary="Send pre-allocated recruiter interview slots via WhatsApp")
async def send_interview_slots(payload: SendSlotsRequest, _: None = Depends(require_admin)):
    if not waha_service.is_configured:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WAHA is not configured")

    result = await whatsapp_agent.send_interview_slots(
        phone=payload.phone,
        candidate_name=payload.candidate_name,
        job_title=payload.job_title,
        employer_name=payload.employer_name,
        slots=payload.slots,
    )
    return {"message": f"Interview slots sent to {payload.candidate_name}", "detail": result}


@router.post("/agent/notify-match", summary="Send proactive job-match notification")
async def notify_job_match(payload: NotifyMatchRequest, _: None = Depends(require_admin)):
    if not waha_service.is_configured:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WAHA is not configured")

    result = await whatsapp_agent.send_job_match_notification(
        phone=payload.phone,
        candidate_name=payload.candidate_name,
        matched_jobs=payload.matched_jobs,
    )
    return {"message": f"Job match notification sent to {payload.candidate_name}", "detail": result}


@router.post("/agent/start-screening", summary="Start recruiter screening questions via WhatsApp")
async def start_screening(payload: StartScreeningRequest, _: None = Depends(require_admin)):
    if not waha_service.is_configured:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="WAHA is not configured")

    result = await whatsapp_agent.start_screening(
        phone=payload.phone,
        candidate_name=payload.candidate_name,
        questions=payload.questions,
        job_title=payload.job_title or "",
    )
    return {"message": f"Screening started for {payload.candidate_name}", "detail": result}


@router.get("/agent/screening-results", summary="Get recruiter candidate screening analytics & response metrics")
async def get_candidate_screening_results(phone: str):
    """
    Returns candidate screening answers, average response latency, responsiveness rating, and AI quality scores.
    """
    results = conversation_store.get_screening_results(phone)
    conv = conversation_store.get(phone) or {}
    return {
        "phone": phone,
        "candidate_name": conv.get("candidate_name", "Candidate"),
        "job_title": conv.get("selected_job_title") or conv.get("job_title", "Candidate"),
        "stage": results.get("stage"),
        "questions": results.get("questions"),
        "answers": results.get("answers"),
        "metrics": results.get("metrics"),
    }



@router.post("/agent/rank", summary="Rank candidate list against job requirements via LLM")
async def rank_candidates(payload: RankCandidatesRequest, _: None = Depends(require_admin)):
    job_req = JobRequirements(
        job_id=payload.job.get("id", "job-1"),
        title=payload.job.get("title", "Position"),
        description=payload.job.get("description", ""),
        required_skills=payload.job.get("required_skills", payload.job.get("skills_required", [])),
        experience_required=payload.job.get("experience_required", "Any"),
    )
    candidates = [
        CandidateProfile(
            candidate_id=c.get("id", f"cand-{i}"),
            name=c.get("name", "Unknown"),
            skills=c.get("skills", []),
            experience_years=c.get("experience_years", 0),
            education=c.get("education", ""),
            cv_summary=c.get("cv_summary", ""),
        )
        for i, c in enumerate(payload.candidates)
    ]
    ranked = await ai_ranking_service.rank_candidates(candidates, job_req)
    return {"job_id": job_req.job_id, "ranked_candidates": ranked}


@router.post("/agent/compare", summary="Compare two candidates side-by-side via LLM")
async def compare_candidates(payload: CompareCandidatesRequest, _: None = Depends(require_admin)):
    job_req = JobRequirements(
        job_id=payload.job.get("id", "job-1"),
        title=payload.job.get("title", "Position"),
        description=payload.job.get("description", ""),
        required_skills=payload.job.get("required_skills", []),
    )
    cand_a = CandidateProfile(
        candidate_id=payload.candidate_a.get("id", "a"),
        name=payload.candidate_a.get("name", "Candidate A"),
        skills=payload.candidate_a.get("skills", []),
        experience_years=payload.candidate_a.get("experience_years", 0),
    )
    cand_b = CandidateProfile(
        candidate_id=payload.candidate_b.get("id", "b"),
        name=payload.candidate_b.get("name", "Candidate B"),
        skills=payload.candidate_b.get("skills", []),
        experience_years=payload.candidate_b.get("experience_years", 0),
    )
    res = await ai_ranking_service.compare_candidates(cand_a, cand_b, job_req)
    return res


@router.get("/agent/conversations", summary="List all tracked WhatsApp conversations")
async def get_conversations(_: None = Depends(require_admin)) -> List[Dict[str, Any]]:
    return conversation_store.all()


@router.get("/agent/status", summary="Get WhatsApp AI Agent status")
async def get_agent_status(_: None = Depends(require_admin)):
    convs = conversation_store.all()
    total_messages = sum(len(c.get("messages", [])) for c in convs)
    confirmed = sum(1 for c in convs if c.get("interview_confirmed"))
    active_screenings = sum(1 for c in convs if c.get("screening_stage") == "in_progress")
    applications = sum(1 for c in convs if c.get("application_stage") in ("submitted", "awaiting_cv"))
    return {
        "auto_reply_enabled": whatsapp_agent.auto_reply_enabled,
        "total_conversations": len(convs),
        "total_messages": total_messages,
        "interviews_confirmed": confirmed,
        "active_screenings": active_screenings,
        "applications_in_progress": applications,
        "agent_name": whatsapp_agent.agent_name,
        "model": whatsapp_agent.model,
    }


@router.put("/agent/toggle", summary="Enable or disable AI Agent auto-reply")
async def toggle_agent(payload: AgentToggleRequest, _: None = Depends(require_admin)):
    whatsapp_agent.auto_reply_enabled = payload.enabled
    return {
        "message": f"AI Agent auto-reply {'enabled' if payload.enabled else 'disabled'}",
        "auto_reply_enabled": whatsapp_agent.auto_reply_enabled,
    }


@router.get("/messages", summary="Fetch recent inbound WhatsApp messages")
async def get_messages(limit: int = 50, _: None = Depends(require_admin)) -> List[Dict[str, Any]]:
    messages = await waha_service.get_messages(limit=limit)
    return messages


class LovableWhatsAppMessageRequest(BaseModel):
    phone: str = Field(..., example="94771234567")
    message: str = Field(..., example="I want to apply for Senior React Developer")
    candidate_name: Optional[str] = Field(default="Candidate", example="Kasun Perera")
    language: Optional[str] = Field(default="en", example="en")


@router.post("/lovable-process", summary="Process WhatsApp message via Lovable AI System")
async def process_whatsapp_with_lovable(payload: LovableWhatsAppMessageRequest, _: None = Depends(require_admin)):
    from app.services.lovable_agent import lovable_ai_service
    result = await lovable_ai_service.process_whatsapp_message(
        phone=payload.phone,
        message_text=payload.message,
        candidate_name=payload.candidate_name or "Candidate",
        language=payload.language or "en",
    )
    return result


PROCESSED_MESSAGE_IDS = set()


@router.post("/agent/reset-session", summary="Reset a candidate session stage (admin)")
async def reset_candidate_session(phone: str, stage: str = "none"):
    """Reset a candidate's application_stage in the live conversation store."""
    from app.services.whatsapp_agent import ApplicationStage, ScreeningStage
    try:
        new_stage = ApplicationStage(stage)
    except ValueError:
        new_stage = ApplicationStage.NONE
    conversation_store.upsert(phone, "", "system", {
        "application_stage": new_stage,
        "screening_stage": ScreeningStage.IDLE,
        "pdf_received": False,
        "selected_job_title": None,
    })

    s = conversation_store.get(phone)
    return {
        "status": "reset",
        "phone": phone,
        "application_stage": s.get("application_stage"),
        "pending_jobs": [j["title"] for j in (s.get("pending_notification_jobs") or [])],
    }


@router.post(
    "/agent/notify-new-job",
    summary="Broadcast new job notifications to candidates (in-house WhatsApp apply)",
    description="Send new job notifications to a list of candidates. Candidates can reply with 1/2/3 to apply in-house.",
)
async def notify_new_job(payload: NewJobNotificationRequest):
    """
    Sends new job listings to candidates via WhatsApp.
    Candidate replies 1/2/3 → AI agent auto-processes application in-house.
    """
    jobs_to_notify = payload.jobs or JOBS_DB
    if not jobs_to_notify:
        raise HTTPException(status_code=400, detail="No jobs available to notify")

    results = []
    for phone in payload.phones:
        conv = conversation_store.get(phone)
        candidate_name = (conv.get("candidate_name") if conv else None) or "Valued Candidate"

        # Build job listing lines
        job_lines = "\n\n".join(
            f"💼 *{i+1}. {j.get('title')}*\n"
            f"🏢 {j.get('company', 'JobStart Client')}, {j.get('location', 'Colombo')}\n"
            f"💰 LKR {j.get('salary_min', 'N/A'):,} – {j.get('salary_max', 'N/A'):,}\n"
            f"🕐 {j.get('job_type', 'Full-time')}"
            for i, j in enumerate(jobs_to_notify[:3])
        )

        msg = (
            f"🔔 *නව රැකියා දැන්වීම!* — JobStart Sri Lanka\n\n"
            f"👋 ආයුබෝවන් *{candidate_name}*! ඔබේ profile සමඟ ගැළපෙන නව Job Opportunities!\n\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"{job_lines}\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"✅ *Apply කිරීමට*: ජොබ් අංකය *1*, *2*, හෝ *3* ලෙස reply කරන්න!\n"
            f"📎 ඔබේ CV ලෙස PDF file එකද reply කළ හොත් apply process සම්පූර්ණ!\n\n"
            f"— *JobStart AI Recruitment*"
        )

        # Save pending notification jobs to candidate session so replies resolve correctly
        conversation_store.upsert(phone, msg, "agent", {
            "pending_notification_jobs": [
                {"id": j.get("id"), "title": j.get("title"), "company": j.get("company"), "location": j.get("location"),
                 "salary_min": j.get("salary_min"), "salary_max": j.get("salary_max")}
                for j in jobs_to_notify[:3]
            ]
        })

        try:
            r = await waha_service.send_text(phone, msg)
            results.append({"phone": phone, "status": "sent", "message_id": r.get("key", {}).get("id")})
        except Exception as e:
            results.append({"phone": phone, "status": "failed", "error": str(e)})

    return {"notified": len(results), "results": results}



def extract_phone_deep(payload: Any, active_sessions: Optional[Dict[str, Any]] = None) -> Optional[str]:
    """
    Recursively scans the entire payload JSON for candidate phone numbers.
    Immunizes the system against ANY future WAHA/WhatsApp schema changes, key renames, or format shifts.
    """
    found_phones = []
    
    def _scan(node: Any):
        if isinstance(node, str):
            clean = node.replace("@s.whatsapp.net", "").replace("@c.us", "").replace("@g.us", "")
            digits = re.sub(r"\D", "", clean)
            if digits.isdigit() and 9 <= len(digits) <= 15 and not node.endswith("@lid"):
                if digits not in found_phones:
                    found_phones.append(digits)
        elif isinstance(node, dict):
            for v in node.values():
                _scan(v)
        elif isinstance(node, list):
            for item in node:
                _scan(item)

    _scan(payload)

    # Check if any extracted phone matches an active session
    if active_sessions:
        for p in found_phones:
            if p in active_sessions:
                return p

    # Prefer Sri Lanka country code (94...) or return first valid phone
    lk_phones = [p for p in found_phones if p.startswith("94")]
    if lk_phones:
        return lk_phones[0]
    elif found_phones:
        return found_phones[0]
    return None


@router.post(
    "/webhook",
    summary="WAHA webhook receiver",
    description="Receives inbound WhatsApp messages and documents from WAHA webhooks.",
    include_in_schema=True,
)
async def waha_webhook(request: Request):
    """
    WAHA posts inbound message events here.
    Supports text, document (CVs), image events.
    """
    try:
        body = await request.json()
        print(f"--> [WAHA WEBHOOK RECEIVED]: {body}")
        import logging
        logging.getLogger("jobstart.waha").info(f"Received WAHA webhook body: {body}")
    except Exception as e:
        print(f"--> [WAHA WEBHOOK ERROR]: {e}")
        return {"status": "ignored", "reason": "invalid JSON"}

    # Extract payload regardless of wrapping
    payload = body.get("payload") if isinstance(body.get("payload"), dict) else body
    event = body.get("event", payload.get("event", "message"))

    # Skip non-message status events like session.status
    if event and event not in ("message", "message.any", "message.upsert", "message.created"):
        if "status" in str(event).lower() or "session" in str(event).lower():
            return {"status": "ignored", "event": event}

    # ── Deduplicate by Message ID to prevent double replies ────────────
    msg_id = payload.get("id") or payload.get("_data", {}).get("key", {}).get("id")
    if msg_id:
        if msg_id in PROCESSED_MESSAGE_IDS:
            return {"status": "ignored", "reason": "duplicate message ID"}
        PROCESSED_MESSAGE_IDS.add(msg_id)
        if len(PROCESSED_MESSAGE_IDS) > 1000:
            PROCESSED_MESSAGE_IDS.clear()

    # ── Deep Recursive Phone Extraction (Schema Change Immune) ──────────
    phone = extract_phone_deep(payload, active_sessions=conversation_store._sessions)
    if not phone:
        sender_raw = payload.get("from") or payload.get("chatId") or payload.get("author", "")
        phone = str(sender_raw).replace("@c.us", "").replace("@s.whatsapp.net", "").replace("@g.us", "")



    text = payload.get("body") or payload.get("text") or payload.get("caption", "")
    is_from_me = payload.get("fromMe", False)
    has_media = payload.get("hasMedia", False)
    media_obj = payload.get("media") if isinstance(payload.get("media"), dict) else {}
    media_url = payload.get("mediaUrl") or media_obj.get("url")
    msg_type = payload.get("_data", {}).get("type", "text") if not has_media else "document"

    # Skip messages sent by the bot itself (fromMe=True) to prevent loops
    if is_from_me or not phone:
        return {"status": "ignored", "reason": "fromMe or empty phone"}

    # Look up any existing conversation context
    conv = conversation_store.get(phone)
    candidate_name = conv.get("candidate_name", "Candidate") if conv else "Candidate"
    job_title = conv.get("job_title", "") if conv else ""
    interview_date = conv.get("interview_date", "") if conv else ""
    interview_time = conv.get("interview_time", "") if conv else ""

    result = await whatsapp_agent.process_inbound_message(
        phone=phone,
        message_text=text or "[Media Document]",
        message_type=msg_type if has_media else "text",
        media_url=media_url,
        candidate_name=candidate_name,
        job_title=job_title,
        interview_date=interview_date,
        interview_time=interview_time,
        available_jobs=JOBS_DB,
    )

    # Send auto-reply via WAHA if one was generated
    if result.get("reply"):
        await waha_service.send_text(phone, result["reply"])

    return {
        "status": "processed",
        "intent": result.get("intent"),
        "auto_replied": result.get("auto_replied"),
        "language": result.get("language"),
    }

