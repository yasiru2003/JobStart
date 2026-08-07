from __future__ import annotations
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum

class TenantTier(str, enum.Enum):
    starter = "starter"
    growth = "growth"
    enterprise = "enterprise"

class TenantStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    trialing = "trialing"

class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)  # e.g., wso2.hirepth.lk
    tier: Mapped[TenantTier] = mapped_column(SAEnum(TenantTier), default=TenantTier.growth)
    status: Mapped[TenantStatus] = mapped_column(SAEnum(TenantStatus), default=TenantStatus.active)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self) -> str:
        return f"<Tenant {self.name} ({self.domain})>"
