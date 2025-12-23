from sqlalchemy import Column, Integer, Text, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship
from .base import Base


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    bid_amount = Column(Integer, nullable=False)
    cover_letter = Column(Text)

    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    job = relationship("Job", back_populates="proposals")
    freelancer = relationship("User", back_populates="proposals_sent")
