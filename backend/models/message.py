from sqlalchemy import Column, Integer, Text, ForeignKey, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from .base import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False)

    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer,  ForeignKey("users.id"), nullable=False)

    sender = relationship(
        "User", back_populates="messages_sent", foreign_keys=[sender_id])
    receiver = relationship(
        "User", back_populates="messages_received", foreign_keys=[receiver_id])
