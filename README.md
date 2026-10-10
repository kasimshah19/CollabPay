# CollabPay

A full-stack application with separate frontend and backend workspaces.

## Project Structure

```
CollabPay/
├── frontend/          # Next.js (App Router, React, TypeScript, Tailwind CSS)
├── backend/           # Express (TypeScript, tsx)
├── .gitignore
└── README.md
```

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at [http://localhost:5000](http://localhost:5000).  
Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy each `.env.example` to `.env` and adjust as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

See each `.env.example` for documented variables.

## Scripts

### Backend

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start development server with tsx    |
| `npm run build`   | Compile TypeScript to `dist/`        |
| `npm start`       | Run compiled production build        |
| `npm run typecheck` | Run TypeScript type checking       |

### Frontend

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Next.js dev server             |
| `npm run build`   | Create production build              |
| `npm start`       | Serve production build               |
| `npm run lint`    | Run ESLint                           |
