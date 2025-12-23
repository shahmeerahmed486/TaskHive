from sqlalchemy import Column, Integer, Text, ForeignKey, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from .base import Base


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    job = relationship("Job", back_populates="contracts")
    freelancer = relationship(
        "User", back_populates="contracts_as_freelancer", foreign_keys=[freelancer_id])
    client = relationship(
        "User", back_populates="contracts_as_client", foreign_keys=[client_id])
