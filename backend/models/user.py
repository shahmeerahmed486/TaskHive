from sqlalchemy import Column, Integer, Text, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship

from .base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="client")
    is_active = Column(Integer, default=1)

    jobs = relationship("Job", back_populates="client")
    proposals_sent = relationship("Proposal", back_populates="freelancer")

    contracts_as_client = relationship(
        "Contract", back_populates="client", foreign_keys="Contract.client_id")
    contracts_as_freelancer = relationship(
        "Contract", back_populates="freelancer", foreign_keys="Contract.freelancer_id")

    messages_sent = relationship(
        "Message", back_populates="sender", foreign_keys="Message.sender_id")
    messages_received = relationship(
        "Message", back_populates="receiver", foreign_keys="Message.receiver_id")
