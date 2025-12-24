from datetime import datetime, timezone
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Annotated, List
from jose import JWTError, jwt
from .auth import get_current_user, SECRET_KEY, ALGORITHM

from backend.models.base import SessionLocal
from backend.models.proposal import Proposal
from backend.models.contract import Contract

router = APIRouter(prefix='/contracts', tags=['contracts'])


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_session)]
user_dependency = Annotated[dict, Depends(get_current_user)]


class ContractChatManager:
    """Tracks websocket connections per contract and broadcasts messages."""

    def __init__(self):
        self.contract_connections: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, contract_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self.contract_connections[contract_id].add(websocket)

    def disconnect(self, contract_id: int, websocket: WebSocket) -> None:
        connections = self.contract_connections.get(contract_id)
        if not connections:
            return
        connections.discard(websocket)
        if not connections:
            self.contract_connections.pop(contract_id, None)

    async def broadcast(self, contract_id: int, message: dict) -> None:
        for connection in list(self.contract_connections.get(contract_id, [])):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(contract_id, connection)


contract_ws_manager = ContractChatManager()


class ContractRead(BaseModel):
    id: int
    amount: int
    status: str
    created_at: datetime
    job_id: int
    freelancer_id: int
    client_id: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ContractRead])
def get_my_contracts(user: user_dependency, db: db_dependency):
    """Get all contracts where the current user is either client or freelancer"""
    contracts = db.query(Contract).filter(
        (Contract.client_id == user["user_id"]) | 
        (Contract.freelancer_id == user["user_id"])
    ).all()
    return contracts


@router.post("/{proposal_id}", response_model=ContractRead, status_code=status.HTTP_201_CREATED)
async def accept_proposal(proposal_id: int,  user: user_dependency, db: db_dependency):
    proposal_obj = db.get(Proposal, proposal_id)
    job = proposal_obj.job

    if not job.client_id == user["user_id"]:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED,
                            detail="Proposals can only be accepted by job owner")

    job.status = "closed"
    contract = Contract(
        amount=proposal_obj.bid_amount,
        status="ongoing",
        created_at=datetime.now(timezone.utc),
        job_id=proposal_obj.job_id,
        freelancer_id=proposal_obj.freelancer_id,
        client_id=job.client_id
    )

    db.add(contract)
    db.commit()
    db.refresh(contract)

    await contract_ws_manager.broadcast(contract.id, {
        "type": "contract_created",
        "contract_id": contract.id,
        "job_id": contract.job_id,
        "client_id": contract.client_id,
        "freelancer_id": contract.freelancer_id,
        "status": contract.status,
    })

    return contract


async def _decode_ws_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, key=SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id")
        email: str = payload.get("sub")
        if user_id is None or email is None:
            raise JWTError("Missing claims")
        return {"user_id": user_id, "email": email}
    except JWTError:
        raise


@router.websocket("/ws/{contract_id}")
async def contract_chat(websocket: WebSocket, contract_id: int, token: str, db: db_dependency):
    try:
        user = await _decode_ws_token(token)
    except JWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        contract = db.get(Contract, contract_id)
        if not contract or user["user_id"] not in (contract.client_id, contract.freelancer_id):
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        await contract_ws_manager.connect(contract_id, websocket)

        await contract_ws_manager.broadcast(contract_id, {
            "type": "user_joined",
            "user_id": user["user_id"],
        })

        while True:
            data = await websocket.receive_json()
            message = data.get("message")
            if not message:
                await websocket.send_json({"error": "message is required"})
                continue

            await contract_ws_manager.broadcast(contract_id, {
                "type": "chat",
                "from": user["user_id"],
                "message": message,
            })

    except WebSocketDisconnect:
        contract_ws_manager.disconnect(contract_id, websocket)
        await contract_ws_manager.broadcast(contract_id, {
            "type": "user_left",
            "user_id": user["user_id"],
        })
    finally:
        db.close()
