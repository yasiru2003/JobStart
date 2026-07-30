from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.core.security import require_roles
from app.services.waha import waha_service
from app.services.whatsapp_agent import whatsapp_agent, conversation_store

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp (WAHA)"])

# Only admin users can manage the WhatsApp integration
require_admin = require_roles("admin")


# ── Schemas ────────────────────────────────────────────────────────────────

class WAHAConfigRequest(BaseModel):
    host: str = Field(..., example="http://178.104.127.220:3000", description="WAHA server base URL (host + port)")
    api_key: str = Field(..., example="key_Z9s561T3AdkBlkciQ73wt7oag2yEurGA", description="WAHA API key (X-Api-Key header)")
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


class AgentToggleRequest(BaseModel):
    enabled: bool = Field(..., description="Enable or disable auto-reply agent")


# ── Session endpoints ──────────────────────────────────────────────────────

@router.get(
    "/status",
    response_model=WAHAStatusResponse,
    summary="Get WhatsApp session status",
)
async def get_whatsapp_status(_: None = Depends(require_admin)):
    """
    Returns the WAHA session status.

    Possible `status` values:
    - `NOT_CONFIGURED` — WAHA host/key not set yet
    - `NOT_STARTED` — session doesn't exist on the WAHA server
    - `STARTING` — session is initializing
    - `SCAN_QR_CODE` — session needs QR scan to authenticate
    - `WORKING` — session is authenticated and operational
    - `FAILED` — session encountered an error
    - `UNREACHABLE` — cannot connect to WAHA host
    """
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
    description="Retrieves the QR code for WhatsApp auth as a base64 data URI. Only valid when status is SCAN_QR_CODE.",
)
async def get_qr_code(_: None = Depends(require_admin)):
    result = await waha_service.get_qr_code()
    return WAHAQRResponse(**result)


@router.post(
    "/session/start",
    summary="Start WhatsApp session",
)
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


@router.post(
    "/session/stop",
    summary="Stop WhatsApp session",
)
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


# ── AI Agent endpoints ─────────────────────────────────────────────────────

@router.post(
    "/agent/send-invite",
    summary="Send WhatsApp interview invitation via AI Agent",
    description="Sends a structured interview invitation to a candidate and tracks the conversation for auto-reply.",
)
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


@router.get(
    "/agent/conversations",
    summary="List all tracked WhatsApp conversations",
    description="Returns all candidate conversations tracked by the WhatsApp AI Agent, sorted by most recent.",
)
async def get_conversations(_: None = Depends(require_admin)) -> List[Dict[str, Any]]:
    return conversation_store.all()


@router.get(
    "/agent/status",
    summary="Get WhatsApp AI Agent status",
)
async def get_agent_status(_: None = Depends(require_admin)):
    convs = conversation_store.all()
    total_messages = sum(len(c.get("messages", [])) for c in convs)
    confirmed = sum(1 for c in convs if c.get("interview_confirmed"))
    return {
        "auto_reply_enabled": whatsapp_agent.auto_reply_enabled,
        "total_conversations": len(convs),
        "total_messages": total_messages,
        "interviews_confirmed": confirmed,
        "agent_name": whatsapp_agent.agent_name,
        "model": whatsapp_agent.model,
    }


@router.put(
    "/agent/toggle",
    summary="Enable or disable AI Agent auto-reply",
)
async def toggle_agent(payload: AgentToggleRequest, _: None = Depends(require_admin)):
    whatsapp_agent.auto_reply_enabled = payload.enabled
    return {
        "message": f"AI Agent auto-reply {'enabled' if payload.enabled else 'disabled'}",
        "auto_reply_enabled": whatsapp_agent.auto_reply_enabled,
    }


@router.get(
    "/messages",
    summary="Fetch recent inbound WhatsApp messages",
    description="Polls recent messages from the WAHA session and processes any unhandled inbound messages through the AI agent.",
)
async def get_messages(limit: int = 50, _: None = Depends(require_admin)) -> List[Dict[str, Any]]:
    messages = await waha_service.get_messages(limit=limit)
    return messages


@router.post(
    "/webhook",
    summary="WAHA webhook receiver",
    description=(
        "Receives inbound WhatsApp messages from WAHA webhooks. "
        "No authentication required — WAHA posts directly to this endpoint. "
        "Configure this URL in your WAHA dashboard: POST /api/v1/whatsapp/webhook"
    ),
    include_in_schema=True,
)
async def waha_webhook(request: Request):
    """
    WAHA posts inbound message events here.
    Payload shape: { event: 'message', payload: { from, body, ... } }
    """
    try:
        body = await request.json()
    except Exception:
        return {"status": "ignored", "reason": "invalid JSON"}

    event = body.get("event", "")
    if event not in ("message", "message.any"):
        return {"status": "ignored", "event": event}

    payload = body.get("payload", {})
    sender = payload.get("from", "")
    text = payload.get("body", "")
    is_from_me = payload.get("fromMe", False)

    # Skip messages sent by the bot itself
    if is_from_me or not text or not sender:
        return {"status": "ignored"}

    # Strip @c.us suffix for storage
    phone = sender.replace("@c.us", "").replace("@g.us", "")

    # Look up any existing conversation context
    conv = conversation_store.get(phone)
    candidate_name = conv.get("candidate_name", "Candidate") if conv else "Candidate"
    job_title = conv.get("job_title", "") if conv else ""
    interview_date = conv.get("interview_date", "") if conv else ""
    interview_time = conv.get("interview_time", "") if conv else ""

    result = await whatsapp_agent.process_inbound_message(
        phone=phone,
        message_text=text,
        candidate_name=candidate_name,
        job_title=job_title,
        interview_date=interview_date,
        interview_time=interview_time,
    )

    # Send auto-reply via WAHA if one was generated
    if result.get("reply"):
        await waha_service.send_text(phone, result["reply"])

    return {
        "status": "processed",
        "intent": result.get("intent"),
        "auto_replied": result.get("auto_replied"),
    }
