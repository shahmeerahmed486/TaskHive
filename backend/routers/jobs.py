from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Annotated, List, Optional
from .auth import get_current_user

from backend.models.base import SessionLocal
from backend.models.user import User
from backend.models.job import Job

router = APIRouter(prefix='/jobs', tags=['jobs'])


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_session)]
user_dependency = Annotated[dict, Depends(get_current_user)]


class JobCreate(BaseModel):
    title: str = Field(..., min_length=4,
                       description="Job Title (min 4 characters)")
    description: str = Field(..., min_length=1, description="Job Description")
    budget: int = Field(..., ge=0, description="Budget in integer amount")
    status: str = "open"


class JobRead(BaseModel):
    id: int
    title: str
    description: str | None = None
    budget: int
    status: str
    client_id: int

    class Config:
        from_attributes = True


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    budget: Optional[int] = Field(None, gt=0)
    status: Optional[str] = None


@router.get("/", response_model=List[JobRead])
def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    title: Optional[str] = Query(None, description="Search in job title"),
    min_budget: Optional[int] = Query(
        None, ge=0, description="Minimum budget"),
    max_budget: Optional[int] = Query(
        None, ge=0, description="Maximum budget"),
    status: Optional[str] = Query(None, description="Filter by status"),
    session: Session = Depends(get_session),
):
    query = session.query(Job)

    if title:
        query = query.filter(Job.title.ilike(f"%{title}%"))
    if min_budget is not None:
        query = query.filter(Job.budget >= min_budget)
    if max_budget is not None:
        query = query.filter(Job.budget <= max_budget)
    if status:
        query = query.filter(Job.status == status)

    jobs = query.offset(skip).limit(limit).all()
    return jobs


@router.post('/create', response_model=JobRead, status_code=status.HTTP_201_CREATED)
def create_new_job(job_request: JobCreate, user: user_dependency, db: db_dependency):
    db_user = db.query(User).filter(User.id == user["user_id"]).first()
    if not db_user.role == "client":
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED,
                            detail="Only Clients can create jobs")
    job = Job(**job_request.model_dump(), client_id=user["user_id"])

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.patch("/{job_id}", response_model=JobRead)
def update_job(job_id: int, payload: JobUpdate, user: user_dependency, db: db_dependency):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Job not found")
    if not job.client_id == user["user_id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN,
                            detail="Job can only be edited by creator")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, user: user_dependency, db: db_dependency):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Job not found")
    if not job.client_id == user["user_id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN,
                            detail="Job can only be deleted by creator")
    db.delete(job)
    db.commit()
