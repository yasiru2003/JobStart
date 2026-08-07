"""
Unit tests for WhatsApp AI Agent & AI Ranking Service
"""
import pytest
from app.services.whatsapp_agent import classify_intent, detect_language, conversation_store, ApplicationStage
from app.services.ai_ranking import CandidateProfile, JobRequirements, ai_ranking_service

def test_detect_language():
    assert detect_language("Hello, I want to apply for a job") == "en"
    assert detect_language("ආයුබෝවන්, මට රැකියාවක් අවශ්‍යයි") == "si"
    assert detect_language("வணக்கம், எனக்கு வேலை வேண்டும்") == "ta"

def test_classify_intent_english():
    assert classify_intent("confirm") == "CONFIRM"
    assert classify_intent("no") == "DECLINE"
    assert classify_intent("reschedule") == "RESCHEDULE"
    assert classify_intent("jobs") == "BROWSE_JOBS"

def test_classify_intent_sinhala():
    assert classify_intent("ඔව්") == "CONFIRM"
    assert classify_intent("නෑ") == "DECLINE"
    assert classify_intent("රැකියා") == "BROWSE_JOBS"

def test_classify_intent_tamil():
    assert classify_intent("ஆம்") == "CONFIRM"
    assert classify_intent("இல்லை") == "DECLINE"
    assert classify_intent("வேலை") == "BROWSE_JOBS"

def test_fallback_candidate_scoring():
    import asyncio
    job = JobRequirements(
        job_id="job-test",
        title="Senior React Developer",
        description="Looking for React and TypeScript expert",
        required_skills=["React", "TypeScript", "Next.js"],
        experience_required="3+ years"
    )
    candidate = CandidateProfile(
        candidate_id="cand-test",
        name="Kasun Perera",
        skills=["React", "TypeScript", "Next.js", "PostgreSQL"],
        experience_years=5
    )
    result = asyncio.run(ai_ranking_service.score_candidate(candidate, job))
    assert result["candidate_id"] == "cand-test"
    assert result["score"] >= 0 and result["score"] <= 100
