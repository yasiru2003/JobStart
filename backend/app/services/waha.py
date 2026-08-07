import httpx
import logging
from typing import Optional
from app.core.config import settings

import re

logger = logging.getLogger("jobstart.waha")


def format_whatsapp_markdown(text: str) -> str:
    """Sanitize and format markdown cleanly for native WhatsApp rendering (*bold*)."""
    if not text:
        return text
    # Convert double asterisks **bold** to single asterisk *bold* for WhatsApp
    text = re.sub(r"\*\*(.*?)\*\*", r"*\1*", text)
    # Convert markdown headers ### Title to *Title*
    text = re.sub(r"^#{1,6}\s*(.*)$", r"*\1*", text, flags=re.MULTILINE)
    return text


class WAHAService:
    """
    WAHA (WhatsApp HTTP API) Integration Service
    Documentation: https://waha.devlike.pro

    Supports WAHA Cloud authentication via X-Api-Key header.
    Configure via env vars: WAHA_BASE_URL, WAHA_SESSION, WAHA_API_KEY
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        session: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        self.base_url = (base_url or settings.WAHA_BASE_URL or "").rstrip("/")
        self.session = session or settings.WAHA_SESSION or "default"
        self.api_key = api_key or settings.WAHA_API_KEY or ""
        self._build_headers()

    def _build_headers(self) -> None:
        self.headers = {"Content-Type": "application/json"}
        if self.api_key:
            self.headers["X-Api-Key"] = self.api_key

    def reconfigure(self, base_url: str, api_key: str, session: Optional[str] = None) -> None:
        """Reconfigure the service at runtime (e.g. from admin settings UI)."""
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        if session:
            self.session = session
        self._build_headers()
        # Persist to settings object so other code picks it up
        settings.WAHA_BASE_URL = self.base_url
        settings.WAHA_API_KEY = self.api_key
        settings.WAHA_SESSION = self.session

    @property
    def is_configured(self) -> bool:
        return bool(self.base_url)

    def _format_phone(self, phone: str) -> str:
        """Formats phone number or JID to WAHA chatId format e.g. 94771234567@c.us or 123@lid"""
        phone = str(phone).strip()
        if any(phone.endswith(suffix) for suffix in ("@c.us", "@s.whatsapp.net", "@lid", "@g.us")):
            return phone
        cleaned = "".join(filter(str.isdigit, phone))
        if cleaned.startswith("0"):
            cleaned = "94" + cleaned[1:]
        return f"{cleaned}@c.us"

    # ── Health / Connectivity ──────────────────────────────────────────────

    async def check_health(self) -> dict:
        """Ping WAHA health endpoint to verify connectivity."""
        if not self.is_configured:
            return {"status": "not_configured", "error": "WAHA_BASE_URL is not set"}
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(f"{self.base_url}/api/health", headers=self.headers)
                resp.raise_for_status()
                return {"status": "ok", "detail": resp.json()}
        except httpx.ConnectError:
            return {"status": "error", "error": "Cannot reach WAHA host — check IP/port"}
        except httpx.HTTPStatusError as e:
            return {"status": "error", "error": f"HTTP {e.response.status_code}: {e.response.text}"}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    # ── Session Management ─────────────────────────────────────────────────

    async def get_session_status(self) -> dict:
        """Returns the current session status from WAHA."""
        if not self.is_configured:
            return {"name": self.session, "status": "NOT_CONFIGURED", "engine": {}}
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(
                    f"{self.base_url}/api/sessions/{self.session}",
                    headers=self.headers,
                )
                if resp.status_code == 404:
                    return {"name": self.session, "status": "NOT_STARTED", "engine": {}}
                resp.raise_for_status()
                return resp.json()
        except httpx.ConnectError:
            return {"name": self.session, "status": "UNREACHABLE", "engine": {}, "error": "Cannot connect to WAHA host"}
        except Exception as e:
            return {"name": self.session, "status": "ERROR", "engine": {}, "error": str(e)}

    async def start_session(self) -> dict:
        """Start the WhatsApp session (creates it if needed, starts it if STOPPED)."""
        if not self.is_configured:
            return {"status": "error", "error": "WAHA_BASE_URL is not configured"}
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                # First check if session already exists
                check = await client.get(
                    f"{self.base_url}/api/sessions/{self.session}",
                    headers=self.headers,
                )
                if check.status_code == 200:
                    data = check.json()
                    current_status = data.get("status", "")
                    # If already working, no need to restart
                    if current_status == "WORKING":
                        return {"status": "WORKING", "detail": "Session already connected"}
                    # If STOPPED or FAILED, start it
                    if current_status in ("STOPPED", "FAILED", "SCAN_QR_CODE"):
                        resp2 = await client.post(
                            f"{self.base_url}/api/sessions/{self.session}/start",
                            headers=self.headers,
                        )
                        return resp2.json() if resp2.status_code < 300 else {"status": "ok", "detail": f"Start attempted from {current_status}"}
                    # STARTING or other — return current state
                    return data

                # Session doesn't exist — create it first
                create_resp = await client.post(
                    f"{self.base_url}/api/sessions",
                    json={"name": self.session},
                    headers=self.headers,
                )
                if create_resp.status_code in (200, 201):
                    # Now start it
                    start_resp = await client.post(
                        f"{self.base_url}/api/sessions/{self.session}/start",
                        headers=self.headers,
                    )
                    return start_resp.json() if start_resp.status_code < 300 else create_resp.json()
                # 422 = race condition, already exists — try starting directly
                if create_resp.status_code == 422:
                    resp2 = await client.post(
                        f"{self.base_url}/api/sessions/{self.session}/start",
                        headers=self.headers,
                    )
                    return resp2.json() if resp2.status_code < 300 else {"status": "ok", "detail": "session start attempted"}
                return {"status": "error", "error": f"Unexpected create status: {create_resp.status_code}"}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def stop_session(self) -> dict:
        """Stop the current WhatsApp session."""
        if not self.is_configured:
            return {"status": "error", "error": "WAHA_BASE_URL is not configured"}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.delete(
                    f"{self.base_url}/api/sessions/{self.session}",
                    headers=self.headers,
                )
                if resp.status_code in (200, 204):
                    return {"status": "stopped"}
                return {"status": "error", "detail": resp.text}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def get_qr_code(self) -> dict:
        """Retrieve the QR code for session authentication as a base64 data URI."""
        if not self.is_configured:
            return {"status": "error", "error": "WAHA_BASE_URL is not configured"}
        try:
            import base64
            async with httpx.AsyncClient(timeout=12.0) as client:
                # Primary: dedicated QR image endpoint
                resp = await client.get(
                    f"{self.base_url}/api/{self.session}/auth/qr",
                    headers={**self.headers, "Accept": "image/png, image/*, */*"},
                )
                if resp.status_code == 200:
                    content_type = resp.headers.get("content-type", "")
                    if "image" in content_type:
                        b64 = base64.b64encode(resp.content).decode()
                        return {"qr_code": f"data:image/png;base64,{b64}", "format": "image"}
                    # JSON response with value field
                    try:
                        data = resp.json()
                        raw = data.get("value") or data.get("qr") or data.get("data", "")
                        if raw and raw.startswith("data:"):
                            return {"qr_code": raw, "format": "image"}
                        if raw:
                            return {"qr_code": raw, "format": "string"}
                    except Exception:
                        pass

                # Fallback: screenshot endpoint (returns PNG screenshot of QR page)
                resp2 = await client.get(
                    f"{self.base_url}/api/screenshot",
                    params={"session": self.session},
                    headers={**self.headers, "Accept": "image/png, */*"},
                )
                if resp2.status_code == 200 and "image" in resp2.headers.get("content-type", ""):
                    b64 = base64.b64encode(resp2.content).decode()
                    return {"qr_code": f"data:image/png;base64,{b64}", "format": "screenshot"}

                return {"status": "error", "error": f"QR not available (HTTP {resp.status_code})"}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    # ── Messaging ──────────────────────────────────────────────────────────

    async def get_messages(
        self,
        limit: int = 50,
        download_media: bool = False,
    ) -> list:
        """Poll recent messages from the WAHA session."""
        if not self.is_configured:
            return []
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.base_url}/api/{self.session}/messages",
                    params={"limit": limit, "downloadMedia": str(download_media).lower()},
                    headers=self.headers,
                )
                if resp.status_code == 200:
                    return resp.json() if isinstance(resp.json(), list) else []
        except Exception as e:
            logger.warning(f"get_messages error: {e}")
        return []

    async def send_text(self, phone: str, text: str) -> dict:
        chat_id = self._format_phone(phone)
        formatted_text = format_whatsapp_markdown(text)
        url = f"{self.base_url}/api/sendText"
        payload = {
            "session": self.session,
            "chatId": chat_id,
            "text": formatted_text,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload, headers=self.headers)
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            return {"status": "error", "message": str(e), "simulated": True, "chatId": chat_id}

    async def send_interview_invitation(
        self,
        phone: str,
        candidate_name: str,
        job_title: str,
        employer_name: str,
        date: str,
        time_slot: str,
        mode: str,
    ) -> dict:
        message = (
            f"👋 Hello *{candidate_name}*,\n\n"
            f"You have been invited for an interview with *{employer_name}* for the position of *{job_title}*!\n\n"
            f"📅 *Date*: {date}\n"
            f"⏰ *Time*: {time_slot}\n"
            f"📍 *Mode/Location*: {mode}\n\n"
            f"Please reply *YES* to confirm your attendance or *NO* if you need to reschedule.\n\n"
            f"— *JobStart Sri Lanka Recruitment Team*"
        )
        return await self.send_text(phone, message)


waha_service = WAHAService()
