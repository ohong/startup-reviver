# Startup Reviver

> **Resurrect failed YC startups for the AI era in one click.**

A minimal Next.js application for prompting the V0 Platform to build a project and deploying the generated version to Vercel. Everything needed to create → deploy → grab the URL lives in this repo; no dependency on the legacy `vibehacker` project.

## Requirements
- Node.js 18.18+ (or the current LTS)
- V0 Platform API key with the Vercel integration authorized

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and provide your key:
   ```bash
   cp .env.local.example .env.local
   # edit .env.local and paste your V0 API key
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 to access the UI.

## Usage
- Enter a prompt in the form and click **Generate with V0**. The app calls `POST /api/generate`, which wraps `v0.chats.create` (or `sendMessage` if you later supply a `chatId`).
- Once generation finishes, the UI captures the `projectId`, `chatId`, and `latestVersion.id`.
- Click **Deploy latest version** to invoke `POST /api/deployments`. The route calls `v0.deployments.create` and automatically provisions the backing Vercel project if it does not exist.
- The UI surfaces the live deployment URL and the Vercel inspector link. Preview deployments may return HTTP 401 until you authenticate in Vercel or configure a bypass token.
- Prefer the single-call `POST /api/autodeploy` if you want the server to handle generation and deployment in one request (see docs/autodeploy-api.md for details).

**Startup of the Dead** takes a failed YC company name and outputs:
- Deep research report on what went wrong
- Strategic analysis of how AI changes the game in 2025
- Complete technical specification
- Working MVP codebase, ready to run

Both API routes perform basic validation and bubble up V0/Vercel errors so they are easy to debug.

What if an AI agent swarm could do it on their own? No human founder needed.

## API Reference
- `POST /api/generate` – Body accepts `message` (string) plus optional `chatId`, `projectId`, `modelId`, `imageGenerations`, `thinking`, and `attachments`. Responds with the V0 `ChatDetail`.
- `POST /api/deployments` – Body requires `projectId`, `chatId`, `versionId`. Responds with the V0 deployment object, including `webUrl` and `inspectorUrl`.
- `POST /api/autodeploy` – Body requires `message` and optionally mirrors the fields from `/api/generate` plus timeout overrides. Responds with deployment metadata (`webUrl`, `deploymentId`, etc.) after generation and deployment complete.
- `POST /api/calls/outbound` – Initiates a PSTN call via LiveKit SIP and (optionally) dispatches a room Agent to ask predefined questions. See `docs/livekit-outbound.md`.

## Scripts
- `npm run dev` – Start the Next.js dev server
- `npm run build` – Build for production
- `npm run start` – Start the production server
- `npm run lint` – Run ESLint

See `flow.md` for a command-line walkthrough of the same prompt → deploy workflow.

<<<<<<< HEAD
## Email Helper
- Use `sendMail` from `lib/email.ts` to send transactional emails through Resend. Set `RESEND_FROM_EMAIL` (use `noreply@updates.tie.uz`) and see `docs/resend-email.md` for configuration and usage details.
## LiveKit Outbound Calls
- Configure LiveKit env vars in `.env.local` and follow `docs/livekit-outbound.md` to test an outbound call and configure an Agent for scripted Q&A.
=======
### The Pipeline

```
User Input → Research → Strategy → Architecture → Code Generation → Working MVP
```

**1. Research Agent** (Perplexity + Claude)
- Searches for failure post-mortems, press coverage, founder reflections
- Extracts why the startup shut down and what they were trying to solve

**2. Strategy Agent** (Claude)
- Analyzes each failure reason: still relevant in 2025? Can AI solve it?
- Generates resurrection strategy with specific AI components

**3. Architect Agent** (Claude)
- Converts strategy into technical specification
- Designs system architecture and tech stack
- Defines 3-4 core MVP features

**4. Code Generation Team** (3 parallel agents)
- **Frontend Agent:** React components, UI, API integration
- **Backend Agent:** Express server, SQLite database, API endpoints
- **AI Agent:** Claude API integration, prompt engineering, intelligent features

All agents communicate via message queue, coordinating like a real engineering team.

**Total pipeline time:** ~20-30 minutes per startup

## 🛠 Tech Stack

**Orchestration**
- Mastra (agent framework)
- Message queue for agent coordination

**Research & Analysis**
- Perplexity API (web research)
- Claude Sonnet 4.5 (all agents)
- YC Company API (startup data)

**Generated Stack** (for resurrected startups)
- Frontend: React, Tailwind CSS, Vite
- Backend: Node.js, Express, SQLite
- AI: Claude API via Anthropic SDK

**Storage**
- Research cache (JSON)
- Generated code output directory

## 🎯 Built For

**The Summoners Track** - Agents that orchestrate other agents, end-to-end task completion

## 🚀 Quick Start

```bash
# Input a dead startup
node index.js --startup "Homejoy"

# Watch the magic happen
# Research → Strategy → Spec → Code → MVP

# Output location
./output/homejoy/
```

---

*Built at the [AgentMail HackHalloween](https://events.ycombinator.com/agentmail-yc25) at YC - October 31, 2025*
>>>>>>> origin/feat/deep-research-enhance
