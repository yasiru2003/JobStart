from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.core.security import get_current_user, require_roles

router = APIRouter(prefix="/jobs", tags=["Jobs Management"])

# In-memory database store for jobs (Syncs with WhatsApp AI Agent)
JOBS_DB: List[Dict[str, Any]] = [
    {
        "id": "job-1",
        "title": "Senior React Developer",
        "company": "99x Technology",
        "location": "Colombo 03",
        "salary_min": 350000,
        "salary_max": 500000,
        "job_type": "Full-time | Hybrid",
        "description": "Senior React/Next.js developer for enterprise SaaS platform.",
        "skills_required": ["React", "Next.js", "TypeScript", "Node.js"],
        "experience_required": "4+ years",
        "status": "Active",
        "created_at": "2026-08-01T10:00:00Z",
    },
    {
        "id": "job-2",
        "title": "Flutter Mobile Developer",
        "company": "Rootcode Labs",
        "location": "Colombo 07",
        "salary_min": 200000,
        "salary_max": 320000,
        "job_type": "Full-time | Remote",
        "description": "Flutter developer for cross-platform mobile applications.",
        "skills_required": ["Flutter", "Dart", "Firebase", "REST APIs"],
        "experience_required": "2+ years",
        "status": "Active",
        "created_at": "2026-08-02T10:00:00Z",
    },
    {
        "id": "job-3",
        "title": "Node.js Backend Engineer",
        "company": "IFS R&D International",
        "location": "Colombo 02",
        "salary_min": 280000,
        "salary_max": 420000,
        "job_type": "Full-time | On-site",
        "description": "Backend engineer for enterprise ERP integrations using Node.js and microservices.",
        "skills_required": ["Node.js", "TypeScript", "PostgreSQL", "Docker", "Microservices"],
        "experience_required": "3+ years",
        "status": "Active",
        "created_at": "2026-08-03T10:00:00Z",
    },
]



class JobCreateRequest(BaseModel):
    title: str = Field(..., example="Senior Full Stack Engineer")
    company: Optional[str] = Field(default="JobStart Client", example="WSO2 Lanka")
    location: Optional[str] = Field(default="Colombo", example="Colombo 03 / Remote")
    salary_min: Optional[int] = Field(default=150000, example=250000)
    salary_max: Optional[int] = Field(default=300000, example=400000)
    job_type: Optional[str] = Field(default="Full-time", example="Full-time")
    description: Optional[str] = Field(default="", example="Job description details...")
    skills_required: Optional[List[str]] = Field(default=["React", "Python"], example=["React", "FastAPI"])
    experience_required: Optional[str] = Field(default="2+ years", example="3+ years")


@router.get("", summary="List all active job listings")
async def list_jobs(params: Optional[str] = None):
    return JOBS_DB


@router.get("/{job_id}", summary="Get job details by ID")
async def get_job(job_id: str):
    job = next((j for j in JOBS_DB if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("", summary="Create a new job listing (Employer / Recruiter / Admin)")
async def create_job(payload: JobCreateRequest, current_user: Dict = Depends(get_current_user)):
    new_id = f"job-{len(JOBS_DB) + 1}"
    new_job = {
        "id": new_id,
        "title": payload.title,
        "company": payload.company or current_user.get("companyName", "JobStart Employer"),
        "location": payload.location,
        "salary_min": payload.salary_min,
        "salary_max": payload.salary_max,
        "job_type": payload.job_type,
        "description": payload.description,
        "skills_required": payload.skills_required or [],
        "experience_required": payload.experience_required,
        "status": "Active",
        "created_by": current_user.get("id"),
    }
    JOBS_DB.insert(0, new_job)
    return {"message": "Job created successfully", "job": new_job}


@router.patch("/{job_id}", summary="Update an existing job listing")
async def update_job(job_id: str, payload: Dict[str, Any], _: Dict = Depends(get_current_user)):
    job = next((j for j in JOBS_DB if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for k, v in payload.items():
        if v is not None:
            job[k] = v
    return {"message": "Job updated successfully", "job": job}


@router.delete("/{job_id}", summary="Delete a job listing")
async def delete_job(job_id: str, _: Dict = Depends(get_current_user)):
    global JOBS_DB
    JOBS_DB = [j for j in JOBS_DB if j["id"] != job_id]
    return {"message": "Job deleted successfully"}
