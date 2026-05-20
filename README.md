# AutoApply Pro

AI-powered job application automation — upload your resume, and it auto-applies to 30+ jobs daily.

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 2. Server Setup
```bash
cd server
cp ../.env.example ../.env   # then edit with your real values
npm install
npm run dev
```

### 3. Client Setup
```bash
cd client
cp .env.example .env         # then edit with your real values
npm install
npm run dev
```

### 4. Required Environment Variables

#### Server (`.env` in project root)
| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Create Cluster → Connect → Connection String |
| `JWT_SECRET` | Any random 32+ character string |
| `REFRESH_TOKEN_SECRET` | Any random 32+ character string |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) (free) |

#### Google OAuth (optional but recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized JavaScript origins: `http://localhost:5173` and your production URL
4. Add authorized redirect URIs: `http://localhost:5173` and your production URL
5. Copy Client ID → set `GOOGLE_CLIENT_ID` in server `.env` AND `VITE_GOOGLE_CLIENT_ID` in client `.env`

#### GitHub OAuth (optional but recommended)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New
2. Set Homepage URL to your app URL
3. Set Authorization callback URL to: `https://your-backend-url/api/auth/github/callback`
4. Copy Client ID → `GITHUB_CLIENT_ID` (server) + `VITE_GITHUB_CLIENT_ID` (client)
5. Copy Client Secret → `GITHUB_CLIENT_SECRET` (server only — never expose this to the client)

#### Client (`client/.env`)
| Variable | Value |
|---|---|
| `VITE_API_URL` | Your backend URL + `/api` (e.g., `https://apply-dash.onrender.com/api`) — leave empty for local dev with Vite proxy |
| `VITE_GOOGLE_CLIENT_ID` | Same as server's `GOOGLE_CLIENT_ID` |
| `VITE_GITHUB_CLIENT_ID` | Same as server's `GITHUB_CLIENT_ID` |

### 5. Deploy
- **Server**: Deploy to Render/Railway/Fly.io — set all env vars in the dashboard
- **Client**: Deploy to Vercel — set `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_GITHUB_CLIENT_ID` in Vercel env settings

## Common Issues

### Login returns 500
Your `MONGODB_URI` is a placeholder or the connection is failing. Replace it with a real MongoDB Atlas connection string.

### Google/GitHub buttons don't appear
The OAuth buttons only render when their client IDs are configured. Set `VITE_GOOGLE_CLIENT_ID` and/or `VITE_GITHUB_CLIENT_ID` in `client/.env`.
