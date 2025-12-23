# TaskHive

A modern freelancing platform built with FastAPI that connects clients with freelancers, enabling job posting, proposal submission, contract creation, and real-time communication.

## Features

- **User Management**: Register and authenticate as client or freelancer
- **Job Posting**: Clients can create, update, and delete jobs with search/filtering
- **Proposals**: Freelancers can submit proposals with bid amounts and cover letters
- **Contract Management**: Accept proposals to create contracts between clients and freelancers
- **Real-time Chat**: WebSocket-based messaging for contract participants
- **Role-based Access**: Endpoints validate user roles and permissions

## Tech Stack

- **Framework**: FastAPI
- **Database**: SQLAlchemy with SQLite (configurable)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: WebSocket connections with connection pooling per contract
- **Validation**: Pydantic models
- **Server**: Uvicorn

## Installation

### Prerequisites
- Python 3.8+
- pip or conda

### Setup

1. **Clone and navigate to project**:
   ```bash
   cd TaskHive
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**:
   ```bash
   uvicorn backend.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/users` - List all users
- `GET /auth/users/{user_id}` - Get user details

**Register Example**:
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass",
    "role": "client",
    "name": "John Doe"
  }'
```

**Login Example**:
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepass"
```

### Jobs (`/jobs`)
- `GET /jobs/` - List jobs with pagination and filtering
- `POST /jobs/create` - Create a new job (client only)
- `PATCH /jobs/{job_id}` - Update job (creator only)
- `DELETE /jobs/{job_id}` - Delete job (creator only)

**Query Parameters**:
- `skip`: Offset for pagination (default: 0)
- `limit`: Number of results (default: 10, max: 100)
- `title`: Search in job title (case-insensitive)
- `min_budget`: Minimum budget filter
- `max_budget`: Maximum budget filter
- `status`: Filter by status (open, closed)

**Create Job Example**:
```bash
curl -X POST http://localhost:8000/jobs/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build a React Dashboard",
    "description": "Need a responsive dashboard for analytics",
    "budget": 5000,
    "status": "open"
  }'
```

### Proposals (`/proposals`)
- `GET /proposals/` - List proposals with filtering
- `POST /proposals/create` - Submit a proposal (freelancer only)
- `PATCH /proposals/{proposal_id}` - Update proposal (author only)
- `DELETE /proposals/{proposal_id}` - Delete proposal (author only)

**Create Proposal Example**:
```bash
curl -X POST http://localhost:8000/proposals/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": 1,
    "bid_amount": 4500,
    "cover_letter": "I have 5 years of React experience..."
  }'
```

### Contracts (`/contracts`)
- `POST /contracts/{proposal_id}` - Accept proposal and create contract (client only)
- `WebSocket /contracts/ws/{contract_id}` - Real-time messaging endpoint

**Accept Proposal Example**:
```bash
curl -X POST http://localhost:8000/contracts/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## WebSocket Chat

Real-time communication between contract participants (client and freelancer).

### Connection

Connect to the WebSocket endpoint:
```
ws://localhost:8000/contracts/ws/{contract_id}?token={JWT_TOKEN}
```

**Parameters**:
- `contract_id`: ID of the contract (integer)
- `token`: JWT authentication token (query parameter)

### Message Types

**Send a chat message**:
```json
{"message": "When can you start?"}
```

**Broadcast events received**:

1. **Contract Created** (on proposal acceptance):
```json
{
  "type": "contract_created",
  "contract_id": 1,
  "job_id": 5,
  "client_id": 1,
  "freelancer_id": 2,
  "status": "ongoing"
}
```

2. **User Joined**:
```json
{
  "type": "user_joined",
  "user_id": 1
}
```

3. **Chat Message**:
```json
{
  "type": "chat",
  "from": 1,
  "message": "When can you start?"
}
```

4. **User Left**:
```json
{
  "type": "user_left",
  "user_id": 1
}
```

### JavaScript Example

```javascript
const contractId = 1;
const token = "your_jwt_token";

const ws = new WebSocket(
  `ws://localhost:8000/contracts/ws/${contractId}?token=${token}`
);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};

ws.send(JSON.stringify({ message: "Hello!" }));
```

## Project Structure

```
TaskHive/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── models/
│   │   ├── base.py            # Database session & engine
│   │   ├── user.py            # User model
│   │   ├── job.py             # Job model
│   │   ├── proposal.py        # Proposal model
│   │   ├── contract.py        # Contract model
│   │   └── message.py         # Message model
│   └── routers/
│       ├── auth.py            # Authentication endpoints
│       ├── jobs.py            # Job endpoints
│       ├── proposals.py        # Proposal endpoints
│       └── contracts.py        # Contract & WebSocket endpoints
├── internal_db/               # Database file location
├── requirements.txt           # Python dependencies
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## Database Models

### User
- `id`, `name`, `email`, `hashed_password`, `role` (client/freelancer), `is_active`
- Relations: jobs, proposals, contracts, messages

### Job
- `id`, `title`, `description`, `budget`, `status`, `client_id`
- Relations: client, proposals, contracts

### Proposal
- `id`, `bid_amount`, `cover_letter`, `job_id`, `freelancer_id`
- Relations: job, freelancer

### Contract
- `id`, `amount`, `status`, `created_at`, `job_id`, `freelancer_id`, `client_id`
- Relations: job, freelancer, client

### Message
- `id`, `content`, `timestamp`, `sender_id`, `receiver_id`
- Relations: sender, receiver

## Environment Variables

Create a `.env` file in the project root (optional):
```env
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
DATABASE_URL=sqlite:///./internal_db/taskhive.db
```

> **Note**: The current implementation uses hardcoded `SECRET_KEY` in `backend/routers/auth.py`. For production, use environment variables.

## Development

### Running Tests

```bash
pytest
```

### Code Style

Install and use Black for formatting:
```bash
pip install black
black backend/
```

### Making Changes

1. Create a new branch for your feature
2. Make changes and test locally
3. Commit with clear messages
4. Push and create a pull request

## Future Enhancements

- [ ] Persist chat messages in Message model
- [ ] Message replay on WebSocket reconnect
- [ ] Rate limiting for WebSocket messages
- [ ] File uploads for job attachments
- [ ] Rating/review system
- [ ] Payment integration
- [ ] Email notifications
- [ ] Advanced filtering and sorting
- [ ] User profiles and portfolios

## Troubleshooting

### WebSocket Connection Fails
- Ensure JWT token is valid and not expired
- Verify contract_id exists and user is a participant
- Check token is passed as query parameter: `?token=YOUR_TOKEN`

### 405 Method Not Allowed
- Verify user role matches endpoint requirements (clients create jobs, freelancers create proposals)

### 403 Forbidden
- Ensure you own the resource being modified/deleted

## License

This project is open source. Feel free to use and modify as needed.

## Support

For issues or questions, please open an issue in the repository.
