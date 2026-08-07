"""
ai_ranking.py — AI-powered Candidate Ranking & Comparison Service
Ranks candidates against job requirements using OpenRouter Gemini Flash.
Supports batch ranking, side-by-side comparison, and score breakdowns.
"""

import json
import logging
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger("hirepath.ai_ranking")


# ── Data Structures ────────────────────────────────────────────────────────


class CandidateProfile:
    """Lightweight candidate snapshot used for ranking."""

    def __init__(
        self,
        candidate_id: str,
        name: str,
        skills: List[str],
        experience_years: int,
        education: str = "",
        languages: List[str] = None,
        cv_summary: str = "",
        cover_letter: str = "",
    ):
        self.candidate_id = candidate_id
        self.name = name
        self.skills = skills
        self.experience_years = experience_years
        self.education = education
        self.languages = languages or ["English"]
        self.cv_summary = cv_summary
        self.cover_letter = cover_letter

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.candidate_id,
            "name": self.name,
            "skills": self.skills,
            "experience_years": self.experience_years,
            "education": self.education,
            "languages": self.languages,
            "cv_summary": self.cv_summary,
            "cover_letter": self.cover_letter,
        }


class JobRequirements:
    """Lightweight job snapshot used for ranking."""

    def __init__(
        self,
        job_id: str,
        title: str,
        description: str,
        required_skills: List[str],
        experience_required: str = "Any",
        location: str = "",
        job_type: str = "full_time",
        salary_range: str = "",
    ):
        self.job_id = job_id
        self.title = title
        self.description = description
        self.required_skills = required_skills
        self.experience_required = experience_required
        self.location = location
        self.job_type = job_type
        self.salary_range = salary_range

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.job_id,
            "title": self.title,
            "description": self.description,
            "required_skills": self.required_skills,
            "experience_required": self.experience_required,
            "location": self.location,
            "job_type": self.job_type,
            "salary_range": self.salary_range,
        }


# ── Ranking Service ────────────────────────────────────────────────────────


