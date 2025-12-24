from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.models import user, job, proposal, contract, message
from backend.models.base import Base, engine
from backend.routers import auth, jobs, proposals, contracts

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(proposals.router)
app.include_router(contracts.router)


@app.get('/')
def test():
    return {'running': 'true'}
