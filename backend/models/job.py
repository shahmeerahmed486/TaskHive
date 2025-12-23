from sqlalchemy import Column, Integer, Text, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship
from .base import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    budget = Column(Integer, nullable=False)
    status = Column(String, nullable=False)

    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client = relationship("User", back_populates="jobs")

    proposals = relationship("Proposal", back_populates="job")
    contracts = relationship("Contract", back_populates="job")
