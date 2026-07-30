# JobStart Architecture

## Overview

JobStart is a full-stack application designed to streamline the job application and interview tracking process, featuring AI-assisted capabilities. The system is split into a **Frontend** built with Next.js and a **Backend** built with FastAPI.

## High-Level Architecture

The architecture follows a standard client-server model:

- **Frontend (Client)**: Next.js application handling the user interface, routing, and client-side state. It communicates with the backend via RESTful APIs.
- **Backend (Server)**: FastAPI application responsible for business logic, database operations, AI integrations, and authentication.
- **Database**: Relational database (likely PostgreSQL or SQLite) managed through SQLAlchemy ORM via Alembic for migrations.

## Backend Architecture (FastAPI)

The backend is structured around domain-driven design principles, keeping concerns separated.

### Directory Structure
```
backend/
├── app/
│   ├── api/        # API routers (v1 endpoints for auth, ai, dashboard, notifications)
│   ├── core/       # Core configurations (config, database, security)
│   ├── models/     # SQLAlchemy database models
│   ├── schemas/    # Pydantic schemas for data validation (requests/responses)
│   ├── services/   # Business logic and external integrations (e.g., AI agents, WAHA)
│   └── main.py     # FastAPI application entry point
├── alembic/        # Database migrations
└── seed_db.py      # Database seeding script
```

### Key Components
1. **API Layer (`app/api/`)**: Defines the REST endpoints and routes requests to the appropriate services.
2. **Core (`app/core/`)**: Handles application-wide settings, database session management, and security (JWT authentication, password hashing).
3. **Data Layer (`app/models/` & `app/schemas/`)**: `models` define the database tables using SQLAlchemy. `schemas` use Pydantic to validate incoming and outgoing data, ensuring strict type checking and serialization.
4. **Service Layer (`app/services/`)**: Contains the core business logic. Includes integrations with external services such as AI tools (`ai_agent.py`) and messaging APIs (`waha.py`).

## Frontend Architecture (Next.js)

The frontend is a modern React application utilizing the Next.js App Router for server-side rendering and optimized routing.

### Directory Structure
```
frontend/
├── src/
│   ├── app/        # Next.js App Router pages and layouts (e.g., providers.tsx)
│   ├── components/ # Reusable UI components organized by domain
│   └── lib/        # Utility functions and shared libraries
├── public/         # Static assets
└── package.json    # Dependencies and scripts
```

### Key Components
1. **App Router (`src/app/`)**: Handles application routing, pages, and global providers (like state management and theme providers).
2. **UI Components (`src/components/`)**:
   - **`ai/`**: Components related to AI features (e.g., `AiAgentDrawer.tsx`).
   - **`modals/`**: Modal dialogs for user interactions (e.g., `ScheduleInterviewModal.tsx`, `ChangePlanModal.tsx`).
   - **`layout/`**: Structural components like `Header.tsx`, sidebars, etc.
   - **`kanban/`**: Kanban board components for tracking job applications.
   - **`charts/`**: Data visualization components.
3. **Styling**: Tailwind CSS is used for utility-first styling, integrated with components (e.g., via Radix UI for accessible primitives).
4. **State Management**: Uses modern state management solutions like `zustand` and data fetching with `@tanstack/react-query`.

## External Integrations

- **AI Services**: Integrates with OpenRouter (via `OPENROUTER_API_KEY`) for AI agent capabilities to assist users.
- **Messaging (WAHA)**: Integration with WAHA API for communication features.

## Deployment & Execution

- **Development**:
  - Backend: Run via `uvicorn app.main:app --reload` (default port 8000).
  - Frontend: Run via `npm run dev` (default port 3000).
- **Environment**: Environment variables manage configurations like database URLs, JWT secrets, and API keys.
