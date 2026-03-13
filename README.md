# AmbientMind AI

A complete, production-ready, fully working full-stack web application designed for active mental health monitoring. Built with FastAPI, React+Vite, and intelligent LLM routing (Gemini/Claude/GPT).

## Complete Setup in 3 Steps

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) + Docker Compose OR Node.js 18+ and Python 3.11+

### Step 1: Environment Variables
Clone the repository and copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and add at least one AI API key for full features.

### Step 2: Start Application
The easiest way is using Docker:
```bash
docker-compose up --build
```

**Alternative (Without Docker):**
Open two terminals.
Terminal 1 (Backend):
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

### Step 3: Run & Use
1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Register a new user account.
3. Complete the onboarding wizard and add an LLM Key.
4. Access the AmbientMind dashboard and begin tracking!

## LLM Keys
AmbientMind uses AI to generate daily insights and empathetic reframes. You need API keys for these to function fully.
- **Gemini** (Recommended, free tier accessible): [Google AI Studio](https://aistudio.google.com/)
- **Claude**: [Anthropic Console](https://console.anthropic.com/)
- **GPT**: [OpenAI Platform](https://platform.openai.com/)

Keys can be securely provided during **onboarding** or in **Settings > AI Configuration**.
