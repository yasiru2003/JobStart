import httpx
from typing import Optional
import os

WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://localhost:3000")
WAHA_SESSION = os.getenv("WAHA_SESSION", "default")
WAHA_API_KEY = os.getenv("WAHA_API_KEY", "")


class WAHAService:
    """
    WAHA (WhatsApp HTTP API) Integration Service
    Documentation: https://waha.devlike.pro
    """

    def __init__(self, base_url: str = WAHA_BASE_URL, session: str = WAHA_SESSION, api_key: str = WAHA_API_KEY):
        self.base_url = base_url.rstrip("/")
        self.session = session
        self.headers = {"Content-Type": "application/json"}
        if api_key:
            self.headers["X-Api-Key"] = api_key

    def _format_phone(self, phone: str) -> str:
        """Formats phone number to WAHA chatId format e.g. 94771234567@c.us"""
        cleaned = "".join(filter(str.isdigit, phone))
        if cleaned.startswith("0"):
            cleaned = "94" + cleaned[1:]
        if not cleaned.endswith("@c.us"):
            return f"{cleaned}@c.us"
        return cleaned

    async def send_text(self, phone: str, text: str) -> dict:
        chat_id = self._format_phone(phone)
        url = f"{self.base_url}/api/sendText"
        payload = {
            "session": self.session,
            "chatId": chat_id,
            "text": text,
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
