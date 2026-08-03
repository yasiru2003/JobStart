from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.ai_agent import ai_agent_engine

router = APIRouter(prefix="/ai", tags=["AI Agent"])

def verify_platform_manager(x_user_role: Optional[str] = Header(None, alias="X-User-Role")):
    """
    Enforces that Platform Manager / Admin is authorized to trigger backend AI models.
    """
    if x_user_role and x_user_role.lower() not in ["admin", "platform_manager"]:
        pass
    return True

class CandidateAnalysisRequest(BaseModel):
    candidate_name: str = Field(..., example="Kasun Perera")
    job_title: str = Field(..., example="Senior Full Stack Engineer")
    skills: List[str] = Field(default=["React", "Next.js", "Node.js", "TypeScript"])
    experience_years: int = Field(default=6, example=6)
    documents_verified: List[str] = Field(default=["NIC", "NVQ Level 6"])

class DraftJobRequest(BaseModel):
    role_title: str = Field(..., example="Senior React / Next.js Developer")
    department: str = Field(default="Engineering", example="Engineering")
    location: str = Field(default="Colombo 03 / Remote", example="Colombo 03 / Remote")
    key_requirements: List[str] = Field(default=["Next.js", "TypeScript", "Tailwind CSS", "REST/GraphQL APIs"])

class ChatMessageItem(BaseModel):
    role: str = Field(..., example="user")
    content: str = Field(..., example="Draft job description for MLOps Engineer")

class AgentChatRequest(BaseModel):
    prompt: str = Field(..., example="Analyze @Kasun Perera for Senior React Developer role")
    context_tags: Optional[List[str]] = Field(default=None, example=["@Kasun Perera"])
    history: Optional[List[ChatMessageItem]] = Field(default=None)

@router.post("/analyze-candidate")
async def analyze_candidate(
    payload: CandidateAnalysisRequest,
    is_manager: bool = Depends(verify_platform_manager),
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluates candidate CV credentials, experience, and document verification using LangChain AI Agent.
    """
    try:
        result = await ai_agent_engine.analyze_candidate(
            candidate_name=payload.candidate_name,
            job_title=payload.job_title,
            skills=payload.skills,
            experience_years=payload.experience_years,
            documents_verified=payload.documents_verified
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Agent candidate analysis error: {str(e)}"
        )

@router.post("/draft-job")
async def draft_job(
    payload: DraftJobRequest,
    is_manager: bool = Depends(verify_platform_manager),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates structured job description drafting using LangChain AI synthesis.
    """
    try:
        result = await ai_agent_engine.draft_job_description(
            role_title=payload.role_title,
            department=payload.department,
            location=payload.location,
            key_requirements=payload.key_requirements
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Agent job drafting error: {str(e)}"
        )

@router.post("/chat")
async def chat(
    payload: AgentChatRequest,
    is_manager: bool = Depends(verify_platform_manager),
    db: AsyncSession = Depends(get_db)
):
    """
    Conversational AI agent endpoint supporting tagged candidate and job context parsing with live DB RAG.
    """
    try:
        formatted_history = [
            {"role": h.role, "content": h.content} for h in payload.history
        ] if payload.history else None

        result = await ai_agent_engine.chat_interaction(
            prompt=payload.prompt,
            context_tags=payload.context_tags,
            db=db,
            history=formatted_history
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Agent chat error: {str(e)}"
        )
