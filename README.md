# AutoApply Pro 🚀

**Work Smart. Apply Automatically.**

AI-powered job application platform that applies to 30 jobs daily across LinkedIn, Indeed, Naukri and more.

---

## 🏗️ Tech Stack

- **Frontend:** React 18 + Vite + Recharts
- **Backend:** Node.js + Express
- **Database:** MongoDB (with mock data fallback — works without DB!)
- **AI:** Claude (Anthropic) for job matching, cover letters, interview prep
- **Security:** AES-256-CBC credential encryption, JWT auth

---

## ⚡ Quick Start (Local Development)

### 1. Clone & Setup

```bash
git clone <your-repo>
cd autoapply-pro
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Install & Run Backend

```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 3. Install & Run Frontend

```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. Open the app

Go to **http://localhost:5173** and register an account.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | Optional (mock data works without it) |
| `JWT_SECRET` | Secret for JWT tokens | ✅ Required |
| `ANTHROPIC_API_KEY` | Claude AI API key | For AI features |
| `ENCRYPTION_KEY` | 32-char key for credential encryption | Optional |

---

## 🐳 Docker Deployment

```bash
cp .env.example .env
# Fill in your .env values

docker-compose up -d
# App runs on http://localhost:80
```

---

## 📁 Project Structure

```
autoapply-pro/
├── server/
│   ├── config/          # DB & env config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, rate limiting, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # Express routers
│   ├── services/
│   │   ├── ai/          # Claude AI integration
│   │   ├── automation/  # Bot engine
│   │   └── encryption/  # AES-256 credential encryption
│   └── utils/           # JWT, mock data, helpers
│
├── client/
│   └── src/
│       ├── components/  # Sidebar, Topbar, shared UI
│       ├── context/     # Auth context
│       ├── pages/       # All page components
│       ├── services/    # Axios API client
│       └── styles/      # Global CSS design system
│
├── docker-compose.yml
└── .env.example
```

---

## 🤖 Features

- **Dashboard** — Live application feed, stats, weekly chart
- **Job Queue** — AI-matched jobs sorted by score, instant apply
- **Applications** — Track all applications with status management
- **Platforms** — Connect LinkedIn, Indeed, Naukri (AES-256 encrypted)
- **AI Assistant** — Claude-powered chat for cover letters, interview prep
- **Analytics** — Response rates, platform breakdown, skills in demand
- **Interview Prep** — AI-generated questions + mock interview mode
- **Companies** — Research companies, tech stacks, ratings

---

## 🔒 Security Notes

- Platform passwords are AES-256-CBC encrypted before storage
- JWT tokens with refresh token rotation
- Rate limiting on all API endpoints
- Helmet.js for HTTP security headers

---

## 📞 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/jobs/queue` | AI-matched job queue |
| GET | `/api/applications` | All applications |
| POST | `/api/ai/chat` | Chat with Claude AI |
| POST | `/api/automation/start` | Start auto-apply bot |
| GET | `/api/analytics/overview` | Analytics overview |

Full API docs available at `http://localhost:5000/health`
