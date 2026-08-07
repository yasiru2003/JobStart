from __future__ import annotations
import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Integer, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base
import enum


class SubscriptionPlan(str, enum.Enum):
    free = "free"
    starter = "starter"
    growth = "growth"
    enterprise = "enterprise"


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    past_due = "past_due"
    cancelled = "cancelled"
    trialing = "trialing"


class EmployerProfile(Base):
    __tablename__ = "employer_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id"), index=True, nullable=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company_logo_url: Mapped[Optional[str]] = mapped_column(String(500))
    industry: Mapped[Optional[str]] = mapped_column(String(100))
    company_size: Mapped[Optional[str]] = mapped_column(String(50))
    website: Mapped[Optional[str]] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    location: Mapped[Optional[str]] = mapped_column(String(255))

    # Stripe billing
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True)
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String(255))
    subscription_plan: Mapped[SubscriptionPlan] = mapped_column(
        SAEnum(SubscriptionPlan), default=SubscriptionPlan.free
    )
    subscription_status: Mapped[Optional[SubscriptionStatus]] = mapped_column(SAEnum(SubscriptionStatus))
    subscription_ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="employer_profile")
    job_postings: Mapped[List["JobPosting"]] = relationship("JobPosting", back_populates="employer")


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    bio: Mapped[Optional[str]] = mapped_column(Text)
    skills: Mapped[list] = mapped_column(JSONB, default=list)
    experience_years: Mapped[Optional[int]] = mapped_column(Integer)
    education: Mapped[Optional[str]] = mapped_column(String(255))
    location: Mapped[Optional[str]] = mapped_column(String(255))
    cv_url: Mapped[Optional[str]] = mapped_column(String(500))
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500))
    portfolio_url: Mapped[Optional[str]] = mapped_column(String(500))

    # Verification
    verification_status: Mapped[VerificationStatus] = mapped_column(
        SAEnum(VerificationStatus), default=VerificationStatus.pending
    )
    nic_document_url: Mapped[Optional[str]] = mapped_column(String(500))
    nvq_document_url: Mapped[Optional[str]] = mapped_column(String(500))
    police_report_url: Mapped[Optional[str]] = mapped_column(String(500))
    verification_notes: Mapped[Optional[str]] = mapped_column(Text)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    verified_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="candidate_profile", foreign_keys=[user_id])
    applications: Mapped[List["Application"]] = relationship("Application", back_populates="candidate")
