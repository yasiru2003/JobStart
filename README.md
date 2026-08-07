# HirePath 🚀

**Sri Lanka's Premier AI-Powered Recruitment & Verification Platform**

*Submitted for the Open Category Innovation Challenge*

---

## 🎯 Project Purpose

HirePath is an end-to-end, AI-driven recruitment platform designed to solve the critical challenges of modern hiring: **candidate friction, manual screening overload, and credential fraud.** 

Traditional job applications are tedious, often resulting in candidate drop-off, while recruiters spend countless hours manually parsing CVs and verifying credentials. HirePath revolutionizes this by allowing candidates to apply seamlessly via WhatsApp, while an autonomous AI Agent handles the entire top-of-funnel pipeline—from intelligent CV parsing and initial screening to automated interview scheduling and credential verification.

Our goal is to create a frictionless, zero-barrier entry for job seekers while providing recruiters with a highly curated, instantly verified pipeline of top talent.

---

## 🧠 The AI Agent Workflow (Core Innovation)

HirePath is not a simple chatbot or a single-prompt wrapper. It features a robust, multi-agent architecture capable of **real reasoning, decision-making, and autonomous action-taking**.

### How the AI Agent Operates:
1. **Context-Aware Intent Classification**: When a candidate messages the platform via WhatsApp, the AI analyzes the conversational history to determine the user's intent (e.g., greeting, asking about a job, uploading a CV, answering a screening question).
2. **Autonomous Candidate Profiling**: Upon receiving a CV (PDF), the agent triggers a background processing pipeline. It extracts structured data, identifies core skills, and automatically matches the candidate against active job postings in the database.
3. **Multi-Step Screening Workflows**: If a candidate applies for a role, the AI orchestrates a dynamic screening interview. It asks role-specific questions, evaluates the responses in real-time, and assigns a match score.
4. **Action-Taking & State Memory**: The AI autonomously progresses the candidate through the hiring pipeline (e.g., moving them from "Applied" to "Screening" to "Interview Scheduled"). It proactively sends pre-allocated Google Meet interview slots and securely registers the candidate's selection.
5. **Proactive Job Matching**: The agent continuously monitors the database and proactively reaches out to past candidates (in English or localized Sinhala/Singlish) when new jobs matching their profile are posted.

---

## ⚙️ Tech Stack

This project leverages a modern, scalable tech stack, precisely matching our original proposal.

### Frontend
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + Radix UI
* **State Management:** Zustand
* **Data Fetching:** Axios

### Backend
* **Framework:** FastAPI
* **Language:** Python 3.11+
* **Database:** SQLite (Development) / PostgreSQL (Production ready) via SQLAlchemy ORM
* **Migrations:** Alembic
* **Authentication:** JWT (JSON Web Tokens)

### AI & Integrations
* **LLM Engine:** Gemini 1.5 Flash (via Google AI Studio) for fast, context-aware reasoning and localized Sinhala support.
* **Orchestration:** Custom Python-based Agentic Workflow Engine (handling state persistence, tool use, and multi-turn memory).
* **Communication:** WAHA (WhatsApp HTTP API) for seamless, authenticated WhatsApp integration.

*Note: All third-party tools, including Next.js, FastAPI, and WAHA, are utilized under their respective Open-Source (MIT/Apache 2.0) licenses. The Gemini API is utilized in compliance with Google's Developer Terms of Service.*

---

## ✨ Core Features

* **Omnichannel AI Application**: Candidates apply and complete initial screenings entirely via WhatsApp, eliminating the need for complex web forms.
* **Intelligent Job Matching Engine**: The system algorithmically ranks candidates against job descriptions, providing recruiters with a match percentage and a detailed AI dossier.
* **Automated Interview Scheduling**: The AI agent proposes available time slots, handles candidate selection, and dispatches Google Meet links automatically.
* **Native Sinhala / Singlish Support**: The AI is explicitly trained to understand and respond in localized Sri Lankan dialects, ensuring accessibility for all candidates.
* **Recruiter Dashboard**: A comprehensive Kanban-style Next.js dashboard for recruiters to monitor pipelines, trigger AI candidate comparisons, and manage job postings.
* **Credential Verification**: Automated cross-checking of National Identity Cards (NIC) and educational certificates.

---

## 🛠️ Setup Instructions

Follow these steps to run HirePath locally on your machine.

### Prerequisites
* Node.js (v18+)
* Python (3.11+)
* Git

### 1. Backend Setup (FastAPI)
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file (configure your GEMINI_API_KEY here)
cp .env.example .env

# Run database migrations and seed initial data
alembic upgrade head
python seed_db.py

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup (Next.js)
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. WhatsApp Integration (Optional for local dev)
To fully test the WhatsApp agent locally, ensure the backend is exposed via a service like ngrok to receive webhooks from your WAHA instance.

---

*Built with ❤️ for the future of recruitment.*
