from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Annotated, List
from .auth import get_current_user

from backend.models.base import SessionLocal
from backend.models.proposal import Proposal
from backend.models.user import User


router = APIRouter(prefix='/proposals', tags=['proposals'])


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_session)]
user_dependency = Annotated[dict, Depends(get_current_user)]


class ProposalRead(BaseModel):
    id: int = Field(...)
    bid_amount: int = Field(...)
    cover_letter: str | None = None
    job_id: int = Field(...)
    freelancer_id: int = Field(...)

    class Config:
        from_attributes = True


class ProposalCreate(BaseModel):
    bid_amount: int = Field(...)
    cover_letter: str | None = None


@router.get("/", response_model=List[ProposalRead])
def get_proposals_by_user(user: user_dependency, db: db_dependency):
    proposals = db.query(Proposal).filter(
        Proposal.freelancer_id == user["user_id"]).all()

    return proposals


@router.get("/{job_id}", response_model=List[ProposalRead])
def get_proposals_by_job(job_id: int, user: user_dependency, db: db_dependency):
    proposals = db.query(Proposal).filter(Proposal.job_id == job_id).all()

    return proposals


@router.post("/{proposal_job_id}", response_model=ProposalRead)
def submit_proposal(proposal_job_id: int, proposal_request: ProposalCreate, user: user_dependency, db: db_dependency):
    user_object = db.get(User, user["user_id"])
    if not user_object.role == "freelancer":
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED,
                            detail="Proposals can only be submitted by freelancers")

    proposal = Proposal(
        bid_amount=proposal_request.bid_amount,
        cover_letter=proposal_request.cover_letter,
        job_id=proposal_job_id,
        freelancer_id=user["user_id"]
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return proposal
