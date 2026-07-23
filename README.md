# CareerForge AI

> **Your AI-Powered Career Development Platform**

CareerForge AI is a full-stack, AI-powered web application that helps professionals master interviews, perfect their resumes, discover ideal career paths, and bridge skill gaps — all powered by Google Gemini AI.

Built for the **Vibe Coding Competition** by Bharat Cares by SMEC Trust & IBM.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Mock Interviews** | AI-powered interview simulations tailored to your target role and industry |
| **Resume Analysis** | ATS-optimized scoring, keyword suggestions, and actionable improvements |
| **Skill Gap Analysis** | Identify missing skills and get a personalized learning roadmap |
| **Career Health Dashboard** | Track career readiness with comprehensive scoring and insights |
| **Persistent AI Memory** | The AI remembers your skills, preferences, and goals across sessions |
| **Real-time Streaming** | AI responses stream token-by-token for a natural conversation experience |
| **Dark/Light Mode** | Premium dark theme by default with smooth light mode toggle |
| **Responsive Design** | Mobile-first layout optimized for all screen sizes |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Landing  │  │Dashboard │  │  Chat    │  │  Settings  │  │
│  │  Page    │  │  Page    │  │  Page    │  │   Page     │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           UI Components (shadcn/ui + Tailwind)        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     API Client (fetch-based SSE streaming)            │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────▼──────────────────────────────────────┐
│                    Backend (Python FastAPI)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Chat    │  │  Career  │  │  Memory  │  │  Health    │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes    │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services: LLM (Gemini) | Memory | Scoring | Prompt  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           SQLAlchemy ORM + SQLite/PostgreSQL          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | Fast builds, type safety, modern DX |
| **UI** | Tailwind CSS + shadcn/ui | Utility-first, accessible, premium design |
| **State** | Zustand + TanStack Query | Lightweight state + server cache |
| **Backend** | Python FastAPI | Async, auto-docs, Pydantic validation |
| **AI** | Google Gemini (google-genai SDK) | Streaming, free tier, powerful |
| **Database** | SQLite (dev) / PostgreSQL (prod) | SQLAlchemy ORM abstracts both |
| **Container** | Docker + docker-compose | Reproducible deployments |
| **Deploy** | AWS / Render / Railway | HTTPS, auto-scaling |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker (optional, for containerized setup)
- Google Gemini API key ([get one free](https://ai.google.dev/))

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd careerforge-ai

# Backend setup
cd backend
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
# Required
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.0-flash

# Optional (defaults shown)
DEBUG=true
DATABASE_URL=sqlite+aiosqlite:///./careerforge.db
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### 3. Run Development

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Docker (Alternative)

```bash
# Set your API key
export GEMINI_API_KEY=your-key-here

# Build and run
docker-compose up --build
```

Open **http://localhost** in your browser.

---

## 📚 API Documentation

When running in development mode (`DEBUG=true`), interactive API docs are available:

| URL | Description |
|---|---|
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/redoc` | ReDoc |

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/conversations` | List conversations |
| `POST` | `/api/v1/conversations` | Create conversation |
| `GET` | `/api/v1/conversations/{id}/stream` | Stream AI response (SSE) |
| `GET` | `/api/v1/conversations/{id}/messages` | Get messages |
| `DELETE` | `/api/v1/conversations/{id}` | Delete conversation |
| `GET` | `/api/v1/career/health` | Get career health scores |
| `GET` | `/api/v1/career/dashboard` | Dashboard data (scores + activity) |
| `GET` | `/api/v1/career/profile` | Get user profile |
| `PUT` | `/api/v1/career/profile` | Update user profile |
| `GET` | `/api/v1/career/activities` | Recent activities |
| `GET` | `/api/v1/memory` | List memories |
| `POST` | `/api/v1/memory` | Create memory |
| `POST` | `/api/v1/memory/extract` | Extract memories from text |
| `DELETE` | `/api/v1/memory` | Clear all memories |

### SSE Streaming Format

The chat endpoint uses Server-Sent Events (SSE):

```
data: {"type": "chunk", "token": "Hello"}
data: {"type": "chunk", "token": " world"}
data: {"type": "done"}
data: {"type": "close"}
```

---

## 🗄️ Database Schema

```
user_profiles
├── id (UUID, PK)
├── session_id (VARCHAR, UNIQUE)
├── full_name, current_role, target_role
├── skills (JSON), interests (JSON), education (JSON)
├── resume_text (TEXT)
└── created_at, updated_at

career_profiles
├── id (UUID, PK)
├── user_id (UUID, FK → user_profiles)
├── resume_score, interview_score
├── skill_gap_score, career_readiness
├── overall_health
└── created_at, updated_at

conversations
├── id (UUID, PK)
├── session_id (VARCHAR, indexed)
├── title, mode, metadata (JSON)
├── is_archived
└── created_at, updated_at

messages
├── id (UUID, PK)
├── conversation_id (UUID, FK → conversations)
├── role (user/assistant/system)
├── content (TEXT)
└── created_at

memory_entries
├── id (UUID, PK)
├── user_id (UUID, FK → user_profiles)
├── key, value, category
├── source, confidence, importance
└── created_at, updated_at

activities
├── id (UUID, PK)
├── user_id (UUID, FK → user_profiles)
├── type, title, description
├── score
└── created_at
```

---

## 🧠 AI Scoring System

The dashboard scores are calculated from two sources:

1. **Heuristic scores** (always applied):
   - **Profile Score**: Completeness of user profile fields
   - **Resume Score**: Resume upload + analysis sessions
   - **Interview Score**: Number of interview practice sessions
   - **Skill Gap Score**: Skills listed + analysis sessions

2. **AI-extracted scores** (override heuristics when present):
   - The AI response is scanned for patterns like `"Resume Score: 75/100"`
   - Only valid scores (0–100) are accepted
   - Parsing failures are silently ignored

**Overall Career Readiness** = weighted combination:
- Profile: 25% | Resume: 30% | Interview: 25% | Skill Gap: 20%

---

## 🐳 Deployment

### Docker Build

```bash
# Build all services
docker-compose build

# Run in production
docker-compose up -d
```

### Deploy to Render (Backend)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
   - `CORS_ORIGINS`

### Deploy to Vercel (Frontend)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL

### HTTPS

- Render provides HTTPS automatically
- Vercel provides HTTPS automatically
- For custom domains, add SSL certificates via your DNS provider

---

## 🧪 Development

### Project Structure

```
careerforge-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API routes
│   │   ├── config/          # Settings, database
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Routes, globals
│   │   ├── components/      # UI + feature components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities, API client
│   │   ├── providers/       # Theme provider
│   │   ├── stores/          # Zustand stores
│   │   └── types/           # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── infra/
│   └── nginx.conf           # Production nginx config
├── docker-compose.yml
└── README.md
```

### Running Tests

```bash
cd backend
pytest
```

### Linting

```bash
cd frontend
npm run lint
```

---

## 🔒 Security

- API keys are stored server-side only (never in frontend code)
- Environment variables for all secrets
- CORS configured for specific origins
- Security headers in nginx config
- Session-based guest access (no passwords stored)
- Input validation on all API endpoints

---

## 🎨 Design System

- **Color Palette**: Purple primary (#7C5CFC) + Teal accent (#00CCCC)
- **Typography**: Inter (UI) + JetBrains Mono (code)
- **Dark Mode**: Default, with smooth light mode toggle
- **Components**: shadcn/ui with custom CareerForge theme
- **Animations**: Fade-in, shimmer, pulse-dot, hover-lift, border-glow
- **Icons**: Lucide React

---

## 📄 License

This project was created for the Vibe Coding Competition by Bharat Cares by SMEC Trust & IBM.

---

## 🙏 Acknowledgments

- **Google Gemini** for the AI API
- **FastAPI** for the async Python framework
- **shadcn/ui** for the component library
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the icon set