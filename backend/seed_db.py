import asyncio
import logging
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import engine, AsyncSessionLocal, Base
from app.models.user import User, UserRole
from app.models.profile import EmployerProfile, CandidateProfile, VerificationStatus
from app.models.job import JobPosting, JobType, JobStatus, JobApplication, ApplicationStatus
from app.models.notification import Notification, NotificationType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_db")

async def seed_database():
    """
    Populates SQLAlchemy PostgreSQL database with initial mock users, employer profiles,
    job listings, candidate applications, and notifications.
    """
    async with engine.begin() as conn:
        logger.info("Creating database tables if not existing...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        async with session.begin():
            # Check if users already seeded
            existing_user = await session.execute(select(User).limit(1))
            if existing_user.scalar_one_or_none():
                logger.info("Database already seeded with initial data. Skipping.")
                return

            logger.info("Seeding initial database mock data...")

            # 1. Admin User
            admin_user = User(
                id=uuid.uuid4(),
                email="nadeeka.dias@hirepath.lk",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", # hashed 'password'
                full_name="Nadeeka Dias",
                role=UserRole.admin,
                is_active=True,
                is_verified=True,
            )
            session.add(admin_user)

            # 2. Employer User & Profile (WSO2)
            employer_user = User(
                id=uuid.uuid4(),
                email="employer@wso2.com",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
                full_name="Sahan Gunawardena",
                role=UserRole.employer,
                is_active=True,
                is_verified=True,
            )
            session.add(employer_user)

            employer_profile = EmployerProfile(
                id=uuid.uuid4(),
                user=employer_user,
                company_name="WSO2 Sri Lanka",
                industry="Software & IT Services",
                company_size="500+ Employees",
                website="https://wso2.com",
                location="Colombo 03, Sri Lanka",
                description="Global leader in open-source integration and API management software.",
            )
            session.add(employer_profile)

            # 3. Recruiter User
            recruiter_user = User(
                id=uuid.uuid4(),
                email="recruiter@hirepath.lk",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
                full_name="Malini Perera",
                role=UserRole.recruiter,
                is_active=True,
                is_verified=True,
            )
            session.add(recruiter_user)

            # 4. Candidate User & Profile
            candidate_user = User(
                id=uuid.uuid4(),
                email="candidate@gmail.com",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
                full_name="Kasun Perera",
                role=UserRole.candidate,
                is_active=True,
                is_verified=True,
            )
            session.add(candidate_user)

            candidate_profile = CandidateProfile(
                id=uuid.uuid4(),
                user=candidate_user,
                headline="Senior Full Stack / Next.js Developer",
                bio="6 years building scalable web apps with React, Next.js, and TypeScript.",
                skills=["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
                experience_years=6,
                location="Colombo 05, Sri Lanka",
                verification_status=VerificationStatus.verified,
                verified_nic="941234567V",
            )
            session.add(candidate_profile)

            # 5. Job Postings
            job1 = JobPosting(
                id=uuid.uuid4(),
                employer=employer_profile,
                title="Senior React / Next.js Developer",
                description="Lead frontend development for enterprise API portals using Next.js and Tailwind CSS.",
                requirements="5+ years React/Next.js experience, TypeScript mastery, REST/GraphQL integration.",
                location="Colombo 03 / Hybrid",
                job_type=JobType.full_time,
                status=JobStatus.active,
                salary_min=350000,
                salary_max=500000,
                skills_required=["Next.js", "TypeScript", "Tailwind CSS", "GraphQL"],
            )
            job2 = JobPosting(
                id=uuid.uuid4(),
                employer=employer_profile,
                title="Lead UI/UX Designer",
                description="Design modern enterprise web interfaces, user journeys, and component design systems.",
                requirements="Figma, Design Systems, User Research, Prototyping.",
                location="Colombo 03 / Remote",
                job_type=JobType.full_time,
                status=JobStatus.active,
                salary_min=300000,
                salary_max=450000,
                skills_required=["Figma", "Design Systems", "Prototyping"],
            )
            session.add_all([job1, job2])

            # 6. Candidate Applications
            app1 = JobApplication(
                id=uuid.uuid4(),
                job_id=job1.id,
                candidate_id=candidate_profile.id,
                status=ApplicationStatus.interview,
                ai_match_score=92,
                notes="Candidate screened with AI agent. Credentials verified via TVEC.",
            )
            session.add(app1)

            # 7. Notifications
            notif1 = Notification(
                id=uuid.uuid4(),
                user_id=employer_user.id,
                title="New Verified Candidate Application",
                message="Kasun Perera applied for Senior React Developer position (Match: 92%).",
                type=NotificationType.application,
                is_read=False,
                link="/dashboard/applications",
            )
            notif2 = Notification(
                id=uuid.uuid4(),
                user_id=employer_user.id,
                title="Interview Confirmed via WhatsApp",
                message="Sunil Rathnayake accepted Google Meet slot for 24 Jul, 10:00 AM.",
                type=NotificationType.interview,
                is_read=False,
                link="/dashboard/interviews",
            )
            session.add_all([notif1, notif2])

            logger.info("Successfully seeded database with real mock models!")

if __name__ == "__main__":
    asyncio.run(seed_database())
