from fastapi import FastAPI
from backend.models import user, job, proposal, contract, message
from backend.models.base import Base, engine
from backend.routers import auth, jobs, proposals, contracts

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(proposals.router)
app.include_router(contracts.router)


@app.get('/')
def test():
    return {'running': 'true'}
