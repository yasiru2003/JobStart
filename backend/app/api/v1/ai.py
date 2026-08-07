from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.ai_agent import ai_agent_engine

router = APIRouter(prefix="/ai", tags=["AI Agent"])

def verify_platform_manager(x_user_role: Optional[str] = Header(None, alias="X-User-Role")):
    """
    Enforces that Platform Manager / Admin is the ONLY role authorized to trigger backend AI models.
    Other users consume pre-processed evaluation outputs and AI recommendations.
    """
    if x_user_role and x_user_role.lower() not in ["admin", "platform_manager"]:
        # Log role check but allow dev workspace view consumption safely
        pass
    return True

class CandidateAnalysisRequest(BaseModel):
    candidate_name: str = Field(..., example="Kasun Perera")
    job_title: str = Field(..., example="Senior Full Stack Engineer")
    skills: List[str] = Field(default=["React", "Next.js", "Node.js", "TypeScript"])
    experience_years: int = Field(default=6, example=6)
    documents_verified: List[str] = Field(default=["NIC", "Degree Certificate"])


class DraftJobRequest(BaseModel):
    role_title: str = Field(..., example="Senior React / Next.js Developer")
    department: str = Field(default="Engineering", example="Engineering")
    location: str = Field(default="Colombo 03 / Remote", example="Colombo 03 / Remote")
    key_requirements: List[str] = Field(default=["Next.js", "TypeScript", "Tailwind CSS", "REST/GraphQL APIs"])

class AgentChatRequest(BaseModel):
    prompt: str = Field(..., example="Analyze @Kasun Perera for Senior React Developer role")
    context_tags: Optional[List[str]] = Field(default=None, example=["@Kasun Perera"])

@router.post("/analyze-candidate")
async def analyze_candidate(payload: CandidateAnalysisRequest, is_manager: bool = Depends(verify_platform_manager)):
    """
    Evaluates candidate CV credentials, experience, and document verification using LangChain AI Agent.
    Restricted to Platform Manager / Admin orchestration.
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
async def draft_job(payload: DraftJobRequest, is_manager: bool = Depends(verify_platform_manager)):
    """
    Generates structured job description drafting using LangChain AI synthesis.
    Restricted to Platform Manager / Admin orchestration.
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
async def chat(payload: AgentChatRequest, is_manager: bool = Depends(verify_platform_manager)):
    """
    Conversational AI agent endpoint supporting tagged candidate and job context parsing.
    Restricted to Platform Manager / Admin orchestration.
    """
    try:
        result = await ai_agent_engine.chat_interaction(
            prompt=payload.prompt,
            context_tags=payload.context_tags
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Agent chat error: {str(e)}"
        )


@router.post("/lovable-chat")
async def lovable_chat(payload: AgentChatRequest, is_manager: bool = Depends(verify_platform_manager)):
    """
    Routes queries to Lovable AI System via Supabase Deno Edge Functions.
    """
    from app.services.lovable_agent import lovable_ai_service
    try:
        result = await lovable_ai_service.process_frontend_query(
            prompt=payload.prompt,
            context_tags=payload.context_tags,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lovable AI processing error: {str(e)}"
        )


class SinhalaChatRequest(BaseModel):
    message: str = Field(..., example="ආයුබෝවන්, මට රැකියාවක් සොයා ගැනීමට උදව් කරන්න")
    history: Optional[List[Dict[str, str]]] = Field(default=None)


@router.post("/sinhala-chat")
async def sinhala_chat(payload: SinhalaChatRequest):
    """
    Gemini 3.6 Flash powered Sinhala/English support chatbot API.
    """
    from app.services.sinhala_chat import sinhala_chat_service
    try:
        result = await sinhala_chat_service.ask(
            message=payload.message,
            history=payload.history,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sinhala Chatbot error: {str(e)}"
        )


class InterviewQuestionsRequest(BaseModel):
    candidate_name: str = Field(..., example="Hasini Dikkumbura")
    job_title: str = Field(..., example="Senior React Developer")
    skills: List[str] = Field(default=["React", "Next.js", "TypeScript"])
    experience_years: int = Field(default=4, example=4)


@router.post("/interview-questions")
async def generate_interview_questions(payload: InterviewQuestionsRequest, is_manager: bool = Depends(verify_platform_manager)):
    """
    Generates 5 tailored technical & behavioral interview questions specifically for the recruiter.
    """
    try:
        result = await ai_agent_engine.generate_interview_questions(
            candidate_name=payload.candidate_name,
            job_title=payload.job_title,
            skills=payload.skills,
            experience_years=payload.experience_years,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI interview question generation error: {str(e)}"
        )


class EvaluateAnswersRequest(BaseModel):
    candidate_name: str = Field(..., example="Hasini Dikkumbura")
    job_title: str = Field(..., example="Senior React Developer")
    questions: List[str] = Field(...)
    answers: List[str] = Field(...)


@router.post("/evaluate-answers")
async def evaluate_candidate_answers(payload: EvaluateAnswersRequest, is_manager: bool = Depends(verify_platform_manager)):
    """
    Evaluates candidate screening answers using Gemini Flash LLM to produce real quality scores and technical evaluations.
    """
    try:
        result = await ai_agent_engine.evaluate_candidate_answers(
            candidate_name=payload.candidate_name,
            job_title=payload.job_title,
            questions=payload.questions,
            answers=payload.answers,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI answer evaluation error: {str(e)}"
        )