class AIRankingService:
    """
    AI-powered candidate ranking and comparison engine.

    Uses OpenRouter Gemini Flash to:
    - Score each candidate against a job's requirements (0-100)
    - Generate per-candidate reasoning
    - Rank candidates by composite score
    - Compare two candidates side-by-side
    - Match a candidate profile against all active jobs (for notifications)
    """

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.OPENROUTER_MODEL
        self.base_url = settings.OPENROUTER_BASE_URL

    # ── LLM Helpers ───────────────────────────────────────────────────────

    async def _call_llm(
        self, system_prompt: str, user_prompt: str, max_tokens: int = 1500
    ) -> Optional[str]:
        """Make a call to the OpenRouter LLM and return the text response."""
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "HTTP-Referer": "https://hirepath.lk",
                        "X-Title": "HirePath AI Ranking Engine",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": 0.2,
                        "max_tokens": max_tokens,
                    },
                )
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"].strip()
                logger.warning(f"LLM status {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
        return None

    async def _call_llm_json(
        self, system_prompt: str, user_prompt: str, max_tokens: int = 1500
    ) -> Optional[Dict]:
        """Call LLM and parse JSON from response."""
        raw = await self._call_llm(system_prompt, user_prompt, max_tokens)
        if not raw:
            return None
        # Strip markdown code fences if present
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            # Remove first and last fence lines
            cleaned = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse LLM JSON response: {cleaned[:200]}")
        return None

    # ── Score single candidate ─────────────────────────────────────────────

    async def score_candidate(
        self, candidate: CandidateProfile, job: JobRequirements
    ) -> Dict[str, Any]:
        """
        Score a single candidate against a job (0–100) with detailed reasoning.
        Returns: { candidate_id, name, score, skill_match, experience_match, reasoning, strengths, gaps }
        """
        system_prompt = (
            "You are an expert AI recruitment analyst for HirePath Sri Lanka. "
            "Evaluate candidates fairly against job requirements. "
            "Always respond with valid JSON only — no markdown, no extra text."
        )
        user_prompt = (
            f"Score this candidate for the job below on a scale of 0 to 100.\n\n"
            f"JOB:\n{json.dumps(job.to_dict(), indent=2)}\n\n"
            f"CANDIDATE:\n{json.dumps(candidate.to_dict(), indent=2)}\n\n"
            f"Return JSON with exactly these fields:\n"
            f'{{"score": <0-100 int>, "skill_match": <0-100 int>, "experience_match": <0-100 int>, '
            f'"reasoning": "<2-3 sentence summary>", '
            f'"strengths": ["<strength1>", "<strength2>"], '
            f'"gaps": ["<gap1>", "<gap2>"], '
            f'"recommendation": "<Highly Recommended|Recommended|Consider|Not Recommended>"}}'
        )

        result = await self._call_llm_json(system_prompt, user_prompt)

        if result:
            return {
                "candidate_id": candidate.candidate_id,
                "name": candidate.name,
                "score": min(100, max(0, int(result.get("score", 50)))),
                "skill_match": min(100, max(0, int(result.get("skill_match", 50)))),
                "experience_match": min(100, max(0, int(result.get("experience_match", 50)))),
                "reasoning": result.get("reasoning", ""),
                "strengths": result.get("strengths", []),
                "gaps": result.get("gaps", []),
                "recommendation": result.get("recommendation", "Consider"),
                "engine": f"AI Ranking ({self.model})",
            }

        # Fallback scoring if LLM fails
        skill_overlap = len(
            set(s.lower() for s in candidate.skills)
            & set(s.lower() for s in job.required_skills)
        )
        skill_score = min(100, int((skill_overlap / max(len(job.required_skills), 1)) * 100))
        exp_score = min(100, candidate.experience_years * 12)
        fallback_score = int(skill_score * 0.6 + exp_score * 0.4)

        return {
            "candidate_id": candidate.candidate_id,
            "name": candidate.name,
            "score": fallback_score,
            "skill_match": skill_score,
            "experience_match": exp_score,
            "reasoning": (
                f"{candidate.name} has {candidate.experience_years} years of experience "
                f"and matches {skill_overlap}/{len(job.required_skills)} required skills."
            ),
            "strengths": candidate.skills[:3],
            "gaps": [s for s in job.required_skills if s.lower() not in [c.lower() for c in candidate.skills]][:3],
            "recommendation": "Recommended" if fallback_score >= 70 else "Consider",
            "engine": "Fallback Scoring (LLM unavailable)",
        }

    # ── Rank multiple candidates ───────────────────────────────────────────

    async def rank_candidates(
        self, candidates: List[CandidateProfile], job: JobRequirements
    ) -> List[Dict[str, Any]]:
        """
        Score and rank all candidates for a given job.
        Returns sorted list (highest score first) with full details.
        """
        if not candidates:
            return []

        # Score each candidate (could be parallelised — keeping sequential for rate limit safety)
        scored = []
        for i, candidate in enumerate(candidates):
            result = await self.score_candidate(candidate, job)
            result["rank"] = 0  # will be set after sorting
            scored.append(result)

        # Sort by score descending
        scored.sort(key=lambda x: x["score"], reverse=True)
        for i, item in enumerate(scored):
            item["rank"] = i + 1

        return scored

    # ── Side-by-side comparison ────────────────────────────────────────────

    async def compare_candidates(
        self,
        candidate_a: CandidateProfile,
        candidate_b: CandidateProfile,
        job: JobRequirements,
    ) -> Dict[str, Any]:
        """
        Generate a detailed side-by-side comparison of two candidates for a job.
        Returns structured comparison with winner recommendation.
        """
        system_prompt = (
            "You are an expert AI recruiter for HirePath Sri Lanka. "
            "Compare two candidates for a job objectively. "
            "Always respond with valid JSON only."
        )
        user_prompt = (
            f"Compare these two candidates for this job and pick the better fit.\n\n"
            f"JOB:\n{json.dumps(job.to_dict(), indent=2)}\n\n"
            f"CANDIDATE A:\n{json.dumps(candidate_a.to_dict(), indent=2)}\n\n"
            f"CANDIDATE B:\n{json.dumps(candidate_b.to_dict(), indent=2)}\n\n"
            f"Return JSON with exactly these fields:\n"
            f'{{"winner": "A" or "B" or "Tie", '
            f'"winner_reason": "<1-2 sentences>", '
            f'"candidate_a": {{"score": <0-100>, "strengths": ["..."], "gaps": ["..."]}}, '
            f'"candidate_b": {{"score": <0-100>, "strengths": ["..."], "gaps": ["..."]}}, '
            f'"summary": "<2-3 sentence overall comparison>"}}'
        )

        result = await self._call_llm_json(system_prompt, user_prompt, max_tokens=1000)

        if result:
            return {
                "job_id": job.job_id,
                "job_title": job.title,
                "candidate_a": {
                    "id": candidate_a.candidate_id,
                    "name": candidate_a.name,
                    **result.get("candidate_a", {}),
                },
                "candidate_b": {
                    "id": candidate_b.candidate_id,
                    "name": candidate_b.name,
                    **result.get("candidate_b", {}),
                },
                "winner": result.get("winner", "Tie"),
                "winner_reason": result.get("winner_reason", ""),
                "summary": result.get("summary", ""),
                "engine": f"AI Comparison ({self.model})",
            }

        # Fallback: basic comparison
        score_a = len(set(s.lower() for s in candidate_a.skills) & set(s.lower() for s in job.required_skills))
        score_b = len(set(s.lower() for s in candidate_b.skills) & set(s.lower() for s in job.required_skills))
        winner = "A" if score_a > score_b else ("B" if score_b > score_a else "Tie")

        return {
            "job_id": job.job_id,
            "job_title": job.title,
            "candidate_a": {"id": candidate_a.candidate_id, "name": candidate_a.name, "score": score_a * 20},
            "candidate_b": {"id": candidate_b.candidate_id, "name": candidate_b.name, "score": score_b * 20},
            "winner": winner,
            "winner_reason": "Based on skill overlap with job requirements.",
            "summary": "Comparison based on skill match (LLM unavailable).",
            "engine": "Fallback Comparison",
        }

    # ── Job matching for notifications ────────────────────────────────────

    async def match_candidate_to_jobs(
        self,
        candidate: CandidateProfile,
        jobs: List[JobRequirements],
        min_score: int = 65,
    ) -> List[Dict[str, Any]]:
        """
        Find all jobs that match a candidate profile above a minimum threshold.
        Used to trigger proactive WhatsApp notifications.
        Returns: list of { job_id, title, score, reasoning } sorted by score desc.
        """
        if not jobs:
            return []

        system_prompt = (
            "You are a job-matching AI for HirePath Sri Lanka. "
            "Match a candidate to multiple jobs and return match scores. "
            "Always respond with valid JSON only."
        )
        jobs_json = json.dumps([j.to_dict() for j in jobs], indent=2)
        user_prompt = (
            f"Score how well this candidate matches each job below (0-100).\n\n"
            f"CANDIDATE:\n{json.dumps(candidate.to_dict(), indent=2)}\n\n"
            f"JOBS:\n{jobs_json}\n\n"
            f"Return a JSON array: "
            f'[{{"job_id": "<id>", "score": <0-100>, "reason": "<1 sentence>"}}]'
        )

        result = await self._call_llm_json(system_prompt, user_prompt, max_tokens=800)

        if isinstance(result, list):
            matches = [
                {
                    "job_id": item.get("job_id", ""),
                    "job_title": next((j.title for j in jobs if j.job_id == item.get("job_id")), ""),
                    "score": min(100, max(0, int(item.get("score", 0)))),
                    "reason": item.get("reason", ""),
                }
                for item in result
                if int(item.get("score", 0)) >= min_score
            ]
            return sorted(matches, key=lambda x: x["score"], reverse=True)

        # Fallback: basic keyword matching
        matches = []
        for job in jobs:
            overlap = len(
                set(s.lower() for s in candidate.skills)
                & set(s.lower() for s in job.required_skills)
            )
            score = min(100, int((overlap / max(len(job.required_skills), 1)) * 100))
            if score >= min_score:
                matches.append({
                    "job_id": job.job_id,
                    "job_title": job.title,
                    "score": score,
                    "reason": f"Matches {overlap}/{len(job.required_skills)} required skills.",
                })
        return sorted(matches, key=lambda x: x["score"], reverse=True)


# Global singleton
ai_ranking_service = AIRankingService()
