from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["Notifications Engine"])

class NotificationSchema(BaseModel):
    id: str
    title: str
    message: str
    type: str  # application | interview | ai_alert | system
    is_read: bool
    link: Optional[str] = None
    created_at: str

class NotificationCreateSchema(BaseModel):
    user_id: str = Field(default="usr_emp_1")
    title: str = Field(..., example="New Verified Candidate Application")
    message: str = Field(..., example="Kasun Perera submitted an application for Senior React Developer.")
    type: str = Field(default="application", example="application")
    link: Optional[str] = Field(default="/dashboard/applications", example="/dashboard/applications")

# In-memory mock database store for notifications engine
MOCK_NOTIFICATIONS_DB: List[Dict[str, Any]] = [
  {
    "id": "notif-1",
    "title": "New Verified Candidate Application",
    "message": "Kasun Perera applied for Senior React Developer position (Match: 92%).",
    "type": "application",
    "is_read": False,
    "link": "/dashboard/applications",
    "created_at": "10 mins ago",
  },
  {
    "id": "notif-2",
    "title": "Interview Confirmed via WhatsApp",
    "message": "Sunil Rathnayake confirmed Google Meet slot for 24 Jul, 10:00 AM.",
    "type": "interview",
    "is_read": False,
    "link": "/dashboard/interviews",
    "created_at": "1 hour ago",
  },
  {
    "id": "notif-3",
    "title": "AI Agent Candidate Analysis Ready",
    "message": "LangChain agent finished CV screening for 5 new applicants.",
    "type": "ai_alert",
    "is_read": True,
    "link": "/dashboard/candidates",
    "created_at": "3 hours ago",
  },
  {
    "id": "notif-4",
    "title": "Identity Verification Verified",
    "message": "Nimal Fernando's NIC & NVQ credentials verified successfully.",
    "type": "system",
    "is_read": True,
    "link": "/dashboard/verification",
    "created_at": "1 day ago",
  },
]

@router.get("", response_model=List[NotificationSchema])
async def get_notifications():
    """
    Returns user notifications list with unread counter.
    """
    return MOCK_NOTIFICATIONS_DB

@router.post("/send", response_model=NotificationSchema)
async def send_notification(payload: NotificationCreateSchema):
    """
    Dispatches a new live notification via the notification engine.
    """
    new_notif = {
        "id": f"notif-{int(datetime.now().timestamp())}",
        "title": payload.title,
        "message": payload.message,
        "type": payload.type,
        "is_read": False,
        "link": payload.link,
        "created_at": "Just now",
    }
    MOCK_NOTIFICATIONS_DB.insert(0, new_notif)
    return new_notif

@router.put("/{notif_id}/read")
async def mark_as_read(notif_id: str):
    """
    Marks a specific notification as read.
    """
    for n in MOCK_NOTIFICATIONS_DB:
        if n["id"] == notif_id:
            n["is_read"] = True
            return {"status": "success", "id": notif_id}
    return {"status": "success", "id": notif_id}

@router.put("/mark-all-read")
async def mark_all_read():
    """
    Marks all notifications as read.
    """
    for n in MOCK_NOTIFICATIONS_DB:
        n["is_read"] = True
    return {"status": "success", "message": "All notifications marked as read."}

@router.delete("/{notif_id}")
async def delete_notification(notif_id: str):
    """
    Deletes a notification from user list.
    """
    global MOCK_NOTIFICATIONS_DB
    MOCK_NOTIFICATIONS_DB = [n for n in MOCK_NOTIFICATIONS_DB if n["id"] != notif_id]
    return {"status": "deleted", "id": notif_id}
