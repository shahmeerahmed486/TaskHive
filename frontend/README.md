# TaskHive Frontend

Modern React frontend for the TaskHive freelancing platform.

## Features

- **Authentication**: Login and registration with JWT tokens
- **Job Management**: Create, view, edit, and delete jobs (clients only)
- **Proposals**: Submit and view proposals (freelancers only)
- **Contracts**: Accept proposals to create contracts
- **Real-time Chat**: WebSocket-based messaging for contract participants
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── api/           # API client functions
├── components/    # Reusable components
├── context/       # React context providers
├── pages/         # Page components
├── types/         # TypeScript type definitions
├── App.tsx        # Main app component with routing
└── main.tsx       # Entry point
```
